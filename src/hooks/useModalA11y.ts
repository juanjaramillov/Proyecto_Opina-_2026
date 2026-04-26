import { useEffect, useRef } from "react";

/**
 * useModalA11y — accesibilidad básica para componentes modales.
 *
 * Introducido en Fase 5.2 para cerrar tres gaps recurrentes en los modales
 * B2C del proyecto:
 *   1. **Escape para cerrar**: WCAG 2.1.1 (Keyboard) + patrón WAI-ARIA dialog.
 *      Sin esto, un usuario que no puede usar mouse queda atrapado si el botón
 *      "cerrar" no está en el flujo de tab visible.
 *   2. **Restaurar foco al cerrar**: cuando un modal se desmonta, el foco
 *      visible se pierde y salta al `<body>`, lo cual descoloca al lector de
 *      pantalla y al usuario de teclado. Guardamos `document.activeElement`
 *      al montar y lo restauramos al desmontar.
 *   3. **Foco inicial**: cuando el modal se abre, mueve el foco a su
 *      contenedor para que las ayudas técnicas anuncien el diálogo.
 *
 * Deliberadamente NO implementa focus trap completo: eso requiere enumerar
 * todos los focusables del subtree en cada render, lo cual es una librería
 * aparte (`focus-trap-react`). Para el scope actual — modales chicos con
 * <10 focusables — el comportamiento nativo + escape key cubre el 95% del
 * uso real. Cuando se sume un formulario complejo a un modal, envolver con
 * `focus-trap-react` es la evolución natural.
 *
 * Uso:
 * ```tsx
 * const containerRef = useModalA11y({ isOpen, onClose });
 * return <div ref={containerRef} role="dialog" aria-modal="true" aria-labelledby="...">...</div>;
 * ```
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>({
    isOpen,
    onClose,
    skipInitialFocus = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    /** Si true, no mueve el foco al contenedor. Útil cuando el modal contiene
     * un input que debería recibir foco por su cuenta. Default false. */
    skipInitialFocus?: boolean;
}) {
    const containerRef = useRef<T | null>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Escape para cerrar.
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Guarda el foco previo al abrir y lo restaura al cerrar/desmontar.
    useEffect(() => {
        if (!isOpen) return;
        previousFocusRef.current = (document.activeElement as HTMLElement) ?? null;
        if (!skipInitialFocus && containerRef.current) {
            // Tabindex -1 permite focus programático sin meter el contenedor
            // en el orden de tabulación natural.
            containerRef.current.setAttribute("tabindex", "-1");
            containerRef.current.focus({ preventScroll: true });
        }
        return () => {
            const prev = previousFocusRef.current;
            if (prev && typeof prev.focus === "function") {
                // preventScroll evita que la página salte visualmente al
                // restaurar foco en un elemento fuera del viewport.
                try { prev.focus({ preventScroll: true }); } catch { /* noop */ }
            }
        };
    }, [isOpen, skipInitialFocus]);

    return containerRef;
}
