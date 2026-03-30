# Opina+ V15 — Unificación Final del Demo Pilot Launchpad

## Cambios Realizados

Para garantizar **consistencia operativa absoluta** entre la documentación, el entorno de validación CLI y el dashboard administrativo, se han unificado las lógicas dispersas o hardcodeadas creando una **Única Fuente de Verdad**.

1. **Creación de `src/config/demoProtocol.ts`**
   - Centraliza los *Thresholds de validación GO/NO-GO* (Señales, Demografías y Entidades).
   - Define el escenario oficial sugerido `telecom` (Telecomunicaciones Demo).
   - Estructura y aloja la arquitectura del **Recorrido Oficial B2C/B2B** a presentar ante los stakeholders (Home -> Access Gate -> Signals Hub -> Profile -> Results B2C -> Intelligence B2B).
   - Documenta los entornos y componentes excluidos ("no recomendados para el piloto").

2. **Refactorización de `AdminDemoLaunchpad.tsx`**
   - El componente dejó de iterar sobre copias locales harcodeadas (`DEMO_SCENARIOS`). 
   - El Tour Oficial (SOP) ahora se genera mapeando el array estandarizado desde `demoProtocol.ts`, garantizando escalabilidad y unificación de criterio.

3. **Corrección Arquitectónica del Script CLI (`validate_demo.ts`)**
   - Se migró el chequeo inicial de *Entities* (tabla antigua `entities`) al catálogo canónico maestro y exclusivo de V15: `signal_entities`.
   - Se abstrajo la lógica condicional para que evalúe y apruebe en estricta sincronía con el archivo `demoProtocol.ts`. Ahora el Terminal Report y la Ventana Launchpad miden exactamente con las mismas reglas matemáticas y bajo el mismo modelo de datos real.

## Plan de Verificación

### Pruebas Automatizadas
- [x] Refactorización evaluada y exitosa frente al TypeScript Checker (`tsc --noEmit`).

### Resultado Visible
> [!NOTE] 
> La consola administrativa en `/admin/demo` ahora predetermina activamente `Telecomunicaciones Demo` como recomendación, renderiza directamente desde el protocolo de tour y exige volumen mediante la estructura de entidades de gamificación `signal_entities` (no registros residuales).

La Fase 4 de **Demo Readiness & Operational Hardening** queda con esto certificada y sellada para validación B2B frente a terceras partes.
