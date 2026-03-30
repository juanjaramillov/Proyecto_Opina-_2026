# Bitácora Fase 2 / Paso 2 (Ajuste Final): Consolidación de Taxonomía Visual y Eliminación de Ambigüedades

**Fecha**: 30 de Marzo de 2026
**Objetivo Exacto Cierre**: Consolidar definitivamente el lenguaje visual, resolviendo la ambigüedad generada por la mezcla semántica entre "Familias Canónicas" y "Nombres de Tokens consumidos" en `tailwind.config.js` e `index.css`.

---

## 1. Ajuste Taxonómico Ejecutado (Opción B: Sistema Mixto Gobernado)

El sistema visual en V15 hereda nombres de clases que están diseminados masivamente en el Frontend (ej. `bg-primary`, `bg-surface2`, `border-stroke`, `text-ink`). Modificarlos hubiese traído la obligación de refactorizar y testear más de ~100 componentes React, contradiciendo el imperativo de **"No inventar un design system gigante"** ni abrir **"una limpieza riesgosa"**. 

Por ello, se ejecutó un **cierre semántico mixto**, pero 100% explícito y gobernado.
Se reformó drásticamente el objeto `colors` en Tailwind y las Declaraciones Root de CSS para documentar categóricamente:

| Familia Canónica | Canonical Token | Subnivel Oficial (Uso Activo) | Legacy Alias Tolerado | Estado y Regla de uso futuro |
|------------------|-----------------|-------------------------------|-----------------------|------------------------------|
| **Brand (Color de Marca)** | `brand` | `brand` | `primary` | `primary` se mantiene por compatibilidad histórica con la extensa base de botones (`btn-primary`). Futuras declaraciones deben entender que referencian a `brand`. |
| **Accent (Énfasis Secundario)** | `accent` | `accent` | `secondary` | Ídem para `secondary`: es formalizado como alias histórico de la familia **Accent**. |
| **Surface (Contenedores)** | `surface` | `surface.DEFAULT` (`#FFF`) / `surface2` (`bg-surface2`) | `bg` | La familia `surface` se consolida rigurosamente con niveles. `surface2` asciende de "sopa de alias" a un **Subnivel Oficial** canónico de contenedores y recuadros. |
| **Ink (Texto / Legibilidad)** | `ink` | `ink` / `ink-muted` | `text-primary`, `text-secondary`, `text-muted` | Se documenta explícitamente cuáles son los subniveles legítimos que mapean a los colores opacos de la tinta (e.g., *slate-500, slate-600*). Son subniveles oficiales gobernados. |
| **Line (Bordes y Delineado)** | `line` | `line` | `stroke` | Se define a `stroke` como **Legacy Alias Formalizado** de la familia canónica **Line**. |

## 2. Acciones Técnicas sobre Archivos

1. **`tailwind.config.js`**
   - Se reescribió todo el árbol de propiedades cromáticas con comentarios de estructura dictaminando Familia vs Sublevel vs Legacy Alias. 
2. **`src/index.css`**
   - El bloque `#root` fue dividido meticulosamente con comentarios técnicos demarcando *Familias*, *Aliases Históricos*, y *Subniveles*.

## 3. Certificación e Integridad Categórica

Se superó la validación final que comprueba que esta reformulación no corrompe Componentes.
- `npm run typecheck` **Exitoso**.
- `npm run build` (Vite) **Exitoso sin incidencias colaterales**. 

> A través de esta corrección se disuelve toda mezcla de términos. El glosario declara sin titubeos las dependencias. Así, **se concluye formal y estrictamente el Paso 2 de la Fase 2**.
