import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Battle } from "../../signals/types";
import { NextActionRecommendation, ActionType } from '../../../components/ui/NextActionRecommendation';
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";
import { useModalA11y } from "../../../hooks/useModalA11y";
import { GradientText } from "../../../components/ui/foundation";

export interface BatchSessionResultRecord {
    battle: Battle;
    mySignal: 'A' | 'B';
    pctA: number;
}

interface BatchSessionResultsProps {
    batchSessionHistory: BatchSessionResultRecord[];
    batchIndex: number;
    showBatchResults: boolean;
    onClose: () => void;
}

export default function BatchSessionResults({
    batchSessionHistory,
    batchIndex,
    showBatchResults,
    onClose
}: BatchSessionResultsProps) {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { signals } = useSignalStore();

    // Fase 5.2 — a11y: escape-to-close + restaurar foco. El "cerrar" real navega
    // a /results, así que reusamos esa acción como handler de Escape.
    const handleClose = () => { onClose(); navigate("/results", { state: { batchIndex } }); };
    const containerRef = useModalA11y<HTMLDivElement>({ isOpen: showBatchResults, onClose: handleClose });

    if (!showBatchResults) return null;

    return (
        <AnimatePresence>
            <div
                ref={containerRef}
                className="fixed inset-0 z-[100] flex items-center justify-center px-4"
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-ink/80 backdrop-blur-md"
                    aria-hidden="true"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 30 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="batch-results-title"
                    className="relative bg-white rounded-4xl p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
                >
                    <button
                        onClick={handleClose}
                        aria-label="Cerrar resumen de sesión"
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200 text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
                    </button>

                    <div className="flex flex-col items-center text-center mb-8 pt-4">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2, bounce: 0.6 }}
                            className="w-20 h-20 rounded-full bg-gradient-brand text-white flex items-center justify-center mb-6 shadow-lg shadow-brand/20"
                        >
                            <span className="material-symbols-outlined text-4xl" aria-hidden="true">check_circle</span>
                        </motion.div>
                        <h2 id="batch-results-title" className="text-3xl md:text-4xl font-black text-ink tracking-tight mb-2">¡Misión <GradientText>Cumplida</GradientText>!</h2>
                        <p className="text-slate-500 font-medium text-lg">
                            Has aportado <span className="font-bold text-slate-800">{batchSessionHistory.length} señales</span> vitales al ecosistema. Así resuenan tus decisiones:
                        </p>
                    </div>

                    <div className="space-y-4 mb-8">
                        {batchSessionHistory.map((h, i) => {
                            const isLeft = h.mySignal === 'A';
                            const votedOption = isLeft ? h.battle.options[0] : h.battle.options[1];
                            const opponentOption = isLeft ? h.battle.options[1] : h.battle.options[0];
                            
                            const pctA = typeof h.pctA === 'number' ? h.pctA : 50;
                            const myPct = isLeft ? pctA : (100 - pctA);
                            const opponentPct = 100 - myPct;
                            
                            const isMajority = myPct >= 50;

                            return (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    key={i} 
                                    className="flex flex-col gap-3 p-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-brand/5 pointer-events-none" />
                                    
                                    <div className="flex items-center justify-between z-10">
                                        <div className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">{h.battle.title}</div>
                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm border ${isMajority ? 'bg-brand/10 text-brand border-brand/20' : 'bg-warning-50 text-warning-600 border-warning-100'}`}>
                                            <span className="material-symbols-outlined text-[14px]">{isMajority ? 'groups' : 'psychology'}</span>
                                            {isMajority ? 'Consenso Público' : 'Mente Independiente'}
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3 z-10 w-full mt-1">
                                        <div className={`flex-1 w-full flex flex-col p-3 rounded-xl border ${isMajority ? 'border-brand/20 bg-brand/5' : 'border-warning-200 bg-warning-50/50'} relative overflow-hidden`}>
                                            <div 
                                                className={`absolute left-0 bottom-0 h-1.5 transition-all duration-1000 ease-out flex items-center justify-end pr-1 ${isMajority ? 'bg-gradient-brand' : 'bg-warning-400'}`}
                                                style={{ width: `${Math.max(myPct, 15)}%` }}
                                            />
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-black text-slate-900 leading-tight pr-2">{votedOption?.label}</span>
                                                <span className={`text-[11px] font-black ${isMajority ? 'text-brand' : 'text-warning-600'}`}>{Math.round(myPct)}%</span>
                                            </div>
                                            <span className={`text-[10px] font-bold ${isMajority ? 'text-brand/70' : 'text-warning-500/70'}`}>Tu Selección</span>
                                        </div>
                                        
                                        <div className="flex shrink-0 w-8 h-8 rounded-full bg-slate-100 items-center justify-center text-slate-400 font-bold text-[10px] italic">
                                            vs
                                        </div>

                                        <div className="flex-1 w-full flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50/80 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all relative overflow-hidden">
                                            <div 
                                                className="absolute left-0 bottom-0 h-1.5 transition-all duration-1000 ease-out bg-slate-300"
                                                style={{ width: `${Math.max(opponentPct, 15)}%` }}
                                            />
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-sm font-bold text-slate-500 line-through decoration-slate-300 leading-tight pr-2">{opponentOption?.label}</span>
                                                <span className="text-[11px] font-black text-slate-400">{Math.round(opponentPct)}%</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">Descartado</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4 pt-6 border-t border-slate-100"
                    >
                        <NextActionRecommendation
                            signalsEarned={batchSessionHistory.length}
                            totalSignals={signals}
                            profileCompleteness={((profile as unknown) as Record<string, number>)?.profileCompleteness || 0}
                            onAction={(action: ActionType) => {
                                onClose();
                                if (action === 'profile') {
                                    navigate('/complete-profile');
                                } else if (action === 'versus') {
                                    navigate("/signals");
                                } else if (action === 'results') {
                                    navigate("/results");
                                }
                            }}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
