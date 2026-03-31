# Opina+ | Documento Maestro Comercial, Estratégico y de Arquitectura

**Señales de personas. Inteligencia para decisiones.**
*Visión comercial, propuesta de valor, capacidad analítica y estado actual de construcción de Opina+.*

* **Versión:** V15 — Marzo 2026
* **Uso:** Documento interno de trabajo, validación estratégica y auditoría comercial.

> **Nota:** Los ejemplos de cifras, insights y lecturas incluidos en este documento son ilustrativos y buscan graficar el potencial analítico de la plataforma. La arquitectura descrita refleja el estado de producción real de la versión V15.

---

## Propósito del documento
Consolidar, en un solo texto, la tesis completa de Opina+ como producto, negocio y ecosistema de datos: qué problema resuelve, qué valor crea para usuarios y empresas, qué métricas produce, cómo valida la calidad de la señal y cuál es el estado real de su arquitectura, código y diseño en su versión V15 (Marzo 2026).

---

## Resumen Ejecutivo

Opina+ es una plataforma diseñada para transformar la participación digital interactiva en inteligencia accionable. Su unidad de valor central no es la respuesta aislada de una encuesta estática, sino la **Señal Atómica**: una huella estructurada de preferencia, comparación, tensión, contexto y evolución temporal.

Bajo esta lógica, la plataforma conecta un ecosistema **B2C premium, gamificado y de baja fricción** con una potente capa **B2B de inteligencia**. Esta dualidad resuelve un problema crítico en el mercado de la investigación: la fatiga de las encuestas tradicionales. Las empresas necesitan datos más rápidos, segmentables y continuos, pero los usuarios desprecian los formularios largos que no les devuelven valor.

Opina+ reemplaza la lógica extractivista por un intercambio de valor continuo. A través de módulos como **Versus (comparación directa), Tu Pulso (time-series personal) y Actualidad (reacción a coyuntura)**, logra interacciones rápidas y repetibles que proveen un retorno visible inmediato al usuario. 

Para las empresas, el resultado no es una fotografía descriptiva, sino una película longitudinal. Opina+ construye un activo de datos basado en Event-Sourcing inmutable, donde cada señal se cruza con "Snapshots" demográficos para revelar *Momentum*, cambios de lealtad, tensiones de mercado y proyecciones accionables con un rigor estadístico auditable (Time Decay, Intervalos de Wilson).

**Idea Fuerza:** Opina+ no busca preguntar una opinión más. Construye una infraestructura tecnológica de grado Fintech capaz de capturar cómo decide la gente, cómo cambia esa preferencia con el tiempo, y qué acciones concretas deben tomar las empresas a partir de ello.

---

## 1. ¿Qué es Opina+?

### 1.1 Definición y tesis del proyecto
Opina+ es una infraestructura de inteligencia de mercado basada en la captura continua de *Señales*. 
Su tesis central postula que una preferencia vale infinitamente más cuando se observa como un comportamiento comparativo, iterativo y contextualizado, que cuando se reduce a una respuesta cerrada. En la versión V15, esto se traduce en una separación arquitectónica estricta pero simbiótica: un Frontend B2C que maximiza la captura de señal mediante micro-interacciones (React/Framer Motion), y un Backend B2B que procesa esa data en *read models* para su explotación comercial (Supabase PostgreSQL).

### 1.2 El problema que viene a solucionar
El mercado de la opinión e investigación de mercado colapsó por fricción estructural.
- **Lado Usuario:** Existe un rechazo generalizado a llenar formularios largos, aburridos y visualmente anticuados que no devuelven información útil ("agujeros negros de datos"). Las tasas de respuesta han caído drásticamente en las últimas dos décadas.
- **Lado Empresa:** Obtener "señal fresca", segmentable y con volumen representativo es cada vez más caro y lento. Los instrumentos actuales (como encuestas de satisfacción o NPS aislado) entregan fotos estáticas que llegan tarde a la toma de decisión.

### 1.3 Qué cambia con Opina+
Opina+ cambia la **unidad de captura**. 
Pasamos de la "pregunta" a la **"Señal"**. El diseño UX/UI de V15 (Dark Mode, Thumb-zone friendly, micro-animaciones) está obsesivamente enfocado en reducir el tiempo cognitivo de respuesta a menos de 3 segundos por señal. 
Al almacenar cada señal con su metadata exacta (User Snapshot, marca de tiempo, módulo de origen), Opina+ permite a las marcas dejar de ver una métrica muerta para comenzar a visualizar trajectorias: qué atributo acelera, qué marca pierde momentum en tiempo real, y qué segmento demográfico lidera el cambio.

### 1.4 Qué no es y qué sí es

