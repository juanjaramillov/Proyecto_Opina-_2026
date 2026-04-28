import { vi } from 'vitest';

/**
 * Helper para construir un mock chainable + thenable que imita la API de
 * `supabase.from(...).select(...).eq(...).order(...).limit(...).maybeSingle()`.
 *
 * El cliente PostgREST de Supabase tiene la propiedad de que la cadena
 * misma es una Promise (resuelve a `{ data, error, count? }`) Y también
 * es chainable. Este helper replica ese comportamiento con un objeto que:
 *   1. Tiene cada método chainable (`select`, `eq`, etc.) que devuelve `this`.
 *   2. Implementa `then`/`catch` para que `await` la cadena directamente
 *      resuelva a `{ data, error, count }`.
 *   3. Implementa los terminales explícitos (`maybeSingle`, `single`) que
 *      también resuelven a `{ data, error }`.
 *   4. Mutations (`insert`, `upsert`, `update`, `delete`) son también
 *      terminales — devuelven la cadena para encadenarse con `.select()`,
 *      pero también son thenable.
 *
 * Cobertura conocida (suficiente para el ~95% del código actual del repo):
 *   select, insert, upsert, update, delete, eq, neq, in, is, not, gt, gte,
 *   lt, lte, like, ilike, or, and, filter, match, range, order, limit,
 *   offset, maybeSingle, single, returns, csv.
 *
 * Casos NO cubiertos (requieren override manual en el test):
 *   - `select(cols, { count: 'estimated' })` retorna `{ count, ... }` con
 *     comportamiento ligeramente distinto. El mock devuelve lo que pongas
 *     en `data` + `count`. Si el código bajo test lee `count` directamente,
 *     pasalo en el `returnValue`.
 *   - `.rpc(...)` — usar `vi.mocked(supabase.rpc).mockResolvedValue(...)`
 *     directamente, no chainable.
 */
export interface SupabaseQueryReturn<T = unknown> {
    data: T | null;
    error: { message: string; code?: string } | null;
    count?: number | null;
}

/**
 * Crea una "cadena" mockeada que:
 *  - Es chainable (cada método devuelve `this`).
 *  - Es thenable (resolve directo al `returnValue`).
 *  - Tiene terminales explícitos (`maybeSingle`, `single`) que resuelven al `returnValue`.
 */
export function buildChainableQuery<T = unknown>(
    returnValue: SupabaseQueryReturn<T>
): SupabaseQueryReturn<T> & Record<string, ReturnType<typeof vi.fn>> & PromiseLike<SupabaseQueryReturn<T>> {
    // Métodos chainable — devuelven la cadena para permitir encadenamiento.
    const chainableMethods = [
        'select', 'eq', 'neq', 'in', 'is', 'not', 'gt', 'gte', 'lt', 'lte',
        'like', 'ilike', 'or', 'and', 'filter', 'match', 'range', 'order',
        'limit', 'offset', 'returns', 'csv', 'overlaps', 'contains', 'containedBy',
    ];

    // Métodos terminales que devuelven directamente la promesa.
    const terminalMethods = ['maybeSingle', 'single'];

    // Mutations que también son terminales (pero pueden encadenar `.select()`).
    const mutationMethods = ['insert', 'upsert', 'update', 'delete'];

    // Construimos el objeto con todos los métodos.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain: any = {
        ...returnValue,
        // then/catch: hacen el objeto thenable (await chain resuelve a returnValue)
        then: (
            onFulfilled?: (v: SupabaseQueryReturn<T>) => unknown,
            onRejected?: (e: unknown) => unknown
        ) => Promise.resolve(returnValue).then(onFulfilled, onRejected),
        catch: (onRejected: (e: unknown) => unknown) =>
            Promise.resolve(returnValue).catch(onRejected),
        finally: (onFinally?: () => void) =>
            Promise.resolve(returnValue).finally(onFinally),
    };

    for (const m of chainableMethods) {
        chain[m] = vi.fn().mockReturnValue(chain);
    }
    for (const t of terminalMethods) {
        chain[t] = vi.fn().mockResolvedValue(returnValue);
    }
    for (const m of mutationMethods) {
        // Mutations son thenable Y chainable (`.upsert(x).select()`).
        chain[m] = vi.fn().mockReturnValue(chain);
    }

    return chain;
}

/**
 * Helper para configurar `supabase.from(...)` con escenarios secuenciales.
 *
 * Uso típico:
 *   import { supabase } from '../../supabase/client';
 *   vi.mock('../../supabase/client', () => ({ supabase: { from: vi.fn() } }));
 *
 *   mockSupabaseFromSequence(supabase, [
 *     { data: [{ id: 1 }], error: null },     // primer from(...)
 *     { data: null, error: { message: 'oops' } }, // segundo from(...)
 *   ]);
 *
 * Cada llamada a `supabase.from(...)` devuelve UN chainable nuevo con el
 * `returnValue` correspondiente.
 */
export function mockSupabaseFromSequence(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabaseInstance: any,
    scenarios: SupabaseQueryReturn[]
) {
    const chains = scenarios.map(s => buildChainableQuery(s));
    const mock = supabaseInstance.from as ReturnType<typeof vi.fn>;
    mock.mockReset();
    chains.forEach(c => mock.mockReturnValueOnce(c));
    return chains; // expuestos para asserts (e.g. expect(chains[0].select).toHaveBeenCalled())
}
