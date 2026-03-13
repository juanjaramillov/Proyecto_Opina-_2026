# Arquitectura Operativa V13 (Opina+)

Este documento establece la consolidación de la arquitectura operativa del proyecto Opina+ V13. Define la separación estricta de las responsabilidades funcionales en 4 grandes capas, para asegurar la escalabilidad, audibilidad y mantenibilidad del sistema.

## Las 4 Capas Funcionales

### 1. Producto (Experiencia Visible del Usuario)
- **Ubicación:** `src/` (Frontend React + Vite).
- **Propósito:** Es la cara visible de Opina+. Contiene exclusivamente código que forma parte de la experiencia del usuario final, interfaces de usuario (UI), layouts, el manejo del estado local del cliente, y llamadas directas hacia la API de Supabase.
- **Regla:** Ningún proceso de mantenimiento periódico, limpieza, o manipulación de datos en batch (seed) debe vivir aquí. El frontend únicamente lee y escribe a través del SDK de Supabase o las invocaciones a Edge Functions para cosas en tiempo real.

### 2. Editorial (Actualidad, Contenidos, Flujos Administrables)
- **Ubicación:** 
  - Backend: `supabase/functions/actualidad-bot/` (generación automática) y tablas `topics`, `news`.
  - Frontend Admin: `/admin/actualidad` (curación manual).
- **Propósito:** Proveer contenido dinámico e informativo a la plataforma (como las noticias y resúmenes).
- **Dónde vive la lógica:** El ciclo de vida de la "Actualidad" vive de forma híbrida. Primero, tareas programadas (cron) disparan el `actualidad-bot` en Supabase para nutrir de contenido; luego la curación final ocurre vía el dashboard Admin en el frontend.

### 3. Operación (Scripts, Mantenimiento, Seeds, Soporte)
- **Ubicación:** `scripts/` y sus subcarpetas (`ops/`, `seed/`, `debug/`, `catalog/`).
- **Propósito:** Alojar herramientas para el equipo de desarrollo y administración del sistema. Estas herramientas no corren en los servidores de producción de forma autónoma.
- **Qué procesos siguen siendo manuales:**
  - `seed/*`: Cargas pesadas iniciales de datos para entornos nuevos (ej. batch de versus de prueba).
  - `ops/*`: Acciones quirúrgicas en la base de datos, como limpieza de tópicos, recálculos manuales en emergencias o saneamiento (`clean_publish_topics`).
  - `catalog/*`: Descarga de logos de dominios y marcas (`download_brand_logos`, `update_brand_domains`). Estas normalizaciones de catálogo aún requieren ejecución manual ocasional para sincronizar nuevas marcas.
  - `debug/*`: Diagnósticos (Whatsapp, ELO checks).

### 4. Datos (Supabase, Señales, Entidades, Rankings, Procesamiento)
- **Ubicación:** Bases de datos, `supabase/migrations/` (Triggers, Funciones RPC), `supabase/functions/` (Edge functions como `versus-bot`).
- **Propósito:** Actuar como el núcleo transaccional inmutable del producto y el organizador automático del ecosistema de señales y métricas.
- **Dónde vive la lógica de señales:** La lógica core hoy reside de forma robusta en la base de datos en sí, asegurando que cualquier señal guardada pase por la misma función (RPC `save_signal_event` y triggers que actualizan aggregates) en vez de ser calculada en el cliente.
- **Qué procesos son automáticos:**
  - El bot de batallas (`versus-bot`) que auto-genera y refresca las batallas a través de Cron Jobs en Supabase (`pg_cron`).
  - Atualización de balances (ELO y participaciones) automatizada mediante Triggers SQL al recibir nuevos votos.
  - El bot de noticias (`actualidad-bot`) también disparado por cron, aunque luego un admin tiene que validarlas.

## Zonas Acopladas / Deuda Técnica Identificada
Al auditar los procesos, persisten algunas áreas superpuestas (acopladas):
1. **Generación IA de Opciones vs Curación Interna**: Los scripts de `catalog/` gestionan logos y marcas, pero no están unificados en un flujo 100% transaccional automático. Si aparece una marca nueva, sigue existiendo una dependencia parcial del desarrollador ejecutando el script en `scripts/catalog/sync_ai_brandfetch.ts`. Esto acopla la Operación y los Datos, en un proceso que idealmente debería ser manejado por un webhook interno o Edge Function.
2. **Duplicación de Testing vs Automáticos**: Durante mucho tiempo scripts sueltos en raíz como `generate_all_ai_versus` competían en la misma lógica funcional que `versus-bot`. Al mover estos scripts manuales a `/seed` y centralizar la creación procedural en Supabase la arquitectura se limpió, pero aún existe acoplamiento de conceptos "ELO" en el frontend en algunos cálculos residuales que deberían ser estrictamente provistos por read-models desde Supabase.

Esta arquitectura garantiza que cada dominio de código tenga un propósito unívoco a partir de Opina+ V13.
