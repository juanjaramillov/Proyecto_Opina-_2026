# Pulse to Signal Write Flow

## Objetivo

Conectar el módulo Tu Pulso interactivo al motor unificado de señales sin romper el comportamiento actual de inserción en `user_pulses`.

## Regla de modelado implacable

En la plataforma transversal, para el apartado *Tu Pulso*, manejamos la mutación `record_personal_pulse_signal`:
**Una respuesta personal estructurada del usuario = una señal independiente `PERSONAL_PULSE_SIGNAL`.**

- El formulario "Sobre Mí" genera N señales (1 por cada pregunta validada/reconocida).

## Separación conceptual

El setup aísla claramente la entidad evaluada del cuándo se evaluó:
- **`entity_id`**: Funciona como la **dimensión conceptual evaluada** (Ej. "Estrés", "Carga Laboral/Estudio", "Calidad de Sueño"). Éstas deben ir poblándose como tipos genéricos/conceptuales en el catálogo oficial `signal_entities` para permitir cruces (Ej. Personas estresadas y su cruce en topics políticos).
- **`context_id`**: Corresponde al **período o formulario temporal concreto**. (Ej. `pulse-mi-semana-2026-w11`). Es un UPSERT recurrente de un wrapper UUID general del suceso.

## Estrategia

1. **Mantener escritura legacy**: Los flujos siguen grabando lote por lote sobre `user_pulses` vía `pulseService.savePulseBatch()`.
2. **Escritura adicional hacia `signal_events`**: Interceptamos tras el primer OK (`showToast`), ejecutando `recordPulseSignalsFromLegacy` pasando el diccionario de `answers` completo de golpe.
3. **Resiliencia Pura**: Si ocurre una desincronización, la dimensión es nula o fallan los *helper upserts*, la UI del usuario final ignora la promesa rota y confirma el avance original.

## Estructura normalizada esperada

Para cada respuesta que sobrevive al helper SQL de guardado:
```json
{
  "dimension": "Estado de Ánimo",
  "question_code": "q_mood_week",
  "response_format": "single_choice",
  "response_value": "mejor",
  "period_type": "weekly",
  "period_reference": "2026-w11",
  "legacy_module": "pulse"
}
```
Campos Nativos en DB rellenables: `value_boolean` para SI/NO, `value_numeric` para escalas 1-5, `value_text` copiando el literal pre-tipado de un sub-estado ternario.
