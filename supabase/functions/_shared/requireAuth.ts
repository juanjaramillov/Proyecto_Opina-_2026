import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "./requireAdmin.ts";

export type AuthResult = {
    userId: string;
    role: string;
    supabaseAdmin: SupabaseClient;
};

/**
 * Valida JWT y retorna userId + role (cualquier role).
 * A diferencia de requireAdmin, no exige role === 'admin'.
 * La Edge Function llamadora decide qué roles acepta.
 */
export async function requireAuth(req: Request): Promise<AuthResult> {
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

    // 2. Leer role real desde public.users con service_role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('user_id', userId)
        .single();

    if (profileError || !profile) {
        throw new Response(JSON.stringify({ error: 'Forbidden: User profile not found' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return {
        userId,
        role: profile.role,
        supabaseAdmin,
    };
}
