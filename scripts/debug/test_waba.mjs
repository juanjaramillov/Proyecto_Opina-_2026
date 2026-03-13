import { config } from "dotenv";
config({ path: '/Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V13/.env.local' });

const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

const payload = {
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: "56972165022",
  type: "template",
  template: {
    name: "invitacion_oficial_opina",
    language: { code: "es_CL" },
    components: [
      {
        type: "header",
        parameters: [
          { type: "image", image: { link: "https://proyecto-opina-2026.vercel.app/images/logo-opina-wa.jpg" } }
        ]
      },
      {
        type: "body",
        parameters: [ { type: "text", text: "PRUEBA FINAL REGISTRO" } ]
      }
    ]
  }
};

async function testSend() {
  console.log(`Sending from ${waPhoneId} to ${payload.to}`);
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${waToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}

testSend();
