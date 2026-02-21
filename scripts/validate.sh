#!/bin/bash

# Opina+ Local Validation Script
# ------------------------------

echo "🔍 Iniciando validación local de Opina+..."

# 1. Type Check
echo "🚀 Ejecutando Type Check (tsc)..."
npm run typecheck
if [ $? -ne 0 ]; then
    echo "❌ Error: Falló el chequeo de tipos. Corrige los errores antes de continuar."
    exit 1
fi

# 2. Lint
echo "🎨 Ejecutando Linter (eslint)..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Error: Falló el linter. Ejecuta 'npm run lint:fix' para corregir problemas automáticamente."
    exit 1
fi

# 3. Build test
echo "📦 Verificando construcción del proyecto (build)..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: La construcción falló."
    exit 1
fi

echo "✅ ¡Todo legal! El código está listo para ser pusheado."
exit 0
