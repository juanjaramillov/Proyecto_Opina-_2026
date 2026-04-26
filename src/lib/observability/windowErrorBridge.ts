/**
 * Window Error Bridge (Fase 5.3)
 *
 * Captura dos clases de error que escapan a los ErrorBoundaries de React y
 * los envía al `ErrorReporter` activo:
 *
 *   1. **`window.onerror`**: errores síncronos arrojados fuera del render
 *      tree — event handlers imperativos, inicialización temprana, setTimeout,
 *      cualquier cosa que no está envuelta en `<ErrorBoundary>`.
 *   2. **`unhandledrejection`**: promesas rechazadas que nadie atrapa. Muy
 *      común en código async del tipo `fetch().then(...)` sin `.catch(...)`.
 *
 * ## Garantías
 *
 *  - **Idempotente**: llamar `installWindowErrorBridge()` N veces monta los
 *    listeners una sola vez. Evita duplicados en HMR o en tests que recargan
 *    el módulo.
 *  - **No interfiere con `console`**: no previene el default — el error
 *    sigue apareciendo en DevTools. Sólo lo reporta en paralelo.
 *  - **No lanza**: si el reporter falla, se traga silenciosamente (la última
 *    cosa que uno quiere es que el handler de errores tire errores).
 *
 * Se llama desde `index.tsx` al arranque.
 */

import { getErrorReporter } from "./errorReporter";

let installed = false;
let errorHandler: ((event: ErrorEvent) => void) | null = null;
let rejectionHandler: ((event: PromiseRejectionEvent) => void) | null = null;

export function installWindowErrorBridge(): void {
    if (installed) return;
    if (typeof window === "undefined") return; // SSR / tests node-only

    errorHandler = (event: ErrorEvent) => {
        try {
            getErrorReporter().captureException(event.error ?? event.message, {
                domain: "platform_core",
                origin: "window.onerror",
                action: "uncaught_sync",
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
            });
        } catch { /* noop — nunca fallar desde el handler global */ }
    };

    rejectionHandler = (event: PromiseRejectionEvent) => {
        try {
            getErrorReporter().captureException(event.reason, {
                domain: "platform_core",
                origin: "window.unhandledrejection",
                action: "uncaught_async",
            });
        } catch { /* noop */ }
    };

    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    installed = true;
}

/**
 * Desmonta los listeners. Principalmente para tests; en runtime no se llama
 * porque el bridge vive todo el lifetime de la app.
 */
export function uninstallWindowErrorBridge(): void {
    if (!installed) return;
    if (typeof window === "undefined") return;
    if (errorHandler) window.removeEventListener("error", errorHandler);
    if (rejectionHandler) window.removeEventListener("unhandledrejection", rejectionHandler);
    errorHandler = null;
    rejectionHandler = null;
    installed = false;
}

/** Expuesto para tests. */
export function isWindowErrorBridgeInstalled(): boolean {
    return installed;
}
