import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../../../supabase/client';
import { AccountProfile } from '../types';
import { authService as profileService } from '../services/authService';

interface AuthContextType {
    profile: AccountProfile | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<AccountProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {
        try {
            const p = await profileService.getEffectiveProfile();
            setProfile(p);
        } catch (err) {
            console.error("Error loading profile in context:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();

        // Listen for Auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            loadProfile();
        });

        // Listen for local changes
        const onUpdate = () => loadProfile();
        window.addEventListener('storage', onUpdate);
        window.addEventListener('opina:verification_update', onUpdate);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('storage', onUpdate);
            window.removeEventListener('opina:verification_update', onUpdate);
        };
    }, []);

    return (
        <AuthContext.Provider value={{ profile, loading, refreshProfile: loadProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
