import { motion, AnimatePresence } from 'framer-motion';

interface GuestConversionModalProps {
    onClose: () => void;
    onRegister: () => void;
    isOpen: boolean;
}

export function GuestConversionModal({ onClose, onRegister, isOpen }: GuestConversionModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
                >
                    {/* Header Banner */}
                    <div className="bg-gradient-to-br from-primary-500 to-secondary-600 p-8 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8" />

                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30 text-white">
                                <span className="material-symbols-rounded text-3xl">verified</span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight mb-2">Haz oficial tu opinión</h2>
                            <p className="text-primary-100 text-sm font-medium">
                                Has estado construyendo señal valiosa. Regístrate para reclamar tus niveles.
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-rounded text-sm font-bold">save</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Protege tu historial</h4>
                                    <p className="text-slate-500 text-xs mt-1">
                                        No pierdas las decisiones que ya tomaste. Tu participación previa será transferida.
                                    </p>
                                </div>
                            </li>

                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-rounded text-sm font-bold">trending_up</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Gana OpinaScore</h4>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Tu opinión validada tiene un mayor impacto en las tendencias de mercado globales.
                                    </p>
                                </div>
                            </li>

                            <li className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="material-symbols-rounded text-sm font-bold">leaderboard</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">Sube de Nivel</h4>
                                    <p className="text-slate-500 text-xs mt-1">
                                        Empieza a ver tu progreso real como Analista Estratégico oficial de Opina+.
                                    </p>
                                </div>
                            </li>
                        </ul>

                        <div className="space-y-3">
                            <button
                                onClick={onRegister}
                                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-900/20"
                            >
                                Registrarme Gratis
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-slate-500 font-bold text-sm hover:text-slate-700 transition-colors"
                            >
                                Seguir como invitado
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
