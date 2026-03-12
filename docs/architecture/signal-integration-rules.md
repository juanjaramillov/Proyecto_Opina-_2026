# Signal Integration Rules

## Objetivo

Asegurar que la transición desde el modelo actual hacia el motor de señales ocurra sin romper la operación vigente del proyecto.

## Regla principal

Cada módulo mantiene su persistencia actual mientras siga operando bajo modelo legacy.
Adicionalmente, cuando sea seguro, debe registrar también una señal en public.signal_events.

## Estrategia

### Etapa 1
Documentar mapping oficial.

### Etapa 2
Crear funciones helper del motor.

### Etapa 3
Detectar puntos actuales de persistencia.

### Etapa 4
Agregar doble escritura de manera controlada.

## Reglas técnicas

- No meter lógica compleja de señales directo en componentes UI.
- Preferir server actions, services o capas de backend ya existentes.
- No duplicar mapeos inconsistentes entre módulos.
- Siempre usar funciones helper SQL para insertar en signal_events.
- Mantener source_module y source_record_id para trazabilidad.

## Regla de rollout

Si un módulo no tiene todavía un punto de persistencia claro y seguro, no forzar integración en este bloque.
Primero documentar, luego integrar.
