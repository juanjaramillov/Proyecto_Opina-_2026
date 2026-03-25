# Referencias Visuales: Feed "Señales"

El hub interactivo de **Señales** es el destino principal luego del log-in.

## Contenedor Principal: Modos de Color
- El contenedor general de la página (`SignalsHub.tsx`) está estructurado con **fondo blanco** (`bg-white`) o un gris ínfimo (`bg-slate-50`), y los textos nativos en **dark** (`text-ink`).
- **Excepción Clave - Tarjetas de Señal**: Existen módulos inmersivos específicos de interacción (Ej. "Versus", "Torneo") donde el contenedor interno fuerza una **inversión de color** abrupta. Es común que las tarjetas interactivas tengan fondo negro (`bg-black` o `bg-zinc-900`) y texto blanco, dándoles un aire premium de exhibición.

## Interacción y Cartas
- Las "Señales" se comportan como cartas apiladas o en lista central.
- Los módulos combinan imágenes de alta carga emotiva, bloques asimétricos y componentes flotantes para indicar progreso (e.g., barras V1, V2).
- Existen transiciones de desplazamiento (swipe o scroll vertical acentuado).

## Elementos Comunes (Alinear con Resultados)
- Los "Insights" descriptivos de cada señal suelen tener bordes de pocos píxeles, colores pasteles de fondo con baja opacidad, o degradados (e.g., violeta a azul).
- Resultados debería retomar estas estéticas cuando presente recortes de información relacionada a "Señales" previas.

*(Para ver la UI exacta actual, referirse a `screenshots/signals/` en este ZIP).*
