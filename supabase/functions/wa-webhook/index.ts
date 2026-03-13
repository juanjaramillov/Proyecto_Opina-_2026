import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || 'my_super_secret_token';

serve(async (req) => {
  const url = new URL(req.url);

  // Verification request from Meta
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('Forbidden', { status: 403 });
    }
  }

  // Incoming webhook payload
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log("=== INCOMING WEBHOOK FROM META ===");
      console.log(JSON.stringify(body, null, 2));

      // Save to database for permanent logging
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          await supabase.from('whatsapp_webhook_logs').insert([{ payload: body }]);
        }
      } catch (dbErr) {
        console.error("Database logging error:", dbErr);
      }

      // Extract status updates
      if (body.entry?.[0]?.changes?.[0]?.value?.statuses) {
        const statuses = body.entry[0].changes[0].value.statuses;
        for (const status of statuses) {
          console.log(`[STATUS UPDATE] ID: ${status.id} | Status: ${status.status}`);
          if (status.errors) {
            console.error(`[DELIVERY ERROR] Reason:`, JSON.stringify(status.errors, null, 2));
          }
        }
      }

      return new Response('EVENT_RECEIVED', { status: 200 });
    } catch (e) {
      console.error("Webhook processing error:", e);
      return new Response('Error', { status: 500 });
    }
  }

  return new Response('Method Not Allowed', { status: 405 });
});
