# Reporte de Auditoría y Saneamiento Comercial (Fase 4 / Paso 1 Final)

Fecha de auditoría: 30 de Marzo, 2026.

Este documento certifica el blindaje comercial de las superficies visibles de Opina+, garantizando un producto libre de etiquetas "Demo", funcionalidades expuestas inoperativas, o claims desalineados con el motor lógico. **Asimismo, certifica la instalación del protocolo operativo definitivo, la *Demo Readiness Layer*, para extinguir sistémicamente el riesgo de "Cold Start" durante demostraciones comerciales.**

## 1. Auditoría por Superficie

### A. Home (Landing Page)
- **Qué restaba credibilidad:** Componentes estáticos irreales (Streak Box) y claims absolutos ("En tiempo real") no alineados a la asincronía del sistema.
- **Qué se corrigió, simplificó u ocultó:** Banner neutralizado, ajustados claims de tiempo real a "Actualidad". Retiradas promesas de "recompensas físicas".
- **Qué se dejó igual y por qué:** El Hero principal de Onboarding cerrado (Beta).

### B. Signals / Signals Hub
- **Qué restaba credibilidad:** El track "Publicidad (Próximamente)" y módulos derivando a pantallas de "Módulo en Construcción" que revelan software inacabado.
- **Qué se corrigió, simplificó u ocultó:** Retiro drástico del bloque ficticio. Cierre del `ComingSoonModule` reemplazado por redirecciones controladas y silenciosas hacia `/signals`.
- **Qué se dejó igual y por qué:** Estados `PageState` de espera asíncrona "Buscando señales...".

### C. Resultados (B2C & B2B In-Page)
- **Qué restaba credibilidad:** Botones ciegos "Evolución B2B (Próximamente)" inyectados de forma hardcodeada en medio de un viaje estadístico B2C.
- **Qué se corrigió, simplificó u ocultó:** Purgado total de componentes B2B inacabados desde vistas orientadas a evaluadores B2C.
- **Qué se dejó igual y por qué:** Las tarjetas Empty State de cálculos matemáticos ("VOLATILIDAD"), porque explican sólidamente la ausencia de un volumen N estadísticamente seguro evitando crashes genéricos.

### D. Perfil y Onboarding
- **Qué restaba credibilidad:** Textos estáticos y copys de privacidad abstractos de difícil validación ante el evaluador B2B.
- **Qué se corrigió, simplificó u ocultó:** Discurso pivotado centralmente a "Anonimato estructural", 100% defendible arquitectónicamente por RLS/Token y el anonimato inherente de la identidad en Supabase.

### E. Intelligence / B2B visible
- **Qué restaba credibilidad:** Mocks gráficos cargados con data en memoria. Falsa representación de la Base de Datos.
- **Qué se corrigió, simplificó u ocultó:** Eliminación absoluta de arreglos *fake* en los diagramas. Todo expuesto asume comportamientos dinámicos limpios (con `EmptyStates`).
- **Qué se dejó igual y por qué:** El maquetado y Layout general.

---

## 2. Validación Estricta de Claims Visibles

| Claim (Texto exacto o inferido) | Superficie | Veredicto | Lógica / Soporte Real | Percepción Cliente / Demo |
|---------------------------------|------------|-----------|-----------------------|---------------------------|
| `"Acumula prestigio"` | Home / Interactivo | **Mantener** | `LoyaltyEngine` consolida puntaje XP persistente.| Altamente perceptible post-voto.|
| `"Sube de nivel"` | Profile | **Mantener** | `Tiering System` computacional migrando rangos. | Constante visual en el Panel.|
| `"Resultados en tiempo real"`| Home | **Reescribir** | Rollups asíncronos. Se adopta el concepto: "Actualidad Viva".| Previene promesas tipo Websockets directos.|
| `"Radiografías macro"` | Onboarding | **Mantener** | Constricción estadística en FrontEnd `MIN_SIGNALS_THRESHOLD`.| Muy perceptible (Desbloqueo).|
| `"Evalúa de forma anónima"` | Access | **Mantener** | Mecánica transaccional Hashed / RLS. | Base del acuerdo de privacidad B2B.|
| `"Recompensas tangibles"` | Home | **Eliminar** | Canje promocional actualmente sin respaldo de catálogo.| Indefendible si se presiona durante Demo.|

---

## 3. Estados Sensibles Saneados

