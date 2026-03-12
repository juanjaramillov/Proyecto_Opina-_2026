# Module to Signal Mapping

Este documento define cómo los módulos actuales de Opina+ deben mapearse al motor unificado de señales.

## Principio general

Toda interacción relevante debe seguir guardándose en su estructura actual mientras el sistema legacy siga activo.
Además, progresivamente, cada interacción debe registrarse también en public.signal_events.

## 1. Versus

### Tipo de señal
VERSUS_SIGNAL

### Qué representa
Preferencia directa entre dos opciones comparables dentro de una misma subcategoría.

### entity_id
Debe apuntar a la opción elegida en signal_entities.

### context_id
Debe apuntar al versus o instancia donde ocurrió la comparación.

### value_json sugerido
{
  "selected_option_id": "...",
  "rejected_option_id": "...",
  "criterion": "...",
  "subcategory": "...",
  "battle_id": "...",
  "round_index": 1
}

### source_module
versus

### source_record_id
ID del registro original del módulo actual, si existe.

---

## 2. Progresivos

### Tipo de señal
PROGRESSIVE_SIGNAL

### Qué representa
Preferencia secuencial donde la opción elegida continúa avanzando.

### entity_id
Debe apuntar a la opción elegida.

### context_id
Debe apuntar al progressive o torneo/flujo correspondiente.

### value_json sugerido
{
  "selected_option_id": "...",
  "rejected_option_id": "...",
  "stage": 1,
  "bracket_step": "...",
  "subcategory": "...",
  "instance_id": "..."
}

### source_module
progressive

### source_record_id
ID original del flujo actual, si existe.

---

## 3. Profundidad

### Tipo de señal
DEPTH_SIGNAL

### Qué representa
Evaluación estructurada de una entidad bajo una serie de preguntas homogéneas.

### entity_id
Debe apuntar a la marca/opción evaluada.

### context_id
Debe apuntar a la instancia del cuestionario o evaluación depth.

### value_json sugerido
{
  "question_code": "...",
  "question_label": "...",
  "response_type": "nps|scale|boolean|single_choice|text",
  "response_value": "...",
  "nps_score": 8,
  "subcategory": "...",
  "survey_instance_id": "..."
}

### source_module
depth

### source_record_id
ID original del registro de respuesta, si existe.

---

## 4. Noticias / actualidad

### Tipo de señal
CONTEXT_SIGNAL

### Qué representa
Postura, percepción o reacción del usuario frente a un tema, evento o noticia.

### entity_id
Debe apuntar al evento, tema o entidad principal asociada.

### context_id
Debe apuntar a la noticia, bloque editorial o contexto temporal.

### value_json sugerido
{
  "topic": "...",
  "stance": "...",
  "answer_value": "...",
  "answer_format": "boolean|scale|single_choice",
  "news_item_id": "...",
  "question_id": "..."
}

### source_module
news

### source_record_id
ID original del registro, si existe.

---

## 5. Tu Pulso

### Tipo de señal
PERSONAL_PULSE_SIGNAL

### Qué representa
Señal del estado, percepción o balance personal del usuario.

### entity_id
Debe apuntar a una dimensión conceptual o emocional evaluada.

### context_id
Debe apuntar al período o formulario de pulse correspondiente.

### value_json sugerido
{
  "dimension": "mood|stress|energy|week_quality",
  "question_code": "...",
  "response_value": "...",
  "response_format": "boolean|scale|single_choice",
  "period": "daily|weekly|monthly"
}

### source_module
pulse

### source_record_id
ID original del módulo, si existe.

---

## Reglas generales

- No romper persistencia actual.
- Cada módulo debe poder seguir operando con su estructura legacy.
- signal_events es capa transversal unificadora.
- La integración debe ser progresiva y segura.
