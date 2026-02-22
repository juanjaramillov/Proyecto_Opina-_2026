import { supabase } from '../../../supabase/client';
import { Database } from '../../../types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../../../lib/logger';

const sb = supabase as unknown as SupabaseClient<Database>;

export type DepthResponseRow = Database['public']['Functions']['get_depth_analytics']['Returns'][number];
export type DepthComparisonRow = Database['public']['Functions']['get_depth_comparison']['Returns'][number];

export const depthService = {
    async saveDepthStructured(
        optionId: string,
        answers: Array<{ question_key: string; answer_value: string }>
    ): Promise<void> {
        // 1. SECURE RPC CALL
        // El RPC insert_depth_answers maneja internamente:
        // - Obtención de anon_id
        // - Denormalización de segmentación (gender, age_bucket, region)
        const { error } = await sb.rpc('insert_depth_answers', {
            p_option_id: optionId,
            p_answers: answers // Pasa el array directamente como JSONB
        });

        if (error) {
            logger.error('[DepthService] RPC insert_depth_answers failed:', error);
            throw error;
        }
    },

    async getDepthAnalytics(
        optionId: string,
        filters?: { gender?: string | null; age_bucket?: string | null; region?: string | null }
    ): Promise<DepthResponseRow[]> {
        const { data, error } = await sb.rpc('get_depth_analytics', {
            p_option_id: optionId,
            p_gender: filters?.gender || null,
            p_age_bucket: filters?.age_bucket || null,
            p_region: filters?.region || null
        });

        if (error) {
            logger.error('[DepthService] Error in getDepthAnalytics:', error);
            return [];
        }
        return data || [];
    },

    async getDepthComparison(params: {
        optionA: string;
        optionB: string;
        gender?: string | null;
        ageBucket?: string | null;
        region?: string | null;
    }): Promise<DepthComparisonRow[]> {
        const { data, error } = await sb.rpc('get_depth_comparison', {
            p_option_a: params.optionA,
            p_option_b: params.optionB,
            p_gender: params.gender || null,
            p_age_bucket: params.ageBucket || null,
            p_region: params.region || null
        });

        if (error) {
            logger.error('[DepthService] Error in getDepthComparison:', error);
            return [];
        }
        return data || [];
    },

    async getProcessedComparison(params: {
        optionA: string;
        optionB: string;
        gender?: string | null;
        ageBucket?: string | null;
        region?: string | null;
    }): Promise<Record<string, DepthComparisonRow[]>> {
        const rawData = await this.getDepthComparison(params);

        return rawData.reduce((acc: Record<string, DepthComparisonRow[]>, row) => {
            if (!acc[row.question_key]) acc[row.question_key] = [];
            acc[row.question_key].push(row);
            return acc;
        }, {});
    },

    async getDepthTrend(params: {
        optionId: string;
        questionKey: string;
        bucket?: 'hour' | 'day' | 'week';
        gender?: string | null;
        ageBucket?: string | null;
        region?: string | null;
    }): Promise<Database['public']['Functions']['get_depth_trend']['Returns']> {
        const { data, error } = await sb.rpc('get_depth_trend', {
            p_option_id: params.optionId,
            p_question_key: params.questionKey,
            p_bucket: params.bucket || 'day',
            p_gender: params.gender || null,
            p_age_bucket: params.ageBucket || null,
            p_region: params.region || null
        });

        if (error) {
            logger.error('[DepthService] Error in getDepthTrend:', error);
            return [];
        }
        return data || [];
    }
};
