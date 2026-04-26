# Pasos pendientes · Local

Este documento consolida lo que **tú** debes correr localmente — fuera del
sandbox donde se hizo el trabajo — para cerrar de manera oficial lo avanzado
en las Fases 2.x, 3.x, 4.x y 5.x (ver `DEBT_REGISTER.md` para contexto por
fase).

El sandbox donde se trabajó no puede ejecutar `npm run test:run` ni
`npm run build` completo porque falta el binario nativo
`@rollup/rollup-linux-arm64-gnu` en este entorno. **Typecheck y lint sí
corrieron y ambos están en cero errores**; los proxies de calidad más
fuertes ya pasaron. Lo de abajo es lo que falta ejecutar en tu máquina.

## 1 · Golden Rule completa

```bash
npm install          # asegura deps nativas correctas para tu plataforma
npm run typecheck    # ya validado en sandbox → esperado 0 errores
npm run lint         # ya validado en sandbox → esperado 0 warnings
npm run test:run     # Vitest suite completa — validar localmente
npm run build        # Vite production build — validar localmente
```

Si algún paso falla, el fallo más probable es:

  * **`test:run` falla por baselines visuales**: el spec `e2e/hub-visual.spec.ts`
    tiene un `test.skip()` hasta que generes las baselines. No corre en la
    suite unitaria; se activa sólo cuando corras E2E con `E2E_VISUAL=1`.
    No debería afectar `test:run`.
  * **`build` falla con error de rollup**: re-correr `npm install` suele
    resolverlo al bajar el binario correcto para tu plataforma (Apple
    Silicon vs Linux vs Windows).

## 2 · E2E Playwright

Los 8 specs deben correr en tu máquina:

```bash
npx playwright install chromium    # primera vez
npm run test:e2e                   # corre los 8 specs sin visual
```

Si querés generar/actualizar baselines visuales:

```bash
E2E_VISUAL=1 npx playwright test e2e/hub-visual.spec.ts --update-snapshots
# commit de los .png resultantes en e2e/hub-visual.spec.ts-snapshots/
```

Specs que requieren credenciales reales contra Supabase:

  * `b2c-happy-path.spec.ts` y `versus-rate-limit.spec.ts` usan
    `test_normal_user@opina.plus / TestNormal123!_seguro`.
  * `b2b-overview.spec.ts` y `b2b-reports-narrative.spec.ts` usan
    `test_admin_user@opina.plus / TestAdmin123!_seguro`.

Si tu entorno local no tiene esos usuarios, créalos antes o ajusta las
credenciales en el `.spec.ts`.

## 3 · Migración de backend (Fase 3.4 · DEBT-006)

La migración `supabase/migrations/20260422000000_debt006_backend_rate_limiting.sql`
**ya está en el repo** pero NO se aplicó automáticamente. Para activarla:

```bash
supabase db push              # si tu branch local aún no tiene la migración
# o en el dashboard:
# Database → Migrations → Run
```

Esto activa:

  * Función `enforce_signal_rate_limit(user_id, anon_id, module_type)`
    con ventana deslizante de 60s.
  * Tabla `pilot_access_attempts` + función `enforce_pilot_access_rate_limit()`
    para brute-force protection del endpoint de invitaciones.
  * `insert_signal_event` reescrito para invocar `enforce_signal_rate_limit`
    antes del cooldown por battle.

Tests de la migración: ejecutar 41+ señales rápidas consecutivas contra un
usuario de prueba → debe disparar `RATE_LIMITED` desde el servidor (el
cliente sólo captura los primeros 40). Ver `versus-rate-limit.spec.ts` como
ejemplo del shape esperado del error.

## 4 · Feature flag narrativo (Fase 5.1)

El `NarrativeProvider` default es `rule-based-v1`. Si querés experimentar
con un LLM:

  1. Implementá un `LLMNarrativeProvider` siguiendo el stub documentado en
     `src/features/b2b/engine/narrativeProvider.ts` (líneas 32–45).
  2. Llamá `setNarrativeProvider(new LLMNarrativeProvider())` desde el
     bootstrap de la app, condicionado por `import.meta.env.VITE_NARRATIVE_PROVIDER === 'llm'`.
  3. **Siempre mantené el fallback al `DefaultNarrativeProvider`** en el
     catch. Ver el ejemplo del test `narrativeProvider.test.ts` caso
     "provider custom puede delegar a DefaultNarrativeProvider como fallback".
  4. Corré evals comparando categoría del LLM vs categoría del rule-based
     sobre un corpus de entries sintéticas. Si divergen >10%, el LLM está
     alucinando.

## 5 · Sink real de observabilidad (Fase 5.3)

El `ErrorReporter` default es `ConsoleErrorReporter` (loggea al `logger`).
Para enviar errores a un servicio externo:

  1. Instalá el SDK (Sentry, Datadog, Highlight, etc.).
  2. Implementá `class MySinkReporter implements ErrorReporter` siguiendo el
     stub documentado en `src/lib/observability/errorReporter.ts` (líneas 32–55).
  3. Llamá `setErrorReporter(new MySinkReporter())` en `src/index.tsx`,
     **antes** de `installWindowErrorBridge()`. Así los errores globales ya
     van al sink desde el primer evento.
  4. Mantené el catch: el reporter **nunca debe lanzar**. Si el sink falla,
     caer a `logger.error(...)` como backup.

