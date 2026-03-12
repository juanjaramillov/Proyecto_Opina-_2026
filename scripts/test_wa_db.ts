import { createClient } from "@supabase/supabase-js";
const supabase = createClient("069ee7c1118a9accdef3275fe9e126825377ecadf3558bafc8b4ace3798761b1", "1de62ff7941ca45310a3996fba4e9919a6be7a736b51b44b690b3d08adf8d751");
async function main() {
  const { data, error } = await supabase
    .from("invitation_codes")
    .select("codigo, whatsapp_phone, whatsapp_status, whatsapp_error, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);
  if (error) console.error("Error querying DB:", error);
  else console.table(data);
}
main();
