# B2B Visual Consumption Layer

La **Capa de Consumo Visual B2B** de Opina+ transforma las estructuras analíticas crudas (`opinascore_breakdown`, `b2b_premium_output`) en componentes ejecutivos claros, accionables y matemáticamente defendibles, sin recurrir a la complejidad visual de un software de Business Intelligence (BI).

Este documento estandariza los componentes y lenguajes visuales utilizados en el panel Admin y cómo los agentes B2B deben interpretar la información.

## 1. B2B Eligibility Banner (Semáforo de Exportabilidad)
El elemento superior de cualquier vista de detalle. Define inmediatamente si la data de la entidad puede venderse, auditarse o si debe permanecer bajo reserva.

- 🟢 **Premium Exportable (`PUBLISHABLE`)**
  - **Fondo:** Verde Esmeralda claro.
  - **Significado:** El dataset supera holgadamente el tamaño muestral crítico ($n_{eff} \ge 100$) y el filtro antifraude ($Integrity \ge 90$). La data es sólida para reportes externos.
- 🟡 **Consumo Exploratorio (`EXPLORATORY`)**
  - **Fondo:** Ámbar claro.
  - **Significado:** El sistema activó un fallback. Generalmente ocurre por empates técnicos detectados, desgaste de la muestra ($30 \le n_{eff} < 100$) o integridad sospechosa ($50 \le Integrity < 90$). Señala volatilidad.
- 🔴 **Uso Interno (`INTERNAL_ONLY`)**
  - **Fondo:** Rojo Rose claro.
  - **Significado:** Riesgo muestral grave. $n_{eff}$ diminuto o integridad colapsada ($< 50$). Totalmente prohibido su uso comercial externo.

> **Explicabilidad Frontal**: El banner lista las `eligibility_reasons` retornadas por PostgreSQL para que el editor sepa exactamente por qué un tema fue penalizado.

## 2. Tarjetas Ejecutivas de Resumen (B2B Executive Cards)
Un grid de cuadricula (4x4 o 2x2) debajo del banner que destila la radiografía poblacional:

1. **OpinaScore Transaccional**: Muestra el valor final normalizado (0-1000). Acompañado de un desglose (Breakdown) estilizado `B: ScoreBase × M: Multiplicador` para transparentar la penalidad.
2. **Confianza Estadística (N_EFF)**: Expone el tamaño efectivo de la muestra, eliminando ruido de bots. Resalta visualmente un "Empate Técnico" (en Ámbar) o "Líder Claro" (en Verde) para no dejar lugar a malinterpretaciones.
3. **Integridad (Score 0-100)**: Termómetro del fraude. Si ocurren flags (`flag_device_concentration`, `flag_velocity_burst`), se inyectan mini-indicadores rojos advirtiendo la tipología específica de la anomalía.
4. **Estructura Muestral / Entropía**: Dependiendo del módulo (`news` o `versus`), muestra el estadio de la información (alta fragmentación vs consenso fuerte) usando el valor normalizado de Shannon, o la etiqueta de "Estadío de Estabilidad".

## 3. Premium Comparative Table (Bandas de Wilson)
La tabla comparativa inyectada para batallas suma-cero (`versus`). 

En lugar de mostrar un "porcentaje de votos" mentiroso, muestra la estructura de `Lower Bound` y `Upper Bound` del intervalo de Wilson. 
- Visualmente ilustra una barra de progreso basada en el `normalized_score` o `raw_win_rate`.
- Incluye el tooltip o texto auxiliar enseñando a leer el intervalo: *Un empate técnico no es 50/50, es la colisión matemática entre el límite inferior del primero y el límite superior del segundo*.

## Lineamientos de Diseño (Bloomberg Terminal Lite)
El diseño respeta el sistema base (Slate/Indigo/Emerald) pero eleva el rigor visual.
- **Tipografía monospace** (`font-mono`) rigurosa para cifras, multiplicadores y bounds.
- **Métricas mayúsculas y condensadas** (`tracking-widest`, `text-[10px]`) para headers de tarjetas.
- Evitación de "tuberías chart.js" a menos que haya carga temporal estricta; se confía predominantemente en la tipografía gruesa y Badges descriptivos.
