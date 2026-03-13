import { config } from "dotenv";
config({ path: '/Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V13/.env.local' });

const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
const wabaId = "918306757653627"; 

async function getTemplates() {
  console.log(`Fetching templates for WABA: ${wabaId}`);
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${wabaId}/message_templates`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${waToken}`
      }
    });
    
    const data = await res.json();
    console.log("Templates:");
    if (data.data) {
       data.data.forEach(t => console.log(`- Name: ${t.name}, Language: ${t.language}, Status: ${t.status}`));
    } else {
       console.log(JSON.stringify(data, null, 2));
    }
  } catch(e) {
    console.error("Error:", e);
  }
}

getTemplates();
