import { useMemo, useState } from 'react';

// Controller Imports
import SignalHUD from "../components/SignalHUD";
import RewardToast from "../../../components/ui/RewardToast";
import VersusGame from "../components/VersusGame"; // Extracted and Shared

import { BATTLES_DATA } from "../../../data/battles";
import { VP_DATA } from "../../../data/progressive_data";
import { BattleOption, ProgressiveBattle } from '../types';

// --- MAIN PAGE COMPONENT (Controller) ---
export default function Versus() {
    const [xp, setXp] = useState(62);
    const [toast, setToast] = useState<{ xp: number; signals: number } | null>(null);
    const [gameMode, setGameMode] = useState<'classic' | 'survival' | 'progressive'>('classic');
    const [selectedProgressive, setSelectedProgressive] = useState<ProgressiveBattle | null>(null);

    const shuffledProgressive = useMemo(() => {
        return [...VP_DATA].sort(() => Math.random() - 0.5);
    }, []);

    // --- INTEGRATION: Persist Real Signals ---
    const handleVote = async (battleId: string, optionId: string, opponentId: string) => {
        // 1. Optimistic UI Update (Mock percentages for feedback)
        const mockResultPromise = new Promise<Record<string, number>>((resolve) => {
            setTimeout(() => {
                const pct = 50 + Math.floor(Math.random() * 20);
                const result: Record<string, number> = {};
                result[optionId] = pct;
                if (opponentId) result[opponentId] = 100 - pct;

                setXp(p => p + 15);
                setToast({ xp: 15, signals: 1 });
                resolve(result);
            }, 300);
        });

        // 2. Real Persistence (Fire & Forget mostly, but we define the context first)
        // No esperamos esto para el feedback visual para no bloquear la UI
        import('../../../services/signalService').then(async ({ signalService }) => {
            try {
                // A. Resolver contexto (Battle + Instance + Options UUIDs)
                const context = await signalService.resolveBattleContext(battleId);

                if (!context.ok) {
                    console.warn('[Versus] Could not resolve context:', context.error);
                    return;
                }

                // B. Mappear IDs locales (strings) a UUIDs de BD usando Labels
                const localBattle = BATTLES_DATA.find(b => b.id === battleId);
                const localOption = localBattle?.options.find(o => o.id === optionId);
                const dbOption = context.options?.find(o => o.label === localOption?.label);

                // C. Persistir Evento
                await signalService.saveSignalEvent({
                    source_type: 'versus',
                    source_id: battleId, // Slug/ID local
                    title: context.title || localBattle?.title || 'Versus',
                    choice_label: localOption?.label,

                    // Contexto Relacional
                    battle_id: context.battle_id,
                    battle_instance_id: context.battle_instance_id,
                    option_id: dbOption?.id, // UUID real si existe
                    signal_weight: 1.0, // Default weight for standard votes

                    // Metadata extra
                    meta: {
                        local_option_id: optionId,
                        opponent_id: opponentId
                    }
                });

                console.log('[Versus] Signal persisted for:', battleId, 'Instance:', context.battle_instance_id);

            } catch (err) {
                console.error('[Versus] Failed to persist signal:', err);
            }
        });

        return mockResultPromise;
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <SignalHUD streak={5} level={3} xp={xp} xpToNext={120} totalSignals={28} />
            {/* Premium Styles */}
            <style>{`
        .op-hero-bg {
          background:
            radial-gradient(800px circle at 50% 10%, rgba(99,102,241,.15), transparent 45%),
            radial-gradient(700px circle at 0% 50%, rgba(34,211,238,.10), transparent 45%),
            radial-gradient(700px circle at 100% 50%, rgba(236,72,153,.10), transparent 45%),
            linear-gradient(180deg, rgba(15,23,42,.02), rgba(15,23,42,.00));
        }
        .op-grid {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
        }
        .op-grid:before {
          content: "";
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, rgba(99,102,241,.25), rgba(34,211,238,.18), rgba(236,72,153,.18));
          filter: blur(18px);
          opacity: .45;
          transform: translate3d(0,0,0);
          animation: opGlow 10s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes opGlow {
          0% { transform: translateX(-6%); opacity: .35; }
          50% { transform: translateX(6%); opacity: .55; }
          100% { transform: translateX(-6%); opacity: .35; }
        }
      `}</style>

            <div className="px-4 py-6">
                <div className="op-grid border border-stroke bg-surface shadow-premium max-w-4xl mx-auto">
                    <div className="absolute inset-0 op-hero-bg pointer-events-none" />
                    <div className="relative p-8 text-center flex flex-col items-center">
                        {/* MODE TOGGLE */}
                        <div className="relative bg-white/60 p-1.5 rounded-full flex items-center mb-6 shadow-sm border border-stroke w-fit mx-auto backdrop-blur-md scale-95 origin-center transition-all hover:scale-100">
                            <div className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r ${gameMode === 'classic' ? 'from-indigo-600 to-indigo-500 left-1.5' : 'from-amber-500 to-orange-500 left-[calc(50%+3px)]'} rounded-full shadow-lg transition-all duration-300`} />
                            <button onClick={() => setGameMode('classic')} className={`relative px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest z-10 w-40 flex items-center justify-center gap-2 transition-colors ${gameMode === 'classic' ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                                <span className="material-symbols-outlined text-base">swords</span> Versus
                            </button>
                            <button onClick={() => { setGameMode('progressive'); setSelectedProgressive(null); }} className={`relative px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-widest z-10 w-40 flex items-center justify-center gap-2 transition-colors ${gameMode === 'progressive' ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                                <span className="material-symbols-outlined text-base">emoji_events</span> Torneo
                            </button>
                        </div>

                        <h1 className="font-extrabold text-ink tracking-tight leading-none text-3xl md:text-5xl mb-3">
                            {gameMode === 'classic' ? '¿Eres ' : '¿Eres '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 animate-gradient-x">
                                {gameMode === 'classic' ? 'mayoría?' : 'invencible?'}
                            </span>
                        </h1>
                        <p className="text-base md:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed font-semibold tracking-tight opacity-90">
                            {gameMode === 'classic' ? "Pon a prueba tu sentido común." : "Lleva tu favorito hasta el final."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="pt-2">
                {gameMode === 'progressive' && !selectedProgressive ? (
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {shuffledProgressive.map((vp) => (
                                <button key={vp.id} onClick={() => setSelectedProgressive(vp)} className="group relative overflow-hidden rounded-3xl bg-white border border-stroke shadow-sm hover:shadow-xl hover:border-amber-400 hover:-translate-y-1 transition-all duration-300 text-left">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><span className="material-symbols-outlined text-8xl">emoji_events</span></div>
                                    <div className="p-8 relative z-10">
                                        <div className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">{vp.industry || 'Torneo'}</div>
                                        <h3 className="text-2xl font-black text-ink mb-1 group-hover:text-amber-600 transition-colors">{vp.title}</h3>
                                        <div className="flex items-center gap-2 text-text-secondary text-sm font-medium"><span className="material-symbols-outlined text-base">swords</span><span>{vp.candidates.length - 1} Rondas</span></div>
                                    </div>
                                    <div className="bg-surface2 p-4 flex items-center justify-between group-hover:bg-amber-50 transition-colors">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {vp.candidates.slice(0, 3).map((c: BattleOption, i: number) => (
                                                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white ${c.bgColor || 'bg-gray-400'}`}>
                                                    {c.type === 'image' || c.type === 'brand' ? (c.imageUrl ? <img src={c.imageUrl} alt="" className="w-full h-full object-cover rounded-full" /> : c.label[0]) : <span className="material-symbols-outlined text-xs">{c.icon || 'circle'}</span>}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="material-symbols-outlined text-amber-500 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <VersusGame
                        battles={BATTLES_DATA.filter(b => b.options && b.options.length >= 2)}
                        onVote={handleVote}
                        mode={gameMode}
                        autoNextMs={1500}
                        progressiveData={gameMode === 'progressive' ? (selectedProgressive || shuffledProgressive[0]) : undefined}
                        onProgressiveComplete={() => {
                            setToast({ xp: 500, signals: 10 });
                            setTimeout(() => { setGameMode('classic'); setSelectedProgressive(null); }, 3000);
                        }}
                    />
                )}
            </div>

            {toast && <RewardToast show={true} xp={toast.xp} signals={toast.signals} onDone={() => setToast(null)} />}
        </div>
    );
}
