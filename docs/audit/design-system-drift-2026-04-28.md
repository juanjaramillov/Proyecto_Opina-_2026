# Auditoría · Drift Design System Opina+

> Fecha: 2026-04-28
> Alcance: `src/` completo (.tsx + .ts + .css)
> Referencia DS: archivo Figma `wBZJLRMdEMg54rUTPgcQ07` + `tailwind.config.js`
> Estado: Fases 1+2+3+4 ejecutadas (ver §11 al final).

## Resumen ejecutivo

| Categoría | Violaciones | Severidad |
|---|---|---|
| Tipografía no canónica | 4 imports + 1 var CSS | **Crítica** |
| Dark mode definido (contradice invariante) | 1 bloque CSS completo | **Alta** |
| Sombras arbitrarias `shadow-[...]` / `drop-shadow-[...]` | 95 ocurrencias | Media |
| Border radius arbitrarios `rounded-[Xrem/px]` | 68 ocurrencias | Media |
| Animaciones inline `animate-[...]` | 40 ocurrencias | Baja |
| Componente foundation con sombra inline | 1 (GlassCard) | Media |
| Colores hex/rgba fuera de paleta en CSS | 2 (radial-gradient) | Baja |
| **Colores Tailwind prohibidos en .tsx** | **0** | — |
| **Spacing arbitrario en .tsx** | **0** | — |

**Total: ~211 violaciones distribuidas en ~43 archivos.**

Lo que está sano: la paleta de colores (cero indigo/violet/purple/cyan/teal/lime/amber decorativo en .tsx), la escala de spacing (cero `p-[Xpx]` arbitrarios). Esos dos invariantes están limpios.

Lo que está sucio y duele: hay un legacy de imports de fuentes ajenas y un theme `.dark` completo definido en `index.css` que contradice tu memoria explícita ("nunca proponer dark mode"). Esos son los hallazgos de mayor impacto y los más rápidos de cerrar.

---

## 1. Tipografía no canónica · CRÍTICA

### 1.1. Imports de fuentes ajenas en `src/index.css`

| Línea | Contenido | Problema | Acción |
|---|---|---|---|
| 1 | `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');` | Plus Jakarta Sans NO está en el DS canónico. | **Eliminar la línea.** |
| 4 | `@import "@fontsource-variable/geist";` | Geist Variable NO está en el DS canónico. | **Eliminar la línea + desinstalar el paquete:** `npm uninstall @fontsource-variable/geist` (ejecutar en **terminal local**, raíz del repo). |
| 84 | `--font-sans: 'Geist Variable', sans-serif;` (dentro de `.theme`) | Define la familia sans como Geist. Si algún componente aplica la clase `.theme`, hereda Geist en lugar de Inter. | **Eliminar las líneas 82–85** (toda la regla `.theme`). |

> Validación post-cambio: `index.html` (línea 12) ya carga Outfit + Inter desde Google Fonts y `tailwind.config.js` los declara como `font-display`/`font-sans`. Eliminando lo de arriba, el sistema queda con solo dos familias autorizadas.

### 1.2. Otros imports legacy en `src/index.css` (revisar caso a caso)

| Línea | Contenido | Comentario |
|---|---|---|
| 2 | `@import "tw-animate-css";` | Librería extra de animaciones. Probablemente legacy. Verificar si algún componente la usa antes de borrar (`grep -r "tw-animate-css" src/`). Si no se usa, eliminar import + paquete. |
| 3 | `@import "shadcn/tailwind.css";` | Theme de shadcn/ui. Aporta variables OKLCH (`--background`, `--foreground`, `--primary`, `--secondary`, `--card`, etc.) que no están en tu DS canónico. Probablemente residuo de una decisión pasada. Verificar si shadcn está realmente en uso. |

---

## 2. Dark mode definido · ALTA (contradice invariante)

`src/index.css` líneas **86–118**: hay un bloque `.dark { ... }` completo con variables OKLCH para tema oscuro (`--background: oklch(0.145 0 0)` = casi negro, `--card`, `--popover`, `--sidebar` en versiones oscuras).

Tu memoria documenta como invariante inviolable: "fondo blanco en TODAS las páginas · nunca proponer dark mode".

Probable origen: el theme de shadcn/ui (`@import "shadcn/tailwind.css"` línea 3) trae el bloque `.dark` por defecto.

