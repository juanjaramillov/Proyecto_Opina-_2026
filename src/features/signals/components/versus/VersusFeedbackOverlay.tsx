import { motion, AnimatePresence } from 'framer-motion';

interface VersusFeedbackOverlayProps {
    clickPosition: { x: number; y: number } | null;
    theme?: { primary: string; accent: string; bgGradient: string; icon: string };
}

export function VersusFeedbackOverlay({ clickPosition }: VersusFeedbackOverlayProps) {
    return (
        <AnimatePresence>
            {clickPosition && (
                <motion.div
                    key="feedback-overlay"
                    initial={{
                        opacity: 0,
                        top: clickPosition.y - 12,
                        left: clickPosition.x - 24, // Centrado (width es 48px)
                        scale: 0.5
                    }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        top: clickPosition.y - 40,
                        scale: [0.5, 1.1, 1, 0.9]
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }} 
                    className="fixed z-[999] pointer-events-none drop-shadow-2xl"
                >
                    <div className="h-12 w-12 rounded-full bg-white/95 border border-slate-100 shadow-[0_15px_35px_rgba(0,0,0,0.15)] flex items-center justify-center backdrop-blur-2xl relative overflow-hidden">
                        <div className="absolute inset-0 border-2 border-accent-400/20 rounded-full animate-pulse" />
                        <span className="material-symbols-outlined text-[28px] font-black text-accent drop-shadow-sm">check</span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VersusFeedbackOverlay;
