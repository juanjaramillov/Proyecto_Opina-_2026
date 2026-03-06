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
- **Hub y Votación Clásica**: El módulo principal de Señales en modalidad "Versus Clásico" interactivo.
- **Resultados Globales**: Visión global de los rankeos resultantes de la votación (`Results`).
- **Admin**: Acceso al panel de invitaciones (`AdminInvites`), chequeos de salud (`AdminHealth`) y antifraude (`AdminAntifraud`).

## Módulos Congelados
Los siguientes módulos permanecen en el código fuente para futura iteración, pero han sido desvinculados de la interfaz (Routing / Navigation):
- Feed Progresivo y de Profundidad (`DepthHub`, `DepthRun`).
- Vistas públicas extendidas de SEO (`PublicRankingPage`).
- Plataforma de Inteligencia B2B e Insights (`IntelligencePage`, Dashboards B2B cerrados).
- Panel de Admin extendido de Demanda y Prioridades de módulo.

## 5 Reglas Operativas
Para evitar recaídas técnicas y deudas estructurales, se debe operar bajo los siguientes principios:

1. **No exponer Service Role Keys:** Jamás guardar una credencial secreta de Supabase en un archivo que pueda mezclarse con vite (no usar el prefijo `VITE_` paral service role keys).
2. **No hardcodear permisos por email:** Todo privilegio debe derivarse de la tabla `users` mediante el campo `role` (`role === 'admin'`). Cero atajos como `email === 'cfo@...'`.
3. **Validación obligatoria:** La validación final de la aplicación no es visual; es a través de `npm run typecheck` y la compilación exitosa sin referenciar rutas falsas o componentes importados y no usados (imports zombies).
4. **Ningún módulo visible si no está terminado:** Se prohíben los *feature flags* cosméticos sin uso. Si un módulo es secundario y aún no está listo, su enlace de menú se retira (`PageShell.tsx`) y su ruta se comenta (`App.tsx`).
5. **No mezclar documentación:** Única y exclusivamente basarse en este `README.md` como estado fáctico del proyecto. Todas las configuraciones `temp_open_*` han sido desactivadas para garantizar integridad de control de accesos.
