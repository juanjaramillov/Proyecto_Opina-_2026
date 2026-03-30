# Sistema de Tokens Visuales Canónicos (Opina+ V15)

Este documento establece la gobernanza y jerarquía de diseño interno que todo componente y desarrollador debe seguir en Opina+ V15. Su objetivo principal es gobernar el sistema visual bajo una **taxonomía estricta de Opción B (Familias Canónicas Mixtas)** que define claramente qué tokens dictan el estándar oficial y qué aliases restan por compatibilidad funcional (Legacy / Subniveles Estructurales).

## 1. Familias Semánticas Canónicas y Subniveles

Toda declaración de theming se agrupa exclusivamente en estas grandes familias semánticas:

### 🌟 Brand (Familia Canónica de Marca)
Define la identidad corporativa primaria.
- **Canónico**: `brand` (Azul corporativo `#2563EB`)
- **[Subnivel Oficial / Legacy Alias]**: `primary`. Utilizado históricamente en V14/V15 por la mayoría de componentes UI. Es tolerado para consistencia actual, pero obedece y mapea sus valores intrínsecamente a la definición de `brand`.

### ✨ Accent (Familia Canónica de Énfasis)
Para elementos destacados accesorios (secundarios) o interacciones contextuales.
- **Canónico Activo**: `accent` (Teal, Sky Blue)
- **[Subnivel Oficial / Legacy Alias]**: `secondary`. Se permite en botones secundarios o etiquetas, pero obedece los valores declarados en `accent`.

### 📦 Surface (Familia Canónica de Contenedores)
Define la estructura espacial de la interfaz (tarjetas, contenedores, fondos modales).
- **Subniveles Oficiales Activos**:
  - `bg-white` (Nivel 1 absoluto).
  - `surface2` / `bg-surface2` (Nivel 2 de contraste, grises translúcidos `#F8FAFC`).
- **Estados Prohibidos**: `surface-container`, `-b2c`, `-dashboard`. 

### 🖋️ Ink (Familia Canónica de Texto)
La "tinta" jerárquica que da legibilidad estructural sobre un *Surface*.
- **Subniveles Oficiales Activos**:
  - `ink` (`text-ink`): Tinta Nivel 1 u Oficial.
  - `ink-muted` (`#64748B`): Tinta Nivel 2 o Auxiliar.
- **[Subnivel / Legacy Alias]**:
  - `text-primary` (Alineado semánticamente a `ink`).
  - `text-secondary` / `text-muted` (Alineados semánticamente a los subniveles de Ink).

### 📏 Line (Familia Canónica de Bordes/Divisores)
Aporta separación visual estricta en el DOM.
- **Canónico Activo**: `line`
- **[Subnivel Oficial / Legacy Alias]**: `stroke` (mapeando unánimemente hacia la variable `var(--stroke)`). Todos los `.hairline` o `border-stroke` se rigen bajo el lineamiento general de la familia *Line*.

---

## 2. Inventario de Estados de Retroalimentación (Status Family)
Todo feedback universal utiliza obligatoriamente:
- **`success`**: `#10B981` (Acciones completadas, subida exitosa).
- **`warning`**: `#F59E0B` (Timeouts, estados pendientes cautelosos).
- **`danger` / `error`**: `#EF4444` (Mensajes destructivos, borrado de entidades).

---

## 3. Matriz de Variables Eliminadas (Deprecated Dead Code) 🚨

> [!WARNING]
> La siguiente lista recoge nomenclaturas **prohibidas y extirpadas del proyecto permanentemente en marzo de 2026**. Cualquier intento de recrearlas en nuevos tickets o Pull Requests será rechazado.

| Familias Prohibidas/Extirpadas | Razón de Deprecación | Reemplazo Oficial |
|---------------------------------|-----------------------|-------------------|
| `-b2c` (`surface-b2c`, `primary-b2c`, etc.) | Violación del principio DRY. Falso acomodamiento. | Usar `surface2` del Theme Canónico. |
| `*-container-high/low/variant` | Fósiles de generadores M3 (Material Theme Builder) nunca usados. | Usar jerarquía `surface2` explícita o opacidad en Tailwind. |

---

## 4. Gobernanza del Frontend
Para añadir nuevos valores o crear nuevos diseños:
1. **Regla general:** Edite a nivel CSS nativo (`var(--brand-opina-...)` en :root). 
2. **Hardcoding Prohibido (Anti-patrón):** Evite declarar valores HEJ (ej. `#191c1e`) en la configuración directa de Tailwind. Hágalo usando las referencias CSS definidas, lo que posibilitaría futuras compatibilidades interplataforma fáciles (p.ej. _Dark Mode_ fluido).