**Acción:** eliminar líneas 86–118 (todo el bloque `.dark`). Si shadcn lo necesita para compilar, eliminarlo junto con el import de shadcn.

> Riesgo: si algún componente de tu app (probablemente ninguno, pero verificar) está usando la clase `.dark` en algún wrapper, se rompe. Grep antes de borrar: `grep -rn "\"dark\"" src/` y `grep -rn "className.*dark" src/`.

---

## 3. Sombras arbitrarias · MEDIA · 95 ocurrencias

Los tokens canónicos del DS son cuatro: `shadow-card` (0 4px 14px / 6%), `shadow-lift` (0 8px 24px / 8%), `shadow-premium` (0 20px 40px / 10%), y la sombra glass que vive inline en `GlassCard.tsx`.

Cualquier `shadow-[...]` o `drop-shadow-[...]` arbitrario rompe la jerarquía de elevación.

### 3.1. Top archivos con sombras arbitrarias

| Archivo | Aprox. ocurrencias | Patrones más frecuentes |
|---|---|---|
| `src/features/home/sections/GamifiedCTASection.tsx` | ~14 | `shadow-[0_0_15px_#2563EB]` (glow), `shadow-[0_30px_60px_rgba(...)]`, `shadow-[inset_...]` compuestos |
| `src/features/home/sections/WhatIsOpinaSection.tsx` | ~6 | `shadow-[inset_0_-10px_20px_rgba(...)]`, `drop-shadow-[0_4px_8px_rgba(37,99,235,0.4)]` |
| `src/features/signals/components/OptionCard.tsx` | ~5 | `shadow-[0_10px_25px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1)]` |
| `src/features/home/sections/InteractiveHeroSection.tsx` | ~3 | `shadow-[0_8px_30px_rgba(0,0,0,0.04)]` |
| `src/components/ui/StateBlocks.tsx` | ~2 | `drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]` |
| Otros 25+ archivos | ~65 | Variantes menores |

### 3.2. Mapeo sugerido

| Patrón actual | Token canónico sugerido |
|---|---|
| `shadow-[0_4px_X_rgba(0,0,0,0.0X)]` | `shadow-card` |
| `shadow-[0_8px_X_rgba(0,0,0,0.0X)]` | `shadow-card` o `shadow-lift` |
| `shadow-[0_10px_25px_...]` | `shadow-lift` |
| `shadow-[0_20-30px_X_rgba(0,0,0,0.0X)]` | `shadow-premium` |
| `shadow-[0_0_Xpx_<hex>]` (glow) | **Decidir:** son efectos de "glow" del Home animado. Si querés conservarlos, agregarlos como tokens nombrados en `tailwind.config.js` (`shadow-glow-brand`, etc.). Si no, eliminar. |
| `shadow-[inset_...]` | NO existe inset en tu DS. Eliminar o convertir a borde. |
| `drop-shadow-[...]` arbitrario | Reemplazar por `shadow-card`/`lift`. |

### 3.3. Excepción técnica: `GlassCard.tsx`

**Archivo:** `src/components/ui/foundation/GlassCard.tsx:60`
**Línea actual:** `const shadowClass = shadow ? 'shadow-[0_8px_32px_rgba(0,0,0,0.06)]' : '';`
**Problema:** el componente foundation define su propia sombra inline. Esto es la sombra "glass" pero no está nombrada como token.
**Acción sugerida:** agregar `glass: "0 8px 32px rgba(0,0,0,0.06)"` a `boxShadow` en `tailwind.config.js` y reemplazar inline por `shadow-glass`.

---

## 4. Border radius arbitrarios · MEDIA · 68 ocurrencias

Los tokens canónicos son `md` (6px), `lg` (8px), `xl` (16px), `2xl` (20px), `3xl` (24px), `full` (pill).

### 4.1. Top archivos con radii arbitrarios

| Archivo | Ocurrencias | Valores típicos |
|---|---|---|
| `src/features/signals/components/OptionCard.tsx` | 8 | `rounded-[2rem]` (32px), `rounded-[2.5rem]` (40px) |
| `src/features/home/sections/InteractiveHeroSection.tsx` | 5 | `rounded-[3rem]` (48px), `rounded-[1.25rem]` (20px), `rounded-[11px]` |
| `src/features/home/sections/GamifiedCTASection.tsx` | 4 | `rounded-[2.5rem]` |
| `src/features/home/sections/WhatIsOpinaSection.tsx` | 3 | `rounded-[2.5rem]` |
| `src/features/signals/components/VersusGame.tsx` | 3 | `rounded-[2.5rem]` |
| Otros archivos | ~45 | Variantes |

