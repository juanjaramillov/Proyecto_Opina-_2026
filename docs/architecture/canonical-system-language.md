# Lenguaje Canónico del Sistema (Opina+)

Este documento establece el glosario técnico oficial y la nomenclatura canónica para el desarrollo en Opina+. Su objetivo es mantener una estricta coherencia semántica entre bases de datos, APIs, variables en memoria, nombres de componentes y documentación, sin perder la fidelidad con la lógica real del producto y respetando los matices funcionales.

**Todo código nuevo, refactorización o diseño debe apegarse estrictamente a estos términos.**

---

## 1. Gamificación y Evaluación: Unidades de Interacción

| Término | Sinónimos Legacy / Ambiguos | Estado | Regla de Uso y Dominio |
| :--- | :--- | :--- | :--- |
| **`Signal` (Señal)** | `Vote`, `Voto` | **Canonical** | **(Dominio de Negocio / UX)**: Instancia o acto mediante el cual el usuario emite una opinión o preferencia atómica. "Vote/Voto" están **Deprecated/Prohibidos** para evitar sesgos con elecciones formales. |
| **`Response` (Respuesta)** | - | **Canonical** | **(Dominio de Interacción Estructurada)**: Representa la contestación concreta a un input, formulario o pregunta encadenada dentro de módulos más complejos (ej. encuestas de profundidad, feedback abierto). |
| **`Event` / `SignalEvent`** | - | **Canonical** | **(Dominio Técnico / Persistencia)**: Registro auditable, almacenado e inmutable generado a partir de una interacción (ej. `signal_events` en la base de datos). Representa la materialización de una Signal para trazabilidad y analítica. |
| **`Battle` (Batalla)** | `Matchup` | **Canonical** | Unidad mínima funcional y técnica de comparación (generalmente 1 vs 1). Es el contenedor base inalterable donde ocurre una disputa resuelta por una `Signal`. |

---

## 2. Modelos de Navegación y Mecánicas de Juego

Esta sección detalla las modalidades de interacción, que deben ser diferenciadas estrictamente según su dinámica.

| Término | Sinónimos Legacy / Ambiguos | Estado | Regla de Uso y Diferencia Funcional |
| :--- | :--- | :--- | :--- |
| **`Versus`** | - | **Canonical** | La experiencia base del módulo de comparación directa. Representa el flujo genérico donde el usuario procesa una serie de `Battles` empaquetadas o inconexas sin racha. |
| **`Progressive`** | `Torneo` (en variables), `Progresivo` | **Canonical** | Dinámica interactiva gobernada por la regla *"ganador sigue compitiendo"*. Una racha (streak) donde el ganador de un duele se enfrenta a otro aleatorio de un pool. Gobernada por el flag `is_active_progressive` y centralizada en `ProgressiveRunner`. |
| **`Tournament`** | `Torneo` | **Canonical** | Exclusivamente para estructuras de **rondas estáticas o árboles cerrados (bracket)** eliminatorios. Gobernada por un flag latente `is_active_tournament`. *Nunca unificar o usar como sinónimo de Progressive*. |
| **`Module`** | `Feature`, `Game` | **Canonical** | Cada bloque interactivo orquestado por url genérica (`/m/:slug` como `m/versus` o `m/torneo`). |

---

## 3. Jerarquía y Sujetos de Evaluación

Reglas sobre el "qué" evalúan los usuarios.

| Término | Sinónimos Legacy / Ambiguos | Estado | Regla de Uso |
| :--- | :--- | :--- | :--- |
| **`Entity` (Entidad)** | `Brand`, `Subject` | **Canonical** | Elemento individual e instanciado que entra en competencia (ej: Una marca específica como Coca-Cola o Latam Airlines). "Brand" es legacy porque una Entidad podría no ser una marca comercial. |
| **`Category`** | - | **Canonical** | Agrupación estructural mayor o "paraguas" transversal del ecosistema B2C (ej. Movilidad, Finanzas). |
| **`Subcategory`** | - | **Canonical** | Agrupación operativa granular cerrada donde ocurren las `Battles` justas (ej. Aerolíneas Low Cost). |
| **`Context`** | `Topic` | **Canonical** | Ámbito o temática a evaluar cuando la señal no recae en una `Entity` física o marca, sino sobre decisiones temporales (ej. Actualidad política, pulso diario). "Topic" se marca como legacy/deprecation lenta. |

---

## 4. Gobernanza B2B, Visibilidad y Analytics

Términos del ecosistema de lectura, analítica y gestión de clientes.

| Término | Sinónimos Legacy / Ambiguos | Estado | Regla de Uso |
| :--- | :--- | :--- | :--- |
| **`b2b`** | - | **Canonical** | **Namespace técnico e interno** exclusivo utilizado para nombrar layouts, componentes de react (`/b2b/overview`), variables y estructura del portal de acceso administrativo. |
| **`Intelligence`** | - | **Canonical** | **Nombre público y comercial** del producto B2B. Define la propuesta de valor hacia afuera ("Dashboard de Inteligencia"). Nunca usar en minúsculas para nombrar carpetas de componentes técnicos puros (`/intelligence` -> ❌; `/b2b` -> ✅). |
| **`Publication State`** | `Launch Mode`, `Mock Mode` | **Canonical** | Mecanismo único centralizado que gobierna si un panel analítico lee resultados en borrador o definitivos. La única fuente de verdad es la tabla `results_publication_state` desempateada cronológicamente por `publication_seq`. Todo lo referente a "Mock System" o "Launch Flags" manuales está **Deprecated** y prohibido en todo entorno B2C. |

---

## 5. Arquitectura de Flags de Tipos (Progressive vs Tournament)

Ambos flags y roles tienen entidad propia en las capas de configuración, pero con destinos distintos en este momento:

- **`is_active_progressive`**: Flag **CANONICAL** que vive como propiedad en el contrato de dominio TypeScript (`BattleOption`) y gobierna qué entidades o rutas pueden ser cargadas dentro de la mecánica de "racha" (Supervivencia). Es completamente operativo hoy.
- **`is_active_tournament`**: Flag **RESERVADO** a futuro. Conserva su definición semántica y de tipo de dominio, pero quedó latente estructuralmente hasta que el backend requiera configurar ramas eliminatorias complejas o se active una vista de árbol para Insights B2B. Sus usos en componentes dinámicos de V15 han sido purgados a favor de Progressive.
