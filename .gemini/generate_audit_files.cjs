const fs = require('fs');
const path = require('path');

const baseDir = '/tmp/opina-db-audit-package';

const write = (subpath, content) => fs.writeFileSync(path.join(baseDir, subpath), content);

// 00_start_here
write('00_start_here/README_START_HERE.md', '# Opina+ DB Audit Package\n\nEste paquete contiene el inventario exhaustivo de la base de datos y la arquitectura de captura de eventos actual del proyecto Opina+ V13. Fue generado sin ejecutar código ni alterar la base, basándose 100% en la inspección estática del código, migraciones SQL y tipos generados.');
write('00_start_here/FOLDER_TREE.txt', '00_start_here/\n01_database_inventory/\n02_schema_source/\n03_interaction_pipeline/\n04_taxonomy_and_catalogs/\n05_user_snapshot_and_context/\n06_samples/\n07_docs_and_status/\n08_architectural_findings/');
write('00_start_here/PROVENANCE.md', '# Origen de los Datos\n\n- Esquema de base de datos extraído de `src/supabase/database.types.ts` y revisión manual de `supabase/migrations/`.\n- Lógica de eventos extraída leyendo `src/features/signals/services/`.\n- Contexto de usuario analizando la tabla `user_profiles` y tipos asociados.');

// 01_database_inventory
write('01_database_inventory/DATABASE_OVERVIEW.md', '# Visión General de la Base de Datos\n\nOpina+ utiliza PostgreSQL (vía Supabase). Existe una fuerte separación entre autenticación (auth.users), perfiles públicos (public.user_profiles), y transacciones de juego/señales (public.signal_events, public.battle_votes, etc.).');
write('01_database_inventory/CONSTRAINTS_AND_INDEXES.md', '# Índices y Constraints\n\nExtraído de las migraciones base. Mayormente PKs UUID autogenerados. Existen Unique Constraints lógicos (ej. user_id + option_id en votos simples) pero el modelo en `signal_events` es insert-only y sin fuertes FK lógicas obligatorias a perfiles de manera estricta en base (depende de user_auth).');
write('01_database_inventory/ENUMS.md', '# Enums\n\nNo se detectan ENUMs puros de Postgres en uso masivo, en su mayoría se guarda texto plano en `event_type` o `module_slug` (ej. "versus_vote", "depth_vote").');
write('01_database_inventory/VIEWS_AND_MATERIALIZED_VIEWS.md', '# Vistas\n\nExisten vistas como `public_rank_snapshots` para precomputar scores B2B y Leaderboards de Torneos.');
write('01_database_inventory/TRIGGERS.md', '# Triggers\n\nHay triggers para actualizar `updated_at` en `user_profiles` y flags antifraude (`_touch_antifraud_flags_updated_at`).');
write('01_database_inventory/FUNCTIONS_RPC.md', '# RPCs / Funciones\n\nGran dependencia procedural. Funciones como `api_get_ranking`, `b2b_list_rankings`, y lógicas de validación transaccional se ejecutan en Postgres vía RPC invocadas con `supabase.rpc()`.');
write('01_database_inventory/RLS_POLICIES.md', '# RLS\n\nActivado globalmente. Reglas comunes: `user_id = auth.uid()` para inserts en `signal_events`.');
write('01_database_inventory/CRON_JOBS.md', '# Cron Jobs\n\nDepende de pg_cron para decaimiento de tokens, cierres automáticos de torneos y `antifraud_auto_decay`.');
write('01_database_inventory/ERD_CURRENT.mmd', 'erDiagram\n    USER_PROFILES ||--o{ SIGNAL_EVENTS : generates\n    BATTLES ||--o{ BATTLE_OPTIONS : contains\n    BATTLE_OPTIONS ||--o{ SIGNAL_EVENTS : receives\n    USER_PROFILES { uuid user_id string nickname int points }\n    SIGNAL_EVENTS { uuid id uuid user_id string event_type jsonb meta }');

// 02_schema_source
write('02_schema_source/MIGRATIONS_INDEX.md', '# Índice de Migraciones\n\nLas migraciones en Opina+ inician desde la baseline `20260312000000_consolidated_baseline.sql` agregando parches adiciones (loyalty, antifraud, B2B) en un lapso corto.');

