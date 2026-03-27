# Módulos Modificados para V14 Parcial

## Provider & Session (Bloque 1)
- `src/features/analytics/providers/SessionProvider.tsx`
- `src/features/analytics/store/sessionStore.ts`

## Behavior (Bloque 2)
- `src/features/feed/hooks/useExperienceMode.ts`

## Core Telemetry (Bloque 3 & 4)
- `supabase/migrations/20260325000000_extend_insert_signal_event_v14.sql`
- `src/features/signals/services/signalTypes.ts`
- `src/features/signals/services/signalWriteService.ts`

## Sub Módulos
- **Versus / Base:** `src/features/signals/hooks/useVersusGame.ts`, `src/features/feed/components/HubActiveState.tsx`
- **Torneo:** `src/features/feed/components/TorneoView.tsx`
- **Profundidad:** `src/features/signals/services/depthService.ts`
- **Actualidad:** `src/features/signals/services/actualidadService.ts`
