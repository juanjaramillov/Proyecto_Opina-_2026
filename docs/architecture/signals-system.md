# Opina+ Signals System

Opina+ es una plataforma de captura, estructuración y análisis de señales de opinión.

Una señal es cualquier interacción del usuario que expresa:

- preferencia
- percepción
- comparación
- evaluación
- estado personal
- reacción contextual

Todas las interacciones del sistema deben transformarse en señales estructuradas.

---

## Tipos de señales del sistema

### 1. Versus Signals

Comparación directa entre dos opciones.

Ejemplo:
Netflix vs Prime Video

Se genera una señal indicando preferencia entre ambas.

---

### 2. Progressive Signals

Comparación secuencial donde el ganador sigue compitiendo.

Ejemplo:

Apple vs Samsung  
Ganador vs Xiaomi  
Ganador vs Huawei

Esto permite construir rankings dinámicos.

---

### 3. Depth Signals

Evaluaciones estructuradas de una entidad.

Ejemplo:

Marca: Banco de Chile

Preguntas:

- NPS
- confianza
- servicio
- relación precio/calidad
- recomendación

Estas señales permiten construir perfiles detallados de cada entidad.

---

### 4. Context Signals

Reacciones frente a eventos actuales.

Ejemplo:

Noticias
Eventos políticos
Eventos económicos

Las señales reflejan percepción pública en tiempo real.

---

### 5. Personal Pulse Signals

Señales del propio estado del usuario.

Ejemplos:

- Esta semana fue mejor que la anterior
- ¿Te sentiste feliz esta semana?
- ¿Te sentiste estresado?

Estas señales permiten construir contexto emocional y personal.

---

## Entidades del sistema

Las señales siempre se generan sobre una entidad.

Ejemplos:

Marca
Producto
Institución
Persona pública
Evento
Concepto

---

## Estructura conceptual de señal

Cada señal debe tener:

user_id
signal_type
entity_id
context_id
value
weight
timestamp

---

## Capas del sistema

### Captura de señales

Versus  
Progresivos  
Profundidad  
Noticias  
Tu Pulso

---

### Lectura de señales

Resultados para usuarios:

- rankings
- tendencias
- comparación con otros

---

### Inteligencia

Capa B2B con acceso avanzado a:

- segmentación
- evolución temporal
- patrones de opinión
