
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { logger } from '../lib/logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');

// Warn in development if keys are missing (handled critically in index.tsx)
if (!supabaseUrl || !supabaseAnonKey) {
    if (import.meta.env.MODE !== 'test') {
        logger.warn('CRITICAL: Missing Supabase environment variables. App should be blocked by index.tsx.');
    }
}
