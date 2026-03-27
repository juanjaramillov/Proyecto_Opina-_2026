# Higiene Operativa del Repo y Gobernanza de Export

Este documento norma obligatoriamente las condiciones y el proceso oficial para empacar código de Opina+ de forma higienizada, asegurando portabilidad sin filtración de secretos, caches pesados ni basura operativa acumulada.

## 1. Definición de "Export Limpio"

Se considera un **Export Limpio** a un empaquetado del repositorio (habitualmente un archivo ZIP) que cumple inquebrantablemente con las siguientes reglas:
- **Ausencia Tota de Compilados Ocultos:** Excesos de tooling (bundles, node_modules, .vercel) que triplican el peso del proyecto son omitidos.
- **Cierre Transparente de Secretos:** Los `.env` per se o `.env.local` son retenidos del escrutinio final para aislar las credenciales del host. Solo se porta la plantilla publicística (.env.example).
- **Control de Inmisiones:** No transporta el `.git` a menos que sea el equipo nuclear el que extraiga un bare clone explícitamente y lo pida. El export está dictado para auditoría en estado puro.

No existen comandos de exportación heredados válidos en Opina+. Ante un pedido de audit o reestructuración remota, **solo se debe ejecutar**:

```bash
npm run export:clean
```

El script enmascarado tras este comando (`scripts/repo/create-clean-export.sh`) encapsula las aserciones paramétricas automáticas para no delegar el discernimiento humano en qué obviar al empaquetar por terminal.

## 3. Destino Oficial Exclusivo
Cualquier export de esta naturaleza acabará automáticamente en la carpeta `exports/` en la raíz (ejemplo `exports/OpinaPlus_Clean_Export_YYYYMMDD_HHMMSS.zip`). Dicha carpeta ya ha sido instruida en `.gitignore` para no encadenar sus productos locales en la historia de GitHub.

## 4. Archivos Excluidos (Blacklist Activa)
Al generarse un paquete mediante la vía oficial, el script automáticamente descarta todo patrón equivalente o derivado de:
- `node_modules/`
- `.git/`
- `dist/`, `build/`, `.vercel/`, `.next/`, `.vite/`
- `coverage/`
- `.DS_Store`, `__MACOSX/`
- `*.env` activo real (excluyendo ejemplo).
- `*.log`, `*.zip`, `.tsbuildinfo`
- Residuos locales temporales (`.bak`, `.tmp`, `.swp`)

## 5. Excepciones: Exportes Totales o Contaminados
El equipo central que requiera enviar a otro dev la masa íntegra del repositorio (con el `node_modules` y `.git` anclados) no se regirá por este documento. Su empaquetamiento deberá realizarse de forma plenamente manual o bajo un git archive bare clone; asumiendo de paso el inmenso peso adjunto.

## 6. Alcance (Not a Security Scanner)
**Importante:** Este script y su gobernanza asociada sirven propósitos de *higiene operativa*, **no de seguridad profunda**.
- La advertencia inicial sobre archivos `.env` es un *"Minimal export guard"*, diseñado para impedir errores torpes u obvios en el empaquetado. 
- **NO fungen como escudo Anti-DLP (Data Loss Prevention)** ni realizan scaneos complejos retrospectivos del zip por filtraciones accidentales secretas no-estándar en el código fuente.
