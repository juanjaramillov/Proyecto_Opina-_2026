import 'dotenv/config';
const waToken = process.env.WHATSAPP_ACCESS_TOKEN;

async function debugToken() {
  console.log("Token length:", waToken ? waToken.length : 0);
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${waToken}`);
    const data = await res.json();
    console.log("Me endpoint:", data);
  } catch(e) {
    console.error(e);
  }
}

debugToken();