## 6 · Verificaciones manuales post-deploy

Una vez que corras los pasos 1–3, validar manualmente:

  * **Accesibilidad** (Fase 5.2): abrir cualquier modal B2C (login modal,
    guest conversion, profile required, batch results, wizard de lugares) y
    apretar `Escape`. Debe cerrarse. Con tabulador, ver que el foco vuelve
    al elemento que abrió el modal. Probar al menos uno con lector de
    pantalla (VoiceOver en Mac, NVDA en Windows) — la card del Hub debe
    leerse por título + "Próximamente" cuando está deshabilitada.

  * **Hub Beta** (Fase 4.3): ver badge "Beta" en los tracks lugares y
    servicios del Hub en `/`. Tocar el CTA "Avísame cuando pueda evaluar" en
    una ficha de servicio — debe abrir toast + NO emitir señal real.

  * **Reportes B2B** (Fase 4.4 + 5.1): con un usuario admin, abrir
    `/b2b/reports`. Debe mostrar "Brief Ejecutivo" con las 4 piezas
    (summary / findings / alerta crítica / recomendación estratégica). NO
    debe haber banner Beta en el tope.

  * **Outbox sync** (DEBT-007 · Fase 3.4): desconectar red desde DevTools
    → emitir 3 señales en Versus → reconectar red → ver en la pestaña
    Application → Local Storage que `opina_signal_outbox_v1` se vacía dentro
    de unos segundos (el trigger `online` dispara el flush).

## 7 · Commits y PRs

Si todo lo anterior pasa, los cambios están listos para:

```bash
git add -A
git commit -m "Fase 5: narrative LLM-ready, a11y audit, observabilidad baseline, E2E expansion"
# o varios commits más pequeños si preferís granular la revisión
```

Archivos nuevos relevantes de Fase 5:

  * `src/features/b2b/engine/narrativeProvider.ts` + `.test.ts`
  * `src/hooks/useModalA11y.ts` + `.test.ts`
  * `src/lib/observability/errorReporter.ts` + `.test.ts`
  * `src/lib/observability/windowErrorBridge.ts` + `.test.ts`
  * `e2e/hub-beta-badge.spec.ts`
  * `e2e/outbox-offline.spec.ts`
  * `e2e/b2b-reports-narrative.spec.ts`
  * `docs/NEXT_STEPS_LOCAL.md` (este archivo)

Archivos modificados para a11y y observabilidad:

  * `src/features/feed/components/VersusView.tsx`
  * `src/features/feed/components/hub/HubBentoGrid.tsx`
  * `src/features/feed/components/BatchSessionResults.tsx`
  * `src/features/feed/components/LugarSignalWizard.tsx`
  * `src/features/auth/components/RequestLoginModal.tsx`
  * `src/features/auth/components/GuestConversionModal.tsx`
  * `src/components/ProfileRequiredModal.tsx`
  * `src/components/ui/ErrorBoundary.tsx`
  * `src/components/ui/GlobalErrorBoundary.tsx`
  * `src/components/ui/ModuleErrorBoundary.tsx`
  * `src/index.tsx`
  * `src/features/b2b/hooks/useBenchmarkB2BState.ts` (Fase 5.1)
  * `src/features/b2b/utils/reportsHelpers.ts` (Fase 5.1)
  * `src/features/b2b/pages/ReportsB2B.tsx` (Fase 5.1)
  * `docs/DEBT_REGISTER.md` (secciones 2.4 Fase 5 · todas las fases)

## 8 · Qué NO se abordó (reconocido)

Para mantener el scope acotado, estas mejoras quedan explícitamente fuera
de Fase 5 — documentadas acá para que no se pierdan:

  * **Focus trap completo en modales**: el `useModalA11y` actual cubre
    escape + restauración de foco, pero no atrapa el Tab dentro del modal.
    Cuando se sume un formulario complejo (p.ej. multi-step wizard con
    10+ focusables), instalar `focus-trap-react` y envolver el subtree.


  * **Reduced motion**: varias animaciones usan `animate-[pulse_...]` hard-
    coded. Para respetar `prefers-reduced-motion`, envolver con
    `motion-reduce:animate-none` de Tailwind. No bloquea WCAG 2.1 AA — es
    AAA (2.3.3 Animation from Interactions).

  * **Audit de contraste de color**: la auditoría de Fase 5.2 fue semántica
    (ARIA, teclado, landmarks, aria-hidden). El contraste text-slate-400
    sobre bg-white (~2.9:1) aparece en varios helperTexts y está por
    debajo de AA (4.5:1). Cambiar a text-slate-500 (~4.6:1) resolvería la
    mayoría sin tocar design tokens. Candidate para Fase 6.

  * **Tests unitarios de componentes de modales**: los hooks se testean
    directamente (`useModalA11y.test.ts`), pero no hay test de render de
    `RequestLoginModal` verificando que al pasar `isOpen=true` y disparar
    Escape, `onClose` se llama. No es crítico — la integración sí está
    cubierta entre el test del hook y los E2E — pero es un hueco a cerrar
    si alguien refactoriza los modales.
