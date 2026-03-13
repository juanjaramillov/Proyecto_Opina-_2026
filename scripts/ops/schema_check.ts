import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Let's call a simple RPC to get all tables if possible, but actually we can just list them using supabase-js if we try to query pg_class? No, supabase-js doesn't allow that.
  // Instead, let's use the REST API of supabase directly to fetch the openapi spec.
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: { 'apikey': supabaseKey }
  });
  const data = await res.json();
  const tables = Object.keys(data.definitions);
  console.log("All tables/views:", tables);
}

checkSchema();
