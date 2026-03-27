# Riesgos y Deficiencias Restantes

## Huecos Reales Detectados:
1. **Timer Ausente en Cuestionarios**: Ni Profundidad ni Actualidad poseen actualmente un hook de reloj de interacción montado a nivel Componente (como sí lo tiene Versus), lo cual imposibilita recolectar `response_time_ms` a menos que se fabrique un wrapper como `useInteractionTimer`. Se están mandando valores nulos preventivos.
2. **Dependencia Lógica en Torneos**: El seguimiento de secuencias nativas de BDD (columnas `sequence_id` y `sequence_order`) ha sido puenteado vía atributos meta (`meta.stage`), obligando a los analistas a escudriñar metadatos JSON para reconstruir el hilo del torneo en vez de usar la estructura canónica.

## Conclusión
La base ha sido endurecida y los pipelines traseros de comunicación son 100% seguros y asumen la arquitectura nueva. El trabajo remanente yace exclusivamente en los componentes React frontales agregándoles telemetría de in-component.
