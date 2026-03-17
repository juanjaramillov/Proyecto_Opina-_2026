# Registro de Deuda Técnica y Operativa (V13)

Este documento centraliza la deuda técnica, operativa y funcional conocida al cierre del ciclo de estabilización de la V13.
El mandato es visibilidad total: la deuda no se oculta, se clasifica rigurosamente entre **Aceptada temporalmente** (no bloquea el core) y **A corregir pronto** (riesgo estructural o promesa de producto incumplida).

---

## Inventario Formal de Deuda Residual

| ID | Área | Descripción real | Gravedad | Estado | Acción recomendada | Cuándo abordarlo |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **DEBT-001** | **Tipados** | Uso de `declare module` genérico para destrabar librerías externas sin tipos formales (`recharts`, `chart.js`, `react-hot-toast`, `framer-motion`). | Media | Aceptada temporalmente | Reemplazar por tipado real instalando `@types/*` oficiales y tipando props fuertemente. | Próxima ventana técnica de tooling |
| **DEBT-002** | **Frontend (B2C)** | Superficie visible de módulos B2C que sugieren mayor profundidad funcional de la soportada actualmente por el read model subyacente (promesas "soon"). | Alta | A corregir pronto | Ocultar botones inactivos o implementar el end-to-end de dichas visualizaciones. | Próximo sprint de Producto B2C |
| **DEBT-003** | **Frontend (B2B)** | B2B aún no completamente cerrado como producto comercial vendible: pantallas parciales (Analytics "soon") y flujos de embudo desconectados. | Alta | A corregir pronto | Definir alcance MVP B2B comercial explícito y ocultar lo irrelevante, o completar flujos. | Antes del primer piloto comercial real |
| **DEBT-004** | **Arquitectura B2B** | Existencia de componentes masivos (como `OverviewB2B.tsx`) que todavía mezclan demasiada responsabilidad UI frente a presentación. | Media | Aceptada temporalmente | Extraer KPIs, Gráficos y Listas en micro-componentes especializados. | Tareas de refactorización background |
| **DEBT-005** | **Tests** | Si bien se implementaron unit tests para contratos puros (policies/read models), hay carencia de pruebas de integración E2E sobre flujos UI completos. | Media | Programada | Implementar Playwright o Cypress para testear el embudo `Gate -> Login -> Signal -> Results`. | Antes de salida a Producción (GA) |
| **DEBT-006** | **Arquitectura (Backend)** | Falta de control granular contra ráfagas de red (Throttling/Rate Limiting) en endpoints críticos de persistencia de señales. | Alta | A corregir pronto | Integrar políticas RPC de límite de requests o Redis/Edge throttling. | Antes de campañas masivas de tráfico |
| **DEBT-007** | **Estado Pendiente** | Falta de sincronización offline robusta en caso de que un fetch se cierre antes de vaciar el local Outbox. | Media | Aceptada temporalmente | Implementar uso de Service Workers o persistencia garantizada en IndexDB. | Tareas de refactorización background |

---

## Política de Deuda

1. **Deuda Aceptada Temporalmente**: Implica que la decisión de tomar el atajo fue consciente para ganar velocidad en el bloque de estabilización anterior. **No** es una licencia para perpetuar el hack.
2. **Deuda A Corregir Pronto**: Ítems cuya mera existencia compromete métricas de negocio, seguridad, o la percepción del cliente final (sobrepromesa). Su priorización en el backlog es obligatoria.
