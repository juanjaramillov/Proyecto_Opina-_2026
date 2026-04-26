import { describe, it, expect, afterEach, vi } from "vitest";
import {
    ConsoleErrorReporter,
    getErrorReporter,
    setErrorReporter,
    resetErrorReporter,
    type ErrorReporter,
} from "./errorReporter";

describe("errorReporter · default behavior", () => {
    afterEach(() => {
        resetErrorReporter();
    });

    it("getErrorReporter devuelve el ConsoleErrorReporter al inicio", () => {
        expect(getErrorReporter().name).toBe("console-v1");
    });

    it("ConsoleErrorReporter.captureException no lanza con un Error", () => {
        expect(() => ConsoleErrorReporter.captureException(new Error("boom"))).not.toThrow();
    });

    it("ConsoleErrorReporter.captureException no lanza con un string", () => {
        expect(() => ConsoleErrorReporter.captureException("fallo crudo")).not.toThrow();
    });

    it("ConsoleErrorReporter.captureException no lanza con null/undefined", () => {
        expect(() => ConsoleErrorReporter.captureException(null)).not.toThrow();
        expect(() => ConsoleErrorReporter.captureException(undefined)).not.toThrow();
    });

    it("ConsoleErrorReporter.captureMessage acepta contexto opcional", () => {
        expect(() => ConsoleErrorReporter.captureMessage("breadcrumb")).not.toThrow();
        expect(() => ConsoleErrorReporter.captureMessage("evento", { domain: "auth" })).not.toThrow();
    });
});

describe("errorReporter · swap", () => {
    afterEach(() => {
        resetErrorReporter();
    });

    it("setErrorReporter cambia el reporter activo", () => {
        const mock: ErrorReporter = {
            name: "mock-sink",
            captureException: vi.fn(),
            captureMessage: vi.fn(),
        };
        setErrorReporter(mock);
        expect(getErrorReporter().name).toBe("mock-sink");
    });

    it("un reporter inyectado recibe las capturas, no el default", () => {
        const mock: ErrorReporter = {
            name: "mock-sink",
            captureException: vi.fn(),
            captureMessage: vi.fn(),
        };
        setErrorReporter(mock);

        const err = new Error("test");
        const ctx = { domain: "signal_write" };
        getErrorReporter().captureException(err, ctx);
        getErrorReporter().captureMessage("info line", ctx);

        expect(mock.captureException).toHaveBeenCalledWith(err, ctx);
        expect(mock.captureMessage).toHaveBeenCalledWith("info line", ctx);
    });

    it("resetErrorReporter restaura el default", () => {
        setErrorReporter({
            name: "custom",
            captureException: vi.fn(),
            captureMessage: vi.fn(),
        });
        resetErrorReporter();
        expect(getErrorReporter().name).toBe("console-v1");
    });
});
