import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
    installWindowErrorBridge,
    uninstallWindowErrorBridge,
    isWindowErrorBridgeInstalled,
} from "./windowErrorBridge";
import { setErrorReporter, resetErrorReporter, type ErrorReporter } from "./errorReporter";

describe("windowErrorBridge", () => {
    const captureException = vi.fn();
    const captureMessage = vi.fn();
    const mockReporter: ErrorReporter = {
        name: "test-sink",
        captureException,
        captureMessage,
    };

    beforeEach(() => {
        captureException.mockReset();
        captureMessage.mockReset();
        setErrorReporter(mockReporter);
    });

    afterEach(() => {
        uninstallWindowErrorBridge();
        resetErrorReporter();
    });

    it("instala los listeners la primera vez", () => {
        expect(isWindowErrorBridgeInstalled()).toBe(false);
        installWindowErrorBridge();
        expect(isWindowErrorBridgeInstalled()).toBe(true);
    });

    it("es idempotente — segunda instalación no duplica listeners", () => {
        installWindowErrorBridge();
        installWindowErrorBridge();
        installWindowErrorBridge();

        // Simula un error y verifica que sólo se reporta 1 vez.
        window.dispatchEvent(new ErrorEvent("error", {
            error: new Error("dup-test"),
            message: "dup-test",
            filename: "x.js",
            lineno: 1,
            colno: 1,
        }));
        expect(captureException).toHaveBeenCalledTimes(1);
    });

    it("captura errores síncronos vía `error` event", () => {
        installWindowErrorBridge();
        const err = new Error("sync boom");

        window.dispatchEvent(new ErrorEvent("error", {
            error: err,
            message: "sync boom",
            filename: "app.js",
            lineno: 42,
            colno: 7,
        }));

        expect(captureException).toHaveBeenCalledWith(
            err,
            expect.objectContaining({
                domain: "platform_core",
                origin: "window.onerror",
                action: "uncaught_sync",
                filename: "app.js",
                lineno: 42,
                colno: 7,
            })
        );
    });

    it("captura rejecciones no manejadas de promesas", () => {
        installWindowErrorBridge();
        const reason = new Error("async boom");

        // jsdom no dispara `unhandledrejection` naturalmente, así que lo
        // disparamos manualmente — lo importante es que el listener escuche
        // el evento del tipo correcto.
        const event = new Event("unhandledrejection") as PromiseRejectionEvent;
        Object.defineProperty(event, "reason", { value: reason, configurable: true });
        Object.defineProperty(event, "promise", { value: Promise.reject(reason).catch(() => {}), configurable: true });

        window.dispatchEvent(event);

        expect(captureException).toHaveBeenCalledWith(
            reason,
            expect.objectContaining({
                domain: "platform_core",
                origin: "window.unhandledrejection",
                action: "uncaught_async",
            })
        );
    });

    it("uninstall retira los listeners — evento post-uninstall no se reporta", () => {
        installWindowErrorBridge();
        uninstallWindowErrorBridge();
        expect(isWindowErrorBridgeInstalled()).toBe(false);

        // Prevent vitest from crashing due to unhandled ErrorEvent in jsdom
        const preventCrash = (e: ErrorEvent) => e.preventDefault();
        window.addEventListener("error", preventCrash);

        window.dispatchEvent(new ErrorEvent("error", {
            error: new Error("after-uninstall"),
            message: "after-uninstall",
        }));

        window.removeEventListener("error", preventCrash);

        expect(captureException).not.toHaveBeenCalled();
    });

    it("si el reporter lanza, el handler no rompe la app", () => {
        const throwingReporter: ErrorReporter = {
            name: "broken",
            captureException: () => { throw new Error("sink exploded"); },
            captureMessage: () => { throw new Error("sink exploded"); },
        };
        setErrorReporter(throwingReporter);
        installWindowErrorBridge();

        // El dispatch no debe propagar el error de dentro del handler.
        expect(() => {
            window.dispatchEvent(new ErrorEvent("error", {
                error: new Error("original"),
                message: "original",
            }));
        }).not.toThrow();
    });
});