| Aclaración estratégica | Explicación |
| :--- | :--- |
| **No es solo una encuesta gamificada** | Aunque usa mecánicas como el *Versus* o progresivos, el fin no es el ocio. Es la recolección masiva de Señales Estructuradas para modelamiento predictivo comercial. |
| **No es solo social listening** | El social listening captura ruido, sarcasmo y volumen de usuarios anónimos. Opina+ captura *elección estructurada de usuarios perfilados y verificados*, eliminando el sesgo del ruido natural de red. |
| **No es un simple dashboard** | Es una arquitectura de *Event-Sourcing* completa. El dashboard B2B es solo el "visor" de un motor estadístico subyacente que calcula entropías, decadencia de tiempo y significancia. |
| **Sí es una plataforma B2C + B2B** | Construye el puente definitivo: UX Premium para retener a las audiencias masivas (B2C), y Business Intelligence vivo para las marcas (B2B). |

---

## 2. Valor comercial y agregado (B2C y B2B)

### 2.1 Valor para el usuario B2C (El "Hook")
Opina+ en V15 entiende que el primer producto es la atención del usuario. Si la experiencia no es gratificante, la base de datos muere. El intercambio de valor se basa en 4 pilares:
1. **Baja fricción:** Navegación bottom-sheet y gestos naturales (Tinder-like) que exigen mínimo esfuerzo.
2. **Resultado Visible (Gratificación):** "Qué opinan los demás". Mostrar pertenencia o disidencia inmediata frente a su cohorte demográfica.
3. **Descubrimiento:** Explorar *insights* de la comunidad (ej. "Los jóvenes prefieren A, pero tu comuna prefiere B").
4. **Progresión (Loyalty Panel):** Misiones y niveles (Bronce a Platino) que recompensan la recurrencia y la completitud del perfil, aumentando el "peso estadístico" de su voto gradualmente.

### 2.2 Valor B2B (Métricas Vivas para Marcas)
El verdadero modelo de negocios de Opina+ es comercializar la anticipación. La acumulación de señales permite a las empresas:
- **Anticipar:** Detectar el cambio de lealtad de marca antes de que impacte en el reporte trimestral de ventas (*Momentum* y *Preference Share*).
- **Corregir:** Modificar campañas si el *Win Rate* de una crisis de PR demuestra que la confianza está cayendo en tiempo real.
- **Priorizar:** Entender si en el segmento de 18-24 años, la "Tensión de decisión" entre dos marcas se define por *Precio* o por *Propósito Corporativo*.

### 2.3 Insights Comerciales Accionables (Ejemplos)

| Insight B2B | Lectura en el Dashboard Opina+ | Decisión Accionable |
| :--- | :--- | :--- |
| **Movilidad de preferencia** | "La marca A cayó 7 puntos en mujeres 25-34 años de la zona centro en los últimos 15 días, migrando directamente a la Marca C." | Intervención quirúrgica de pauta digital y promociones en ese micro-segmento. |
| **Cambio de Driver Dominante** | "Hace un mes, la categoría Telecomunicaciones se decidía por 'Precio'. Hoy, el driver 'Estabilidad' tiene 2x más peso relativo." | Cambio inmediato de mensaje comunicacional en canales masivos. |
| **Brecha Notoriedad vs. Decisión** | "La campaña elevó las interacciones sociales (ruido), pero el Win Rate efectivo de Marca X vs Marca Y se mantuvo plano." | La atención creció, pero no alteró la preferencia. Toca pivotar la promesa de valor, no solo la publicidad. |

---

## 3. Modelos Matemáticos, Estadísticos y KPIs (El Motor de Inteligencia)

La arquitectura técnica de V15 está diseñada para soportar rigor matemático de primer nivel, evitando la lectura superficial de datos.

### 3.1 KPIs Base de Calidad (Sistema)
* **Volumen, Frecuencia y Recurrencia:** Base fundamental para certificar la salud de la muestra.
* **Effective Sample Size:** Ajuste matemático en SQL para evitar sobreleer un segmento hiperactivo frente a su peso demográfico real.
* **Session Integrity & Anti-Fraud:** Algoritmos que hunden el peso estadístico de votos emitidos a velocidades no humanas (< 500ms).

### 3.2 KPIs de Estructura de Mercado
* **Preference Share:** Participación agregada de mercado.
* **Win Rate y Distancia 1 vs 2:** Porcentaje de victorias en enfrentamientos directos y la solidez del liderazgo.
* **Entropía de la Categoría:** Nivel de fragmentación o concentración del mercado. Alta entropía = Mercado abierto a disrupción.