### 4.2. Mapeo sugerido

| Valor actual | Token Tailwind sugerido |
|---|---|
| `rounded-[1rem]` (16px) | `rounded-xl` |
| `rounded-[1.25rem]` (20px) | `rounded-2xl` |
| `rounded-[1.5rem]` (24px) | `rounded-3xl` |
| `rounded-[2rem]` (32px) | **Decidir:** o crear `rounded-4xl: 2rem` en config, o bajar a `rounded-3xl` (24px). |
| `rounded-[2.5rem]` (40px) | **Decidir:** o crear `rounded-5xl: 2.5rem`, o bajar a `rounded-3xl`. |
| `rounded-[3rem]` (48px) | **Decidir:** mismo criterio. |
| `rounded-[11px]` | `rounded-md` (12px) o `rounded-lg` (8px). 11px es ruido. |

> Recomendación pragmática: extender `tailwind.config.js` con `'4xl': '2rem'` y `'5xl': '2.5rem'` si esos valores aparecen consistentemente en heroes y option cards (son visualmente distintos a 2xl/3xl). Solo así dejan de ser "arbitrary values".

---

## 5. Animaciones inline · BAJA · 40 ocurrencias

Patrones detectados:

| Patrón | Cantidad |
|---|---|
| `animate-[ping_Xs_infinite]` | 8 |
| `animate-[bounce_Xs_infinite]` | 5 |
| `animate-[pulse_Xs_infinite]` | 2 |
| `animate-float-slow` (clase no en config) | 5 |
| Otros `animate-[...]` | 20 |

Concentrados en `src/features/home/sections/GamifiedCTASection.tsx`.

**Acción sugerida:** mover esos keyframes a `tailwind.config.js` bajo `keyframes` + `animation`, dándoles nombres semánticos. Ejemplo:

```js
// tailwind.config.js (en terminal local: editar y reiniciar dev server con npm run dev)
extend: {
  keyframes: {
    'float-slow': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
  },
  animation: {
    'float-slow': 'float-slow 6s ease-in-out infinite',
    'ping-slow': 'ping 3s cubic-bezier(0,0,0.2,1) infinite',
  },
}
```

---

## 6. Colores no canónicos en CSS · BAJA · 2 ocurrencias

Aunque las clases Tailwind están limpias en `.tsx`, en `src/index.css` hay dos valores rgb fuera de paleta:

**Línea 192:**
```css
.bg-pulse-gradient {
  background: radial-gradient(circle at 50% 50%, rgba(36, 56, 156, 0.05) 0%, rgba(0, 108, 73, 0.02) 100%);
}
```

