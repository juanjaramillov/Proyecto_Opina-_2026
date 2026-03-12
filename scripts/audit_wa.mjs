const waToken = "EAAQHW2lpH64BQy4IiDJgGDcAoWfbs1aCqkZBrJ96nQxZAMusoo8gU5bhSggB3h4mwP6ZBr4WA7ZBx2gdZBhWukdgQ7HLyw0P2foXDIEPjyHd9Wk6xZAbQF9chIFltuBZAxX54CDfoKw3PsG9c2nPWsjphIXomVqZBo3eomPcTHjSGP74TNdQTct7Q8xZC2t4nLaCYS7Wt0Wd0sBofRcompeMlFugyN22uCxSXQcoRZCWnjZBT1kbxGyQez968X5Cf9rsxDZAsk5pddyQajS6bZBDNV75Qv0zlKMtYdjYGqlYZD";

async function auditMeta() {
  console.log("1. Checking Token Info...");
  try {
    const debugRes = await fetch(`https://graph.facebook.com/v19.0/debug_token?input_token=${waToken}&access_token=${waToken}`);
    const debugData = await debugRes.json();
    console.log("Token ID mapped to App ID:", debugData.data?.app_id);

    console.log("\n2. Checking User Businesses...");
    const bizRes = await fetch(`https://graph.facebook.com/v19.0/me/businesses?access_token=${waToken}`);
    const bizData = await bizRes.json();
    
    if (bizData.data && bizData.data.length > 0) {
      for (const biz of bizData.data) {
        console.log(`\n-> Business ID: ${biz.id} (${biz.name})`);
        const waAcctsRes = await fetch(`https://graph.facebook.com/v19.0/${biz.id}/owned_whatsapp_business_accounts?access_token=${waToken}`);
        const waAcctsData = await waAcctsRes.json();
        const allAccts = waAcctsData.data || [];
        
        console.log(`Found ${allAccts.length} WhatsApp Business Accounts.`);
        for (const acct of allAccts) {
          console.log(`\n  >> Fetching Phone Numbers for WABA ${acct.id} (${acct.name})...`);
          const phonesRes = await fetch(`https://graph.facebook.com/v19.0/${acct.id}/phone_numbers?access_token=${waToken}`);
          const phonesData = await phonesRes.json();
          const phones = phonesData.data || [];
          for (const phone of phones) {
            console.log(`      * Phone: ${phone.display_phone_number} (ID: ${phone.id}) - Status: ${phone.status}`);
          }
        }
      }
    } else {
      console.log("No businesses found or missing 'business_management' permission.");
    }
    
    // Check WhatsApp accounts mapped directly to user
    console.log("\n3. Fallback: Checking WhatsApp Accounts directly...");
    const directAcctsRes = await fetch(`https://graph.facebook.com/v19.0/me/whatsapp_business_accounts?access_token=${waToken}`);
    const directAcctsData = await directAcctsRes.json();
    if (directAcctsData.data && directAcctsData.data.length > 0) {
        for (const acct of directAcctsData.data) {
            console.log(`Direct WABA: ${acct.id}`);
            const phonesRes = await fetch(`https://graph.facebook.com/v19.0/${acct.id}/phone_numbers?access_token=${waToken}`);
            const phonesData = await phonesRes.json();
            console.log("Direct WABA phones:", JSON.stringify(phonesData.data, null, 2));
        }
    } else {
        console.log("No direct WABA accounts mapped to this user via current token.");
    }

  } catch (err) {
    console.error("Error during audit:", err);
  }
}

auditMeta();
