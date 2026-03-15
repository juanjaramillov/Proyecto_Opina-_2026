# Banderas de Integridad y Antifraude Analítico (Bloque 5)

## Propósito
Para proteger el valor del Ledger de Señales de Opina+ de granjas de clics, intervencionismos forzados y cuentas bot automatizadas, aplicamos heurísticas reactivas en la base de datos sin necesidad de redes neuronales o pipelines excesivamente complejos. 

## Mecanismo Puntuador
Cualquier entidad (Batalla, Noticia o Entidad) en revisión para un Export Premium se coteja contra `get_analytical_integrity_flags(entity_id)`, el cual evalúa los latidos recientes (últimas 24hs o inferior) del Ledger y determina un **Integrity Score** entre de $0/100$ hacia la perfección $100/100$.

## Heurísticas Actuales

### 1. `flag_device_concentration` (Concentración Extrema)
**Castigo:** $-40$ Puntos  
**Disparador:** Calcula si en las últimas 24 horas, la sumatoria de "victorias" o participaciones provenientes de un solitario dispositivo (`session_id` o hash único) abarca $> 35\%$ del Share Total de la batalla.
> **Por qué:** Bloquea campañas de marketing de guerrilla maliciosa o cuentas _smurf_ hiperactivas en encuestas pequeñas donde tratan de dictar el mercado asimétricamente.

### 2. `flag_velocity_burst` (Ráfaga Inusual)
**Castigo:** $-30$ Puntos  
**Disparador:** Establece una línea de base móvil dividiendo el volumen general en 7 días / $168$ hrs para hallar el latido inter-horario normal (ej: $10$ señales por hora). Si en una franja aislada de $15$ minutos hay $+5x$ del latido (ej: golpean $+50$ votos), detectamos un *burst* que alerta a la B2B sobre "viralidad toxica" y es penalizado.

### 3. `flag_repetitive_pattern` (Granjas Automatizadas Smurfs)
**Castigo:** $-20$ Puntos  
**Disparador:** Rastrea si *n* eventos emitidos careciendo de `user_id` en una misma hora repiten de forma mecánica las interacciones contra un mismo nodo, y su umbral supera las $20$ instancias, evidenciando scripts automatizados.

---

> [!CAUTION] Si el Integrity Score colapsa severamente (< 90%), se aplica el status `INTERNAL_ONLY` a la data y será escondida de la capa B2B Comercial, evitando que los clientes compren Data Suciada por la opinión irracional de granjas bot.
