import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

function sha256Hex(input: string) {
    const data = new TextEncoder().encode(input);
    return crypto.subtle.digest("SHA-256", data).then((hash) => {
        const bytes = new Uint8Array(hash);
        return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    });
}

/**
 * Verifica la firma X-Hub-Signature-256 que envía Meta en cada webhook.
 * Meta firma el body crudo con HMAC-SHA256 usando WHATSAPP_APP_SECRET.
 *
 * Formato del header: "sha256=<hex>"
 *
 * @returns true si la firma es válida, false en cualquier otro caso
 */
async function verifyMetaSignature(rawBody: string, signatureHeader: string | null): Promise<boolean> {
    if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
        return false;
    }
    const appSecret = Deno.env.get("WHATSAPP_APP_SECRET");
    if (!appSecret) {
        console.error("[whatsapp-webhook] WHATSAPP_APP_SECRET no está configurada");
        return false;
    }

    const expectedHex = signatureHeader.slice("sha256=".length);

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(appSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );
    const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
    const computedHex = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    // Comparación timing-safe: ambos strings tienen longitud fija (64 hex chars).
    if (computedHex.length !== expectedHex.length) return false;
    let diff = 0;
    for (let i = 0; i < computedHex.length; i++) {
        diff |= computedHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    return diff === 0;
}

function looksLikeUuid(x: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
}

function extractToken(body: string): { tokenText: string | null; inviteId: string | null } {
    // Busca línea tipo: token: XXXXX
    const m = body.match(/token:\s*([^\s]+)/i);
    const tokenText = m ? m[1] : null;
    const inviteId = tokenText && looksLikeUuid(tokenText) ? tokenText : null;
    return { tokenText, inviteId };
}

async function sendInteractiveMenu(to: string, tokenText: string | null) {
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    if (!accessToken || !phoneNumberId) return;

    const url = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

    const payload = {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
            type: "list",
            body: {
                text:
                    `Recibido ✅\n` +
                    `Elige el tipo de feedback para ordenarlo:\n` +
                    `${tokenText ? `\n(token: ${tokenText})` : ""}`,
            },
            action: {
                button: "Elegir",
                sections: [
                    {
                        title: "Opina+ Feedback",
                        rows: [
                            { id: "bug", title: "Bug / Error", description: "Algo se rompe o no funciona" },
                            { id: "ux", title: "UX / UI", description: "Diseño, claridad, usabilidad" },
                            { id: "idea", title: "Idea / Feature", description: "Propuesta de mejora" },
                            { id: "data", title: "Resultados / Datos", description: "Algo no cuadra" },
                            { id: "perf", title: "Rendimiento", description: "Lento / carga / lag" },
                            { id: "other", title: "Otro", description: "Cualquier otra cosa" },
                        ],
                    },
                ],
            },
        },
    };

    await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
}

serve(async (req) => {
    const url = new URL(req.url);

    // 1) Verificación de webhook (GET)
    if (req.method === "GET") {
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token");
        const challenge = url.searchParams.get("hub.challenge");
        const expected = Deno.env.get("WHATSAPP_VERIFY_TOKEN");

        if (mode === "subscribe" && token && expected && token === expected && challenge) {
            return new Response(challenge, { status: 200 });
        }
        return new Response("forbidden", { status: 403 });
    }

    // 2) Webhook eventos (POST)
    if (req.method === "POST") {
        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (!supabaseUrl || !serviceKey) return new Response("server misconfig", { status: 500 });

        // ─────────────────────────────────────────────────────────────
        // Verificación de firma HMAC X-Hub-Signature-256 (S03 fix)
        // ─────────────────────────────────────────────────────────────
        // Lee el body como texto CRUDO (debemos firmarlo byte-a-byte como
        // lo recibió Meta, antes de parsear JSON).
        const rawBody = await req.text();
        const signatureHeader = req.headers.get("x-hub-signature-256");
        const signatureOk = await verifyMetaSignature(rawBody, signatureHeader);

        if (!signatureOk) {
            // Loguear pero NO revelar detalles al atacante.
            console.warn("[whatsapp-webhook] firma inválida o ausente, request rechazado");
            return new Response("forbidden", { status: 403 });
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
        });

        let payload: any = null;
        try {
            payload = JSON.parse(rawBody);
        } catch {
            payload = null;
        }
        if (!payload) return new Response("bad request", { status: 400 });

        // WhatsApp Cloud API: events dentro de entry[].changes[].value
        const entry = payload.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;

        const messages = value?.messages ?? [];
        for (const msg of messages) {
            const waFrom = msg.from ?? null;
            const waMsgId = msg.id ?? null;
            const msgType = msg.type ?? null;

            let body = "";
            if (msgType === "text") body = msg.text?.body ?? "";
            else if (msgType === "interactive") {
                body =
                    msg.interactive?.list_reply?.title ??
                    msg.interactive?.button_reply?.title ??
                    "";
            } else {
                body = "";
            }

            const fromHash = waFrom ? await sha256Hex(waFrom) : null;
            const { tokenText, inviteId } = extractToken(body);

            await supabase.from("whatsapp_inbound_messages").insert({
                wa_message_id: waMsgId,
                wa_from: waFrom,
                wa_from_hash: fromHash,
                message_type: msgType,
                body,
                token_text: tokenText,
                invite_id: inviteId,
                raw: payload,
            });

            // Respuesta automática con menú (solo si el usuario mandó texto, para no spamear)
            if (waFrom && msgType === "text") {
                await sendInteractiveMenu(waFrom, tokenText);
            }
        }

        const statuses = value?.statuses ?? [];
        for (const status of statuses) {
            await supabase.from("whatsapp_inbound_messages").insert({
                wa_message_id: status.id,
                wa_from: status.recipient_id,
                message_type: 'status_' + status.status,
                body: JSON.stringify(status.errors || {}),
                raw: payload,
            });
        }

        return new Response("ok", { status: 200 });
    }

    return new Response("method not allowed", { status: 405 });
});
