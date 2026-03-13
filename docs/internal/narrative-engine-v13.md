# Motor de Narrativas y Explicaciones (V13)

## 1. Definición del Narrative Engine
El **Narrative Engine** de Opina+ transforma la frialdad de los datos porcentuales y las alarmas de umbral de sistema en algo comprensible y accionable matemáticamente.
Su objetivo principal es proveer explicaciones oficiales respaldadas estrictamente en lecturas transaccionales o temporales, para evitar que la UI quede como un dashboard "mudo" o peor aún, llene espacios con hardcodes marketeros.

El motor reside en `src/features/metrics/narratives/narrativeEngine.ts` y exporta la función fundamental `narrativeEngine.generateSystemNarratives()`.

## 2. Taxonomía de Narrativas y Traducción B2C/B2B

El motor intercepta las Alertas del sistema y cruza información del `metricsService` para devolver narrativas enriquecidas bajo 5 arquetipos. Para cada métrica detectada se retornarán dos textos, uno para capa de Consumo Público (Resultados) y otro Estructural Ejecutiva (Inteligencia).

### 2.1 Picos de Polarización (`POLARIZATION_SPIKE`)
- **Base Técnica**: Entidades donde el `alertEngine` disparó alarma de un combato estancado entre 45% y 55% de Win Rate sostenido.
- **Consumer Text**: Foco en la falta de acuerdo tajante o debate reñido.
- **Intelligence Text**: Foco en el estancamiento orgánico y la división a mitades. Presentación del Win Rate real.

### 2.2 Aceleración Notoria (`STRONG_ACCELERATION`)
- **Base Técnica**: Tendencia de Momentum (WoW >30% con suficiencia de datos).
- **Consumer Text**: Celebración del interés acelerado en comunidad.
- **Intelligence Text**: Lectura analítica mostrando el salto del delta porcentual.

### 2.3 Caída Severa (`RELEVANT_DROP`)
- **Base Técnica**: Desplome de momentum detectado por el `alertEngine` (Drop agudo vs T-1).
- **Consumer Text**: Resiliencia suave e.g. "se ha enfríado recientemente".
- **Intelligence Text**: "Pérdida de piso conversacional o fin de ciclo de vida viral", marcando deltas.

### 2.4 Emergencia Temprana (`EARLY_SIGNAL`)
- **Base Técnica**: Alarmas tempranas transitorias.
- **Consumer Text**: Asoman en el radar rápidamente.
- **Intelligence Text**: Brote incipiente pero que requiere mayor acumulación.

### 2.5 Dominancia Estable (`STABLE_DOMINANCE`)
- **Base Técnica**: Esta narrativa NO nace de una alerta de contingencia. Cruza el `etricsService.getGlobalLeaderboard`. Si una entidad reina con win rate >60% y no ha disparado ninguna alerta de drop o polarización reciente, el sistema atestigua que se encuentra en control sostenido.
- **Consumer Text**: Confirmado como "Un favorito indiscutible".
- **Intelligence Text**: Demuestra un techo alto sin síntomas de debilidad sistémica actual ni ruido fragmentario.

## 3. Principio de Silencio ("La Confianza")
La métrica más importante es la verdad. El `narrativeEngine` escapa limpiamente (retornando `null`) si un requerimientro en particular de `generateEntityNarrative(id)` solicita una entidad que no goza ni de dominancia global, ni está cruzando métricas excepcionales de caída, crecimiento o polarización.
**Nunca** inventaremos texto de relleno por llenar un card en la UI. Si el motor devuelve `null`, la interfaz debe reaccionar omitiendo bloques de insight y limitándose al número per se, evitando el ruido.

## 4. Próximos Pasos de Adopción
- Reemplazar los *call-outs* quemados de "Resultados" por el output local de `generateEntityNarrative(currentUserLeadingEntity)`. 
- Adaptar las Vistas de "Inteligencia" para nutrir las tablas B2B con los renglones puros de `intelligenceText`.