- **Empty States (Torneos/Resultados)**: Implementan prolijamente `MetricAvailabilityCard` justificando científicamente falta parcial de volumen.
- **Loading States**: Centralización con `<PageState type="loading">`.
- **Transiciones y Fallbacks**: Ocultamiento de páginas 404s mediante redireccionamiento silente, erradicando toda visibilidad de "Módulo en Construcción".

---

## 4. Riesgo de Cold Start Anulado

Con anterioridad, el modelo adolecía comercialmente porque arrancar una Staging en "blanco" rompía la promesa fundamental expuesta en la plataforma. 

Este riesgo de *Cold Start* ha sido eliminado operativamente mediante la inclusión de una **Demo Readiness Layer**, descartando la improvisación manual y los falsos rellenos inyectados en FrontEnd. 

La semilla oficial `seed_demo` transita y carga datos sintéticos-realistas que fluyen por los *Read Models*: inserta las tablas de `signal_entities` y su base heredada `entities`, procesa las combinaciones vinculantes en `battles` y `battle_options`, e instiga un volumen N > 10 de eventos formales `signal_events` con `user_demographics` mixtas listos para poblar Dashboards y Radares de cualquier evaluador B2B.

### Procedimiento Anti-Cold-Start Operacionalizado

1. **Protocolo Obligatorio y Comandos Exactos:** Todo demo debe precederse de la inyección de Escenarios (`telecom`, `banking`) desde CLI:
   - `npm run demo:prepare:telecom -- --allow-demo-seed`
   - `npm run demo:prepare:banking -- --allow-demo-seed`
   
   Estos scripts (alojados en `scripts/ops/demo/seed_demo.ts`) inyectan la categoría, las entidades y las combinaciones de batallas, y luego simulan un panel de interacciones B2B *insertándolas en las tablas canónicas* (`profiles`, `user_demographics`, `signal_events`). De este modo, la plataforma consume su propio modelo real, sin mocks ni lógicas paralelas.

2. **Seguridad Anti-Producción y Blindaje RLS:** El script aborta inmediatamente con `process.exit(1)` si detecta cualquiera de las siguientes vulneraciones:
   - `NODE_ENV === 'production'`.
   - Host reservado de base de datos en `VITE_SUPABASE_URL` detectado.
   - Ausencia manual del flag terminal `--allow-demo-seed`.
   - Ausencia de la variable `SUPABASE_SERVICE_ROLE_KEY`, garantizando que la herramienta sea exclusivamente *Server-Side CLI* al requerir el token que sortea la seguridad RLS para transaccionar eventos en tabla ajena, bloqueando su consumo por error desde APIs de Frontend.

3. **Gobernanza de Catálogo Canónico (Motor Único):** Para erradicar la divergencia de bases de datos, se impuso una arquitectura estricta gestionada desde un motor central unificado (`src/lib/catalogGovernance.ts`). Todo write central como Admin y el Seed transaccionan dualmente validando esta regla de llenado:
   - **`signal_entities`**: Catalogación Canónica Maestra V15 (Usada por Read Models, Dashboards y Analytics central).
   - **`entities`**: Tabla de Compatibilidad Legada (Actúa como backup retro-compatible y mantiene relaciones de foreign keys como `battle_options.brand_id`).
   - El Motor central sincroniza ambas tablas unificando bajo la pre-condición inquebrantable de compartir: `id` (UUID idéntico), `slug`, `display_name`/`name` y estado `is_active`.

4. **Sistema GO / NO-GO Automatizado:** El validador estricto exige aprobación técnica de las 3 superficies conectadas para arrojar pase comercial favorable:
   - `npm run demo:validate:telecom` (o `banking`)
   - Verifica **Signals Hub**: Mínimo de 3 entidades habilitadas en sub-hub.
   - Verifica **Resultados B2C**: Mínimo de 10 `signal_events` asociables al rubro curado superando el threshold estadístico de volatilidad.
   - Verifica **Intelligence B2B**: Mínimo de 5 perfiles (`user_demographics`) que sustenten demográficamente toda gráfica de benchmark requerida.

Se adjunta doc funcional integral de esto documentando todos los casos en `docs/architecture/demo-readiness-protocol.md`.

Con el protocolo estructurado listo y validado con rigor computacional, el Paso 1 de la Fase 4 alcanza su Cierre maduro, hermético y demostrable para iniciar un *Go-To-Market* o ciclo de inversionistas sin sobresaltos.
