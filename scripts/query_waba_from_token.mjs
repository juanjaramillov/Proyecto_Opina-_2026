import fetch from "node-fetch";

const token = "EAAWwVLYEJpwBQ0MZBna4xPb2UeJSEclXvhgOSm04qWZA2SAA4LbY4d4KJRWFvZA9AIp8KYQ9ZBiQsIfiHz33peyUoFx05wgxJUy2TQdLz9XKgGLjSGjNBcOVLP7XhE9nV0tKJryvv8nDTlgcsTephT3nZCIZCE8jclbvqZAVmL3y4tIaYOvuDzW8P4lQuT0Fqu6lgZDZD";
const phoneId = "1067866623067275";

async function run() {
  const accountUrl = `https://graph.facebook.com/v19.0/${phoneId}?fields=whatsapp_business_api_data`;
  let r = await fetch(accountUrl, {headers:{Authorization: `Bearer ${token}`}});
  let data = await r.json();
  console.log("Phone data (WABA):", JSON.stringify(data, null, 2));

  // Let's just ask for message_templates using the system user directly? No, templates are on the WABA.
  // Wait, let's look for WABA accounts directly linked to this user/token:
  const directWabaUrl = `https://graph.facebook.com/v19.0/me/whatsapp_business_accounts?access_token=${token}`;
  r = await fetch(directWabaUrl);
  data = await r.json();
  console.log("Direct WABA Accounts:", JSON.stringify(data, null, 2));
}
run();
