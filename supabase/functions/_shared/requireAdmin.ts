import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export type AdminAuthResult = {
    userId: string;
    role: string;
    supabaseAdmin: SupabaseClient;
}

export async function requireAdmin(req: Request): Promise<AdminAuthResult> {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid Authorization header' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRole) {
        console.error("Missing critical Supabase environment variables in Edge Function.");
        throw new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // 1. Validar el JWT y obtener el usuario usando anon key
    const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabaseAuthClient.auth.getUser(token);

    if (userError || !userData?.user) {
        throw new Response(JSON.stringify({ error: 'Unauthorized: Invalid token' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const userId = userData.user.id;

    // 2. Comprobar el rol real en public.users con service_role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('user_id', userId)
        .single();

    if (profileError || !profile || profile.role !== 'admin') {
        throw new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return {
        userId,
        role: profile.role,
        supabaseAdmin
    };
}
