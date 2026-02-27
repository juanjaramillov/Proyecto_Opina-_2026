import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
   console.error('No envs');
   process.exit(1);
}

const client = createClient(url, key);

async function run() {
   const { data } = await client.auth.admin.listUsers();
   const user = data.users.find(u => u.email === 'newadmin@test.com');
   if (user) {
      console.log('Found test user, deleting...');
      await client.auth.admin.deleteUser(user.id);
      console.log('Deleted.');
   } else {
      console.log('Test User not found. It might have already been deleted.');
   }
}
run();
