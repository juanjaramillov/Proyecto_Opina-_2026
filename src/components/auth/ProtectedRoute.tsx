import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase/client";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const loc = useLocation();
    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [profileOk, setProfileOk] = useState(false);

    useEffect(() => {
        let alive = true;

        const run = async () => {
            setLoading(true);

            const { data: auth } = await supabase.auth.getSession();
            const session = auth?.session;

            if (!session) {
                if (!alive) return;
                setAuthed(false);
                setProfileOk(false);
                setLoading(false);
                return;
            }

            // Perfil mínimo: nickname
            const { data: prof, error } = await supabase
                .from("user_profiles")
                .select("nickname")
                .eq("user_id", session.user.id)
                .maybeSingle();

            if (!alive) return;

            setAuthed(true);

            if (error) {
                // Si falla por RLS u otro, mejor forzar completion para no dejar entrar “a medias”
                setProfileOk(false);
            } else {
                const nick = (prof?.nickname ?? "").trim();
                setProfileOk(Boolean(nick));
            }

            setLoading(false);
        };

        run();
        return () => {
            alive = false;
        };
    }, []);

    if (loading) return null;

    if (!authed) {
        const next = encodeURIComponent(loc.pathname + loc.search);
        return <Navigate to={`/login?next=${next}`} replace />;
    }

    if (!profileOk) {
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
}
