import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from './client';

/**
 * Helper tipado para llamar RPCs de Supabase que no aparecen en los tipos
 * generados de `database.types.ts` (porque no se han regenerado o porque
 * la RPC es nueva).
 *
 * Centraliza el cast que antes se repetía en cada callsite de servicio
 * como `(sb.rpc as unknown as (fn: string, p: object) => Promise<...>)`.
 * Cuando los tipos generados se actualicen para incluir la RPC, migrar
 * esos callsites a `supabase.rpc` directo y dejar este helper solo para
 * RPCs realmente pendientes de tipar.
 *
 * @template TResult Tipo esperado de `data`. Puede ser un array o un objeto.
 * @param fnName Nombre de la función/RPC en Postgres.
 * @param args Argumentos nombrados (opcional).
 * @returns `{ data, error }` con el mismo shape que `supabase.rpc`, pero `data` tipado como `TResult | null`.
 */
export async function typedRpc<TResult>(
    fnName: string,
    args?: Record<string, unknown>
): Promise<{ data: TResult | null; error: PostgrestError | null }> {
    // Cast necesario: la RPC no existe en el tipo generado. Este es el único
    // `as unknown as` intencional — toda la deuda de casts RPC repetidos en
    // servicios se canaliza por acá.
    //
    // ⚠️ Llamada INLINE (no extraer a variable). Si se hace
    //   `const rpc = supabase.rpc as ...; await rpc(...)` se pierde el `this`
    // del método y el cuerpo interno de Supabase truena con
    //   "Cannot read properties of undefined (reading 'rest')"
    // porque `this.rest.rpc(...)` queda con this=undefined.
    const { data, error } = await (
        supabase.rpc as unknown as (
            fn: string,
            args?: Record<string, unknown>
        ) => Promise<{ data: unknown; error: PostgrestError | null }>
    ).call(supabase, fnName, args);
    return { data: data as TResult | null, error };
}
