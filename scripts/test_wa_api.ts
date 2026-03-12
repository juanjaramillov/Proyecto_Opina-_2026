import { config } from "dotenv";

config({ path: ".env.local" });

const WA_TOKEN = "EAAQHW2lpH64BQ75cF1A9GFDD1MXNo9VzF9dTybRoO3MnZBMEZBAeO1KULwLGCl1koUYqTTI34S2PoIrsqwAqDfA87MQq4skKRnUoWZBkwWZCvYlYNjdO5xvJNqGKeomIou2kz4zQhIb9mTBLkjQUkz1ZC7ddvFYA2BgHbcszMQkqXIGKnFZCXIx86zp9J1KZCFqNgZDZD";

async function main() {
  const accountId = "907780525441599"; // WhatsApp Business Account ID
  const url = `https://graph.facebook.com/v18.0/${accountId}/message_templates?name=invitaciones_acceso`;
  console.log("Fetching", url);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${WA_TOKEN}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main();
