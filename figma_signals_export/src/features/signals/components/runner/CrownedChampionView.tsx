import { motion } from 'framer-motion';
import { BattleOption } from '../../types';
import EntityLogo from '../../../../components/entities/EntityLogo';
import { resolveEntitySlug } from '../../../../lib/entities/resolveEntitySlug';

interface Theme {
    primary: string;
    accent: string;
    bgGradient: string;
    icon: string;
}

interface CrownedChampionViewProps {
    champion: BattleOption;
    theme: Theme;
    champWins: number;
    round: number;
    defeatedOpponents: BattleOption[];
    onReplay: () => void;
}

export function CrownedChampionView({
    champion,
    theme,
    champWins,
    round,
    defeatedOpponents,
    onReplay
}: CrownedChampionViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-8 max-w-4xl mx-auto"
        >
            {/* Champion Badge */}
            <div className="relative">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, delay: 0.2 }}
                    className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white shadow-2xl border-8 border-theme-primary p-8 flex items-center justify-center relative z-20 mx-auto"
                    style={{ borderColor: theme.primary }}
                >
                    <EntityLogo
                        name={champion.label || "Campeón actual"}
                        src={champion.image_url || champion.imageUrl}
                        slug={resolveEntitySlug(champion)}
                        size="lg"
                        rounded={false}
                        className="w-full h-full border-none object-contain bg-transparent"
                    />
                </motion.div>

                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 z-10 border-4 border-dashed rounded-full scale-110"
                    style={{ borderColor: `${theme.accent}50` }}
                />

                <div className="absolute -top-6 -right-6 md:right-4 z-30 bg-slate-900 text-white w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-xl rotate-12">
                    <span className="text-[10px] font-black uppercase">Wins</span>
                    <span className="text-2xl font-black">{champWins}</span>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-4xl md:text-5xl font-black text-ink tracking-tight">
                    {champion.label} <span className="text-gradient-brand">Preferencia Sólida</span>
                </h2>
                <p className="text-lg text-slate-500 font-medium">Opción sobreviviente tras {round} decisiones consecutivas.</p>
            </div>

            {/* Decision Profile Insight */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="card card-pad text-left relative overflow-hidden group w-full"
            >
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="material-symbols-outlined text-white text-[18px]">verified</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Perfil de Decisión</span>
                </div>

                <p className="text-slate-700 font-bold leading-relaxed md:text-lg">
                    Tu preferencia sostenida es <span className="text-emerald-600 font-black">{champion.label}</span>. Tras descartar a las demás opciones, esta marca se consolida como tu elección dominante en esta iteración.
                </p>

                <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">save</span>
                        Señal Completada
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                        Proceso Anónimo
                    </div>
                </div>
            </motion.div>

            {/* Camino a la Victoria (Tournament Result) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="w-full text-left"
            >
                <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary-500">route</span>
                    Camino a la victoria
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <p className="text-sm font-bold text-slate-500 mb-4">Opciones que descartaste en este torneo:</p>
                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-max items-center">
                            {defeatedOpponents.map((opp, idx) => (
                                <div key={idx} className="flex items-center">
                                    <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden p-2 group-hover:-translate-y-1 transition-transform relative">
                                            <div className="absolute inset-0 bg-rose-500/5 mix-blend-multiply z-10" />
                                            <div className="absolute top-1 right-1 z-20">
                                                <span className="material-symbols-outlined text-[14px] text-rose-500 drop-shadow-sm font-bold">close</span>
                                            </div>
                                            <EntityLogo
                                                name={opp.label}
                                                src={opp.image_url || opp.imageUrl}
                                                slug={resolveEntitySlug(opp)}
                                                size="sm"
                                                rounded={false}
                                                className="w-full h-full border-none object-contain opacity-60 grayscale bg-transparent"
                                            />
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-600 w-20 text-center truncate">{opp.label}</span>
                                    </div>
                                    {idx < defeatedOpponents.length - 1 && (
                                        <span className="material-symbols-outlined text-slate-300 mx-2 text-sm">arrow_forward</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button
                    onClick={() => window.location.href = '/signals'}
                    className="btn-secondary w-full"
                >
                    Ver más evaluaciones
                </button>
                <button
                    onClick={onReplay}
                    className="btn-primary w-full"
                >
                    Jugar de nuevo
                </button>
            </div>
        </motion.div>
    );
}
