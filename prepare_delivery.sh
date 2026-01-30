#!/bin/bash
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_ZIP="opina_entregable_$TIMESTAMP.zip"

echo "📦 Preparando entrega limpia: $OUTPUT_ZIP..."

zip -r "$OUTPUT_ZIP" . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".env*" \
  -x ".env.local" \
  -x "_archive/*" \
  -x "deliveries/*" \
  -x "opina_entregable_*.zip" \
  -x ".git/*" \
  -x "**/.DS_Store" \
  -x "__MACOSX/*" \
  -x "*.log" \
  -x "coverage/*" \
  -x ".vscode/*"

mkdir -p deliveries
mv -f "$OUTPUT_ZIP" deliveries/
echo "✅ ZIP creado: deliveries/$OUTPUT_ZIP"
