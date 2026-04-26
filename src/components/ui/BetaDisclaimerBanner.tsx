import { useState } from "react";

export interface BetaDisclaimerBannerProps {
    /**
     * Slug corto del módulo (e.g. 'lugares', 'servicios'). Se usa como key
     * para recordar la preferencia de descarte del usuario en localStorage.
     *
     * F-10 reviewed: localStorage acceptable — es solo una preferencia de UI
     * ("usuario ya cerró este banner para este módulo"), sin PII ni secretos.
     */
    moduleSlug: string;
    /**
     * Título corto mostrado al usuario (e.g. "Lugares está en Beta").
     */
    title: string;
    /**
     * Mensaje honesto sobre el estado real del módulo. Debe explicar
     * qué funciona, qué aún no, y qué esperar.
     */
    message: string;
    /**
     * Si `true`, el usuario puede descartar el banner (se persiste por moduleSlug).
     * Default: true.
     */
    dismissible?: boolean;
}

const STORAGE_KEY_PREFIX = "opina_beta_banner_dismissed:";

/**
 * Banner transparente que advierte al usuario que está usando un módulo en Beta.
 * Preferimos claridad ("tu evaluación se guarda localmente, la agregación pública
 * llega pronto") sobre marketing inflado ("¡Inteligencia colectiva!").
 */
export function BetaDisclaimerBanner({
    moduleSlug,
    title,
    message,
    dismissible = true
}: BetaDisclaimerBannerProps) {
    const storageKey = `${STORAGE_KEY_PREFIX}${moduleSlug}`;

    const [dismissed, setDismissed] = useState<boolean>(() => {
        try {
            return localStorage.getItem(storageKey) === "1";
        } catch {
            return false;
        }
    });

    if (dismissed) return null;

    const handleDismiss = () => {
        try {
            localStorage.setItem(storageKey, "1");
        } catch {
            // noop — si no podemos persistir, al menos ocultamos en la sesión
        }
        setDismissed(true);
    };

    return (
        <div
            role="status"
            aria-label={title}
            className="w-full rounded-2xl border border-warning-200 bg-warning-50/90 px-4 py-3 md:px-5 md:py-4 flex items-start gap-3 shadow-sm"
        >
            <span className="material-symbols-outlined text-warning-600 text-[22px] shrink-0 mt-0.5">
                science
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm md:text-[15px] font-black text-warning-900 leading-tight">
                    {title}
                </p>
                <p className="mt-1 text-[13px] md:text-sm text-warning-800/90 leading-snug font-medium">
                    {message}
                </p>
            </div>
            {dismissible && (
                <button
                    type="button"
                    onClick={handleDismiss}
                    aria-label="Cerrar aviso"
                    className="shrink-0 rounded-lg px-2 py-1 text-warning-800 hover:bg-warning-100 transition-colors active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
            )}
        </div>
    );
}

export default BetaDisclaimerBanner;
