#!/bin/bash
set -e

OUT="${1:-opina_safe_share_$(date +%Y%m%d_%H%M).zip}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"

zip -r "$OUT" . \
  -x "node_modules/*" \
  -x "dist/*" \
  -x ".git/*" \
  -x ".env*" \
  -x "__MACOSX/*" \
  -x ".DS_Store" \
  -x "**/.DS_Store" \
  -x ".vercel/*"

echo "OK: creado $OUT"
