# Opina+ Data Model (V13)

## Introducción
Este documento define la estructura central (Canónica) de datos en Opina+. Históricamente, el esquema se componía de múltiples migraciones parcheadas con *fixes* y aperturas temporales. A partir de la versión V13, **el modelo de datos ha sido purgado y concentrado** en un único archivo base de esquema consolidado (`20260312000000_consolidated_baseline.sql`) y una fuente central de inserción de catálogos y diccionarios (`supabase/seed.sql`).

## Tablas Core (El Patrón Canónico)
- **`signal_events`**: El corazón del sistema. ***Toda interacción de usuario que represente una opinión (ya sea en Versus, Actualidad, Tu Pulso o Profundidad) DEBE guardarse aquí primero.*** Contiene un payload en formato JSONB (`context_data`) que flexibiliza la adición de metadatos según el módulo.
- **`users` (o Profiles)**: La tabla de perfiles extendidos que gobierna la sesión del usuario. Contiene el nivel de verificación (`verification_level`), progreso de onboarding (`profile_completeness`), y el rol oficial (`role` - vital para el Access Policy Gate implementado en React).
- **`invitation_codes`**: Administra los pines y tokens de acceso al sistema para restringir el paso de cuentas invitadas, B2B y testers.
- **`entities`, `categories`, `battle_options`**: El catálogo maestro transaccional sobre cuyos IDs votan los usuarios y se asocian las agrupaciones estructurales.

## Tablas Auxiliares por Módulo (Metadata)
El nuevo paradigma dictamina que los módulos derivan metadatos hacia estas tablas **solamente tras haber confirmado** la existencia del evento canónico en `signal_events`:
- **`current_topics`**: Para el módulo editorial Actualidad (debates diarios). Reemplazó a `actualidad_topics` + `user_actualidad_responses` (legacy, droppeadas el 2026-04-26 — ver migración `20260426001000_drop_legacy_actualidad_tables.sql`).
- **`user_pulses`**: Almacena las huellas agrupadas de la recolección rápida demográfica.
- **`depth_segments`**: Para el enriquecimiento y segmentación contextual profunda de perfiles B2B / Demográficos.

## Funciones (RPCs) y Triggers Operativos
- `insert_signal_event`: Interfaz de inyección (via RPC) para grabar señales de forma transaccional, imponiendo controles antifraude (rate limit, device ID hashing) en la puerta de entrada.
- `enrich_signal_event`: Función gatillada en cada inserción a `signal_events` para normalizar las referencias, asegurando que `entity_target` o `entity_won`/`entity_lost` reflejen exactamente la intención del evento para simplificar los analíticos en lectura.

## Postura de Row Level Security (RLS)
El modelo consolidado terminó con el patrón defectuoso de "aperturas/cierres temporales" de policies.
- **Inserción Strict**: Las políticas previenen inserción arbitraria en tablas protegidas. Inserciones críticas (como signals) fluyen por Funciones Aseguradas o via validación donde solo operan si `auth.uid() = user_id`.
- **Lectura Abierta Ponderada**: Las vistas de agregación (`hub_live_stats`, rankeos) pueden ser consultadas libremente por clientes anónimos para la UI púbica, pero el peso real de sus conteos descansa en la validación a nivel de escritura de los eventos originarios.

## Seeds Operativas
Los datos de las categorías iniciales, enfrentamientos de batallas default, y dominios (Brandfetch) residen en `supabase/seed.sql`. Esto garantiza que los entornos limpios puedan levantarse en segundos durante operaciones de reset, sin tener que ejecutar 190 migraciones secuenciales acumuladas.
