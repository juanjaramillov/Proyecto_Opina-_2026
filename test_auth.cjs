require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing auth...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@opina.cl',
    password: 'wrongpassword'
  });
  console.log("Error object:", error);
}
test().then(() => console.log('Done')).catch(console.error);