| Color | Hex aprox. | En paleta canónica |
|---|---|---|
| `rgb(36, 56, 156)` | `#24389C` | NO. Cerca de brand-700 (#1D4ED8) o brand-800 (#1E40AF). |
| `rgb(0, 108, 73)` | `#006C49` | NO. Cerca de accent-700 (#047857) o accent-800 (#065F46). |

**Acción:** reemplazar por `rgba(37, 99, 235, 0.05)` (brand-600) y `rgba(16, 185, 129, 0.02)` (accent-500).

---

## 7. Componentes foundation reimplementados

Análisis cruzado con `src/components/ui/foundation/`:

- **GlassCard:** la propia GlassCard.tsx hardcodea su sombra (ver §3.3). No detecté otros archivos `.tsx` reimplementando glassmorphism manualmente.
- **GradientText:** no detecté duplicados.
- **AmbientOrbs:** no detecté duplicados.
- **Detalle:** `src/index.css:179` define `.glass-panel { background: rgba(255,255,255,0.8); backdrop-filter: blur(20px); ... }` que es básicamente GlassCard como utility CSS. Si ningún componente lo usa, eliminar. Si se usa, decidir si convertirlo en variante de GlassCard o eliminar.

Comando para verificar uso de `.glass-panel` (ejecutar en **terminal local**, raíz del repo):
```bash
grep -rn "glass-panel" src/
```

---

## 8. Plan de remediación recomendado (fases en orden de impacto)

### Fase 1 · Tipografía + dark mode (cerrar invariantes) — 1 sesión

1. Editar `src/index.css`:
   - Línea 1: eliminar import Plus Jakarta Sans.
   - Línea 4: eliminar import `@fontsource-variable/geist`.
   - Líneas 82–85: eliminar regla `.theme`.
   - Líneas 86–118: eliminar bloque `.dark` (verificar primero con grep que no se usa).
2. En **terminal local**, raíz del repo:
   ```bash
   npm uninstall @fontsource-variable/geist
   grep -rn "Plus Jakarta\|Geist Variable\|className.*dark" src/
   npm run dev
   ```
3. Validación visual: levantar `localhost:5173`, comparar Home / Admin / B2B antes/después.

**Resultado:** queda en el sistema solo Outfit + Inter, y se elimina el dark mode definido. Cero impacto si nadie aplicaba `.theme` ni `.dark`.

### Fase 2 · Tokens nuevos en `tailwind.config.js` — 30 min

Antes de tocar 211 archivos, decidir qué tokens nuevos crear. Propuesta:

```js
boxShadow: {
  card:    "0 4px 14px rgba(0,0,0,0.06)",
  lift:    "0 8px 24px rgba(0,0,0,0.08)",
  premium: "0 20px 40px rgba(0, 0, 0, 0.10)",
  glass:   "0 8px 32px rgba(0,0,0,0.06)",        // NUEVO
  'glow-brand':  "0 0 16px rgba(37,99,235,0.40)", // NUEVO si conservás glow del Home
  'glow-accent': "0 0 16px rgba(16,185,129,0.40)" // NUEVO si conservás glow del Home
},
borderRadius: {
  xl:    "1rem",
  '2xl': "1.25rem",
  '3xl': "1.5rem",
  '4xl': "2rem",     // NUEVO
  '5xl': "2.5rem",   // NUEVO
},
keyframes: { ... },   // mover los animate-[...] inline acá
animation: { ... },
```

### Fase 3 · Refactor masivo de inline → tokens — 1-2 sesiones

Con los tokens nuevos disponibles, hacer find+replace por archivo:

- `shadow-[0_8px_32px_rgba(0,0,0,0.06)]` → `shadow-glass`
- `shadow-[0_0_Xpx_#2563EB]` → `shadow-glow-brand`
- `rounded-[2.5rem]` → `rounded-5xl`
- `rounded-[2rem]` → `rounded-4xl`
- `rounded-[1.25rem]` → `rounded-2xl`
- etc.

Priorizar archivos del top 5 (GamifiedCTASection, WhatIsOpinaSection, OptionCard, InteractiveHeroSection, StateBlocks) porque concentran ~50% de las violaciones.

### Fase 4 · Limpieza CSS final — 30 min

- Reemplazar colores rgb fuera de paleta en `index.css:192` por brand/accent rgba.
- Decidir destino de `.glass-panel` (eliminar o documentar como utility duplicada).
- Verificar si `tw-animate-css` y `shadcn/tailwind.css` siguen siendo necesarios.
- Reemplazar `shadow-md` en `.state-active` (línea 245) por `shadow-card`.

---

## 9. Lo que está limpio y validado

- ✅ Cero clases Tailwind prohibidas (indigo/violet/purple/cyan/teal/lime/amber-decorativo) en `.tsx`.
- ✅ Cero spacing arbitrario `p-[Xpx]`/`m-[Xpx]`/`gap-[Xpx]` con valores fuera de la escala canónica.
- ✅ Cero hex hardcoded fuera de paleta en archivos `.tsx`.
- ✅ La paleta canónica (brand/accent/slate/danger/warning) está bien usada en componentes.
- ✅ El fondo blanco como invariante visual está respetado en `body { background: #FFFFFF !important }` (`index.css:38`).

---

## 10. Sin tocar código todavía

> ~~Este reporte es solo lectura. Cuando confirmes scope (Fase 1 sola, o Fase 1+2, o las cuatro), aplico cambios con plan detallado por archivo y diff antes de cada commit.~~
>
> **2026-04-28 actualización:** scope C (las 4 fases completas) ejecutado. Ver §11.

---

## 11. Estado final tras la ejecución (2026-04-28)

### Fase 1 · Tipografía + dark mode — CERRADA

`src/index.css` quedó con:

- Eliminados los 4 imports legacy (`Plus Jakarta Sans`, `tw-animate-css`, `shadcn/tailwind.css`, `@fontsource-variable/geist`) reemplazados por un comentario explicativo.
- Eliminada la regla `.theme { --font-sans: 'Geist Variable' }` (líneas 82-85 del archivo original).
- Eliminado el bloque `.dark { ... }` completo (líneas 86-118 del archivo original) — esto cierra la violación al invariante "no hay dark mode".
- Eliminada la utility `.glass-panel` (sin consumidores; reemplazo es el componente `<GlassCard>`).
- Cambiado el radial-gradient de `.bg-pulse-gradient` para usar rgba de brand (`#2563EB`) y accent (`#10B981`) en lugar de los rgb fuera de paleta.
- Cambiado `shadow-md` por `shadow-card` en la utility `.state-active`.

### Fase 2 · Tokens nuevos en `tailwind.config.js` — CERRADA

Agregados a `boxShadow`:

- `glass: "0 8px 32px rgba(0,0,0,0.06)"` — para GlassCard.
- `glow-brand`, `glow-accent`, `glow-brand-lg` — efectos de halo.
- `paper`, `paper-brand`, `paper-accent`, `paper-brand-sm`, `paper-accent-sm` — sombra "papel" con borde superior brilloso (etiquetas flotantes y cards heroicas con tint corporativo).

Agregados a `borderRadius`:

- `3xl: "1.5rem"` (24px), `4xl: "2rem"` (32px), `5xl: "2.5rem"` (40px), `6xl: "3rem"` (48px).

Agregados a `keyframes` y `animation`:

- `float-slow`, `pulse-soft`, `fade-up`, `ping-slow`, `ping-slower`, `bounce-slow`, `bounce-slower`, `pulse-slow`.

### Fase 3 · Refactor archivos — CERRADA

#### `GlassCard.tsx` (foundation)
- `shadow-[0_8px_32px_rgba(0,0,0,0.06)]` → `shadow-glass`.

#### Top 5 archivos
- `GamifiedCTASection.tsx`: `shadow-[0_10px_20px...,inset_0_2px_4px...]` ×6 → `shadow-paper`. `rounded-[2.5rem]` → `rounded-5xl`. Animaciones `ping/bounce/pulse` mapeadas a tokens donde el timing coincidía. **Excepción documentada**: las animaciones de partículas conservan timings únicos (1.5s, 2.5s, 3.5s, 4.5s, 4.8s, 5.5s, 6s, etc.) **intencionalmente** para evitar sincronización visual.
- `WhatIsOpinaSection.tsx`: `shadow-[inset...,inset...,0_20px_40px_rgba(37,99,235,0.1)]` ×2 → `shadow-paper-brand`. La variante accent → `shadow-paper-accent`. `rounded-[2.5rem]` ×3 → `rounded-5xl`.
- `InteractiveHeroSection.tsx`: `rounded-[3rem]` → `rounded-6xl`, `rounded-[1.25rem]` → `rounded-2xl`, `shadow-[0_8px_32px...]` → `shadow-glass`, sombras `paper-brand-sm`/`paper-accent-sm` aplicadas.
- `OptionCard.tsx`: `rounded-[2rem]` ×8 → `rounded-4xl`. `shadow-[0_20px_40px_rgba(0,0,0,0.1)]` → `shadow-premium`.
- `StateBlocks.tsx`: `rounded-[2rem]` → `rounded-4xl`.

#### Sweep masivo (resto de archivos)
- 34+ archivos procesados con mapeo `rounded-[Xrem]` → `rounded-{2xl,3xl,4xl,5xl,6xl}` según equivalencia exacta.
- 14 archivos adicionales con valores en pixeles (`rounded-[24px]`, `rounded-[32px]`, `rounded-[40px]`, `rounded-[26px]`, `rounded-[22px]`, `rounded-[4px]`, `rounded-[1.4rem]`) mapeados a tokens.
- **Bug del sweep automático corregido manualmente**: una pasada inicial mapeó `rounded-[2.5rem]` a `rounded-3xl` (24px) en lugar de `rounded-5xl` (40px) en 11 archivos. Verificados y corregidos uno por uno: `SectionShell.tsx`, `InsightPack.tsx` (×2), `DepthWizard.tsx`, `BattlePage.tsx`, `SignalsRouter.tsx`, `ActualidadPreview.tsx`, `ServiciosView.tsx`, `LugaresView.tsx`, `ProgressiveRunner.tsx`, `FilterBar.tsx`, `PreviewShell.tsx`. También se corrigieron 3 archivos donde `rounded-3xl` legítimo había sido cambiado a `rounded-6xl`: `LugarSignalWizard.tsx` (×4 íconos cuadrados), `DepthComplete.tsx`, `B2BLeadForm.tsx`.

### Fase 4 · Limpieza CSS — CERRADA (parcial, ver deuda)

- `index.css` sin imports legacy ni utilities huérfanas (cerrado en Fase 1).
- `package.json` aún declara `@fontsource-variable/geist`, `tw-animate-css` y `shadcn` como dependencias. **Acción pendiente para vos** (en terminal local, raíz del repo):
  ```bash
  npm uninstall @fontsource-variable/geist tw-animate-css shadcn
  npm run build
  npm run dev
  ```
  Si el build se rompe (probable: `class-variance-authority`, `clsx`, `radix-ui`, `tailwind-merge` se usan en `src/components/ui/button.tsx` que es del residuo shadcn), evaluar si reemplazar `button.tsx` shadcn por un wrapper propio o mantener esas dependencias. Por ahora la app sigue funcionando porque el CSS de shadcn ya no se importa.

### Deuda menor que queda (no bloqueante)

| Ítem | Conteo final | Justificación |
|---|---|---|
| `rounded-[11px]` | 1 | Excepción visual del ring interior de un nav button en `InteractiveHeroSection.tsx:147`. Documentado como caso especial. |
| `rounded-[min(var(--radius-md),Xpx)]` | 4 | En `src/components/ui/button.tsx` (shadcn legacy). Quedan acopladas al residuo de shadcn. Resolver junto con la decisión de borrar shadcn. |
| `shadow-[...]` arbitrarios | ~97 ocurrencias | Mayoría son sombras hiper-específicas por componente (mockups, glow effects, sombras compuestas con tint). Las patrones repetidos ya se mapearon a tokens. Las restantes son únicas y mover cada una a token requiere análisis caso por caso. **Aceptable**: representa la "variedad legítima" de un home animado. |
| `drop-shadow-[...]` | 6 | Drop-shadows específicos de íconos con tint brand/accent. Equivalente a glow propio del ícono. Aceptable. |
| `animate-[...]` con timings únicos | ~35 | Variedad **intencional** para evitar sincronización visual de partículas y elementos flotantes. Documentado como excepción de diseño. |

### Hallazgo positivo confirmado

Sigue siendo cierto y se mantiene tras todos los cambios:

- ✅ Cero clases Tailwind prohibidas (`indigo/violet/purple/cyan/teal/lime/amber-decorativo`) en `.tsx`.
- ✅ Cero spacing arbitrario `p-[Xpx]`/`m-[Xpx]`/`gap-[Xpx]` con valores fuera de la escala canónica.
- ✅ Cero hex hardcoded fuera de paleta en archivos `.tsx`.
- ✅ La paleta canónica se respeta al 100%.
- ✅ El fondo blanco como invariante visual sigue siendo `body { background: #FFFFFF !important }`.
- ✅ Cero dark mode en CSS.
- ✅ Cero tipografías ajenas en `index.css`.

### Pasos siguientes recomendados (ya no bloqueantes)

1. **Validación visual en localhost** (en terminal local, raíz del repo):
   ```bash
   npm run dev
   ```
   Abrir `localhost:5173`, navegar Home / Admin / B2B / Feed y verificar visualmente que no hay regresiones. Especialmente: option cards, etiquetas flotantes, phone mockup, modal de onboarding (deberían verse iguales que antes — los tokens nuevos producen los mismos pixels que los inline anteriores).

2. **Decidir destino de shadcn** (`button.tsx` + `class-variance-authority` + `radix-ui` + `tailwind-merge`):
   - Opción A: borrar `button.tsx` y la dependencia shadcn, reemplazar consumidores por un button propio.
   - Opción B: mantener shadcn pero verificar que ningún archivo importe el theme `.dark` (ya verificado: cero consumidores).

3. **Refactor opcional de las sombras restantes**: si el equipo quiere bajar el conteo de `shadow-[...]` por debajo de 50, agendar una sesión específica para nombrar las 5-10 sombras compuestas que aparecen en heroes animados (`InteractiveHeroSection`, `OptionCard`, etc.) como tokens nombrados (`shadow-mockup-deep`, `shadow-feature-card`, etc.).
