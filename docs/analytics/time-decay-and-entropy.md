# Modelos y Fórmulas Analíticas Especializadas (Bloque 3)

Como parte de la versión v3 del Motor Estadístico de Opina+, se incorporaron modelos orientados a evaluar y castigar participaciones históricas (Recencia) y analizar el estado de un mercado competitivo (Entropía).

## Time-Decay (Decaimiento Exponencial)

**Problema que Resuelve:**
Un error común en *Leaderboards* de votación acumulada asume que una señal de hace 3 años vale lo mismo que una señal de hoy ("Las viejas glorias inmerecidas").

**Metodología Matemática (Thermodynamic Half-Life):**
El valor de una victoria en un versus no es siempre $W = 1 \times effective\_weight$.
El valor temporal de la señal se devalúa exponencialmente:

$$ W_{temporal} = W_{base} \times e^{-\lambda t} $$
Donde:
- $W_{base}$ es el `effective_weight` (basado en el Nivel del Usuario y su `signal_weight`).
- $\lambda = \frac{\ln(2)}{\text{Half-Life en Días}}$. (Ej: $\text{Half-Life} = 7$, el valor decae al 50% cada 7 días).
- $t$ son los días reales (fraccionales) transcurridos entre `created_at` y `now()`.

**Implementación (RPC & SQL):**
La función `get_trending_leaderboard_decay(p_half_life_days=7.0)` aplica este modelo "on-the-fly" en base a la línea de tiempo. Es decir, las señales brutas en `signal_events` nunca son sobreescritas (garantizando inmutabilidad histórica), pero los read-models exponen la bandera `temporal_decay_applied = TRUE`.

---

## Entropía de Opinión y Dispersión

**Problema que Resuelve:**
Si una batalla (A vs B vs C) suma 10.000 señales, la magnitud no cuenta toda la historia.
¿Esa batalla está totalmente sesgada hacia la Opción A? ¿Hay un empate técnico caótico entre todas?
Para esto se utiliza un modelo de teoría de la información prestado de Termodinámica de Shannon.

**Metodología Matemática (Entropía de Shannon Normalizada):**

Dado un set de opciones de $1$ a $k$:
1. Se calcula la masa total de la batalla ($M = \Sigma W_{base}$).
2. Se calcula la probabilidad empírica o *Share* de cada opción ($p_i = \frac{W_i}{M}$).
3. Entropía Cruda ($H_{raw}$):
   $$ H_{raw} = - \sum_{i=1}^{k} p_i \log_2(p_i) $$

4. Normalización ($H_{norm}$): Para comparar batallas de 2 opciones con torneos de 16, normalizamos al rango $[0, 1]$ dividiendo por la entropía máxima posible ($\log_2(k)$):
   $$ H_{norm} = \frac{H_{raw}}{\log_2(k)} $$

**Interpretación Semántica (RPC `get_opinion_entropy_stats`):**
A través del campo de retorno `opinion_fragmentation_label`, la base de datos tipifica la matriz:
- $H_{norm} < 0.4 \implies$ **alta concentración**: Existe un ganador claro o predictibilidad absoluta.
- $0.4 \le H_{norm} \le 0.8 \implies$ **competencia abierta**: Disputa clásica, empate o nichos fuertes coexistiendo.
- $H_{norm} > 0.8 \implies$ **alta fragmentación**: Dispersión estadística, la opinión está atomizada entre múltiples opciones.
