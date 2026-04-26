import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useModalA11y } from "./useModalA11y";

describe("useModalA11y", () => {
    let originalActive: Element | null;

    beforeEach(() => {
        originalActive = document.activeElement;
    });

    afterEach(() => {
        // Limpia cualquier elemento inyectado por el test.
        document.body.innerHTML = "";
        if (originalActive instanceof HTMLElement) {
            try { originalActive.focus(); } catch { /* noop */ }
        }
    });

    it("registra listener de Escape cuando isOpen=true y llama onClose", () => {
        const onClose = vi.fn();
        renderHook(() => useModalA11y({ isOpen: true, onClose }));

        const evt = new KeyboardEvent("keydown", { key: "Escape" });
        document.dispatchEvent(evt);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("ignora otras teclas además de Escape", () => {
        const onClose = vi.fn();
        renderHook(() => useModalA11y({ isOpen: true, onClose }));

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
        document.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("no dispara onClose si isOpen=false (listener no se monta)", () => {
        const onClose = vi.fn();
        renderHook(() => useModalA11y({ isOpen: false, onClose }));

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        expect(onClose).not.toHaveBeenCalled();
    });

    it("remueve el listener cuando isOpen pasa a false", () => {
        const onClose = vi.fn();
        const { rerender } = renderHook(
            (props: { isOpen: boolean }) => useModalA11y({ isOpen: props.isOpen, onClose }),
            { initialProps: { isOpen: true } }
        );

        rerender({ isOpen: false });
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("restaura el foco al desmontarse", () => {
        // Setup: un botón previamente enfocado.
        const btn = document.createElement("button");
        btn.textContent = "previous";
        document.body.appendChild(btn);
        btn.focus();
        expect(document.activeElement).toBe(btn);

        const onClose = vi.fn();
        const { unmount } = renderHook(() => {
            const ref = useModalA11y<HTMLDivElement>({ isOpen: true, onClose, skipInitialFocus: true });
            return ref;
        });

        // Simula que mientras el modal está abierto, el foco va a otro elemento.
        const other = document.createElement("button");
        other.textContent = "inside-modal";
        document.body.appendChild(other);
        other.focus();
        expect(document.activeElement).toBe(other);

        unmount();
        // Después de desmontar, vuelve al botón previo.
        expect(document.activeElement).toBe(btn);
    });
});