### 3.3 Modelos Matemáticos Avanzados en el Backend
En la capa de Supabase PostgreSQL, la data cruda se procesa usando:
* **Time-Decay (Decaimiento Exponencial):** Las victorias de ayer valen matemáticamente más que las de hace 6 meses. Mide inercia vs tracción actual.
* **Intervalos de Confianza de Wilson:** Previene el riesgo de mostrar certezas sobre muestras pequeñas (ej. no declarar un ganador rotundo si solo votaron 15 personas).
* **Calidad de Señal por Perfil:** El voto de un usuario Nivel Oro (con identidad validada y 6 meses de historial) pondera estadísticamente distinto a un usuario anónimo de primer día.

---

## 4. Arquitectura y Estado de Construcción Actual (V15)

El salto hacia la V15 consolida a Opina+ como un producto "enterprise-ready". Se abandonan los prototipos para asentar un *stack* de producción moderno, modular y altamente auditable.

### 4.1 Stack Tecnológico y Diseño
* **Frontend B2C/B2B:** React 18, Vite, TypeScript. Tipado estricto extremo para garantizar calidad del código.
* **Estilizado y UX:** Tailwind CSS combinado con Framer Motion. Diseño Premium "Dark Mode", eliminación de grises sucios, sombras con tinte y componentes flotantes. Optimizado 100% para uso móvil a una mano.
* **Backend y Base de Datos:** Supabase (PostgreSQL), Edge Functions, Row Level Security (RLS) y Webhooks (integración WhatsApp API).

### 4.2 Arquitectura "Event-Sourcing" Estricta
Opina+ no guarda "el puntaje actual" de una marca de manera cruda. Guarda el **registro histórico inmutable de eventos** (Señales). 
* Todo *Versus* o voto en *El Pulso* se emite como un `signal_event`.
* Se genera un **User Snapshot** inmutable en el momento del evento. Si un usuario tiene 19 años hoy y vota por Adidas, y en tres años cambia a Nike, la plataforma respeta matemáticamente su opinión de los 19 años de manera cronológica sin corromper el pasado.
* Los Paneles B2B leen de *Read Models* (Vistas Materializadas) construidas sobre esta cadena de eventos.

### 4.3 Módulos Productivos Básicos en V15

| Módulo Core | Estado y Funcionalidad |
| :--- | :--- |
| **Señales Hub (Home)** | Dashboard personal bottom-sheet. Punto central con micro-retornos de información y notificaciones de misiones. |
| **Versus Serial** | Componente técnico más complejo. Flujo de tarjetas deslizables con aceleración por animaciones (Framer). Permite votación infinita jerarquizada por industrias. |
| **El Pulso (Time-series)** | Módulo para trackear indicadores anímicos, financieros o sociales del usuario de forma longitudinal y personal. |
| **Actualidad (Reacción)** | Flujo dinámico tipo *Stories* corporativas. Transforma lectura de noticias rápidas en posicionamiento (A favor / En contra / Tensión). |
| **Loyalty & Profiling** | Panel donde conviven misiones, avatares, rangos de confianza y completitud gamificada (Progress rings). |
| **Panel de Resultados B2C** | Feed de lectura de mercado. Curaduría que le demuestra al usuario que su voz sí construye grandes bloques de datos. |

### 4.4 Defensibilidad y El "Moat"
La barrera de entrada final de Opina+ V15 no es el código de React. Su *moat* es el **Activo Longitudinal Inmutable**. 
Cualquier competidor corporativo podría copiar la interfaz en 6 meses con buen presupuesto. Pero ningún competidor puede retroceder el tiempo para recolectar el historial de millones de señales validadas, con *User Snapshots*, que demuestran la evolución precisa del mercado desde el minuto cero. La data es el oxígeno; el *Event-Sourcing* asegura que nunca se pierda un aliento de información histórica.

---

## 5. Riesgos y Cierre Estratégico

El éxito definitivo de la V15 hasta su lanzamiento masivo descansa ahora en tres ejes:
1. **Recurrencia:** Validar métricas de retención sobre los flujos de *Versus* y *Pulso*. Sin regreso recurrente, el modelo se estanca en fotos, perdiendo su ventaja narrativa y temporal.
2. **Volumen vs. Calidad:** Calibración final de los scripts de Supabase para los modelos *Time-Decay* y filtros Antifraude, asegurando que el Dashboard B2B siempre consuma información "limpia".
3. **Consolidación de Identidad:** Mantener el estándar visual premium y la gobernanza de componentes corporativos para no distorsionar la credibilidad B2B.

**Conclusión V15:**
Opina+ ya no es solo conceptual; es una infraestructura viva. Es una plataforma B2C adictiva y premiada por el diseño, conectada intrínsecamente a un poderoso radar estadístico empresarial. Ya no pedimos respuestas al mercado; medimos las señales del comportamiento humano.
