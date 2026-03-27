import { createClient } from '@supabase/supabase-js'
import type { LegacyDatabaseUnsafe } from '../features/shared/types/database-legacy-unsafe'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// CLIENTE LEGACY UNSAFE: Solo para uso en módulos antiguos que causarían error de tipos en runtime vivo
export const supabaseLegacyUnsafe = createClient<LegacyDatabaseUnsafe>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Override default lock to handle the "Acquiring an exclusive Navigator LockManager lock timed out" error
        lock: (_name, _acquireTimeout, fn) => {
            return fn()
        },
    },
})
