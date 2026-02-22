import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";

interface UserRoleData {
    role: string;
}

interface OrgMemberData {
    org_id: string;
    role: string;
    organizations: {
        name: string;
    } | null;
}

export function useRole() {
    const [role, setRole] = useState<string | null>(null);
    const [orgId, setOrgId] = useState<string | null>(null);
    const [orgRole, setOrgRole] = useState<string | null>(null);
    const [orgName, setOrgName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccessData = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                setRole(null);
                setLoading(false);
                return;
            }

            try {
                // 1. Obtener rol global
                const { data: userData, error: userError } = await (supabase as any)
                    .from("users")
                    .select("role")
                    .eq("id", session.user.id)
                    .single();

                if (!userError && userData) {
                    setRole((userData as UserRoleData).role);
                }

                // 2. Obtener membresía de organización
                const { data: memberData, error: memberError } = await (supabase as any)
                    .from("organization_members")
                    .select("org_id, role, organizations(name)")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                if (!memberError && memberData) {
                    const member = memberData as OrgMemberData;
                    setOrgId(member.org_id);
                    setOrgRole(member.role);
                    setOrgName(member.organizations?.name || null);
                }
            } catch (error) {
                console.error("[useRole] Error fetching access data:", error);
                setRole("user");
            }

            setLoading(false);
        };

        fetchAccessData();
    }, []);

    return { role, orgId, orgRole, orgName, loading };
}
