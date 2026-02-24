import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export default function FeedbackFab() {
    const location = useLocation();

    const enabled = import.meta.env.VITE_FEEDBACK_WHATSAPP_ENABLED !== "false";

    // Número desde env (PROD). En DEV/preview usamos fallback para que lo veas.
    const waFromEnv = (import.meta.env.VITE_FEEDBACK_WHATSAPP_NUMBER as string | undefined) || "";
    const waFallback = import.meta.env.DEV ? "56991284219" : "";
    const waNumber = waFromEnv || waFallback;

    // En admin no mostramos el FAB
    if (location.pathname.startsWith("/admin")) return null;
    if (!enabled || !waNumber) return null;

    const templateEnv = (import.meta.env.VITE_FEEDBACK_WHATSAPP_TEMPLATE as string | undefined) || "";

    const message = useMemo(() => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        const base = templateEnv.trim()
            ? templateEnv
            : `Hola! Estoy probando Opina+ y quiero reportar feedback.\n\nURL: {url}\n\nQué pasó:\n- \n\nQué esperaba:\n- \n\nDispositivo/Navegador:\n- `;

        return base
            .replaceAll("{url}", url)
            .replaceAll("{path}", location.pathname)
            .replaceAll("{nickname}", "");
    }, [location.pathname, templateEnv]);

    const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[90]">
            <button
                type="button"
                onClick={() => window.open(href, "_blank")}
                className="h-14 w-14 rounded-full shadow-xl shadow-emerald-100 bg-[#25D366] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                aria-label="Enviar feedback por WhatsApp"
                title="Feedback por WhatsApp"
            >
                <span className="material-symbols-rounded text-white text-[30px] leading-none">chat</span>
            </button>
        </div>
    );
}
