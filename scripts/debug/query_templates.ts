import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function queryTemplates() {
  try {
    // 1. Get WABA ID
    const phoneRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}?fields=whatsapp_business_api_data`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const phoneData = await phoneRes.json();
    console.log("Phone Data (fields=whatsapp_business_api_data):", JSON.stringify(phoneData, null, 2));

    let wabaId = phoneData?.whatsapp_business_api_data?.business_info?.id;

    // Alternative way to get WABA ID if the above fails
    if (!wabaId) {
      console.log("Trying alternative route to get WABA ID...");
      const altRes = await fetch(`https://graph.facebook.com/v18.0/${phoneId}?fields=account_id`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const altData = await altRes.json();
      console.log("Alternative Phone Data:", altData);
      wabaId = altData.account_id;
    }

    if (!wabaId) {
      // Fallback: Check env var if added manually
      wabaId = process.env.WHATSAPP_WABA_ID;
    }

    if (!wabaId) {
      console.error("Could not determine WABA ID");
      return;
    }

    console.log(`Using WABA ID: ${wabaId}`);

    // 2. Fetch Templates
    const tplRes = await fetch(`https://graph.facebook.com/v18.0/${wabaId}/message_templates`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const tplData = await tplRes.json();
    
    if (tplData.data) {
      console.log(`Found ${tplData.data.length} templates:`);
      tplData.data.forEach((tpl: any) => {
        console.log(`- Name: ${tpl.name}, Language: ${tpl.language}, Status: ${tpl.status}`);
      });
    } else {
      console.log("Templates Response:", tplData);
    }
  } catch (error) {
    console.error("Error fetching templates:", error);
  }
}

queryTemplates();
