import { supabase } from '../../../supabase/client';
import { logger } from '../../../lib/logger';

export type AdminUserRow = {
    user_id: string;
    nickname: string | null;
    role: string;
    created_at: string;
    total_interactions: number;
    is_identity_verified: boolean;
};

export const adminUsersService = {
    searchUsers: async (searchTerm: string = ''): Promise<AdminUserRow[]> => {
        try {
            const { data, error } = await supabase.rpc('admin_search_users', { p_search_term: searchTerm });
            if (error) throw error;
            return data as AdminUserRow[];
        } catch (error) {
            logger.error("Error searching users", { domain: 'admin_actions', origin: 'adminUsersService', action: 'search' }, error);
            throw error;
        }
    },

    updateRole: async (userId: string, targetRole: 'user' | 'admin' | 'b2b'): Promise<boolean> => {
        try {
            // F-03: única vía oficial para cambiar role. La RPC valida:
            //   - caller es admin (current_user_is_admin)
            //   - target != caller (no self-change)
            //   - target != admin canónico (UUID e9ac2e3e-…)
            //   - no degradar al último admin
            //   - role ∈ {user, admin, b2b}
            // El audit log lo emite el trigger AFTER UPDATE OF role
            // (audit_role_changes → log_admin_action), no se duplica aquí.
            const { error } = await supabase.rpc('admin_set_user_role', {
                p_target_user_id: userId,
                p_new_role: targetRole,
            });
            if (error) throw error;
            return true;
        } catch (error) {
            logger.error("Error updating user role", { domain: 'admin_actions', origin: 'adminUsersService', action: 'update_role' }, error);
            throw error;
        }
    }
};
