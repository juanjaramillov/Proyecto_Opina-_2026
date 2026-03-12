import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function getTemplates() {
  const phoneRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const phoneData = await phoneRes.json();
  // console.log("Phone data:", phoneData);
  
  const wabaId = phoneData.account_id || process.env.WHATSAPP_WABA_ID; // account_id might not be there depending on fields
  // if not, let's just fetch fields
  
  const wabaRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}?fields=whatsapp_business_api_data`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  // Actually, wait, it's easier to just fetch from the app token, or if the user knows the template language.
}
