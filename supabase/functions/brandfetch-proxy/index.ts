import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain');

    if (!domain) {
      return new Response(JSON.stringify({ error: 'Domain parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('BRANDFETCH_API_KEY');
    if (!apiKey) {
      console.error('Missing BRANDFETCH_API_KEY secret');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call the Brandfetch API
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Brandfetch API error: ${response.status}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const logos = data.logos;

    if (!logos || logos.length === 0) {
      return new Response(JSON.stringify({ error: 'No logos found for domain' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find the best quality SVG or PNG (preferably icon/symbol)
    const bestLogo = logos.find((l: { type: string; formats: { format: string; src: string }[] }) => l.type === 'icon' || l.type === 'symbol') || logos[0];
    const format = bestLogo.formats.find((f: { format: string; src: string }) => f.format === 'svg') 
        || bestLogo.formats.find((f: { format: string; src: string }) => f.format === 'png') 
        || bestLogo.formats[0];

    if (!format || !format.src) {
        return new Response(JSON.stringify({ error: 'No valid image format found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // We successfully got the direct, high-res image URL from Brandfetch API.
    // Instead of serving the JSON, we can fetch the ACTUAL image here and pipe it back, 
    // or just return a 302 Redirect to the image URL so the browser loads it directly.
    // A 302 Redirect is much faster, uses less server RAM, and caches perfectly.
    
    return new Response(null, {
        status: 302,
        headers: {
            ...corsHeaders,
            'Location': format.src,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400' // Cache for 24 hours
        }
    });

  } catch (error) {
    console.error('Error fetching brand logo:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
