# Guía de Diseño y Experiencia de Usuario (UI/UX): Opina+

## 1. Guía de Estilos Visuales (Design System)

La identidad de **Opina+** debe transmitir simultáneamente **confianza institucional**, **modernidad tecnológica** y extrema **facilidad de uso**. Debe sentirse y comportarse como una aplicación nativa móvil premium en cualquier dispositivo, alejándose radicalmente de la estética clínica y aburrida de las herramientas de encuestas tradicionales.

### Paleta de Colores
* **Primario (Brand Blue):** `#0A2540` o azul profundo similar. Utilizado para acciones principales, interfaces de máxima legibilidad, encabezados, y estructuración de la confianza.
* **Secundario (Teal/Emerald):** `#00D287` o variantes de verde vibrante. Utilizado paradenotar éxito, llamados a la acción (CTAs) positivos, validación de la participación y crecimiento.
* **Superficies y Fondos:** Se priorizan fondos neutros refinados. Implementación de estética *"Glassmorphism"* sutil para paneles superpuestos, tarjetas con elevación por sombras muy suaves, y un **Modo Oscuro (Dark Mode)** elegante y pulido (esencial para la inmersión en consumo prolongado y para el panel analítico).

### Tipografía
* **Títulos y Componentes Display:** *Outfit*, *Inter* o tipografías geométricas similares (Pesos Bold/ExtraBold) para crear impacto visual, asegurar modernidad y atrapar la mirada rápido en el feed.
* **Cuerpo de Texto y Datos (Body):** *Roboto* o variantes legibles de *Inter* para garantizar la máxima claridad en componentes densos de la UI y etiquetas de los gráficos.

### Lenguaje de Componentes Interaccionables
* **Tarjetas de Interacción (Cards):** Bordes redondeados consistentes (ej. 16px/24px de radio), espaciado interno generoso. Deben reaccionar al toque: animaciones de hover sutiles (escala 1.02), efectos de *Tilt* (inclinación) 3D para módulos envolventes como **Versus** y **Torneo**, dando sensación de profundidad.
* **Gestos y Fluidez:** Toda interacción de opinión (votar, deslizar) debe estar acompañada de *feedback visual inmediato* (micro-interacciones fluidas a 60fps, transiciones orgánicas, destellos sutiles de color al tomar una decisión). No deben existir re-cargas completas de página ("page reloads") abruptas durante el flujo de participación.

---

## 2. Flujo de Usuario Principal (User Flow)

### A. Flujo del Participante (Opinion Provider)
El objetivo es "Fricción Cero".
1. **Descubrimiento (El Hub de Señales):** El usuario ingresa a un "Hub" o "Feed" principal. Es recibido por una interfaz dinámica donde visualiza directamente módulos interactivos de diferentes temáticas (Política, Entretenimiento, Marcas).
2. **Interacción (Dentro de un Módulo):**
   * El usuario selecciona y abre un módulo (ej. "Versus: iOS vs Android").
   * La interfaz transiciona, opcionalmente, a una vista expandida o directamente reacciona en la tarjeta.
   * Realiza la acción requerida (tap en una opción, deslizar un slider, arrastrar para organizar).
   * **Recompensa Inmediata:** Al instante de emitir su señal, la UI revela dinámicamente cómo ha votado el resto de la comunidad hasta ese milisegundo. Esto funciona como validación social.
3. **Continuidad:** La interfaz sugiere fluidamente o presenta de inmediato el siguiente módulo relevante sin necesidad de volver a un menú principal forzosamente, fomentando rachas de participación.

### B. Flujo del Analista (Data Consumer / Creador)
El objetivo es "Claridad Analítica y Rapidez B2B".
1. **Dashboard Panorámico (Overview):** Pantalla principal enfocada en la salud y rendimiento de sus campañas activas. KPIs presentados en tarjetas de alto contraste superior (Total de opiniones recolectadas hoy, Distribución demográfica clave rápida).
2. **Setup Rápido:** Capacidad de crear y desplegar un nuevo módulo de investigación (ej. subir elementos para un Versus) en un asistente visual paso a paso en menos de 3 minutos, sin depender de soporte técnico.
3. **Inmersión Analítica:** Pantallas de detalle por campaña con gráficos interactivos y actualizados en tiempo real donde el usuario puede segmentar, filtrar temporalmente y exportar conclusiones.

---

## 3. Arquitectura de Pantallas Principales

### Pantalla 1: Hub de Señales (Feed del Participante - App/Web Mobile)
* **Header / Navegación:** Barra superior muy limpia. Contiene el imagotipo de Opina+, acceso rápido al perfil de usuario (avatar) e indicadores sutiles de estatus o gamificación.
* **Hero Interactive Section (Versus Destacado):** La sección superior domina la pantalla promoviendo el debate o interacción más relevante del momento. Diseñado visualmente como un bloque grande, impactante, con botones claros para tomar partido (A vs B).
* **Track Secundarios (Torneos / Módulos de Profundidad):** Carruseles o listas horizontales desplazables nativamente (swipe) para explorar interactuables secundarios, organizados por estética y temática.
* **Componente de "Actualidad Viviente" (Ticker):** Un elemento en la interfaz (como una delgada marquesina o tarjetas rotativas al fondo) que demuestra que la plataforma está "viva", mostrando resultados cambientes en tiempo real de forma pasiva.

### Pantalla 2: Interfaz Inmersiva de Resolución (Ej. Módulo Versus)
* Dominancia visual absoluta de la interacción. Si es un "Versus", la pantalla se divide claramente estableciendo la competencia.
* Las opciones (entidades a comparar) se presentan con imágenes de alta calidad o logotipos normalizados, centrados sobre fondos neutros adaptables para evitar direccionar la psique del usuario.
* UI enfocada 100% en el evento táctil (el tap decisivo).

### Pantalla 3: Panel de Análisis Avanzado (Analistas Desktop/Web)
* **Estructura Clásica de Consola B2B:** Un Sidebar a la izquierda para la navegación estructural (Resumen general, Campañas específicas, Informes Generados, Configuración de cuenta).
* **Área de Contenido Principal (Canvas de Datos):**
  * **Top Metrics:** Fila superior fija con "Tarjetas de Estado" que contienen los números absolutos más vitales (Volumen entrante, Tendencia).
  * **Core Visualization:** Centro visual dominado por el gráfico principal de la herramienta activa (ej. gráfico de líneas temporales de sentimiento, o barras comparativas para resultados de Torneos). Responde fluidamente a filtros aplicados en el momento.
  * **Modo Oscuro Obligatorio:** Para esta vista, el ambiente oscuro (esquemas de color azules y grises muy profundos) facilita la lectura prolongada de datos brillantes al reducir el impacto luminoso del blanco puro de las hojas de estilo estándar.
