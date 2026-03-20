import { motion, AnimatePresence } from 'framer-motion';
import { BattleOption } from '../../types';

interface VersusInsightCardProps {
    selectedOption: BattleOption | null;
    momentum: any; 
}

export function VersusInsightCard({ selectedOption, momentum }: VersusInsightCardProps) {
    const percentage = momentum && selectedOption
        ? momentum.options.find((o: any) => o.id === selectedOption.id)?.percentage || 0
        : 0;

    return (
        <AnimatePresence>
            {!!selectedOption && (
                <motion.div
                    id="insight-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute bottom-6 md:bottom-12 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
                >
                    <div className="bg-white/95 border border-slate-100 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.08)] rounded-[1.75rem] p-5 md:py-6 md:px-8 flex flex-col items-center justify-center text-center max-w-sm w-full mx-auto backdrop-blur-xl">
                        {/* etiqueta */}
                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-primary-500 mb-2">
                            <span className="material-symbols-outlined text-[14px]">psychology</span>
                            Insight Rápido
                        </div>
                        
                        {/* frase principal */}
                        <h4 className="text-lg md:text-xl font-black text-slate-900 leading-tight tracking-tight mb-1.5">
                            El <span className="text-primary-600">{percentage}%</span> piensa igual que tú y eligió {selectedOption?.label}
                        </h4>
                        
                        {/* linea secundaria corta */}
                        <div className="text-xs text-slate-500 font-medium">
                            Señal respaldada por la comunidad.
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default VersusInsightCard;
