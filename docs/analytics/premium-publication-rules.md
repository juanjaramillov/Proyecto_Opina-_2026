# Reglas de Publicación Premium B2B (Modo Estricto v1.1)

## Propósito
Del 100% de data viva en Opina+, solo una pequeña fracción tiene rigor estadístico suficiente para ser comercializada en B2B.

La función central `get_premium_eligibility_v1_1(entity_id, module_type)` escupe un contrato estandarizado de la forma `b2b_premium_output`, que además de contener el **OpinaScore Final**, cataloga la entidad en tres estratos inamovibles según thresholds duros calculados en tiempo real.

---

## Tres Estratos del Output Analítico B2B

### 🟢 1. PUBLISHABLE (PREMIUM)
Data robusta y matemáticamente estable. Lista para reportes a C-Levels, APIs externas, o Exportación B2B directa.

**Requisitos Simultáneos ($AND$ lógico):**
- Tolerancia empírica ($n_{eff}$) $\ge 100.0$.
- No existe un Empate Técnico (`technical_tie_flag = FALSE`).
- Score de Integridad Analítica $\ge 90.0$ (Prácticamente impecable frente al botting).
- Nivel comercial mínimo: `OpinaScore` final $\ge 300.0$.

### 🟡 2. EXPLORATORY (TENDENCIA TEMPRANA)
Datos emergentes ó inherentemente caóticos. Visibles para Editores o Agencias en dashboards avanzados pero exigiendo advertencias (Warnings) rojas o ámbar antes de tomar decisiones.

**Disparadores Fijos (Alguna de estas condiciones degrada de PUBLISHABLE a EXPLORATORY):**
- Muestra insuficiente para Premium pero pasable: $30.0 \le n_{eff} < 100.0$.
- Presencia comprobada de **Empate Técnico** dentro del Intervalo de Wilson.
- Score de Integridad sospechoso pero no crítico: $50.0 \le Integridad < 90.0$.
- `OpinaScore` de muy baja adopción: $< 300$.

### 🔴 3. INTERNAL_ONLY (NO PUBLICABLE / BLOQUEADO)
Data basura ó etapa hiper-embrionaria. Riesgo metodológico altísimo. **Desconectada de cualquier API B2B** y visible estrictamente para Super-Admins de Opina+.

**Disparadores Fatales ($OR$ lógico - basta uno para morir aquí):**
- $n_{eff} < 30.0$. Totalmente gobernado por la Varianza.
- Red Flag Tóxica de Antifraude: Score de Integridad Analítica $< 50.0$.

---

> [!NOTE] Motor de Razones
> El Pipeline SQL siempre llena el arreglo `eligibility_reasons` con cadenas de texto explícitas (ej: `"Technical Tie Detected"`, `"Low Integrity Score (<50)"`) por cada threshold negativo alcanzado. Así se justifica en UI al Editor B2B por qué una batalla no es exportable.
