import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { join } from 'path'

dotenv.config({ path: join(process.cwd(), '.env.development.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole)

async function run() {
    const authRes = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const normal = authRes.data.users.find(u => u.email === 'test_normal_user@opina.plus')
    if (normal) {
        const { data } = await supabaseAdmin.from('user_profiles').select('*').eq('user_id', normal.id)
        console.log(JSON.stringify(data, null, 2))
    } else {
        console.log("Normal user not found in auth.users")
    }
}
run()
