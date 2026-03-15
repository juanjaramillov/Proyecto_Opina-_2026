## Documentación Maestra (Fuente de Verdad)

Para entender la arquitectura de acceso, el estado de los módulos funcionales y el historial de estabilización del proyecto, consulta:
👉 **[PROJECT_MASTER_STATUS.md](file:///Users/juanignaciojaramillo/Desktop/Opina+/Antigravity - Proyecto/Opina+ V13/docs/PROJECT_MASTER_STATUS.md)**

---

## Cómo Levantar la App

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Verificar Salud del Código (Obligatorio antes de Commits):**
   ```bash
   npm run typecheck && npm run build
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

Para auditorías o respaldos, el empaquetado debe ser ligero e higiénico:
- **INCLUIR**: `src/`, `public/`, `supabase/`, `docs/`, `package.json`, `tsconfig.json`, `vite.config.ts`, `README.md`.
- **EXCLUIR**: `node_modules/`, `dist/`, `.DS_Store`, archivos `.log`.

---

## Reglas de Oro Operativas
1. **Validación de Tipos**: `npm run typecheck` es el estándar de verdad, no la vista previa.
2. **Acceso Seguro**: Todo privilegio se deriva de `role` en la tabla `users`.
3. **Core Vivo**: Los módulos activos son Versus, Torneo, Actualidad y B2B Dashboard.
