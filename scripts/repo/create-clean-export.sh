#!/usr/bin/env bash

# create-clean-export.sh
# Único archivo oficial para generar exports limpios de Opina+
# Evita compilar, copiar y distribuir basura local (.env, node_modules, caches, logs).

set -e

# Cambiar a la raíz del proyecto
cd "$(dirname "$0")/../.."

echo ">> Iniciando auditoría y empaquetado de Opina+..."

# 1. Validación de Higiene Básica
# Minimal export guard: prevents packaging obvious local sensitive files by mistake.
# This is NOT a security scanner.
if ls .env 1> /dev/null 2>&1; then
    echo "[!] Detectados archivos .env locales. Serán excluidos de la exportación (solo migrará .env.example)."
fi

# 2. Configuración del Destino Oficial
mkdir -p exports

EXPORT_PREFIX="OpinaPlus_Clean_Export"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ZIP_FILE="exports/${EXPORT_PREFIX}_${TIMESTAMP}.zip"

echo ">> Empaquetando código fuente en: $ZIP_FILE"

# 3. Compresión con exclusión paramétrica rigurosa
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
  -x "*/__MACOSX/*" "__MACOSX/*" \
  -x "exports/*" \
  -x "*.zip" \
  -x "*.log" \
  -x "*.bak" \
  -x "*.tmp" \
  -x "*.swp" \
  -x "*/.env" ".env" \
  -x "*/.env.local" ".env.local" \
  -x "*/.env.*.local" ".env.*.local" \
  -x "*/.env.production" ".env.production" \
  -x "*/.env.development" ".env.development" \
  -x "*/.env.vercel.*" ".env.vercel.*" \
  > /dev/null

echo ">> [SUCCESS] Exportación limpia generada. Código fuente listo para traslado operativo."
echo ">> Ruta: $ZIP_FILE"
