import { useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { AccountProfile } from "./account";
import { profileService } from "../services/profileService";

export function useAccountProfile() {
    const [profile, setProfile] = useState<AccountProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const p = await profileService.getEffectiveProfile();
                if (mounted) {
                    setProfile(p);
                    setLoading(false);
                }
            } catch (err) {
                console.error("Error loading profile:", err);
                if (mounted) setLoading(false);
            }
        };

        // Initial load
        load();

        // Listen for Real Auth changes (Login/Logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            load();
        });

        // Listen for Demo/Local changes
        const onStorage = () => load();
        window.addEventListener('storage', onStorage);
        window.addEventListener('opina:verification_update', onStorage);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('opina:verification_update', onStorage);
        };
    }, []);

    return { profile, loading };
}

