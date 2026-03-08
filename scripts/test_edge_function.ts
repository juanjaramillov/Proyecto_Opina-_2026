import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY!;

async function testFunction() {
  const functionUrl = `${supabaseUrl}/functions/v1/send-whatsapp-invite`;
  console.log('Hitting:', functionUrl);

  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        invitation_id: '123e4567-e89b-12d3-a456-426614174000', // dummy UUID
        phone_e164: '+56912345678'
      })
    });

    const text = await res.text();
    console.log(`Status: ${res.status}`);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Fetch failed:', err);
  }
}

testFunction();
