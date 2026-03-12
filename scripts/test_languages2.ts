import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

// The user might have named it based on the previous template or "invitaciones"
const possibleTemplates = [
  "invitaciones_opina_mas_definitivas",
  "invitaciones",
  "invitacion",
  "opina_mas",
  "acceso",
  "acceso_opina",
  "bienvenida"
]; 
const testPhone = "56991284219";
const languages = ["es", "es_CL", "es_LA", "es_AR", "es_MX", "es_ES"];

async function testAll() {
  for (const templateName of possibleTemplates) {
    for (const lang of languages) {
      console.log(`Testing template '${templateName}' with language '${lang}'...`);
      const waPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: testPhone,
        type: "template",
        template: {
          name: templateName,
          language: { code: lang },
          components: [
            { type: "header", parameters: [{ type: "image", image: { link: "https://opina-v13.vercel.app/og-image.png" } }] },
            { type: "body", parameters: [{ type: "text", text: "123456" }] }
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
        if (res.ok) {
          console.log(`✅ SUCCESS! Language code '${lang}' works for template '${templateName}'.`);
          return; // exit early on success
        } 
      } catch(e) { console.error(e); }
    }
  }
  console.log("None worked.");
}

testAll();
