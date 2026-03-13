import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Use the exact parameters from the edge function
const templateName = process.env.WHATSAPP_INVITE_TEMPLATE_NAME || 'invitaciones_opina_mas_definitivas';
const testPhone = process.env.WHATSAPP_TEST_PHONE || '56912345678'; // Provide a valid test phone number if needed, or we just look at the API error

async function testTemplate(lang: string) {
  const waPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "56991284219", // Juan's number seen in check_template.ts
    type: "template",
    template: {
      name: templateName,
      language: {
        code: lang
      },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                link: "https://proyecto-opina-2026.vercel.app/images/logo-opina-wa.jpg?v=3"
              }
            }
          ]
        },
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "123456" // Test code
            }
          ]
        }
      ]
    }
  };

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(waPayload)
    });
    const data = await res.json();
    console.log(`Response for ${lang}:`, JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(`Error for ${lang}:`, e);
  }
}

async function run() {
  console.log("Testing es_CL (current)...");
  await testTemplate("es_CL");
  
  console.log("\Testing es (fallback)...");
  await testTemplate("es");
  
  console.log("\Testing es_LA (Latin America)...");
  await testTemplate("es_LA");
}

run();
