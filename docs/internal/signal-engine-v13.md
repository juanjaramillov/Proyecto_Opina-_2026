# Signal Engine V13 (Opina+)
*Documentación Canaria de la Arquitectura de Señales V13*

## El Flujo Canónico

La versión 13 de Opina+ consolida múltiples arquitecturas (legacy, progressive, insights) en un único motor de señales unificado (`signal_events`). 

El objetivo principal de esta transición es que el frontend no tenga que saber a qué tabla específica van sus votos (ej. a una tabla `versus_votes` o `progressive_tournaments` o `insight_answers`). Frontend simplemente emite un evento de señal.

### The Canonical Writer (`insert_signal_event`)
En la base de datos, toda escritura ocurre mediante el RPC Security Definer `insert_signal_event()`. Este RPC se encarga de:
- Validación Anti-Fraude (Device Hash ban/throttle).
- Rate Limiting e Idempotencia (Cooldowns, Caps diarios).
- Chequeo de Gating (Invitación, Perfil Válido).
- Verificación del Asset Emisor (Que existan `battle_id` y `option_id`).

### Desacople en la UI (`Experience.tsx`)
`Experience.tsx` NO arma ni manipula payloads con lógica transitoria. Simplemente llama a metodos especializados en el dispatcher central:
- `signalService.saveSignalEvent` (Básico).
- `signalService.saveVersusSignal` (Helper).
- `signalService.saveTorneoSignal` (Helper).

## La Capa Legacy Bridge (Transitoria)

**ADVERTENCIA**: Los archivos como `recordLegacySignals.ts` existen ÚNICAMENTE para servir como puente de compatibilidad ("bridge") entre el frontend nuevo y tablas antiguas en base de datos. 
**Regla de oro:** No se debe construir nueva arquitectura sobre este puente. Las funciones aquí están obsoletas y migrarán eventualmente a su desaparición cuando el backoffice soporte la lectura puramente desde `signal_events`.

### Naming Comparativo Unificado
- Historicamente el frontend enviaba variaciones como `rejected_option_id`, o `loser`, o `discarded`.
- **Estandar Oficial**: Para comparaciones (Versus, Torneos), el perdedor se almacena usando el prefijo `loser_` (ej. `loser_entity_id`, `loser_option_id`, `loser_option_name`).
- Los **Read Models** SQL (ej. `v_comparative_preference_summary`) leen exlcusivamente bajo esta convención (ej. `s.value_json->>'loser_entity_id'`).

## Master Entity Resolution
- Todos los IDs preferidos para las entidades son UUIDs.
- `resolveMasterEntity.ts` es el punto de enganche del cliente para convertir (si puede) strings o slugs planos al verdadero UUID maestro oficial que permite relacionar señales en las métricas de Impacto Global.
- Utiliza un Regex validador de seguridad estricto para evitar fallos donde un "mal id" rompía el insert en base de datos.
- Como mejora de la V13, soporta redirección a través de la tabla relacional `entity_aliases` como primer filtro de búsqueda.

## Arquitectura V13: El Camino Oficial

A partir del Bloque 8, **el nuevo motor de señales es la única fuente de verdad técnica y el camino principal**. 

### 1. Definición Oficial
El "Signal Engine" es el subsistema centralizado responsable de captar, estructurar, verificar y almacenar toda interacción del usuario (voto, preferencia, respuesta, visualización) en una única tabla append-only (`public.signal_events`).

### 2. Camino Canónico de Registro
1. **Frontend / Cliente**: Emite una intención de señal llamando a wrappers en `signalService.ts` (ej. `saveVersusSignal`).
2. **Layer de Servicio**: `signalService.ts` resuelve entidades maestras (`resolveMasterEntity`), contextos (`resolveSignalContext`) y enruta la payload.
3. **Primary Write (Signal Engine)**: Se invoca el RPC correspondiente al tipo de señal (ej. `record_comparative_signal`, `record_context_signal`, `record_personal_pulse_signal`). Esto inserta en `signal_events`.
4. **Resiliencia (Outbox)**: Si hay fallo de red, la señal se encola localmente. El worker de resiliencia opera **exclusivamente sobre el nuevo motor**.
5. **Transitional Fallback (Legacy Bridge)**: Solo por motivos de compatibilidad hacia atrás temporal, se invoca un adaptador (ej. `recordLegacySignals.ts`) en modo *fire-and-forget* para hacer doble escritura en tablas antiguas (ej. `versus_votes`). **Esta capa está deprecada y no debe expandirse.**

### 3. Payload Mínimo Esperado
Todo `value_json` insertado en `signal_events` debe ser autocontenido y no depender de tablas externas para su interpretación básica.
- **Comparativas (Versus/Torneos)**: Debe contener estrictamente:
  - `selected_option_id`, `selected_entity_id`, `selected_option_name`
  - `loser_option_id`, `loser_entity_id`, `loser_option_name`
- **Contextuales (Depth/News)**: Debe contener `question_code`, `response_type`, `response_value`.

### 4. Read Models Dependientes
El sistema explota la data insertada mediante vistas materializadas o regulares (Read Models) que consumen de `signal_events`. Ejemplos clave:
- `v_signal_entity_summary`
- `v_comparative_preference_summary` (Depende fuertemente de la normalización del naming `loser_entity_id`).

### 5. Riesgos del Double Write Actual
1. **Desincronización**: Si el insert en `signal_events` funciona pero el legacy falla, el backoffice antiguo no verá el dato, pero la inteligencia centralizada sí. El sistema prioriza siempre `signal_events`.
2. **Latencia UI**: Ejecutar múltiples escrituras por red añade overhead. Se mitiga ejecutando el puente legacy en segundo plano (Promise sin await bloqueante para la UI).
3. **Acumulación de Deuda**: El legacy bridge debe ser removido tan pronto como el backend/CMS pueda leer directamente de los Read Models del nuevo motor.
