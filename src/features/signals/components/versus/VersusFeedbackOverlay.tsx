import { motion, AnimatePresence } from 'framer-motion';

interface VersusFeedbackOverlayProps {
    clickPosition: { x: number; y: number } | null;
    theme?: { primary: string; accent: string; bgGradient: string; icon: string };
}

export function VersusFeedbackOverlay({ clickPosition, theme }: VersusFeedbackOverlayProps) {
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
                        className="text-white font-black text-3xl px-4 py-2 rounded-full border-4 border-white shadow-xl transform -rotate-6 whitespace-nowrap overflow-hidden"
                        style={{ backgroundColor: theme?.primary || '#10b981' }}
                    >
                        Registrada
                    </div>
                    <div className="absolute inset-0 bg-white opacity-20 blur-md rounded-full animate-pulse" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VersusFeedbackOverlay;
