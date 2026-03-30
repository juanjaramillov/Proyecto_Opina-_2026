# Mapa de Tooling Operativo de Opina+ (V15)

Este documento centraliza el objetivo, gobernanza y reglas de uso del *tooling* interno en el entorno de Opina+. Con la apertura de la Fase 2, se prohíbe alojar scripts crudos (ej. `fix.cjs`, `check.ts`) en la raíz del proyecto para preservar un espacio de desarrollo limpio.

## 1. Jerarquización de Scripts (`scripts/`)
Todas las herrramientas de CLI que no son comandos formales del bundler o linter están agrupadas modularmente dentro de `scripts/`:

### 📥 1.1 Operaciones (Activas y Frecuentes)
`scripts/ops/` contiene los scripts destinados a interactuar directamente con la base de datos o APIs para flujos administrativos o de mantenimiento que requiere el staff de Opina+.
- **`create_admin_user.ts`**: Utilizado para conceder provilegios de administrador master directos sin UI.
- **`catalog/fetch-entity-logos.mjs`**: Robot ETL para sincronizar y actualizar isologos del catálogo de marcas en bulk.
- **`update_admin_list_invites.ts`**: Procesa migraciones rápidas de invitaciones B2B.

### 🖼️ 1.2 Recursos y Logos (Legacy / Transición)
`scripts/assets/` y `scripts/logos/`
Scripts remanentes de la curación de los >2000 logotipos y su carga masiva hacia el bucket de Supabase. Suelen considerarse procesos históricos, pero se mantienen indexados en caso de reestructuración de imagen.
- **`migrate-strong.ts` / `apply-high-priority.ts`**: Procesos puntuales ejecutados en Marzo 2026.

### 🗑️ 1.3 Herramientas Legacy de Terminal (Deprecated)
`scripts/legacy_tools/`
Scripts de migración asíncrona, fix de secuencias de tablas o tests ad-hoc en crudo usados por desarrolladores durante estabilización MVP de V14.
- **`fix.cjs` / `sync.cjs`**: Utilidades descartadas para forzar el Build en Edge Functions V14.
- **`check_seq.cjs` / `check.ts`**: Creados para la migración de `results_publication_state`.

---

## 2. Mapa `package.json` Semántico

Todo comando `npm run ...` sigue ahora un linaje estricto:

### 🚀 Core App
- `npm run dev`: Inicia el servidor de Vite nativo.
- `npm run build`: Compilación con validación dura TypeScript previa.
- `npm run typecheck`: Validador sintáctico estéril para CI/CD.

### 🧪 Tests
- `npm run test / test:smoke`: Testing automatizado con Vitest en suites de QA.

### ⚙️ Ops Activos
- `npm run ops:admin:create`: Promueve usuario a Master Admin.
- `npm run ops:db:generate-types`: Fuerza regeneación de tipos Supabase contra el cluster base de V15.
- `npm run ops:catalog:fetch-logos`: Levanta el scraper de logos.

### 📦 Legacy (Usar Bajo Riesgo / No Mantenido)
Prefixados como `npm run legacy:*`. No corren pipelines automáticos.

---

## 3. Disposición a Futuro

1. Cualquier script en batch `JS`/`TS` **DEBE** depositarse bajo `scripts/ops/` si tiene valor permanente.
2. Si es una validación de bugfix temporal (ej: regenerar una fila errática en staging), **DEBE** borrarse después de su uso o ir a `scripts/legacy_tools/`.
3. Está estrictamente prohibido esparcir archivos `.cjs`, `.mjs`, o `.log` temporales en la base del directorio estructural.
