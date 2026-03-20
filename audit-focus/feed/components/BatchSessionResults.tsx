import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Battle } from "../../signals/types";
import { NextActionRecommendation, ActionType } from '../../../components/ui/NextActionRecommendation';
import { useAuth } from "../../auth";
import { useSignalStore } from "../../../store/signalStore";

export interface BatchSessionResultRecord {
    battle: Battle;
    myVote: 'A' | 'B';
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

    if (!showBatchResults) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => { onClose(); navigate("/results", { state: { batchIndex } }); }}
                    className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white rounded-[32px] p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
                >
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-3xl">task_alt</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-ink"><span className="text-gradient-brand">Resultados</span> de tu sesión</h2>
                        <p className="text-slate-500 font-medium mt-2">
                            Aportaste <span className="font-bold text-emerald-600">{batchSessionHistory.length} señales</span>. Así se comparan tus decisiones.
                        </p>
                    </div>

                    <div className="space-y-3 mb-6">
                        {batchSessionHistory.map((h, i) => {
                            const votedOption = h.myVote === 'A' ? h.battle.options[0] : h.battle.options[1];
                            const opponentOption = h.myVote === 'A' ? h.battle.options[1] : h.battle.options[0];

                            return (
                                <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all">
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{h.battle.title}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900">{votedOption?.label || "Opción"}</span>
                                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Tu Voto</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                                        <span>vs</span>
                                        <span className="text-slate-600 line-through decoration-slate-300">{opponentOption?.label || "Opción"}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4">
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
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
