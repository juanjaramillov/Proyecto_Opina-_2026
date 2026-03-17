#!/usr/bin/env bash

# export-clean-zip.sh
# Genera un archivo ZIP limpio del proyecto Opina+, excluyendo secretos, basura y directorios pesados.

set -e

# Cambiar a la raíz del proyecto
cd "$(dirname "$0")/../.."

# 1. Validación Previa
echo ">> Verificando entorno antes de exportar..."

if [ -d "node_modules" ]; then
    echo "[!] Se detectó node_modules localmente. Será excluido de la exportación."
fi

if ls .env 1> /dev/null 2>&1; then
    echo "[!] Se detectaron archivos .env reales. Serán excluidos estrictamente. Solo viajará .env.example."
fi

# 2. Configurar salida
mkdir -p exports

EXPORT_PREFIX="${1:-OpinaPlus_Clean_Export}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_FILE="exports/${EXPORT_PREFIX}_${TIMESTAMP}.zip"

echo ">> Empaquetando código fuente en: $ZIP_FILE..."

# 3. Empaquetar aplicando exclusiones rigurosas
zip -r "$ZIP_FILE" . \
  -x "*/node_modules/*" "node_modules/*" \
  -x "*/dist/*" "dist/*" \
  -x "*/build/*" "build/*" \
  -x "*/.git/*" ".git/*" \
  -x "*/.vercel/*" ".vercel/*" \
  -x "*/.next/*" ".next/*" \
  -x "*/.vite/*" ".vite/*" \
  -x "*/coverage/*" "coverage/*" \
  -x "*/.DS_Store" ".DS_Store" \
  -x "*.zip" \
  -x "*.log" \
  -x "*.tmp" \
  -x "*.bak" \
  -x "*.swp" \
  -x "*/.env" ".env" \
  -x "*/.env.local" ".env.local" \
  -x "*/.env.*.local" ".env.*.local" \
  -x "*/.env.production" ".env.production" \
  -x "*/.env.development" ".env.development" \
  -x "*/.env.vercel.*" ".env.vercel.*" \
  -x "exports/*" \
  -x "*/__MACOSX/*" "__MACOSX/*" \
  > /dev/null

echo ">> [OK] Archivo ZIP creado."

# 4. Verificación de Seguridad Interna (Post-Build)
echo ">> Auditando el archivo generado para descartar filtraciones..."

# Buscaremos patrones prohibidos dentro de la lista de archivos que contiene el zip:
# node_modules/, dist/, .git/, .env (exceptuando .env.example)
if unzip -l "$ZIP_FILE" | grep -E 'node_modules/|dist/|\.git/|\.env[^.]|/\.env$' > /dev/null; then
    echo ">> [ERROR CRITICO] Ocurrió una fuga. Se han incluido directorios prohibidos o variables de entorno reales dentro del ZIP."
    echo ">> Elimina el archivo y revisa las exclusiones del script."
    exit 1
fi

echo ">> [SUCCESS] Exportación limpia garantizada. Listo para compartir."
echo ">> Salida: $ZIP_FILE"
