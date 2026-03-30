# Fase 4 - Paso 3: Demo Pilot Launchpad (Cierre Final)

## Objetivo Comercial y Operativo
El propósito de este entregable es dotar a Opina+ V15 de la capacidad nativa de ejecutar un piloto o demostración B2B/B2C en vivo, sin depender de _Cold Starts_ (entornos vacíos) ni requerir "siembra manual" por parte de los operadores comerciales. 

## Criterio de Fuente de Verdad Única
Para gobernar este proceso sin divergencias, se ha creado el archivo **`src/config/demoProtocol.ts`**, el cual funciona como la única **fuente de verdad universal** compartida obligatoriamente por el UI (`AdminDemoLaunchpad.tsx`), los scripts CLI (`validate_demo.ts`) y la documentación analítica (`demo-readiness-protocol.md`).

### 1. Sistema GO / NO-GO Centralizado
Ambas interfaces consumen los mismos thresholds:
- `MIN_ENTITIES`: 3 (Válida que el módulo Base de Versus tenga contenido).
- `MIN_SIGNALS`: 10 (Válida el rebasamiento del margen de volatilidad estadística B2C).
- `MIN_DEMOGRAPHICS`: 5 (Válida la operatividad de los Radares de Inteligencia B2B).

El frontend (`AdminDemoLaunchpad.tsx`) se sincroniza con Base de Datos en tiempo real calculando sobre el catálogo maestro (`signal_entities`) para activar de forma asíncrona la indicación visual de Despliegue.

### 2. Escenario Oficial de Recomendación
El escenario por defecto (`DEMO_RECOMMENDED_SCENARIO`), forzado globalmente en base de código, queda designado a: **Telecomunicaciones Demo (`telecom-demo`)**. Esto pre-calibra los scripts y botones de inyección para el path de menor fricción cognitiva hacia clientes Enterprise.

### 3. Secuencia de Demostración Formal (SOP)
El orden oficial exacto que expone la UI mediante sus "Launch Buttons", consumido desde la configuración central es:
1. `Home & Landing` (`/`)
2. `Access Gate` (`/access`)
3. `Signals Hub` (`/m/versus?slug={slug}`)
4. `Perfil y Progresión` (`/profile`)
5. `Resultados B2C` (`/results?slug={slug}`)
6. `Intelligence B2B` (`/b2b?slug={slug}`)

### 4. Entornos Proscritos (Fuera del Tour)
La misma configuración prohíbe explícitamente y alerta en la UI evitar:
- Tableros administrativos internos (/admin/* excepto el panel Launchpad)
- Modo Torneo B2C (/m/torneo) mientras no reciba sembrado
- Recuperación y reseteo de contraseñas
- Onboarding manual y Auth Email puro

## Conclusión Técnica y Cierre del Roadmap
La integración de un dashboard comercial en la red administrativa previene el problema clásico de presentadores perdiéndose en URLs muertas o interfaces vacías. La unificación con `demoProtocol.ts` blinda el ecosistema de inconsistencias cruzadas.

> **ESTADO DE LA FASE:** CERRADA. Con esto, Opina+ V15 da por cerrado su roadmap planificado, logrando un producto maduro, estable, asimétrico y preparado operacionalmente para demostraciones ejecutivas B2B.
