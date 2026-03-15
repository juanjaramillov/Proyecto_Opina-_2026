# OpinaScore v1.1: Índice Compuesto de Valor de Mercado

## Propósito
El `OpinaScore` es la métrica "north star" de Opina+ para clientes B2B. Condensa la opinión pública masiva considerando la incerteza estadística, la salud de la muestra y la fragmentación del mercado. 

El modelo `v1.1` genera un desglose tipificado en el SQL (`opinascore_breakdown`) compuesto por:
- `opinascore_base` $\in [0, 1000]$
- `integrity_multiplier` $\in [0.0, 1.0]$
- `opinascore_final` (Base $\times$ Multiplicador)

> [!CAUTION] Norma de Comparabilidad (Contextual)
> ¿Un OpinaScore 780 en Versus significa lo mismo que un 780 en Depth? **NO**.
> Se establece oficialmente que la escalabilidad entre módulos es **contextual solamente**. El OpinaScore sólo puede usarse para rankear entidades dentro de su mismo módulo subyacente (`context`). No existe calibración cruzada que equipare la densidad de una noticia con la incerteza de un versus.

---

## 1. OpinaScore Comparativo (`versus`)
Diseñado para escenarios de suma-cero donde la opción A compite por share mental contra B y C.

**Rango Esperado:** $0 - 1000$

**Fórmula de Base ($Score_{base}$):**
1. **Ratio Bayesiano ($R_{bayes}$):**
   $$R_{bayes} = \frac{W_{eff} + m \cdot C_{prior}}{N_{eff} + m}$$
   *Donde $W_{eff}$ es victorias ponderadas, $N_{eff}$ volumen efectivo, masa $m=10.0$ y prior central $C_{prior}=0.5$.*
2. **Pivote 1000:** Multiplica $R_{bayes} \times 1000$.
3. **Castigo por Incerteza (Wilson):**
   Sea $W_{width} = UpperBound - LowerBound$. 
   Si el ancho supera el $10\%$ de holgura ($W_{width} > 0.1$), se deduce:
   $$Penalty = 300 \cdot (W_{width} - 0.1)$$
4. **Floor:** $Score_{base} = \max(0, R_{bayes} \cdot 1000 - Penalty)$.

---

## 2. OpinaScore Normativo (`news`)
Diseñado para noticias/tópicos efímeros. Se evalúa el nivel de intensidad del tema y qué tan polarizado (caótico) se encuentra.

**Rango Esperado:** $0 - 1000$

**Fórmula de Base ($Score_{base}$):**
1. **Densidad Bayesiana ($R_{bayes}$):**
   Mismo cálculo que Versus, pero el $W_{eff}$ corresponde exclusivamente a la opción líder (majority share).
2. **Castigo por Entropía (Shannon):**
   La Entropía de la Noticia normalizada $H_{norm} \in [0, 1]$ actúa como penalidad. Mayor entropía indica ruido y falta de consenso.
   $$Penalty = 400 \cdot H_{norm}$$
3. **Cálculo Final Base:**
   $$Score_{base} = \max(0, R_{bayes} \cdot 1000 - Penalty)$$

---

## 3. OpinaScore Perceptual (`depth`)
Calculado puramente sobre encuestas de Rating Relacional ($1$ a $10$).

**Rango Esperado:** $0 - 1000$

**Fórmula de Base ($Score_{base}$):**
1. **Ratio Bayesiano ($R_{bayes}$):**
   En vez de Share, aquí se ancla el Average Score obtenido de forma directa al centro estricto de la escala para evitar sesgo de muestras diminutas.
   $$R_{bayes} = \frac{(\text{AvgRating} \cdot N_{eff}) + (10.0 \cdot 5.5)}{N_{eff} + 10.0}$$
2. **Translación Lineal (1-10 $\rightarrow$ 0-1000):**
   $$Score_{base} = \max\left(0, \left(\frac{R_{bayes} - 1}{9}\right) \cdot 1000\right)$$

---

> [!IMPORTANT] Impacto Estructural de la Integridad
> Al final de todo cálculo de contexto, la base siempre se multiplica por el `integrity_multiplier` calculado en `get_analytical_integrity_flags()`. Si $Score_{base} = 800$ pero la entidad sufre ráfagas bot (Multiplicador $0.70$), el score reportado comercialmente caerá a $560$.
