import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://example.com"
const supabaseAnonKey = "key"

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        lock: (name, acquireTimeout, fn) => fn()
    }
})
