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
                    initial={{
                        opacity: 1,
                        top: clickPosition.y - 40,
                        left: clickPosition.x - 40,
                        scale: 0.5
                    }}
                    animate={{
                        opacity: [1, 1, 0],
                        top: clickPosition.y - 120,
                        scale: [1, 1.2, 1]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="fixed z-[999] pointer-events-none drop-shadow-2xl"
                >
                    <div
                        className="text-white font-black text-2xl md:text-3xl px-6 py-2.5 rounded-full border-[3px] border-white/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-[8deg] whitespace-nowrap overflow-hidden bg-gradient-to-r from-primary to-emerald-500 flex items-center gap-2 backdrop-blur-md relative"
                    >
                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full animate-[shimmer_1s_infinite]" />
                        <span className="material-symbols-outlined text-[28px] md:text-[32px] font-black drop-shadow-md">electric_bolt</span>
                        <span className="drop-shadow-md">¡Opinión Registrada!</span>
                    </div>
                    <div className="absolute inset-0 bg-white opacity-40 blur-xl rounded-full animate-pulse" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VersusFeedbackOverlay;
