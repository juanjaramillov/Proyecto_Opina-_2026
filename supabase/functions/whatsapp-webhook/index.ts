import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

function sha256Hex(input: string) {
    const data = new TextEncoder().encode(input);
    return crypto.subtle.digest("SHA-256", data).then((hash) => {
        const bytes = new Uint8Array(hash);
        return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    });
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

        const supabase = createClient(supabaseUrl, serviceKey, {
            auth: { persistSession: false },
        });

        const payload = await req.json().catch(() => null);
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

        return new Response("ok", { status: 200 });
    }

    return new Response("method not allowed", { status: 405 });
});
