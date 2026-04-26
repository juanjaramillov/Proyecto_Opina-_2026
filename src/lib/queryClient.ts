/**
 * TanStack Query — cliente único de la app.
 *
 * FASE 1 del plan acordado al 2026-04-24 con Juan. Esta capa cierra 4 hallazgos
 * de Drimo de un golpe (datos repetidos, refetch innecesario, falta de
 * paralelización, spinner eterno parcial).
 *
 * Política por defecto:
 *   - staleTime 5 min: datos se consideran frescos por 5 min sin refetch.
 *     Volver al Hub no recarga si la última fetch fue hace <5min.
 *   - gcTime 10 min: caché en memoria 10 min (default es 5, lo subimos para
 *     que la navegación rápida entre pantallas no pierda datos).
 *   - retry 1: un solo reintento ante error de red/server. Más es ruido.
 *   - refetchOnWindowFocus false: el patrón de Opina+ es admin/lector — refetch
 *     en cada blur/focus sobra y mete carga inútil en Supabase.
 *   - refetchOnReconnect true: si el usuario perdió red y volvió, sí refetcheamos
 *     porque el dato puede haber cambiado mientras estaba offline.
 *
 * Si una pantalla específica necesita política distinta (ej. dashboard live con
 * staleTime 30s), se sobrescribe en el `useQuery` correspondiente — esto es
 * solo el default.
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 min
            gcTime: 10 * 60 * 1000, // 10 min
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            // Las mutaciones no se reintentan automáticamente — un POST duplicado
            // puede ser destructivo (ej. doble grant de rol, doble ban). Cada
            // mutation puede setear su propio retry si es idempotente.
            retry: false,
        },
    },
});
