import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { computeAccountProfile } from './account';
import { DemographicData, AccountProfile, AccountTier } from '../types';
import { logger } from '../../../lib/logger';
import { normalizeAllDemographics } from '../../../lib/demographicsNormalize';
import { typedRpc } from '../../../supabase/typedRpc';

const sb = supabase as unknown as SupabaseClient<Database>;

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];
type SubscriptionRow = Database['public']['Tables']['subscription_plans']['Row'];

/**
 * Error específico de registro, con código para permitir UX diferenciada
 * en la pantalla de registro (p.ej. mostrar link a login si EMAIL_EXISTS).
 *
 * Códigos posibles (reflejan lo que devuelve la Edge Function register-user):
 *   - EMAIL_EXISTS            (409) email ya registrado
 *   - INVALID_EMAIL           (400)
 *   - INVALID_PASSWORD        (400)
 *   - INVALID_NICKNAME        (400)
 *   - CAPTCHA_MISSING         (400) token de Turnstile no enviado
 *   - CAPTCHA_FAILED          (403) token de Turnstile rechazado
 *   - RATE_LIMITED            (429) demasiados intentos
 *   - BAD_REQUEST             (400) body malformado
 *   - PROFILE_CREATION_FAILED (500) rollback ocurrido
 *   - SIGNUP_FAILED           (400) error genérico de auth
 *   - SERVER_MISCONFIGURED    (500) env vars faltantes
 *   - METHOD_NOT_ALLOWED      (405)
 *   - NETWORK_ERROR           (cliente) problema de red
 *   - LOGIN_AFTER_REGISTER_FAILED (cliente) cuenta OK pero login falló
 */
export class RegistrationError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'RegistrationError';
    }
}

