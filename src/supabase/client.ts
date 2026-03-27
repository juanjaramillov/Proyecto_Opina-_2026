import { createClient } from '@supabase/supabase-js'
import type { StrictDatabase } from '../features/shared/types/database-contracts'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient<StrictDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Override default lock to handle the "Acquiring an exclusive Navigator LockManager lock timed out" error
        // Some mobile browsers fail to release locks, causing a 10s timeout that blocks login.
        lock: (_name, _acquireTimeout, fn) => {
            return fn()
        },
    },
})
