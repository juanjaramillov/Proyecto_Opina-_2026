# Política de Exportación Limpia (Clean Export Policy)

Esta política dictamina la **ÚNICA** manera autorizada para empaquetar, respaldar o compartir el repositorio fuente de Opina+. 

## 1. Alcance
Cualquier archivo `.zip` o archivo comprimido que contenga el código fuente del proyecto con el propósito de Handoff Técnico, Auditoría, Respaldo o Envío a Clientes/Terceros.

## 2. Regla de Oro
**Jamás empaquetar el proyecto manualmente.** 
Utilice siempre el comando automatizado para asegurar las exclusiones por defecto:
```bash
npm run export:clean
```

## 3. Elementos Estrictamente Excluidos
El script de exportación bloqueará agresivamente los siguientes artefactos:
- `node_modules/` (Debe ser provisto por el entorno de instalación vía `npm ci`).
- `dist/`, `build/` (El código compilado se genera post-instalación).
- `.env` y derivados (`.env.local`, `.env.production`). **EXCEPTO** `.env.example`.
- `.git/` (El historial o configuración local no debe filtrarse a externos no git).
- `.vercel/`, `.next/`, `.vite/` (Caches de frameworks).
- `coverage/` (Reportes de tests locales).
- `__MACOSX/`, `.DS_Store` (Basura del sistema operativo).
- `*.zip` (La recursividad de zips dentro de zips ennegrece los repositorios).
- `*.log`, `*.tmp`, `*.bak`, `*.swp` (Basura temporal de corrida y editores).

## 4. Precondiciones para Empaquetar
1. **Verificar Repo Dirty**: Si el comando de export encuentra `.env` locales sucios que rompen la barrera física (o archivos prohibidos detectados por `npm run ops:repo-hygiene`), requerirá precaución y fallará tempranamente alertando el problema.
2. **Build Test**: Cerciórese localmente de que el código base funciona antes de empaquetar, ejecutando `npm run typecheck` y `npm run build`.

## 5. Salida del Script
El zip final se depositará en una nueva carpeta operativa (`exports/`). Revise su contenido si es primera vez, asegurándose de que cumple el patrón establecido en el archivo de ignorados y esta política.
