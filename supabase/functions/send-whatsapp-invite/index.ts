import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { invitation_id, phone_e164 } = body;

    if (!invitation_id || !phone_e164) {
      throw new Error("Missing invitation_id or phone_e164");
    }

    // Initialize Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Fetch the code
    const { data: inviteData, error: inviteError } = await supabaseAdmin
      .from('invitation_codes')
      .select('code, whatsapp_status')
      .eq('id', invitation_id)
      .single();

    if (inviteError || !inviteData) {
      throw new Error(`Invitation not found or error loading it: ${inviteError?.message}`);
    }

    const { code } = inviteData;

    // Call Meta Graph API
    const waToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    const waPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

    if (!waToken || !waPhoneId) {
       throw new Error("Missing WhatsApp configuration (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID)");
    }

    // We'll send a template message containing the code.
    const templateName = Deno.env.get('WHATSAPP_INVITE_TEMPLATE_NAME') || 'invitacion_oficial_opina';

    const waPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phone_e164.replace('+', ''), // Meta requires phone number without '+', e.g., '56912345678'
      type: "template",
      template: {
        name: templateName,
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
                text: code
              }
            ]
          }
        ]
      }
    };

    console.log(`Sending WhatsApp message to ${waPayload.to} for invite ${invitation_id}`);

    const metaRes = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${waToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(waPayload)
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      console.error("WhatsApp API Error:", metaData);
      
      // Update invitation with error
      await supabaseAdmin
        .from('invitation_codes')
        .update({
          whatsapp_status: 'error',
          whatsapp_error: metaData.error?.message || 'Unknown WhatsApp API error',
          whatsapp_last_sent_at: new Date().toISOString()
        })
        .eq('id', invitation_id);

      throw new Error(`WhatsApp API Error: ${metaData.error?.message || 'Unknown Error'}`);
    }

    // Success response indicates message queued
    const messageId = metaData.messages?.[0]?.id || 'unknown';

    // Update the invite status
    await supabaseAdmin
      .from('invitation_codes')
      .update({
        whatsapp_status: 'sent',
        whatsapp_phone: phone_e164, // the original with '+'
        whatsapp_message_id: messageId,
        whatsapp_sent_at: new Date().toISOString(),
        whatsapp_last_sent_at: new Date().toISOString(),
        whatsapp_error: null
      })
      .eq('id', invitation_id);

    return new Response(JSON.stringify({ success: true, messageId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 to prevent Supabase JS client from swallowing the exact error message
    });
  }
});
