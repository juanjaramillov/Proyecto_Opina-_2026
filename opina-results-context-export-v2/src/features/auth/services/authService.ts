import { supabase } from '../../../supabase/client';
import { Database } from '../../../supabase/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { computeAccountProfile } from './account';
import { DemographicData, AccountProfile, AccountTier } from '../types';
import { logger } from '../../../lib/logger';
import { normalizeAllDemographics } from '../../../lib/demographicsNormalize';

const sb = supabase as unknown as SupabaseClient<Database>;

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];
type SubscriptionRow = Database['public']['Tables']['subscription_plans']['Row'];

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
        const { data, error } = await (sb.rpc as unknown as (name: string, args: Record<string, unknown>) => Promise<{ data: { ok: boolean; error?: string } | null; error: unknown }>)('bootstrap_user_after_signup_v2', {
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
        const { data, error } = await (sb.rpc as unknown as (name: string, args: Record<string, unknown>) => Promise<{ data: { ok: boolean; error?: string } | null; error: unknown }>)('bootstrap_user_after_signup_v2', {
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
        const { error: rpcError } = await (sb.rpc as unknown as (name: string, args: Record<string, unknown>) => Promise<{ error: unknown }>)('refresh_user_influence_rank', {
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
        localStorage.setItem('pending_oauth_data', JSON.stringify({ nickname, inviteCode }));
    },

    getStoredOAuthBootstrap(): { nickname: string; inviteCode: string } | null {
        const raw = localStorage.getItem('pending_oauth_data');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    clearOAuthBootstrap() {
        localStorage.removeItem('pending_oauth_data');
    }
};
