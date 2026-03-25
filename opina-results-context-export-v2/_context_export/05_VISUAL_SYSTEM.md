# Sistema Visual Base (Extracto)

Los siguientes tokens extraídos de `tailwind.config.ts` y las utilidades compartidas rigen la identidad visual del proyecto. Los nuevos diseños en Resultados deben respetar este marco técnico.

## Colores Base (`theme.extend.colors`)
- **`primary`**: `#FF5A5F` (Brand color principal - Rojo/Coral vibrante)
- **`secondary`**: `#00A699` (Acento verde cerceta)
- **`purple`**: `#7C3AED` (Para destacados de "Wow", "Premium", o "Insight profundo")
- **`ink`**: `#0F172A` (Texto principal, casi negro)
- **`paper`**: `#FFFFFF` (Fondos base)
- **Superficies**: `surface` y `surface-hover` definen tarjetas y grises cálidos.
- **Estados**: `success` (verde), `warning` (amarillo), `error` (rojo).

## Tipografía
- **Familia Principal**: `Inter`, sans-serif. Existen clases nativas como `font-sans`.
- **Display**: Clases propias o `tracking-tight` para achicar el tracking en los H1 y H2.

## Radios (Redodeos)
- Las tarjetas grandes suelen usar `rounded-3xl` o `rounded-[32px]`.
- Elementos internos o inputs prefieren `rounded-xl` o `rounded-2xl`.
- Tags y pills utilizan `rounded-full`.

## Layout de Componente Estándar ("Container")
El ancho máximo del contenedor en Desktop es el prefijado por Tailwind (`max-w-7xl` o utilidades custom en `index.css`), pero las experiencias interactivas suelen usar una columna única centralizada ancha (Ej. `max-w-4xl mx-auto`).

*(Para configuraciones específicas e importadas de plugins como Framer Motion y Tailwind Typography, revisar el archivo adjunto `tailwind.config.ts`).*
