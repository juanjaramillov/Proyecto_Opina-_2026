# Referencias Visuales: Home Page

La vista **Home** funciona como la identidad principal no autenticada del producto. A pesar de que partes heroicas de otras pantallas tienen modos oscuros (Hero), la **Landing** en sí (el feed del Home) es un diseño muy limpio, predominantemente iluminado.

## Paleta y Contenedor Principal
- **Background Base**: **Blanco puro (`bg-white`)**. Múltiples secciones flotan sobre este canvas luminoso.
- **Identidad Modular**: Uso de rectángulos con bordes redondeados (`rounded-3xl` o `rounded-2xl`) con gris sutil o blanco y sombras etéreas (`shadow-sm`, `shadow-xl`) para delimitar tarjetas.

## Tipografía y Contraste
- Textos primarios en **`text-ink`** (gris casi negro).
- Títulos de gran peso (`font-bold`, `tracking-tight`).
- Componentes de acción (botones CTA) usualmente usan el color brand **`bg-primary`** o negros profundos (`bg-ink`) contra texto blanco.

## Comportamiento
- Home es una landing de scroll continuo.
- Incorpora animaciones de revelado suave al scrollear (Framer Motion).
- Existe una barra de navegación (Header) flotante con efecto *glassmorphism* (blur) en la parte superior.

*(Para ver la UI exacta actual, referirse a `screenshots/home/` en este ZIP).*
