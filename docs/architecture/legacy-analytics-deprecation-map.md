# Matriz de Deprecación de Vistas y Modelos Analíticos (Bloque 4)

Al avanzar hacia las arquitecturas V2 y V3 del Motor Estadístico, ciertas vistas, funciones o RPCs históricos del B1 originario quedan obsoleto para operaciones de alta fidelidad, aunque algunas pudiesen mantenerse *solo para* la carga ultrarrápida del home u otras gamificaciones donde la precisión matemática no es crítica.

Esta matriz guía a los desarrolladores para evitar arrastrar métricas de V1 a los nuevos tableros del Admin o B2B.

---

## 1. Rutas Totalmente Obsoletas (Do Not Use)

**Status general: `DEPRECATED` en cualquier sistema de decisión operativa.**

| Objeto Legacy (RPC / View) | Reemplazo Canónico B2B (Bloque 4) | Motivo de Deprecación |
| :--- | :--- | :--- |
| **Lectura de Señal de Actualidad (`source='actualidad'`)** | Payload Nativo `module_type='news'` vía `entity_id` | Históricamente contaminaba Versus enmascarado tras el UUID del battle_id. Corregido en Bloque 2/3. (El parche reparó la data vieja, pero la escritura nueva no debe jamás recaer en los `source` flat strings). |
| **`results_view` (Uso en Admin/Export)** | `get_b2b_battle_analytics(p_battle_id)` | Devuelve shares crudos sin consideraciones matemáticas sobre el *n* real, produciendo espejismos en conteos bajos (ej. 1 voto = 100%). Sigue vigente para carga super inicial de UI Base interactiva. NO apto para data exports. |
| **Lectura de Score Base Depth** (Consulta cruda sobre jsonb) | `get_b2b_depth_brand_analytics(p_entity_id)` | La lectura empírica del json asumiendo `attribute_id` como pregunta está deprecada gracias al uso del nuevo payload con `context_id` (V3.0). El RPC nuevo agrega las dimensiones de un profile con scores corregidos por industria de forma robusta. |

## 2. Modelos Intermedios de Transición

**Status general: `SUPPORTED, BUT NOT CANONICAL B2B`.** Se usan como piezas de motor, no para outputs comerciales listos para servir.

| Función B2/B3 | Comportamiento | Directiva |
| :--- | :--- | :--- |
| `get_bayesian_true_score(...)` | Motor Bayesiano de V2.2 | Función de bajo nivel escalar. En UI/Admin no deben utilizarse de forma cruda sino envueltas en los constructos de alto nivel (como `get_b2b_battle_analytics`). |
| `calculate_wilson_interval_weighted(...)` | Motor Intervalos Confianza de V2.2 | Ídem arriba. Solo de uso transaccional interno en DB o de construcción de reportes agregados. |
| `get_opinion_entropy_stats(...)` | Motor Fragmentación V3.0 | Disponible para exploración, pero estructurado formalmente en los Golden Endpoints para entregables limpios y consistentes para Dashboards y UI de clientes B2B. |

## 3. Golden Endpoints (El Nuevo Estándar Oficial B2B / Admin)

**Status general: `CANONICAL (ACTIVE)` para todos los dashboards de consumo de decisiones, top analytics o exportaciones a los clientes B2B.** Las consultas backend para UI/Admin preferiblemente caerán acá.

1.  **`get_b2b_battle_analytics(p_battle_id uuid)`:** (Versus) Contiene `n_eff`, puntaje Bayesiano, Bandas de Confianza (Wilson), Label de Estabilidad, Flag de Empate Técnico y Label de Fragmentación (Entropía).
2.  **`get_b2b_actualidad_topic_analytics(p_topic_id uuid)`:** Agrupa limpiamente metadata de noticia, con share categórico sólido y medición del clima político/tendencia (Concentrado / Fragmentado).
3.  **`get_b2b_depth_brand_analytics(p_entity_id uuid)`:** Recolecta métricas B2B con agregaciones directas desde `context_id` para evaluaciones directas, y devuelve ratings ponderados de la entidad (Marca).
4.  **`get_b2b_trending_decay_leaderboard()`:** Rankeador de entidades priorizando Time-Decay (media de caída 7.0 días por default). Reemplaza totalmente la ordenación simplista de Leaderboard legacy cuando debamos promover frescura temporal real y sustentada termodinámicamente.

---

> El equipo de frontend debe hacer una auditoría progresiva para asegurarse de migrar (componente a componente) el Data Fetching operativo de las antiguas vistas a estas nuevas RPC que centralizan toda inteligencia predictiva en SQL.
