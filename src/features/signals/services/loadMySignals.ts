import { supabase } from "../../../supabase/client";

export async function loadMySignals() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];

    const { data } = await supabase
        .from("signal_events")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

    return data ?? [];
}
