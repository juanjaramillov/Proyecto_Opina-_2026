# Gobernanza de Tipos Supabase

Este documento establece la procedencia y el manejo seguro del contrato de datos tipado en el frontend activo.

## 1. El Archivo Generado (Intocable)
El archivo `src/supabase/database.types.ts` contiene el Tipado Original (AST) exportado por Supabase. 
**REGLA DE ORO:** Está estrictamente prohibido editar manualmente este archivo. No se pueden agregar tablas, columnas, reparar nulos ni cambiar relaciones aquí. Todo lo escrito aquí es efímero y producto de la consola.

## 2. Cómo Regenerar los Tipos
Si hubo migraciones en base de datos o cambios en el Dashboard de Supabase, ejecuta:

```bash
npm run supabase:types
```

Este script `scripts/supabase/generate-types.sh` jalará la base más reciente y automáticamente inyectará un cerrojo "Do not edit" en el tipeo para proteger el contrato.

## 3. Override y Modificaciones Manuales (Aislamiento)
En diversas iteraciones, podríamos necesitar acceder a las tablas en el cliente que recién introdujimos mediante SQL y que el generador de CLI aún no recoge correctamente, o para extender features que están incompletas.

Cualquier sobreescritura estricta que tuviéramos que hacer a este AST vivirá **aislada** en:
`src/features/shared/types/database-manual-overrides.ts`

- **¿Cuándo se permite un override?** Sólo temporalmente cuando una tabla/columna aún no figura en el CLI generation, o cuando haya colapsado por una incompatibilidad del generador.
- **¿Qué pasará con el override?** Todos los overrides deben ser documentados y tender a desaparecer mediante el CLI de Supabase conforme la base evolucione y se sincronicen los entornos.

**ESTADO ACTUAL (Auditoría Bloque 3.5):**
_Cero (0) overrides activos._ Las tablas `app_sessions`, `behavior_events` y la totalidad de nuevos campos en `signal_events` fueron integradas nativamente en la generación `supabase:types`. El archivo _database-manual-overrides.ts_ rige vacío por diseño.

## 4. Tipado Oficial en el Frontend (`StrictDatabase`)
Ningún archivo de lógica o UI deberá importar la Interfaz base del archivo autogenerado en bruto. 
Para invocar al AST verídico, siempre usar e importar el alias unificado:
`StrictDatabase` (o `Database` compuesto) situado en: `src/features/shared/types/database-contracts.ts`

```typescript
import type { StrictDatabase } from '@/features/shared/types/database-contracts'
const supabase = createClient<StrictDatabase>(...)
```
Este contrato unificará el archivo generado, más la curaduría del *database-manual-overrides.ts* sin inyectar deuda técnica al origen.
