import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const supabase = createClient(
  process.env.SUPABASE_URL || "https://neltawfiwpvunkwyvfse.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Cannot use real key in bash script
);