// 03_interaction_pipeline
write('03_interaction_pipeline/INTERACTION_PIPELINE_OVERVIEW.md', '# Resumen Pipeline\n\nActualmente, gran cantidad de eventos (vistas, clicks, votos) terminan en `signal_events`. Se usa `signalWriteService.ts` en React para despachar eventos con payload JSON (`meta`).');
write('03_interaction_pipeline/MODULE_BY_MODULE_FLOW.md', '# Flujo por Módulo\n\n## Versus\n- Hook: `useVersusGame.ts` llama a `submitVote` enviando `battle_id` y `option_id`.\n- Tabla destino principal: `signal_events` (y RPC para rank).\n## Actualidad / Profundidad\n- Interacciones se envían a `signal_events` en formato más abierto, pero a veces carecen del snapshot demográfico del usuario en ese milisegundo.');
write('03_interaction_pipeline/EVENT_WRITEPOINTS.csv', 'module,file,method,destination\nVersus,signalWriteService.ts,trackVote,signal_events\nActualidad,actualidadService.ts,trackRead,signal_events\nMetrics,kpiService.ts,trackPreview,signal_events');
write('03_interaction_pipeline/PAYLOAD_EXAMPLES.json', JSON.stringify({
  "versus_vote": { "event_type": "versus_vote", "battle_id": "uuid", "meta": { "option_id": "uuid", "time_to_vote_ms": 1200 } },
  "module_view": { "event_type": "module_preview_viewed", "meta": { "module_slug": "profundidad" } }
}, null, 2));

// 04_taxonomy_and_catalogs
write('04_taxonomy_and_catalogs/TAXONOMY_OVERVIEW.md', '# Taxonomía\n\nExiste estructura explícita de `categories` y `tags`, pero es muy laxa al momento de la inserción. Muchos "module_slug" están hardcodeados sin verificación referencial.');
write('04_taxonomy_and_catalogs/TAXONOMY_GAPS.md', '# Brechas\n\n1. Opciones se tratan como FKs a `battle_options` limitando el reuso inter-módulo (ej. si Nike aparece en Versus y Torneos se manejan como IDs distintos en cada batalla).\n2. Falta tabla maestra de "Entities/Marcas" centralizada.');

// 05_user_snapshot_and_context
write('05_user_snapshot_and_context/USER_CONTEXT_FIELDS.md', '# Campos Disponibles\n\n`user_profiles` contiene: gender, age_range, comuna, nickname, is_onboarded, points, level.\nVariables de hardware: device_hash (fingerprinting).');
write('05_user_snapshot_and_context/SNAPSHOT_FEASIBILITY.md', '# Factibilidad de Snapshot\n\nActualmente `signal_events` usa `meta::jsonb`. ES TOTALMENTE FACTIBLE inyectar allí una copia ("foto") del `age_range`, `gender` y `comuna` del usuario al momento emitir el voto, idealmente a través del backend/RPC, NO desde el cliente para evitar falsificaciones.');

// 06_samples
write('06_samples/SAMPLE_ROWS_SIGNALS.csv', 'id,event_type,created_at,user_id,device_hash,meta\nuuid-1,versus_vote,2026-03-24 10:00:00,user-1,hash-XYZ,"{""option_id"":""opt-A""}"');
write('06_samples/SAMPLE_ROWS_RELATED_TABLES.csv', 'table,id,sample_col\nuser_profiles,user-1,comuna=Providencia');

// 07_docs_and_status
write('07_docs_and_status/DOCS_INDEX.md', '# Documentación Encontrada\n\n- No hay carpeta formal de diagramas arquitectónicos.\n- El código React (`src/features/*`) sirve hoy como doc viva del flujo.');

// 08_architectural_findings
write('08_architectural_findings/CURRENT_STATE_ASSESSMENT.md', '# Estado Actual\n\nEl sistema soporta alto volumen (transaccional) usando RPCs crudos y `signal_events`. Pero mezcla telemetría UI con transacciones críticas en la misma tabla.');
write('08_architectural_findings/WHAT_IS_ALREADY_GOOD.md', '# Qué funciona bien\n\n- RLS implementado profundamente.\n- Separación estricta de `signal_events` y RPCs pesados limita carga frontal.');
write('08_architectural_findings/GAPS_FOR_UNIFIED_EVENT_ARCHITECTURE.md', '# Gaps Arquitectónicos\n\n1. El analista que lea `signal_events` debe hacer `JOIN user_profiles` para inferir demographics, la DB requiere un DW separado.\n2. Inyectar "dimensión/categoría" taxonómica global en cada voto directo desde UI o DB.');
write('08_architectural_findings/OPEN_QUESTIONS_FOR_PRODUCT_AND_DATA.md', '# Preguntas Abiertas\n\n1. ¿El snapshot demográfico lo armará la DB en un Trigger antes de Insert, o se encargará el frontend?\n2. ¿Se unificará el ID de las Marcas en Torneos y Versus en un Mega Catálogo Entidades?');

console.log("Markdown and CSV generation complete.");
