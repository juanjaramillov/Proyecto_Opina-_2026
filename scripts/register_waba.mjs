import { config } from "dotenv";
config({ path: '/Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V13/.env.local' });

const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function checkAccountStatus() {
  console.log(`Checking status for Phone ID: ${waPhoneId}`);
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${waToken}`
      }
    });
    
    const data = await res.json();
    console.log("Status check:", JSON.stringify(data, null, 2));

    const resRegister = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/register`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${waToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messaging_product: "whatsapp", pin: "123456" })
    });
    const dataReg = await resRegister.json();
    console.log("Registration API attempt:", JSON.stringify(dataReg, null, 2));
  } catch(e) {
    console.error("Error:", e);
  }
}

checkAccountStatus();
