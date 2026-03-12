# Tu Pulso / Pulse Signal Integration Status

## Archivos Integrados Base
- `src/lib/signals/recordPulseSignalsFromLegacy.ts`: Servicio secundario con normalizador `normalizePulseAnswer()`. Convierte el enum interno `[key: PulseCategory]` y sus scores arbitrarios ("igual", "peor", numéricos 1-5, o binarios Si/No) a formatos tipables de DB `value_numeric`, `value_boolean` y `value_text`.
- `src/features/feed/components/PulseHubManager.tsx`: Componente principal del Wizard personal. Orquesta que ante el `onComplete` final hacia Supabase, despache el *fire and forget* iterador prometiendo transacciones concurrentes hacia el motor central unificado.

## Supuestos Asumidos
- La periodicidad estándar se marca como `weekly` dentro del wrapper del formulario (`context_id` con prefijos y semana año).
- Las claves únicas de respuestas se pre-tienen listadas (`PULSE_DIMENSION_MAP`) en nuestra capa backend. P. ej. `q_stress` intenta validar o crearse como "Nivel de Estrés" si la tabla `signal_entities` o sus alias/legacy lo avalan. De otra forma se saltará la grabación por sanidad de la data.

## Brechas Analíticas y Gaps (TODOs)
- **Nacimiento de Entidades Conceptuales**: Actualmente `signal_entities` está volumbilizada para catalogar Políticos, Marcas, Organismos etc. La inyección de Tu Pulso exigirá que Data Science empadrone oficialmente Dimensiones puras (`kind = concept`) con strings canónicos como: `Estado de Ánimo`, `Calidad de Sueño`, `Nivel de Energía`, `Sobrecarga`, `Percepción de Inseguridad`, etc. El mapper actual previene errores usando fallbacks tolerantes.
- Modulos Anteriores: El histórico de `user_pulses` no se retro-migró en esta PR.
