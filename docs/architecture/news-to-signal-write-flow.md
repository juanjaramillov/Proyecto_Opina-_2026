# News / Actualidad to Signal Write Flow

## Objetivo

Conectar el módulo **News / Actualidad** interactivo al motor unificado de señales sin romper el comportamiento actual de grabación desde Supabase.

## Regla de Modelado Obligatoria
En este bloque y en el formato de Context Signal estandarizado:
**1 respuesta editorial estructurada del usuario = 1 señal iterativa (`CONTEXT_SIGNAL`).**

- Pregunta 1 respondida (Ej. Escala) = una señal
- Pregunta 2 respondida (Ej. Boolean) = otra señal

## Separación Entity vs Context
El diseño separa claramente el "qué" del "dónde":
- **`entity_id`**: Es el sujeto subyacente de la noticia (Ej. "Gobierno", "Inflación", "Aprobación Presidencial"). Las noticias intentan ser emparejadas al catálogo curado basado en su `category` secundaria, o en su `title`.
- **`context_id`**: Es la pieza editorial o artículo concreto en sí mismo, instanciado con el flag `kind = 'news'`. 

## Estrategia

1. **Mantener escritura legacy**: Los flujos siguen grabando `topic_answers` (usando `submitAnswers` en frontend) primariamente por compatibilidad del Wizard.
2. **Escritura secundaria asíncrona**: Después del primer save DB true, disparamos individualmente promesas SQL que inyectan registros en `signal_events` invocando la mutación `record_context_signal`.
3. **Fallas silenciosa y UX Reactiva**: Si los helper fallan, o no puede descubrirse un topic general en el `master map` del entity, *se salta este paso*. La UX en `ActualidadHubManager.tsx` mostrará éxito siempre y cuando el viejo endpoint responda bien.

## Normalización
`normalizeNewsAnswer(...)` usa el subdiccionario adjunto proveniente de las `TopicQuestion` del `ActualidadTopicDetail` y deduce las cotas y valores tipados para `value_numeric`, booleans literal de inputs, o string explícitos para fallback en JSON y `value_text`.
