import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../features/auth";

export default function FeedbackFab() {
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();
    const { profile } = useAuth();

    // Ocultar en rutas administrativas o landing limpias (opcional)
    const isHiddenRoute = location.pathname.startsWith("/admin");
    const isEnabled = import.meta.env.VITE_FEEDBACK_WHATSAPP_ENABLED !== "false";
    const wppNumber = import.meta.env.VITE_FEEDBACK_WHATSAPP_NUMBER || "56900000000";

    useEffect(() => {
        // Pequeño delay para que no aparezca de golpe al cargar
        const t = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(t);
    }, []);

    if (isHiddenRoute || !isEnabled) return null;

    const handleFeedbackClick = () => {
        // Soporte para variables en el mensaje
        let template = import.meta.env.VITE_FEEDBACK_WHATSAPP_TEMPLATE || "¡Hola Opina+! Tengo un comentario/idea: ";
        template = template.replace("{url}", window.location.href);
        template = template.replace("{path}", location.pathname);
        template = template.replace("{nickname}", profile?.demographics?.name || "Usuario anónimo");

        const text = encodeURIComponent(template);
        const url = `https://wa.me/${wppNumber}?text=${text}`;
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-6 right-6 z-[90]"
                >
                    {/* Tooltip Hover */}
                    <div className="absolute bottom-full right-0 mb-3 w-max opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none translate-y-2 group-hover:translate-y-0">
                        <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl relative">
                            Danos tu opinión
                            <div className="absolute -bottom-1 right-5 w-2 h-2 bg-slate-900 rotate-45"></div>
                        </div>
                    </div>

                    <button
                        onClick={handleFeedbackClick}
                        className="group flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#25D366]/20 active:scale-95"
                        aria-label="Enviar feedback por WhatsApp"
                    >
                        {/* Sparkle micro-animation */}
                        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                            <div className="w-[200%] h-full bg-white/20 -rotate-45 translate-y-full group-hover:-translate-y-full transition-transform duration-700 ease-in-out"></div>
                        </div>

                        <span className="material-symbols-outlined text-2xl font-bold">chat</span>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
