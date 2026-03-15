# Contrato Normativo de Consumo Analítico (B2B / Admin)

## Propósito
Este documento establece las reglas oficiales sobre cómo deben consumirse los datos analíticos dentro de Opina+. Conforme la plataforma evoluciona de un entorno puramente B2C (gamificado) hacia una herramienta seria de minería de opinión (B2B), es imperativo que las capas de consumo respeten el rigor estadístico disponible en el *Ledger* de señales (`signal_events`).

---

## 1. Topología de Consumo por Capa

Existen tres (3) dominios de consumo claramente diferenciados en el producto. **Es un anti-patrón utilizar métricas de una capa inferior para tomar decisiones en una capa superior.**

### A. Capa de Gamificación (UI Base / Usuarios Normales)
- **Objetivo:** Velocidad, engagement, validación inmediata del usuario.
- **Métricas Permitidas:** Conteos crudos (raw mass), sumatorias de `effective_weight` planas, rankings veloces (sin decay complejo ni bayesiano paramétrico).
- **Recursos Oficiales:** Vistas *legacy* (`results_view`, `leaderboards`, conteos en tabla `battles`).
- **Advertencia:** Estos datos *no* son representativos de la realidad estadística del mercado. Un 90% vs 10% con 3 votos no puede inferirse como tendencia. Esto debe quedar en el UI como entretenimiento rápido.

### B. Capa de Operación (Admin / Moderadores / Editores)
- **Objetivo:** Toma de decisiones de contenido, curación editorial, detección de alertas tempranas.
- **Métricas Permitidas:** Empate técnico (Technical Tie), Tamaño de Muestra Efectivo ($n_{eff}$), Estabilidad (Mass to Revert), Entropía (Fragmentación).
- **Recursos Oficiales:** Los Golden Endpoints B2B (`get_b2b_battle_analytics`, `get_b2b_actualidad_topic_analytics`, etc.).
- **Regla:** El Admin no debe alarmarse por un 90% vs 10% si el $n_{eff}$ indica un tamaño de muestra marginal o si el Intervalo de Confianza (Wilson) clasifica el resultado como `frágil`.

### C. Capa B2B / Premium / Data Exports (Clientes)
- **Objetivo:** Análisis de mercado sólido robusto con representatividad demográfica, sin contaminación temporal ni sesgos de minorías ruidosas.
- **Métricas Permitidas:** Bayesian Score, Bandas de Wilson completas, Entropía Normalizada (Shannon), Trending con Time-Decay. Totalmente ajeno a *vanity metrics*. Exclusivamente outputs clasificados, corregidos e interpretados.
- **Recursos Oficiales:** Solo y únicamente los Golden Endpoints o Data Lakes construidos *sobre* el nuevo contrato no-battle `v3.0`.
- **Regla:** Ningún export para cliente (CSV/API) debe incluir la métrica plana sin incluir en la columna contigua el `n_eff` ponderado y la `bayesian_prior` para asegurar *Data Integrity*.

---

## 2. Formato Estándar de Salida ("Golden Endpoints")

Para garantizar coherencia, todos los *read models* orientados a la Capa B y C (Admin y B2B) deberán separar sus outputs en tres dimensiones semánticas:

1.  **Raw (Crudos):** `raw_score_pct`, `total_weight_mass`, `options_count`.
2.  **Corrected (Corregidos):** `bayesian_score_pct`, `n_eff`, `ci_lower`, `ci_upper`, `decayed_score`.
3.  **Interpreted (Interpretados):** (El backend toma la decisión y arroja string o boolean).
    - `technical_tie_flag`: boolean (True si las bandas de confianza cruzan la ventana 50-50).
    - `stability_label`: text (`frágil`, `probable`, `robusto`, `empate técnico` según inercia de masa).
    - `fragmentation_label`: text (`alta concentración`, `competencia abierta`, `alta fragmentación` según modelo de entropía generalizada).

## 3. Versionado del Contrato Analítico

Todos los RPCs B2B incluirán el campo estático `stats_version` (ej. `'v3.0'`). Esto permite que si en el Bloque 5 se ajusta la fórmula del *OpinaScore*, los reportes históricos en CSV exportados a clientes de B2B sigan indicando bajo qué reglas matemáticas (ej. `'v2.2-Weighted'` vs `'v3.0'`) fue inferido ese valor específico, salvando el contrato comercial de SLA de Datos.
