import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Battle, BattleOption } from '../../signals/types';
import VersusGame from '../../signals/components/VersusGame';
import { useHubSession } from '../hooks/useHubSession';
import { signalService } from '../../signals/services/signalService';
import { platformService, RecentActivity } from '../../signals/services/platformService';
import { useToast } from '../../../components/ui/useToast';
import { logger } from '../../../lib/logger';

interface HubActiveStateProps {
    battles: Battle[];
    onBatchComplete: (history: Array<{ battle: Battle; myVote: 'A' | 'B'; pctA: number; }>) => void;
}

const dynamicWords = [
    { text: "instinto", suffix: ", " },
    { text: "perspectiva", suffix: " " },
    { text: "y criterio.", suffix: "" }
];

export default function HubActiveState({ battles, onBatchComplete }: HubActiveStateProps) {
    const [visibleCount, setVisibleCount] = useState(1);
    const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);

    useEffect(() => {
        platformService.getRecentActivity().then(res => {
            if (res) setRecentActivity(res);
        });
    }, []);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        const tick = (count: number) => {
            setVisibleCount(count);
            let nextDelay = 1200; // Time between words revealing
            if (count === dynamicWords.length) nextDelay = 3000; // Hold full sentence for 3s
            else if (count === 0) nextDelay = 400; // Short wipe pause
            
            timeout = setTimeout(() => {
                const nextCount = count === dynamicWords.length ? 0 : count + 1;
                tick(nextCount);
            }, nextDelay);
        };
        
        tick(1); 
        return () => clearTimeout(timeout);
    }, []);
    const { 
        sessionSignals, 
        sessionLimit, 
        sessionProgressPercentage, 
        consumeSessionSignal,
        isUnlimited
    } = useHubSession();
    
    const { showToast } = useToast();

    // Priorizar batallas inteligentes (Weighted Shuffle)
    const battlesForQueue = useMemo(() => {
        if (!battles || battles.length === 0) return [];
        
        // Algoritmo de Matching: 60% Tensión/Relevancia, 30% Aleatoriedad (Novedad)
        // Simulamos la "Tensión" usando isHighSignal o añadiendo entropía
        const weighted = [...battles].sort((a, b) => {
            const scoreA = (a.isHighSignal ? 2 : 1) * Math.random();
            const scoreB = (b.isHighSignal ? 2 : 1) * Math.random();
            return scoreB - scoreA;
        });

        // En una sesión real podríamos asegurar que no se repitan marcas.
        return weighted.slice(0, 15);
    }, [battles]);

    const handleVote = async (battleId: string, optionId: string, opponentId: string) => {
        try {
            const b = battlesForQueue.find(x => x.id === battleId);
            const selected = b?.options.find((o: BattleOption) => o.id === optionId);
            const rejected = b?.options.find((o: BattleOption) => o.id === opponentId);

            if (b && selected && rejected) {
                await signalService.saveVersusSignal({
                    battle_uuid: battleId,
                    battle_id: b.slug || b.id,
                    battle_title: b.title,
                    selected_option_id: selected.id,
                    loser_option_id: rejected.id,
                    selected_option_name: selected.label,
                    loser_option_name: rejected.label,
                    subcategory: typeof b.category === 'object' ? b.category.slug : b.category || b.industry,
                });
            } else {
                await signalService.saveSignalEvent({ battle_id: battleId, option_id: optionId });
            }
            
            // Consumir señal en la sesión local
            consumeSessionSignal();

        } catch (err) {
            logger.error("Failed to save vote:", err);
            showToast("Error de conexión al guardar la señal", "error");
        }
        return {};
    };

    if (battlesForQueue.length === 0) {
        return (
            <div className="w-full flex items-center justify-center p-12 min-h-[400px]">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin-slow">sync</span>
                    <p className="text-slate-500 font-medium mt-4">Actualizando radar de señales...</p>
                </div>
            </div>
        );
    }

    const isGoldenHour = new Date().getHours() >= 19 && new Date().getHours() <= 22; // Hardcodeado ampliado para demos

    return (
        <div className={`w-full min-h-[80vh] md:min-h-[85vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-500 overflow-hidden md:overflow-visible`}>
            
            {/* Fondo Inmersivo (Grid Tecnológico o Dark/Light Radar) */}
            <div className={`absolute inset-0 z-0 transition-colors duration-1000 ${isGoldenHour ? 'bg-amber-50/40' : 'bg-slate-50 md:bg-transparent'}`}>
                {/* Patrón de Grid sutil estilo Blueprint */}
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#0f172a 1px, transparent 1px), linear-gradient(90deg, #0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                {/* Glow Radial central para destacar el VersusGame */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[80vh] max-h-[800px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${isGoldenHour ? 'bg-amber-500/10' : 'bg-primary/5'}`} />
            </div>

            {/* Contenido principal sobre el fondo */}
            <div className="relative z-10 flex-1 flex flex-col w-full h-full">

                {/* STICKY HEADER: Floating Session Pill */}
                <div className="sticky top-4 z-50 w-full px-4 flex justify-center pointer-events-none transition-all duration-1000">
                    <div className={`pointer-events-auto px-5 py-2.5 rounded-full backdrop-blur-xl transform-gpu border shadow-xl flex items-center gap-4 sm:gap-6 transition-colors duration-1000 ${isGoldenHour ? 'bg-amber-500/90 border-amber-400' : 'bg-white/95 border-slate-200/50'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isGoldenHour ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>
                                <span className="material-symbols-outlined text-sm font-bold animate-[spin_4s_linear_infinite]">radar</span>
                            </div>
                            <div className="flex flex-col">
                                <h3 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 leading-none ${isGoldenHour ? 'text-white' : 'text-slate-800'}`}>
                                    En Misión 
                                    {isGoldenHour && <span className="bg-white text-orange-600 text-[8px] px-1.5 py-0.5 rounded border border-orange-200 animate-pulse ml-0.5">x2 PUNTOS</span>}
                                </h3>
                                <p className={`text-[9px] font-bold mt-0.5 ${isGoldenHour ? 'text-amber-100' : 'text-slate-600'}`}>
                                    {isUnlimited ? "Modo Infinito" : `${sessionSignals} de ${sessionLimit} señales enviadas`}
                                    {isGoldenHour && " • Golden Hour 🔥"}
                                </p>
                            </div>
                        </div>

                        {!isUnlimited && (
                            <div className={`w-20 sm:w-32 h-2.5 rounded-full overflow-hidden border shadow-inner shrink-0 ${isGoldenHour ? 'bg-amber-900/30 border-amber-400/50' : 'bg-slate-100 border-slate-200'}`}>
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${isGoldenHour ? 'bg-white shadow-[0_0_10px_white]' : 'bg-gradient-brand'}`}
                                    style={{ width: `${sessionProgressPercentage}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* MAIN VERSUS CONTAINER */}
                <div className="flex-1 flex flex-col items-center justify-start p-0 md:p-6 mt-6 md:mt-8 mb-4">
                    
                    {/* Hero Title & Contexto */}
                    <div className="w-full flex flex-col items-center justify-center text-center px-4 mb-6 md:mb-10 animate-in slide-in-from-bottom-4 duration-700">
                        <div className="flex items-center justify-center gap-2 mb-3 md:mb-4 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest border border-primary/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Radar Activo
                            </span>
                            
                            {/* SOCIAL PROOF BADGE */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-emerald-500/30">
                                <span className="material-symbols-outlined text-[14px]">group</span>
                                {recentActivity ? Math.max(124, recentActivity.unique_users_last_3h * 2) : 124} usuarios en radar
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-4 flex flex-col items-center justify-center leading-[1.1] text-slate-800">
                            <span className="mb-1 sm:mb-2">Pon a prueba tu</span>
                            <div className="flex items-center justify-center min-h-[50px] sm:min-h-[60px] md:min-h-[75px] w-full gap-x-1 lg:gap-x-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl whitespace-nowrap overflow-hidden">
                                <AnimatePresence>
                                    {dynamicWords.slice(0, visibleCount).map((item, i) => (
                                        <motion.span
                                            key={`word-${i}`}
                                            initial={{ opacity: 0, y: 15, filter: "blur(8px)", scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
                                            exit={{ opacity: 0, filter: "blur(10px)", scale: 0.9, transition: { duration: 0.3 } }}
                                            transition={{ type: "spring", stiffness: 120, damping: 14 }}
                                            className="inline-flex"
                                        >
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500 pb-2">
                                                {item.text}
                                            </span>
                                            <span className="text-slate-800 whitespace-pre">
                                                {item.suffix}
                                            </span>
                                        </motion.span>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </h1>
                        <p className="text-base md:text-lg text-slate-600 font-medium max-w-xl mx-auto leading-relaxed px-4">
                            Señala tu preferencia rápida entre dos opciones. Desliza hacia abajo para descubrir diferentes formas de opinar.
                        </p>
                    </div>

                    {/* CUADRANTE VERSUS */}
                    <div className="w-full max-w-4xl flex flex-col relative shrink-0 px-2 sm:px-4 md:px-0">
                        
                        {/* Header del Cuadrante */}
                        <div className="flex flex-row items-center justify-between mb-4 md:mb-6 px-2 md:px-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                    <span className="material-symbols-outlined text-base md:text-lg">bolt</span>
                                </div>
                                <h2 className="text-lg md:text-2xl font-black text-slate-800 tracking-tight">Inicio rápido</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">En Vivo</span>
                            </div>
                        </div>

                        {/* Contenedor Físico del Juego */}
                        <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-sm shadow-slate-200/50 border border-slate-200/60 w-full min-h-[400px] md:min-h-[450px] flex flex-col relative overflow-hidden">
                            {/* Brillo Superior Sutil */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent" />
                            
                            {/* Micro Contexto Overlay */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
                                <div className="bg-blue-950/95 backdrop-blur-md transform-gpu px-5 py-2.5 rounded-full border border-blue-800/50 text-[11px] md:text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 shadow-xl opacity-0 animate-[fadeInOut_8s_ease-in-out_forwards] delay-300">
                                    <span className="material-symbols-outlined text-[16px] text-emerald-400 animate-pulse">touch_app</span>
                                    Desliza para reaccionar
                                </div>
                            </div>
                            
                            {/* VERSUS GAME COMPONENT */}
                            <div className="flex-1 w-full relative pt-2">
                                <VersusGame
                                    key="hub-active-versus"
                                    battles={battlesForQueue}
                                    onVote={handleVote}
                                    mode="classic"
                                    enableAutoAdvance={true}
                                    hideProgress={true} // Ocultamos el viejo progress bar porque tenemos el nuevo sticky
                                    isQueueFinite={true}
                                    autoNextMs={3800} // Tiempo ajustado a 3.8s para lectura del Micro-Insight
                                    onQueueComplete={onBatchComplete}
                                    isSubmitting={false}
                                    theme={{
                                        primary: "#2563EB",
                                        accent: "#10B981",
                                        bgGradient: "from-transparent to-transparent", // El card ya provee fondo
                                        icon: "bolt",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                
                {/* Indicador de Scroll para más módulos */}
                <div className="w-full flex justify-center mt-6 md:mt-8 mb-4 animate-[fadeIn_1s_ease-in-out_2s_both]">
                    <div className="flex flex-col items-center gap-2 text-slate-400/80 hover:text-primary transition-colors cursor-default">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Descubre más dinámicas abajo</span>
                        <span className="material-symbols-outlined animate-bounce text-xl">keyboard_double_arrow_down</span>
                    </div>
                </div>

            </div>
            {/* Fin contenedor main versus */}
            </div>

            <style>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    10% { opacity: 1; transform: translateY(0); }
                    80% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
}
