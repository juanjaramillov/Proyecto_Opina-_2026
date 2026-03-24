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
                        top: clickPosition.y - 20,
                        left: clickPosition.x - 60,
                        scale: 0.5
                    }}
                    animate={{
                        opacity: [1, 1, 0],
                        top: clickPosition.y - 60,
                        scale: [0.8, 1, 0.8]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="fixed z-[999] pointer-events-none drop-shadow-xl"
                >
                    <div
                        className="text-white font-black text-sm md:text-base px-4 py-1.5 rounded-full border-2 border-white/90 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform -rotate-[6deg] whitespace-nowrap overflow-hidden bg-gradient-to-r from-primary to-emerald-500 flex items-center gap-1.5 backdrop-blur-md relative"
                    >
                        <div className="absolute inset-0 bg-white/20 w-1/2 -skew-x-12 translate-x-full animate-[shimmer_1s_infinite]" />
                        <span className="material-symbols-outlined text-[18px] md:text-[20px] font-black drop-shadow-sm">electric_bolt</span>
                        <span className="drop-shadow-sm">¡Opinión Registrada!</span>
                    </div>
                    <div className="absolute inset-0 bg-white opacity-30 blur-lg rounded-full animate-pulse" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VersusFeedbackOverlay;
