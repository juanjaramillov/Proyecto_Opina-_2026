import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = "f271498eb4deb9f69d253fd497a343df895a30d63d5ced5eb648cec1d49b71a0";
const phoneId = "2acec2fad067c5a6173b0b35053119d5bfb8c3f0fbee72fa3e8149beacbe4a5f";

async function checkTemplate() {
  if (!token) return console.error("No token");
  if (!phoneId) return console.error("No phone id");

  const waPayload = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "56991284219", // User's test number
    type: "template",
    template: {
      name: "invitaciones_acceso",
      language: {
        code: "es_CL"
      },
      components: [
        {
          type: "header",
          parameters: [
            {
              type: "image",
              image: {
                link: "https://opina-v13.vercel.app/og-image.png"
              }
            }
          ]
        },
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: "OP-TEST"
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
    console.log("Meta Response (NO HEADER):", JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }

  console.log(JSON.stringify(tmplData, null, 2));
}

checkTemplate();
