# UI Foundation Governance

Este documento establece las reglas y principios de uso para los componentes estructurales de la **UI Foundation**, introducida en la Fase 2 del proyecto Opina+ V14.

## Propósito
Evitar la proliferación de wrappers, métricas, botones y 'empty states' artesanales a lo largo de los distintos módulos (Home, Results, Signals). La **UI Foundation** es la única capa autorizada para definir estas estructuras visuales primarias.

## Primitivos Oficiales (`src/components/ui/foundation/`)

### 1. `SectionShell`
**Uso:** Contenedor oficial para envolver secciones completas o "Widgets" grandes de datos (ej. *Muro de Percepciones*, *Pulso Ejecutivo*). 
**Reglas:**
- Nunca usar `div` flotantes con sombras artesanales para Layouts de dashboard.
- Utiliza la prop `actionContent` para inyectar controles de sección (botones "Ver más", flechas de carrusel).

### 2. `StatTile`
**Uso:** Tarjeta oficial para mostrar métricas clave, KPIs o contadores numéricos grandes.
**Reglas:**
- Todo número o métrica aislada debe usar `StatTile`.
- Soporta renderizado de proyecciones o tendencias (`trend` prop) y un ícono superior opcional.

### 3. `EmptyState`
**Uso:** Pantalla estandarizada para cuando no hay datos (ej. un usuario sin señales, un torneo sin participantes).
**Reglas:**
- Prohibido crear pantallas grises con texto manual.
- Renderizar siempre a través de este componente proporcionando `title`, `description` e `icon`. Puede recibir llamadas a la acción (`primaryAction`).

### 4. `FilterPill`
**Uso:** Botones de filtro de estado, categorías o selecciones rápidas.
**Reglas:**
- Es responsivo: dispone de variantes (`primary`, `secondary`, `soft`) y tamaños (`sm`, `md`, `lg`).
- Todo selector visual tipo "pestaña de burbuja" (ej. Modos de vista en Results, Tópicos en Hub) debe usar `FilterPill`.

## Flujo de Trabajo
Si necesitas un componente estructural nuevo, primero evalúa si puedes componerlo con los primitivos existentes de `foundation`. Si el caso de uso es verdaderamente ajeno, propón su inclusión formal en este directorio antes de acoplarlo directamente al `feature`.
