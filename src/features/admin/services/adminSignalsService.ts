import { supabase } from "../../../supabase/client";
import { logger } from "../../../lib/logger";

export interface AdminSignalOption {
    id: string;
    label: string;
    image_url: string | null;
}

export interface AdminSignalRow {
    id: string;
    title: string;
    description: string | null;
    status: string;
    created_at: string;
    category_name: string | null;
    total_votes: number;
    options: AdminSignalOption[];
}

export const adminSignalsService = {
    async searchSignals(searchTerm: string = '', statusFilter: string = 'all', limit: number = 50, offset: number = 0): Promise<AdminSignalRow[]> {
        try {
            const { data, error } = await supabase.rpc('admin_search_battles', {
                search_term: searchTerm,
                status_filter: statusFilter,
                limit_count: limit,
                offset_count: offset
            });

            if (error) {
                logger.error("Error searching signals from admin RPC", { domain: 'admin_actions', origin: 'adminSignalsService', action: 'search_signals' }, error);
                throw error;
            }

            return data as unknown as AdminSignalRow[];
        } catch (error) {
            logger.error("Unexpected error searching signals", { domain: 'admin_actions', origin: 'adminSignalsService', action: 'search_signals' }, error);
            return [];
        }
    },

    async updateStatus(battleId: string, newStatus: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('battles')
                .update({ status: newStatus })
                .eq('id', battleId);

            if (error) {
                return { success: false, error: error.message };
            }
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Error inesperado al actualizar estado' };
        }
    }
};
