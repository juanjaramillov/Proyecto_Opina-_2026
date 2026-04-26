## Documentación Maestra (Fuente de Verdad)

Para entender la arquitectura de acceso, el estado de los módulos funcionales y el historial de estabilización del proyecto, consulta:
👉 **[PROJECT_MASTER_STATUS.md](./docs/PROJECT_MASTER_STATUS.md)**

Para supervisar los atajos técnicos que no fueron corregidos todavía y se documentaron como deuda explícita, revisar rigurosamente:
👉 **[DEBT_REGISTER.md](./docs/DEBT_REGISTER.md)**

---

## Cómo Levantar la App

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Regla Obligatoria de No-Regresión del Core (Pre-Commits):**
   Cualquier iteración al core estable requiere comprobación nula de errores.
   ```bash
   npm run typecheck && npm run test:run && npm run build
   ```

3. **Iniciar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```

## Variables de Entorno

**⚠️ REGLAMENTARIO: NUNCA USES CLAVES PRIVADAS EN EL FRONTEND.**
Copia `.env.example` a `.env.local` y define lo siguiente:
- `VITE_SUPABASE_URL`: Tu URL en Supabase.
- `VITE_SUPABASE_ANON_KEY`: Key anónima y pública.
- `VITE_ACCESS_GATE_ENABLED`: `true` (Habilita el PIN de acceso).

---

## Política de "Zip Limpio"

Para auditorías o respaldos, el empaquetado **nunca debe ser manual**. Utiliza los comandos automatizados para garantizar higiene del entorno:

1. **Generar Zip:**
   ```bash
   npm run export:clean
   ```

- **EXCLUIDOS EXPLÍCITAMENTE**: Consulta `docs/internal/repo-hygiene-and-export-governance.md` para ver la lista estricta de exclusiones operativas. El empaquetado limpio generado aparecerá en la raíz, en la carpeta `exports/`.

---

## Reglas de Oro Operativas
1. **Validación de Tipos**: `npm run typecheck` es el estándar de verdad, no la vista previa.
2. **Acceso Seguro**: Todo privilegio se deriva de `role` en la tabla `users`.
3. **Core Vivo**: Los módulos activos son Versus, Torneo, Actualidad y B2B Dashboard.
4. **UI Foundation (Fase 2)**: Al crear o modificar vistas complejas, DEBEN utilizarse los componentes núcleo de `src/components/ui/foundation` (e.g., `SectionShell`, `StatTile`). Prohibido reinventar layouts de métricas o cards artesanales.
5. **Partición de Componentes (Fase 2)**: Todo componente monolítico vivo con mezcla de responsabilidades debe fragmentarse extrayendo sus subcomponentes lógicos y configuraciones. Consultar `docs/internal/component-partitioning-governance.md`.
6. **Lenguaje Humano (Fase 2)**: El "runtime" B2C (Home, Signals, Results) requiere un registro estrictamente Premium-Editorial. Prohibido usar vocablos corporativos de BI ("Overview", "Ejecutivo", "Ecosistema", "Dashboard") en vistas orientadas a consumidores.
