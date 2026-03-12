import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config({ path: '.env.local' });

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const templateName = "invitaciones_opina_mas_definitivas";
const testPhone = "56991284219";

async function run() {
  const waPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: testPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: "es_CL" },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                link: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/512px-React-icon.svg.png"
              }
            }
          ]
        },
        { 
          type: "body", 
          parameters: [{ type: "text", text: "TEST-CODE" }] 
        }
      ]
    }
  };
  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(waPayload)
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(JSON.stringify(data, null, 2));
  } catch(e) { console.error(e); }
}
run();
