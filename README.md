## Documentación Maestra (Fuente de Verdad)

Para entender la arquitectura de acceso, el estado de los módulos funcionales y el historial de estabilización del proyecto, consulta:
👉 **[PROJECT_MASTER_STATUS.md](./docs/PROJECT_MASTER_STATUS.md)**

Para supervisar los atajos técnicos que no fueron corregidos todavía y se documentaron como deuda explícita, revisar rigurosamente:
👉 **[DEBT_REGISTER_V13.md](./docs/DEBT_REGISTER_V13.md)**

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

Para auditorías o respaldos, el empaquetado **nunca debe ser manual**. Utiliza los comandos automatizados para garantizar higiene y portabilidad:

1. **Verificar Higiene:**
   ```bash
   npm run ops:repo-hygiene
   ```
2. **Generar Zip:**
   ```bash
   npm run ops:zip-clean
   ```

- **INCLUIDOS EN ZIP**: `src/`, `public/`, `supabase/`, `docs/`, `scripts/`, configs de raíz y `.env.example`.
- **EXCLUIDOS EXPLÍCITAMENTE**: `node_modules/`, `dist/`, `.git/`, `.vercel/`, `.env.*` locales, logs e informes temporales. La carpeta `archive/` queda fuera por defecto.

---

## Reglas de Oro Operativas
1. **Validación de Tipos**: `npm run typecheck` es el estándar de verdad, no la vista previa.
2. **Acceso Seguro**: Todo privilegio se deriva de `role` en la tabla `users`.
3. **Core Vivo**: Los módulos activos son Versus, Torneo, Actualidad y B2B Dashboard.
