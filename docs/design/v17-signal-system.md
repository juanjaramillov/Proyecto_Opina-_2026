# V17 · Signal Visual Language System

> Sistema visual canónico de Opina+ a partir de 2026-04-29.
> Construido sobre los tokens existentes (`tailwind.config.js` + `index.css`),
> NO los reemplaza ni los modifica.

---

## 1. Frase madre · qué es una señal Opina+

**Una señal Opina+ es una lectura colectiva opt-in con masa, dirección, contexto y vigencia.**

Esta frase es interna · brief de diseño. NO es publicidad ni copy de marketing.

El tagline público es independiente: *"Tu opinión es una señal."*

### Por qué esta frase y no otra

- **Lectura colectiva**: cubre todos los tipos de señal (versus, profundidad, noticias, pulso, torneos), no solo "preferencia binaria".
- **Opt-in**: lo que diferencia a Opina+ del social listening (Brandwatch, Sprinklr) es que la data es primaria y consentida, no scrapeada.
- **Masa, dirección, contexto, vigencia**: los 4 atributos que cualquier visualización de señal debe codificar para ser defendible.

---

## 2. Microelemento canónico · Nodo de Señal Validada

El sistema visual de V17 se ancla en **un solo microelemento repetido** que aparece en todas las pantallas donde haya datos colectivos: el **Nodo de Señal Validada**.

### Spec