export const authService = {
    /**
     * Fetches complete profile from multiple tables + computed tiers.
     * Source of truth for AccountProfile.
     */
    async fetchFullProfile(): Promise<AccountProfile | null> {
        const { data: auth, error: authErr } = await sb.auth.getSession();
        if (authErr || !auth?.session?.user) {
            // Guest mode
            return computeAccountProfile({
                tier: 'guest',
                profileCompleteness: 0,
                isProfileComplete: false,
                hasCI: false
            });
        }

        // 2. REAL USER MODE (Continue if auth.user exists)
        if (auth?.session?.user) {
            const user = auth.session.user;
            const [profileRes, identityRes, subRes, userRes] = await Promise.all([
                sb.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
                sb.from('users').select('is_identity_verified').eq('user_id', user.id).maybeSingle(),
                sb.from('subscription_plans').select('plan_name').eq('user_id', user.id).maybeSingle(),
                sb.from('users').select('role, invitation_code_id').eq('user_id', user.id).maybeSingle()
            ]);

            const profileData = profileRes.data as UserProfileRow | null;
            const identityData = identityRes.data as Pick<UserRow, 'is_identity_verified'> | null;
            const userMetaData = userRes.data as Pick<UserRow, 'role' | 'invitation_code_id'> | null;
            const role = userMetaData?.role as string | undefined;
            const invitationCodeId = userMetaData?.invitation_code_id as string | undefined;

            if (!profileData) {
                // If user exists in Auth but profiles fetch failed
                return computeAccountProfile({
                    id: user.id,
                    tier: role === 'admin' ? 'verified_full_ci' : 'registered',
                    profileCompleteness: 0,
                    isProfileComplete: false,
                    hasCI: false,
                    displayName: user.user_metadata?.display_name || user.email?.split('@')[0],
                    email: user.email,
                    role: role,
                    invitation_code_id: invitationCodeId
                });
            }

            // Business Logic: Subscription overrides Tier
            const planName = (subRes.data as SubscriptionRow | null)?.plan_name;
            const isPro = planName === 'pro_user';
            const isEnterprise = planName === 'enterprise';

            const completionPercentage = profileData.profile_completeness || 0;
            const profileStage = profileData.profile_stage || 0;
            const isProfileComplete = completionPercentage === 100 || profileStage >= 4;
            const hasCI = identityData?.is_identity_verified || false;

            // Determine final tier
            let finalTier: AccountTier = "registered";
            if (role === 'admin') finalTier = "verified_full_ci";
            else if (isEnterprise) finalTier = "verified_full_ci"; // Enterprise are full
            else if (isPro) finalTier = "verified_full_ci";     // Pro are full
            else if (hasCI) finalTier = "verified_full_ci";
            else if (isProfileComplete) finalTier = "verified_basic";

            // Normalization
            const localDemographics: DemographicData = normalizeAllDemographics({
                birthYear: profileData.birth_year,
                gender: profileData.gender,
                region: profileData.region,
                comuna: profileData.comuna,
                employmentStatus: profileData.employment_status,
                incomeRange: profileData.income_range,
                educationLevel: profileData.education_level,
                housingType: profileData.housing_type,
                purchaseBehavior: profileData.purchase_behavior,
                influenceLevel: profileData.influence_level,
                profileStage: profileData.profile_stage,
                signalWeight: profileData.signal_weight,
                householdSize: profileData.household_size,
                childrenCount: profileData.children_count,
                carCount: profileData.car_count
            });

            return computeAccountProfile({
                id: user.id,
                tier: finalTier,
                profileCompleteness: completionPercentage,
                isProfileComplete: isProfileComplete,
                hasCI: hasCI,
                displayName: profileData.nickname || user.user_metadata?.display_name || user.email?.split('@')[0],
                email: user.email,
                role: userMetaData?.role || undefined,
                invitation_code_id: userMetaData?.invitation_code_id || undefined,
                demographics: {
                    ...localDemographics,
                    birthYear: profileData.birth_year || localDemographics.birthYear,
                    gender: profileData.gender || localDemographics.gender,
                    region: profileData.region || localDemographics.region,
                    commune: profileData.comuna || localDemographics.commune,
                    employmentStatus: profileData.employment_status || localDemographics.employmentStatus,
                    incomeRange: profileData.income_range || localDemographics.incomeRange,
                    educationLevel: profileData.education_level || localDemographics.educationLevel,
                    housingType: profileData.housing_type || localDemographics.housingType,
                    purchaseBehavior: profileData.purchase_behavior || localDemographics.purchaseBehavior,
                    influenceLevel: profileData.influence_level || localDemographics.influenceLevel,
                    profileStage: profileData.profile_stage || localDemographics.profileStage,
                    signalWeight: profileData.signal_weight || localDemographics.signalWeight,
                    householdSize: profileData.household_size || localDemographics.householdSize,
                    childrenCount: profileData.children_count || localDemographics.childrenCount,
                    carCount: profileData.car_count || localDemographics.carCount,
                }
            });
        }

        return null;
    },

    async updateProfileDisplayName(nickname: string): Promise<void> {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error("No authenticated user");

        const { error } = await sb
            .from('user_profiles')
            .update({ nickname })
            .eq('user_id', user.id);

        if (error) {
            logger.error("Update Nickname Error:", error);
            throw error;
        }
    },

    /**
     * Direct demographic save (legacy/Wizard).
     * Now using normalization.
     */
    async saveDemographic(payload: DemographicData): Promise<void> {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error("No authenticated user");

        // Convert frontend keys to DB snake_case
        const updatePayload = {
            birth_year: payload.birthYear,
            gender: payload.gender,
            region: payload.region,
            comuna: payload.commune,
            employment_status: payload.employmentStatus,
            income_range: payload.incomeRange,
            education_level: payload.educationLevel,
            housing_type: payload.housingType,
            purchase_behavior: payload.purchaseBehavior,
            influence_level: payload.influenceLevel,
            profile_stage: payload.profileStage,
            signal_weight: payload.signalWeight,
            household_size: payload.householdSize,
            children_count: payload.childrenCount,
            car_count: payload.carCount,
            updated_at: new Date().toISOString()
        };

        const { error } = await sb
            .from('user_profiles')
            .update(updatePayload as Database['public']['Tables']['user_profiles']['Update'])
            .eq('user_id', user.id);

        if (error) {
            logger.error("Save Demographic Error:", error);
            throw error;
        }
    },

    /**
     * High level demographics updater (V2).
     */
    async updateProfileDemographics(data: Partial<DemographicData>): Promise<void> {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error("No authenticated user");

        const updatePayload: Record<string, unknown> = {
            updated_at: new Date().toISOString()
        };

        if (data.birthYear !== undefined) updatePayload.birth_year = data.birthYear;
        if (data.gender !== undefined) updatePayload.gender = data.gender;
        if (data.region !== undefined) updatePayload.region = data.region;
        if (data.commune !== undefined) updatePayload.comuna = data.commune;
        if (data.employmentStatus !== undefined) updatePayload.employment_status = data.employmentStatus;
        if (data.incomeRange !== undefined) updatePayload.income_range = data.incomeRange;
        if (data.educationLevel !== undefined) updatePayload.education_level = data.educationLevel;
        if (data.housingType !== undefined) updatePayload.housing_type = data.housingType;
        if (data.purchaseBehavior !== undefined) updatePayload.purchase_behavior = data.purchaseBehavior;
        if (data.influenceLevel !== undefined) updatePayload.influence_level = data.influenceLevel;
        if (data.profileStage !== undefined) updatePayload.profile_stage = data.profileStage;
        if (data.signalWeight !== undefined) updatePayload.signal_weight = data.signalWeight;
        if (data.householdSize !== undefined) updatePayload.household_size = data.householdSize;
        if (data.childrenCount !== undefined) updatePayload.children_count = data.childrenCount;
        if (data.carCount !== undefined) updatePayload.car_count = data.carCount;

        const { error } = await sb
            .from('user_profiles')
            .update(updatePayload as Database['public']['Tables']['user_profiles']['Update'])
            .eq('user_id', user.id);

        if (error) {
            logger.error("Update Demographics Error:", error);
            throw error;
        }
    },

    /**
     * Consuming invitation code $invitation_code user $nickname
     */
    async consumeInvitation(code: string, _nickname: string): Promise<void> {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error("No authenticated user");
        const { data, error } = await typedRpc<{ ok: boolean; error?: string }>('bootstrap_user_after_signup_v2', {
                p_nickname: _nickname,
                p_invitation_code: code
            });

        if (error) {
            logger.error("Error consumiendo código de invitación", { domain: 'auth', action: 'consume_invitation', code }, error);
            throw error;
        }
        
        if (!data || !data.ok) {
            throw new Error(data?.error || "Error consumiendo código");
        }
    },

    /**
     * Registro atómico via Edge Function `register-user`.
     *
     * Reemplaza al flujo anterior `registerWithEmail` + navegación a
     * /complete-profile, que dejaba `auth.users` huérfanos si el
     * usuario cerraba el navegador a medio camino.
     *
     * La Edge Function crea `auth.user` + `users` + `user_profiles`
     * atómicamente, y hace rollback (borra auth.user) si algo falla
     * después de crearlo.
     *
     * Después de success, hace signInWithPassword para establecer
     * sesión local.
     *
     * @throws RegistrationError con código específico (EMAIL_EXISTS,
     *         INVALID_NICKNAME, RATE_LIMITED, etc.) para permitir UX
     *         específica en la pantalla de registro.
     */
    async registerWithProfile(email: string, password: string, nickname: string, captchaToken: string | null): Promise<void> {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new RegistrationError('SERVER_MISCONFIGURED', 'Configuración del cliente incompleta.');
        }

        const url = `${supabaseUrl}/functions/v1/register-user`;
        let response: Response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': supabaseAnonKey,
                    'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                // captchaToken puede ser null en entornos sin site key configurada
                // (ej. local dev). El backend decide si rechazar o aceptar
                // según su propia config de TURNSTILE_SECRET_KEY.
                body: JSON.stringify({ email, password, nickname, captchaToken }),
            });
        } catch (netErr) {
            logger.error('Error de red en registro atómico', { domain: 'auth', action: 'register_with_profile', email }, netErr);
            throw new RegistrationError('NETWORK_ERROR', 'Problema de conexión. Revisa tu internet e intenta de nuevo.');
        }

        let body: { ok?: boolean; error?: string; code?: string; user_id?: string } = {};
        try {
            body = await response.json();
        } catch {
            // falla al parsear — usar defaults
        }

        if (!response.ok || !body.ok) {
            const code = body.code ?? 'UNKNOWN_ERROR';
            const msg = body.error ?? 'Error inesperado creando la cuenta.';
            logger.error('Registro atómico rechazado', { domain: 'auth', action: 'register_with_profile', email, code }, new Error(msg));
            throw new RegistrationError(code, msg);
        }

        // Registro exitoso → iniciar sesión
        const { error: loginError } = await sb.auth.signInWithPassword({ email, password });
        if (loginError) {
            // La cuenta se creó pero el login falló. Raro pero posible (p.ej. si la
            // verificación de email está activa). No hay huérfano de user_profiles
            // porque la Edge Function los creó. Dejamos mensaje específico.
            logger.error('Login post-registro falló', { domain: 'auth', action: 'register_with_profile', email }, loginError);
            throw new RegistrationError(
                'LOGIN_AFTER_REGISTER_FAILED',
                'Tu cuenta se creó pero no se pudo iniciar sesión automáticamente. Intenta iniciar sesión manualmente.'
            );
        }
    },

    /**
     * @deprecated Usar `registerWithProfile` en lugar. Este método queda
     * como fallback por compatibilidad pero tiene el bug de dejar
     * `auth.users` huérfanos si el usuario abandona antes de completar.
     */
    async registerWithEmail(email: string, password: string, nickname?: string): Promise<void> {
        const { error } = await sb.auth.signUp({
            email,
            password,
            options: {
                data: { nickname }
            }
        });
        if (error) {
            logger.error("Error en registro por email", { domain: 'auth', action: 'register_email', email }, error);
            throw error;
        }
    },

    async loginWithEmail(email: string, password: string): Promise<void> {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) {
            logger.error("Error en login por email", { domain: 'auth', action: 'login_email', email }, error);
            throw error;
        }
    },

    async resetPasswordForEmail(email: string): Promise<void> {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
    },

    async updateUserPassword(password: string): Promise<void> {
        const { error } = await sb.auth.updateUser({ password });
        if (error) throw error;
    },

    async getBootstrapStatus(): Promise<{ needsBootstrap: boolean }> {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return { needsBootstrap: false };

        const { data, error } = await sb
            .from('user_profiles')
            .select('profile_stage')
            .eq('user_id', user.id)
            .maybeSingle();

        if (error || !data) return { needsBootstrap: true };

        return {
            needsBootstrap: (data as { profile_stage: number | null }).profile_stage === 0
        };
    },

    async signOut(): Promise<void> {
        const { error } = await sb.auth.signOut();
        if (error) throw error;
    },

    /**
     * Bootstraps user record after signup using RPC
     */
    async bootstrapUserAfterSignup(_nickname: string, invitationCode: string = ''): Promise<void> {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) throw new Error("No authenticated user");
        const userId = user.id;
        const { data, error } = await typedRpc<{ ok: boolean; error?: string }>('bootstrap_user_after_signup_v2', {
                p_nickname: _nickname,
                p_invitation_code: invitationCode
            });

        if (error) {
            logger.error("Error crítico en Bootstrap de usuario (RPC falló)", { 
                domain: 'auth', 
                action: 'bootstrap_user', 
                state: 'failed',
                userId,
                invitationCode
            }, error);
            throw error;
        }

        const result = data as { success: boolean, error?: string } | boolean | null;
        if (typeof result === 'object' && result !== null && !result.success) {
            throw new Error(result.error || "Bootstrap failed");
        } else if (result === false) {
            throw new Error("Bootstrap failed");
        }
    },

    /**
     * Sync profile metrics from local stats (rarely used, mostly for loyalty jumps)
     */
    async syncProfileFromLocal(): Promise<void> {
        const { data: { user } } = await sb.auth.getUser();
        if (!user) return;
        const userId = user.id;

        // Force a fresh calculation in backend
        const { error: rpcError } = await typedRpc<unknown>('refresh_user_influence_rank', {
            p_user_id: userId
        });
        if (rpcError) {
            logger.error("Failed to refresh influence rank", { domain: 'auth', action: 'refresh_rank' }, rpcError);
        }
    },

    /**
     * Verifies if an invitation code is valid BEFORE signup
     */
    async verifyInvitationCode(code: string): Promise<{ valid: boolean; message?: string }> {
        const { data, error } = await sb
            .from('invitation_codes')
            .select('status')
            .eq('code', code.trim().toUpperCase())
            .maybeSingle();

        if (error || !data) return { valid: false, message: "Código no encontrado" };
        if (data.status !== 'active') return { valid: false, message: "Código ya utilizado o inactivo" };

        return { valid: true };
    },

    /**
     * OAuth Handlers
     */
    prepareOAuthBootstrap(nickname: string, inviteCode: string) {
        sessionStorage.setItem('pending_oauth_data', JSON.stringify({ nickname, inviteCode }));
    },

    getStoredOAuthBootstrap(): { nickname: string; inviteCode: string } | null {
        const raw = sessionStorage.getItem('pending_oauth_data');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    clearOAuthBootstrap() {
        sessionStorage.removeItem('pending_oauth_data');
    }
};
