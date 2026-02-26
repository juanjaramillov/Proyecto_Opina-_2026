import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabase/client";

function inferReason(pathname: string) {
    if (pathname.startsWith("/results")) return "results";
    if (pathname.startsWith("/rankings")) return "rankings";
    if (pathname.startsWith("/profile")) return "profile";
    if (pathname.startsWith("/b2b")) return "b2b";
    return "auth";
}

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
    const loc = useLocation();
    const [loading, setLoading] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [profileOk, setProfileOk] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

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
                setIsAdmin(false);
                setLoading(false);
                return;
            }

            setAuthed(true);

            // 1. Check if user is Admin
            const { data: userRow } = await supabase
                .from("users")
                .select("role")
                .eq("user_id", session.user.id)
                .maybeSingle();

            const adminStatus = (userRow?.role ?? "") === "admin";
            setIsAdmin(adminStatus);

            if (adminStatus) {
                if (!alive) return;
                setProfileOk(true); // Admins always have profile OK
                setLoading(false);
                return;
            }

            // 2. Normal users: Perfil mínimo REAL: nickname + profile_stage >= 1
            const { data: prof, error } = await supabase
                .from("user_profiles")
                .select("nickname, profile_stage")
                .eq("user_id", session.user.id)
                .maybeSingle();

            if (!alive) return;

            if (error) {
                setProfileOk(false);
            } else {
                const nick = (prof?.nickname ?? "").trim();
                const stage = Number(prof?.profile_stage ?? 0);
                setProfileOk(Boolean(nick) && stage >= 1);
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
        const reason = inferReason(loc.pathname);
        return <Navigate to={`/login?next=${next}&reason=${reason}`} replace />;
    }

    // Admins are exempt from profile completeness checks and wizard
    if (isAdmin && loc.pathname === "/complete-profile") {
        return <Navigate to="/" replace />;
    }

    if (!profileOk) {
        if (loc.pathname === "/complete-profile") return children;
        return <Navigate to="/complete-profile" replace />;
    }

    return children;
}
