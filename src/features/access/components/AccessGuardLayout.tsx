import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import { accessGate } from "../services/accessGate";

export default function AccessGuardLayout() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        let alive = true;

        const run = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                const session = data?.session;

                if (!session) {
                    if (!alive) return;
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                // Consulta rol admin en tabla de app (ajustado a user_id)
                const { data: u, error } = await (supabase as any)
                    .from("users")
                    .select("role")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                if (!alive) return;

                if (error) {
                    setIsAdmin(false);
                } else {
                    setIsAdmin((u?.role ?? "") === "admin");
                }

                setLoading(false);
            } catch {
                if (!alive) return;
                setIsAdmin(false);
                setLoading(false);
            }
        };

        run();
        return () => { alive = false; };
    }, []);

    if (loading) return null;

    // ADMIN: jamás se bloquea por Access Gate
    if (isAdmin) return <Outlet />;

    // Si gate deshabilitado por env
    if (!accessGate.isEnabled()) return <Outlet />;

    // Público: si no tiene token, mandar a /access
    if (!accessGate.hasAccess()) {
        const next = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/access?next=${next}`} replace />;
    }

    return <Outlet />;
}
