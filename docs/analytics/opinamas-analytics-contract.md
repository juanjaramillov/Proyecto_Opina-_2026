# Contrato Analítico Oficial de Opina+

Este documento funda las bases del entendimiento oficial y matemático del motor de inteligencia (Signal Engine) en Opina+. Todos los análisis de datos, IA y endpoints de lecturas deben someterse a este contrato.

## 1. Conceptos Fundamentales

- **Señal (Signal):** Una señal es una unidad atómica e inmutable de interacción con valor analítico, emitida por un actor identificable a nivel de sistema mediante `user_id`, `anon_id`, `device_hash` o mecanismo equivalente de trazabilidad, dentro de un contexto definido y en un instante del tiempo. La señal puede tener distinto peso de influencia según el nivel de verificación, reputación, confianza o integridad del emisor, pero no deja de poseer valor como señal cruda de comportamiento.
- **Señal Canónica:** Una señal es canónica si y solo si es estandarizada, trazable, posee un contexto analítico válido, es agregable universalmente y es **100% auditable directamente desde el ledger `signal_events` sin tener que depender de cruces o joins interpretativos con tablas metadata legacy**. Si el ledger obliga a forzar/contorsionar IDs (ej. meter la ID de una noticia larga en el campo estricto `battle_id`), esto es una limitación técnica del esquema actual que viola la semántica pura; no un estado canónico ideal.
- **Integración Parcial (o Frágil):** Modulo que escribe señales al ledger valiéndose de forzar la semántica original del modelo base (generalmente abusando del binomio Battle-Option) o que debe obligadamente apoyarse en una "Doble Escritura" hacia esquemas desactualizados para mantener consistencia UI.
- **Read Model:** Tablas y/o vistas materializadas o crudas utilizadas **exclusivamente para lectura analítica e interfaces**, estructuradas para aislar a la aplicación de lecturas o scaneos pesados sobre el ledger transaccional en tiempo real (`signal_events`).

## 2. Definición Oficial de Pesos y Scores

Actualmente conviven o convivirán múltiples nociones de "pesos" que deben quedar estrictamente separados en su uso:

| Columna / Concepto | Significado Central | Uso Oficial |
|---|---|---|
| `signal_weight` | El peso base originario asignado al usuario al momento de emitir (basado en su Nivel/Tier de autenticidad y actividad). | Registrar la credibilidad *en crudo* en el instante t. Nunca cambia en el registro inmutable. |
| `computed_weight` | *(Proyección)* Una transformación sobre `signal_weight` al aplicarle atenuadores (ej. decaimiento temporal, flags algorítmicos o clustering de bots). | Base para motores estadísticos intermedios. |
| `effective_weight` | Peso neto definitivo que se toma en la agregación. Si la señal es detectada como granja de bots, `effective_weight = 0`. | Dashboarding, sumatorias, conteo total oficial validado (N efectivo). |
| `opinascore` | El índice final, normalizado y depurado de una entidad, opción o marca en el tablero principal. Matemáticamente derivado. | Leaderboards, Marketplaces de Insights y reportes B2B. |

*Regla de Oro:* Las vistas del perfil de usuario y contadores gamificados leen siempre conteos directos o `signal_weight`. Los dashboards de B2B e Inteligencia deben leer `effective_weight` y rankear vía `opinascore`.

## 3. Catálogo de Métricas y Cálculos

### 3.1. Métricas Existentes (Construidas o Activas Básicas)
- **Pesado por Trust/Nivel:** Implementado parcialmente. El token de tier del usuario inyecta `signal_weight` en el RPC.
- **Volumen Nominal (Momentum Primitivo):** Operativo crudo. Se lee en `hub_live_stats_24h` contando iteraciones puras en periodos acotados.
- **Comparación por Segmentos Demográficos:** Implementado a nivel Query y RPC (`get_depth_comparison`, aplicando `p_gender`, `p_age_bucket`). Fuente técnica operativa.

### 3.2. Brechas y Faltantes Críticos (A Implementar)
Las siguientes capacidades están formalmente definidas como prioritarias para enriquecer el Bloque Matemático:
- **Promedio Bayesiano (Bayesian Average):** Vital para anclar la varianza de resultados con poca volumetría vs. resultados masivos.
- **Intervalos de Confianza (Confidence Intervals):** Medida probabilística aplicada a proporciones directas, shares en versus binarios y distribuciones (ej. Promoters en NPS). **No se presentará un intervalo compuesto general (como un OpinaScore 8.5 ± X%)** hasta que el framework principal no tenga una formulación matemática cerrada con varianza explícita validada.
- **Entropía de Opinión y Polarización:** Nivel de fragmentación o división social frente a una entidad, tema o disyuntiva en Actualidad.
- **Time-Decay (Recencia y Decaimiento Temporal):** Mecanismo de castigo o atenuación progresiva sobre señales antiguas, asegurando que snapshots, leaderboards o proyecciones siempre ponderen "la actualidad térmica" de la opinión y diluyan el interés del pasado.
- **Estabilidad / Robustez de la Muestra:** Métrica distinta al Decay. Cuantifica qué tan resiliente o inyectable es un resultado actual frente a fluctuaciones repentinas o a "ataques" demográficos y nuevas olas de emitentes divergentes.

## 4. Regla Oficial de Consumo por Capa (Normativa Estricta)

Toda interfaz de la plataforma **debe regirse obligatoriamente** por la siguiente regla para totalizaciones y consumos:

1. **Capa UI Base / Gamificación / Perfiles de Usuario:** Solo pueden mostrar **conteos nominales base** y/o lecturas en crudo del `signal_weight` originario. Es lo que el usuario entiende que "ha participado y avanzado".
2. **Capa Operativa / Analytics Internos:** Deben renderizarse desde el **`effective_weight`** del ledger. Esto garantiza que las herramientas administrativas ya remuevan granjas detectadas u operaciones fraudulentas.
3. **Capa Oficial B2B / Leaderboards Exigentes (Premium):** Solo deben renderizar índices corregidos, estables y normalizados derivando en los modelos avanzados (ejs. **`opinascore`** corregido con factor Bayesiano, Intervalos paramétricos, atenuación y despolarizantes). Si no cumple rigurosidad penal, el leaderboard premium queda inhabilitado para su visualización comercial.
