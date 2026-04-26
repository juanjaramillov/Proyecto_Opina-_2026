import { motion, AnimatePresence } from 'framer-motion';
import OnboardingFlow from './OnboardingFlow';
import { useModalA11y } from '../../../hooks/useModalA11y';

interface RequestLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RequestLoginModal({ isOpen, onClose, onSuccess }: RequestLoginModalProps) {
    // Fase 5.2 — a11y: escape-to-close + restaurar foco al cerrar. El
    // `role="dialog"` + `aria-modal` vive en `OnboardingFlow` (ya lo tenía),
    // así que aquí sólo agregamos el hook.
    const containerRef = useModalA11y<HTMLDivElement>({ isOpen, onClose });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                ref={containerRef}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                    aria-hidden="true"
                />

                {/* Content Container */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <OnboardingFlow onClose={onClose} onSuccess={onSuccess} />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