| Atributo | Valor |
|---|---|
| Tamaño base (md) | 12 px de diámetro |
| Tamaños alternos | sm = 8 px · lg = 16 px |
| Color del nodo | `bg-brand` (#2563EB) |
| Halo | accent #10B981 · offset 4 px · stroke 1.5 px |
| Componente React | `<SignalNode state="..." size="..." />` (en `src/components/ui/foundation/`) |

### Estados

El Nodo tiene **3 estados** que codifican el ciclo de vida de una señal:

| Estado | Visual | Significado |
|---|---|---|
| `validated` | Nodo + halo | La señal cruzó el umbral (k mínimo) y es publicable. |
| `umbral` | Solo nodo (opacity 0.5) | Está alcanzando masa, todavía no validada. |
| `insufficient` | Nodo gris (slate-300, opacity 0.7) | Ruido sin masa suficiente. NO publicable. |

### Reglas de uso

**Usar el Nodo SI**:
- Representa un dato colectivo real (n personas opinaron).
- El estado refleja el ciclo de vida de la señal (k-anonimato, masa, validez).
- El usuario puede entender qué significa en menos de 3 segundos (ver `SignalNodeLegend`).

**NO usar el Nodo si**:
- Es decoración visual sin significado real.
- Aparece en lugares donde no hay señal colectiva (ej: páginas legales, formularios).
- Se usa para marcar elementos individuales (perfiles, items de menú).

### Densidad recomendada por pantalla

- **Hub principal (Señales)**: ~14-20 Nodos repartidos en hero + live strip + cards de módulo.
- **Pantallas de resultados**: 6-12 Nodos en KPIs principales.
- **Pantallas utilitarias** (auth, legales, 404): 0 Nodos.
- **Pantallas Admin/B2B operativas**: 0-6 Nodos, solo donde aporten significado real.

> **Regla anti-saturación**: si el contador supera 25 Nodos en una sola vista, está mal. Reducir.

---

## 3. Prohibiciones duras del sistema

Estos elementos están **explícitamente prohibidos** porque hacen que cualquier producto se vea "SaaS analytics genérico":

| Prohibido | Por qué |
|---|---|
| Trend pills tipo `+12% sem` / `+3 hoy` | Cliché de SaaS analytics. Los usa cualquier dashboard. |
| Emojis decorativos (⚡📊🔥) en KPIs | Ruido visual, no aporta semántica. |
| Live dots pulsantes (⚪ EN VIVO) | Cliché omnipresente en dashboards. |
| Barras de progreso horizontales como recurso principal | Tableau, Looker, todos. Demasiado genérico. |
| Scatter plots de puntos aleatorios | Estética de dashboard estándar. |
| Donut/ring charts como metáfora central | Mismo problema. |
| Estética crypto/blockchain (hexágonos en grilla, glow neón) | No es Opina+. |
| Gradientes brand→accent decorativos sin transformación | El gradiente representa cambio. Si no hay cambio real, no hay gradiente. |

### Regla del gradiente

El gradiente `from-brand to-accent` solo aparece cuando representa **transformación, activación o validación temporal**. Ejemplos válidos:

- Texto "ahora." en hero (marca el momento presente).
- CTA primario que dispara una acción transformadora.
- Estado de transición en un componente (de inactivo → activo).

Ejemplos NO válidos:
- Fondo decorativo de una card.
- Borde de un avatar.
- Color de un ícono que no representa cambio.

---

## 4. Anchors visuales de referencia

La V17 se diseña tomando inspiración de:

- **[Are.na](https://www.are.na)** — calidez editorial, espacios respirados, frialdad sin frialdad.
- **[The Pudding](https://pudding.cool)** — visualizaciones narrativas. Cada gráfico cuenta. No decorativo.
- **[Rauno Freiberg](https://rauno.me)** — micro-detalles sofisticados, contornos definidos.

NO somos Stripe Sigma, Linear, Datadog ni Brandwatch. Si una decisión visual nos lleva a parecernos a esos, revisar.

---

## 5. Cómo aplicar el sistema a una pantalla

Checklist operativo cuando se adapta una pantalla existente:

1. **Identificar dónde hay datos colectivos**. Solo ahí van los Nodos.
2. **Eliminar elementos prohibidos** (trend pills, emojis, live dots, barras decorativas).
3. **Aplicar copy editorial**: una idea por línea, lenguaje natural, sin frases tipo "✨ ¡Bienvenido!".
4. **Insertar `<SignalNodeLegend />` una vez por pantalla** la primera vez que aparece un Nodo.
5. **Verificar densidad**: contar Nodos finales · si supera 25, reducir.
6. **Validar en localhost**: correr `npm run dev` y revisar.

---

## 6. Estructura de archivos

```
src/
├── components/ui/foundation/
│   ├── SignalNode.tsx           ← microelemento canónico
│   ├── SignalNodeLegend.tsx     ← leyenda explicativa
│   └── index.ts                 ← exports
├── features/feed/components/hub/
│   └── LiveActivityStrip.tsx    ← strip de actividad en vivo (Hub)
docs/design/
└── v17-signal-system.md         ← este archivo
```

---

## 7. Estado del rollout V17

| Pantalla | Estado |
|---|---|
| **Foundation system (componentes + docs)** | ✅ Completo · 2026-04-29 |
| Señales (`/signals`) | Pendiente · Fase B siguiente |
| Resultados (`/results`) | Pendiente |
| Inteligencia (`/intelligence`) | Pendiente |
| Perfil (`/profile`) | Pendiente |
| Home (`/`) | Pendiente · última (la más estable) |

Las páginas Tier 2-4 (auth, legales, B2B, Admin) heredan el sistema vía PageShell + componentes. No requieren rediseño visual profundo, solo limpieza de elementos prohibidos.

---

## 8. Validación externa pendiente

> **Esta sección es importante.** El sistema fue construido con asistencia de IA (Claude + ChatGPT) y SIN validador humano externo con criterio editorial real.
>
> Antes de propagar el sistema a todas las pantallas (Fase B/C completa), se recomienda validación con al menos uno de:
>
> - Diseñador/director de arte humano externo.
> - Focus group de 5-7 usuarios reales del perfil objetivo.
> - Test contra competidores: ¿se distingue Opina+ de Brandwatch / Sprinklr / Mentimeter al verlos lado a lado?
>
> Sin esa validación, el sistema queda como **propuesta defendible pero no confirmada como firma de marca**.

---

## Referencias

- **Brief V17 fijado** · iteración cerrada el 2026-04-29 entre Claude + ChatGPT + Juan.
- **Lab Figma**: archivo `ZYVcwfVvaNkpzPbkML94z7` · página `09 · V17 · Signal Visual Language Lab`.
- **Backup pre-V17 de Señales en Figma**: frame `Señales · v16 · referencia (backup pre-V17)` en página 05.
- **Memoria del proyecto**: `project_opina_design_invariants`, `project_opina_color_policy`, `project_opina_gradient_direction`.
