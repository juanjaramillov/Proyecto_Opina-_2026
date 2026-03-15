# Opina+ Core Estadístico (Mejora Bloque 2 - v2.2)

Este documento detalla los elementos matemáticos introducidos en la mejora del **Bloque 2** para dotar al Ledger de Señales de robustez estadística. Se endurecieron los cálculos para evitar interpretaciones falsas sobre pesos efectivos puros, agregando trazabilidad explícita para B2B.

## 1. Problema de la Masa Cruda (N) vs N Efectivo ($n_{eff}$)
Dado que Opina+ usa `effective_weight` (pesos de credibilidad y reputación), un voto puede valer 1.0, 0.5 o 10.0. 
Utilizar la suma directa de la masa como "Total de la Muestra" ($N$) en las fórmulas binomiales infla artificialmente la estrechez de las estimaciones (falso exceso de confianza estadística). 

**Solución Metodológica Aplicada:**
En la versión `v2.2` reemplazamos la masa pura por el **Tamaño de Muestra Efectivo Ponderado** ($n_{eff}$):
$$ n_{eff} = \frac{(\sum w_i)^2}{\sum (w_i^2)} $$
Este $n_{eff}$ reduce correctamente la certeza cuando la masa mayoritaria proviene de muy pocos actores con un peso altísimo, permitiendo a los modelos inferir la "verdad poblacional real".

---

## 2. Promedio Bayesiano Parametrizable (Rankings)
Para listas ordenadas globales (ej. marcas más queridas), usamos una **Estimación Bayesiana** en lugar del *Raw Win Rate*.

### Trazabilidad y Cálculo
$$ Bayesian Score = \frac{(n_{eff} \times p_{hat}) + (m \times C)}{n_{eff} + m} $$

* $p_{hat}$: Proporción de la masa de victoria observada (`raw_wins_weight / total_effective_weight`). 
* $n_{eff}$: Tamaño de muestra efectivo.
* $C$ (`bayesian_prior`): Tasa de victoria estimada antes de la evidencia. Ahora **calculada dinámicamente** en base al promedio global transversal de todas las entidades, pero permite *override* en los RPC. Si no hay data la plataforma asume conservadoramente 0.5.
* $m$ (`bayesian_m`): Factor de encogimiento. Por defecto `20.0` (freno fuerte para los early-leaders de muestras enanas).

**Salidas:** Ahora las vistas retornan explícitamente separados el `raw_score_pct`, el `bayesian_score_pct`, el `n_eff`, y metadatos de los hiperparámetros.

---

## 3. Intervalo de Confianza para Versus (Wilson Score Weighted)
Para duelos directos (A vs B) y comparaciones binarias, aplicamos el **Intervalo de Wilson Ponderado** usando $n_{eff}$.

### Lógica (RPC `calculate_wilson_interval_weighted`)
* Usa la estimación asimétrica para encontrar `ci_lower` y `ci_upper` (Confianza del 95%).
* Introduce un Flag Lógico Transaccional: `technical_tie_flag` = `TRUE` si `ci_lower <= 0.5` y `ci_upper >= 0.5`. 

---

## 4. Estabilidad del Resultado Combinada
La métrica de estabilidad ya no descansa solamente sobre cuánta masa necesita el perdedor para poder ganar (`mass_to_revert`), sino que incluye a Wilson y a los tamaños de muestra.

### Categorización Robusta (`stability_label`):
1. **`empate técnico`**: Mandatorio si el flag del Intervalo de Wilson cruza el 0.5, independientemente de la masa faltante.
2. **`frágil`**: Si la masa para revertir / masa total es menor al 5%. Un grupo chico organizado puede voltear el tablero hoy.
3. **`probable`**: Masa para revertir entre 5% y 15%. Muestra una tendencia seria pero aún atacable por cambios de humor.
4. **`robusto`**: El margen supera el 15% del total de las inercias conjuntas y está estadísticamente cerrado a revertirse bajo afluencia normal.

---

## 5. Auditoría de Migraciones (Actualidad -> News)
Se corrigieron todas las inconsistencias de los logs en `Actualidad` y quedaron plasmados en la base de datos inmutable.
En el schema público vive la tabla `signal_migration_audit_log`, asegurando evidencia trazable sobre cuántos registros históricos fueron editados para salvar la exactitud del módulo Versus. Ninguna intervención se hará de espaldas a los registros.

### Limitaciones Restantes (Para Bloque 3+)
* El hack profundo del schema de Depth sigue heredado.
* Entropía multi-sector.
* Algoritmo *OpinaScore* principal con Time-Decay del peso efectivo a lo largo del calendario.
