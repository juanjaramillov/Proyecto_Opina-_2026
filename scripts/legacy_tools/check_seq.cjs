const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('results_publication_state').select('id, published_at, publication_seq');
  if (error) {
    console.error('Error fetching data:', error);
    return;
  }
  
  const total = data.length;
  const nulls = data.filter(r => r.publication_seq === null).length;
  console.log(`TOTAL_ROWS=${total}`);
  console.log(`NULL_SEQ=${nulls}`);
  console.log(JSON.stringify(data, null, 2));
}

check();
