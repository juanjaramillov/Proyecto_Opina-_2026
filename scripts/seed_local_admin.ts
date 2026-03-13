import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure it loads the local env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.development.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Needs Service Role to create users

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SERVICE_ROLE_KEY in .env.development.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seedAdmin() {
  console.log('Seeding Local Admin User...');
  
  const email = 'juanjaramillov@gmail.com'; // User's assumed email, or we can use admin@opina.com
  const password = 'password123';

  // 1. Create Auth User
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' }
  });

  if (authError) {
    if (authError.message.includes('already exists')) {
       console.log('Admin user already exists in auth.users.');
    } else {
       console.error('Error creating auth user:', authError);
       return;
    }
  } else {
    console.log(`✅ Auth user created: ${email} / ${password}`);
  }

  // Ensure public profile is set to admin
  if (authData?.user) {
     const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ role: 'admin', signals_daily_limit: -1 })
        .eq('id', authData.user.id);

     if (profileError) {
        console.error('Error updating profile to admin:', profileError);
     } else {
        console.log('✅ Profile updated to Admin privileges.');
     }
  }
}

seedAdmin();
