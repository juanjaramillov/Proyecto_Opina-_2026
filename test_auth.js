import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing auth...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@opina.cl', // just a dummy to see if it responds with 400 or 500
    password: 'wrongpassword'
  });
  console.log("Error:", error?.message);
  console.log("Status:", error?.status);
}
test();
