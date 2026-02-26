import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import { accessGate } from "../services/accessGate";

function looksLikeUuid(x: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
}

function normalizeCodeToken(tokenId: string) {
    return (tokenId.startsWith("CODE:") ? tokenId.slice(5) : tokenId).trim().toUpperCase();
}

export default function AccessGuardLayout() {
    const location = useLocation();

    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasInviteBound, setHasInviteBound] = useState(false);

    const [gateChecked, setGateChecked] = useState(false);
    const [tokenValid, setTokenValid] = useState(true);

    useEffect(() => {
        let alive = true;

        const run = async () => {
            try {
                // 1) Sesión
                const { data } = await supabase.auth.getSession();
                const session = data?.session;

                // 2) Si hay sesión: leer rol + si ya tiene invite amarrado (invitation_code_id)
                let admin = false;
                let inviteBound = false;

                if (session) {
                    const { data: u, error } = await (supabase as any)
                        .from("users")
                        .select("role, invitation_code_id")
                        .eq("user_id", session.user.id)
                        .maybeSingle();

                    if (!error) {
                        admin = (u?.role ?? "") === "admin";
                        inviteBound = !!u?.invitation_code_id;
                    }
                }

                if (!alive) return;

                setIsAdmin(admin);
                setHasInviteBound(inviteBound);

                // ADMIN o usuario ya “claimed”: nunca depender del token del Access Gate
                if (admin || inviteBound) {
                    setTokenValid(true);
                    setGateChecked(true);
                    setLoading(false);
                    return;
                }

                // 3) Gate deshabilitado: permitir
                if (!accessGate.isEnabled()) {
                    setTokenValid(true);
                    setGateChecked(true);
                    setLoading(false);
                    return;
                }

                // 4) Si no hay pase local, no validamos nada acá; el render hará redirect a /access
                if (!accessGate.hasAccess()) {
                    setTokenValid(true);
                    setGateChecked(true);
                    setLoading(false);
                    return;
                }

                const tokenId = accessGate.getTokenId();
                if (!tokenId) {
                    setTokenValid(false);
                    setGateChecked(true);
                    setLoading(false);
                    return;
                }

                // 5) Validación del pase: uuid => validate_invite_token, code => validate_invitation
                if (looksLikeUuid(tokenId)) {
                    const { data: ok, error } = await (supabase as any).rpc("validate_invite_token", {
                        p_invite_id: tokenId,
                    });

                    if (!alive) return;
                    setTokenValid(!error && Boolean(ok));
                    setGateChecked(true);
                    setLoading(false);
                    return;
                }

                const code = normalizeCodeToken(tokenId);
                const { data: isValid, error } = await (supabase as any).rpc("validate_invitation", {
                    p_code: code,
                });

                if (!alive) return;
                setTokenValid(!error && Boolean(isValid));
                setGateChecked(true);
                setLoading(false);
            } catch {
                if (!alive) return;
                setIsAdmin(false);
                setHasInviteBound(false);
                setTokenValid(false);
                setGateChecked(true);
                setLoading(false);
            }
        };

        run();
        return () => {
            alive = false;
        };
    }, []);

    if (loading) return null;

    // ADMIN: jamás se bloquea por Access Gate
    if (isAdmin) return <Outlet />;

    // Usuario autenticado con invite amarrado: bypass total
    if (hasInviteBound) return <Outlet />;

    // Gate deshabilitado por env
    if (!accessGate.isEnabled()) return <Outlet />;

    // Esperar validación
    if (!gateChecked) return null;

    // Token inválido: revocar y pedir código de nuevo
    if (!tokenValid) {
        accessGate.revoke();
        const next = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/access?next=${next}`} replace />;
    }

    // Público: si no tiene pase local, mandar a /access
    if (!accessGate.hasAccess()) {
        const next = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/access?next=${next}`} replace />;
    }

    return <Outlet />;
}
