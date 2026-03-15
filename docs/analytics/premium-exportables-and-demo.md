# Premium Exportables y Demo Comercial (B2B)

El **Bloque 7** estandariza la forma en que los clientes y prospectos visualizan y consumen los insights matemáticos de Opina+. El enfoque fue desarrollar una experiencia de "One-Pager" digital sin necesidad de librerías PDF pesadas.

## 1. El Motor de Narrativa Automática (`b2bNarrativeEngine.ts`)
El valor principal de la capa B2B radica en la **traducción matemática al lenguaje comercial (Business Speech)**. El motor toma el payload en crudo y lo transforma en un *Executive Summary* bajo estas reglas estrictas:

- **Empates Técnicos:** Nunca permite alucinar "ganadores estadísticos" si las bandas de Wilson se cruzan. La palabra clave inyectada es *"Escenario Altamente Competitivo"*.
- **Integridad Penalizada:** Alertará visualmente y textualmente si hay banderas rojas (`flag_device_concentration`, `flag_velocity_burst`), advirtiendo que la muestra está bajo estrés o fue manipulada.
- **Fragmentación (Entropía):** Si la desviación entrópica de la opinión es fuerte, el reporte dicta *"Alta Fragmentación"*, útil para mostrarle a un cliente político o corporativo que el mercado no ha tomado una postura.

## 2. Componente de Exportabilidad (`PremiumExportCard.tsx`) 
El componente base del que bebe la vista demo comercial.
Su arquitectura es *Print-Aware*, lo que permite a los usuarios **imprimir el PDF directamente desde los controles nativos del navegador** (CMD/CTRL + P). 

**Características @media print:**
- Elementos técnicos de fondo ocultos automáticamente (`print:hidden`).
- Sobrajez de sombras desactivada visualmente para impresión plana.
- Fecha/Timestamp explícito impreso, sin renders de navegaciones secundarias.

**Payload JSON:**
A nivel sistémico, este componente ofrece integración nativa exportando la ficha de análisis B2B directo al portapapeles del navegador (como RAW JSON) con un click, abriendo la puerta a sistemas de BI del cliente (PowerBI, Tableau) mediante endpoints estándar.

## 3. Modo Presentación (Demo Mode Toggle)
Es imposible vender un análisis si el Admin asusta visulamente al directivo. Por esto, `DepthInsightsDrawer` ahora cuenta con un botón **"Demo Activo / Panel Técnico"**.
- Al seleccionar la demo, la IA de Opina+, sus gráficas experimentales y herramientas de manipulación (Admin UI) desaparecen en favor exclusivo de la `PremiumExportCard`.
- Garantiza limpieza total para presentar un Insight de Opina+ a cámara compartida por Zoom/Meet.
