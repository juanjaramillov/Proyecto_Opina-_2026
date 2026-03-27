#!/usr/bin/env bash

# generate-types.sh
# -----------------
# Regenera el archivo de tipos de Supabase desde el proyecto en la nube 
# y le inyecta una nota de "Do not edit" para proteger la gobernanza.
#
# Uso: npm run supabase:types

# 1. Aseguramos que existe el directorio destino
mkdir -p src/supabase

# 2. Generamos el archivo usando el CLI de Supabase 
# NOTA: Asegúrate de tener el entorno enlazado (supabase link) o provee el project-id si es necesario.
echo "Generando tipos desde Supabase..."
npx supabase gen types typescript --linked > src/supabase/database.types.tmp.ts

# 3. Verificamos que el comando fue exitoso
if [ $? -ne 0 ]; then
  echo "Error: Fallo al generar los tipos de Supabase. Revisa tu login o el link del proyecto."
  rm -f src/supabase/database.types.tmp.ts
  exit 1
fi

# 4. Inyectamos la cabecera de "Do not edit" en el archivo final
echo '/**
 * AUTO-GENERATED FILE.
 * Source of truth: Supabase CLI.
 * Do not edit manually.
 * Manual overrides must live outside this file in `database-manual-overrides.ts`.
 */' > src/supabase/database.types.ts

cat src/supabase/database.types.tmp.ts >> src/supabase/database.types.ts

# Limpiamos el archivo temporal
rm src/supabase/database.types.tmp.ts

echo "Tipos generados y protegidos con éxito en src/supabase/database.types.ts"
