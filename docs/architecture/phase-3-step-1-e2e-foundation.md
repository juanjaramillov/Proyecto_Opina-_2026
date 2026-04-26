# Phase 3 Step 1: Estabilización y Blindaje de E2E (Happy Path B2C)

## 1. Flujo B2C Exacto Cubierto

El test E2E `b2c-happy-path.spec.ts` cubre el **"Happy Path Crítico"** para un usuario B2C (consumidor) que ingresa a la plataforma y participa en la gamificación primaria.

**Entry Point:** `/login?next=/signals` con credenciales reales (`test_normal_user@opina.plus`).

**Secuencia controlada:**
1. Autenticación exitosa.
2. Intercepción y escape del Guard Access (`Gate.tsx`) mediante Bypass validado.
3. Ruteo condicional: Si el backend requiere que el usuario complete su perfil, intercepción de pasos 2, 3 y 4 del `ProfileWizard`.
4. Ruteo final al `SignalsHub` (Game Engine primario).
5. Interacción con una serie progresiva de **3 señales consecutivas** en el motor `VersusGame`.

## 2. Selectores Estables Agregados (Surgical IDs)

Para eliminar dependencias frágiles de la interfaz (como `input[type="number"]` o `#versus-container button`), se insertaron los siguientes anchors quirúrgicos en componentes clave del flujo:

- `data-testid="profile-wizard-step-basic"`: Contenedor del Paso 2 del Wizard.
- `data-testid="profile-wizard-age-input"`: Input numérico para ingreso de año de nacimiento.
- `data-testid="profile-wizard-step-professional"`: Contenedor del Paso 3 del Wizard.
- `data-testid="profile-wizard-step-home"`: Contenedor del Paso 4 del Wizard.
- `data-testid="versus-container"`: Contenedor primario de la arena de juego.
- `data-testid="versus-option-[ID]"`: Píldoras interactivas (OptionCards) dentro de la arena de versus.

## 3. Mocks y Semillas (Seeds) Utilizadas

El test corre principalmente contra interfaces reales pero bloqueamos dependencias de red del motor de gamificación para garantizar repetitibilidad rápida:

- **Access gate desactivado por env var:** El dev-server que levanta Playwright arranca con `VITE_ACCESS_GATE_ENABLED=false` (ver `playwright.config.ts → webServer.command`), lo que hace que `accessGate.isEnabled()` devuelva `false` y el Gate no bloquee. Reemplaza al viejo bypass client-side de `localStorage.opina_access_pass='admin'`, que se retiró al cerrar la vulnerabilidad crítica #2 de la auditoría Drimo.
- **RPC `validate_invitation`:** Mockeado con respuesta en array válido `[{ is_valid: true }]` para emular un Access Code Admin perfecto, sin mutar la red de Supabase.
- **RPC `bootstrap_user_after_signup_v2`:** Interceptado para retornar `{ success: true }`, evitando errores de asincronía o fallas tempranas por intentos de bootstrap duplicados en usuarios de testeo.
- **RPC `get_active_battles`:** Proveemos un set de *3 Batallas Sintéticas* inyectadas directamente en formato JSON (Battle 1, Battle 2, Battle 3) para garantizar su presencia independiente del estado de la base de datos de producción o del ambiente local.

## 4. Cantidad de Interacciones Reales Cubiertas

1. Formulario de acceso completo: 3 inputs de tipear y click real a submit.
2. Si el perfil lo requiere: Llenado iterativo de selects e inputs en Wizard (3 vistas dinámicas).
3. Evaluaciones en Arena: **3 clicks orgánicos y consecutivos** (`cardButton.click()`) sobre la opción mockeada izquierda `[data-testid="versus-option-opt1"]`.

## 5. Condición Final de Éxito del Test

El test valida que **tras cada una de las 3 iteraciones de interacción de señal**, se cumplan los siguientes criterios:
1. El UI del juego sigue desplegado y visible.
2. Los botones de evaluación vuelven a estar activos, presentes y sin bloquearse ni mostrar un estado de "cooldown" erróneo o un esqueleto vacío permanente.
3. El test determina su finalización limpia cuando el bloque interactivo iterativo procesó 3 interacciones enteras fluidas con los delays artificiales completados sin timeouts.

## 6. Confirmación Explícita

Mediante este rediseño de testing: estabilización de esperas basándose en el DOM, adición de _data-testids_ dedicados, validación precisa con variables controladas, el test es repetible de forma robusta.

*Nota Semántica*: Todo el pipeline E2E y esta documentación de cierre han sido estandarizados para utilizar la terminología oficial de producto ("Señales", "Interacción de Señal"), asegurando que no quedan residuos semánticos relevantes de "voto" en la suite de pruebas. Sin embargo, **persisten contratos técnicos legacy con el naming `Vote` (ej. `onVote`, `handleVote`, `VoteResult`) en componentes estabilizados del motor `VersusGame`**, los cuales fueron dejados explícitamente intactos por compatibilidad y estabilidad estructural.

**¡Declaro el Paso 1 de la Fase 3 Oficialmente CERRADO!**
