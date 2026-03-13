# Opina+ V13 (Core MVP)

## Descripción General
Opina+ es una plataforma de votación y recolección de percepciones a través de señales (batallas, enfrentamientos). Este repositorio representa la versión V13 que ha sido recortada y consolidada a su núcleo esencial operativo. Funciones adicionales no esenciales (Inteligencia, Rankings, Torneos Progresivos) se encuentran explícitamente **congeladas** (inactivas/ocultas) en la interfaz actual.

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

### Públicas (Seguras, accesibles por Vite y React)
- `VITE_SUPABASE_URL`: Tu URL en Supabase.
- `VITE_SUPABASE_ANON_KEY`: Key anónima y pública (segura en el cliente).
- `VITE_ACCESS_GATE_ENABLED`: `true` (Habilita el acceso con PIN / código).
- `VITE_ACCESS_GATE_DAYS_VALID`: Ej. `30`.

### Privadas (NUNCA PREFIJAR CON `VITE_`)
- `SUPABASE_SERVICE_ROLE_KEY`: Solo para scripts `create_rpc.ts` u herramientas de Backend, jamás importadas en el cliente (`src/`).

## Alcance Activo (Core Flow)
Solo los módulos a continuación se consideran activos y de soporte primario:
- **Autenticación (Access Gate)**: `AccessGate`, `Login`, `Register`, `ResetPassword`.
- **Pre-Flujo**: Onboarding y Captura de Perfil (`ProfileWizard`).
- **Señales (Hub)**: `/signals`. El módulo principal para que el usuario participe en batallas o debata en actualidad (`SignalsHub`).
- **Resultados Globales**: `/results`. Visión B2C de los rankeos resultantes de la votación (`Results`).
- **Intelligence Landing**: `/intelligence`. Landing page orientada a captar leads comerciales B2B (`IntelligenceLanding`).
- **Panel Intelligence B2B**: `/b2b`. Suite analítica profunda para segmentar señales poblacionales en tiempo real.
- **Admin**: `/admin`. Acceso al panel de control interno, incluyendo overview del sistema (`AdminSystemOverview`), invitaciones, health, antifraude y editor de actualidad.

## Módulos de Archivo Legacy
Otras piezas que formaron parte de prototipos anteriores (Depth, ModulesDemand, Rankings, etc.) han sido retiradas del core vivo y archivadas.
Se pueden encontrar en `legacy_archive/src_graveyard/` con fines de referencia histórica, pero NO son importables ni forman parte del ruteo activo.

## 5 Reglas Operativas
Para evitar recaídas técnicas y deudas estructurales, se debe operar bajo los siguientes principios:

1. **No exponer Service Role Keys:** Jamás guardar una credencial secreta de Supabase en un archivo que pueda mezclarse con vite (no usar el prefijo `VITE_` paral service role keys).
2. **No hardcodear permisos por email:** Todo privilegio debe derivarse de la tabla `users` mediante el campo `role` (`role === 'admin'`). Cero atajos como `email === 'cfo@...'`.
3. **Validación obligatoria:** La validación final de la aplicación no es visual; es a través de `npm run typecheck` y la compilación exitosa sin referenciar rutas falsas o componentes importados y no usados (imports zombies).
4. **Ningún módulo visible si no está terminado:** Se prohíben los *feature flags* cosméticos sin uso. Si un módulo es secundario y aún no está listo, su enlace de menú se retira (`PageShell.tsx`) y su ruta se comenta (`App.tsx`).
5. **No mezclar documentación:** Única y exclusivamente basarse en este `README.md` como estado fáctico del proyecto. Todas las configuraciones `temp_open_*` han sido desactivadas para garantizar integridad de control de accesos.
