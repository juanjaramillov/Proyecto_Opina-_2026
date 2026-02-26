import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { accessGate } from "../../features/access/services/accessGate";

export default function FeedbackFab() {
    const location = useLocation();

    const enabled = import.meta.env.VITE_FEEDBACK_WHATSAPP_ENABLED !== "false";

    // Número desde env (PROD). En DEV/preview usamos fallback para que lo veas.
    const waFromEnv = (import.meta.env.VITE_FEEDBACK_WHATSAPP_NUMBER as string | undefined) || "";
    const waFallback = import.meta.env.DEV ? "56991284219" : "";
    const waNumber = waFromEnv || waFallback;

    const message = useMemo(() => {
        const tokenId = accessGate.getTokenId() ?? "NO_TOKEN";
        const url = window.location.href;
        const ts = new Date().toISOString();

        const text =
            `Opina+ | Feedback\n` +
            `token: ${tokenId}\n` +
            `url: ${url}\n` +
            `ts: ${ts}\n` +
            `\n` +
            `Tipo (elige 1 número):\n` +
            `1) Bug/Error\n` +
            `2) Idea/Feature\n` +
            `3) UX/UI\n` +
            `4) Resultados/Datos\n` +
            `5) Rendimiento/Lento\n` +
            `6) Otro\n` +
            `\n` +
            `Severidad (si es bug): B | M | A\n` +
            `\n` +
            `Resumen (1 frase):\n` +
            `- \n` +
            `\n` +
            `Pasos para reproducir:\n` +
            `1) \n` +
            `2) \n` +
            `3) \n` +
            `\n` +
            `Esperado:\n` +
            `- \n` +
            `Actual:\n` +
            `- \n` +
            `\n` +
            `Extra (opcional): link/captura/video\n` +
            `- `;

        return text;
    }, []);

    // En admin no mostramos el FAB
    if (location.pathname.startsWith("/admin")) return null;
    if (!enabled || !waNumber) return null;

    const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

    const handleFeedbackClick = async () => {
        try {
            await navigator.clipboard.writeText(message);
        } catch (err) {
            console.error('Failed to copy feedback text to clipboard', err);
        }
        window.open(href, "_blank");
    };

    return (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[90]">
            <button
                type="button"
                onClick={handleFeedbackClick}
                className="h-14 w-14 rounded-full shadow-xl shadow-emerald-100 bg-[#25D366] hover:opacity-95 active:scale-95 transition-all flex items-center justify-center focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30"
                aria-label="Enviar feedback por WhatsApp"
                title="Feedback por WhatsApp"
            >
                <span className="material-symbols-rounded text-white text-[30px] leading-none">chat</span>
            </button>
        </div>
    );
}
