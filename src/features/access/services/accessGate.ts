export const accessGate = {
    /**
     * Indica si el access gate piloto está activo.
     * Toggle vía VITE_ACCESS_GATE_ENABLED=false (solo para entornos de desarrollo).
     *
     * No existe bypass client-side: los admins entran con role='admin' en su JWT
     * (emitido por Supabase Auth) y los usuarios piloto con la claim access_granted
     * puesta por el RPC server-side grant_pilot_access().
     */
    isEnabled(): boolean {
        return import.meta.env.VITE_ACCESS_GATE_ENABLED !== 'false';
    }
};
