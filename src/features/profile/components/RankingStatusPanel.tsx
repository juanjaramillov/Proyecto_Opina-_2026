import { UserRanking } from '../services/profileService';

interface RankingStatusPanelProps {
    ranking: UserRanking | null;
    loading?: boolean;
}

export default function RankingStatusPanel({ ranking, loading }: RankingStatusPanelProps) {
    if (loading) {
        return (
            <div className="bg-slate-900 rounded-[2rem] p-6 lg:p-8 animate-pulse border border-slate-800 flex flex-col gap-4">
                <div className="h-6 w-1/3 bg-slate-800 rounded-lg"></div>
                <div className="h-12 w-2/3 bg-slate-800 rounded-xl mt-2"></div>
                <div className="h-4 w-1/2 bg-slate-800 rounded-lg mt-1"></div>
            </div>
        );
    }

    // If we don't have ranking data yet, but are not loading, show a sensible empty state or nothing
    if (!ranking) {
        return null;
    }

    // Interpretation logic based on percentile
    let statusContext = "Estás construyendo tu estatus en la red.";
    let badgeColor = "from-slate-600 to-slate-500";
    let badgeIcon = "military_tech";
    let badgeName = "Observador";

    if (ranking.percentile <= 5) {
        statusContext = "Perteneces a la élite absoluta de la plataforma.";
        badgeColor = "from-primary-600 to-emerald-500";
        badgeIcon = "workspace_premium";
        badgeName = "Élite";
    } else if (ranking.percentile <= 15) {
        statusContext = "Estás entre los informantes de más alta fidelidad y alcance.";
        badgeColor = "from-primary-500 to-primary-400";
        badgeIcon = "star";
        badgeName = "Avanzado";
    } else if (ranking.percentile <= 35) {
        statusContext = "Tu constancia supera al promedio ampliamente.";
        badgeColor = "from-emerald-600 to-emerald-500";
        badgeIcon = "trending_up";
        badgeName = "Destacado";
    } else if (ranking.percentile <= 60) {
        statusContext = "Tus señales son una parte sólida de la base rítmica de Opina+.";
        badgeColor = "from-blue-600 to-blue-500";
        badgeIcon = "radar";
        badgeName = "Fijo";
    }

    return (
        <section className="bg-slate-900 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden group">
            {/* Background glow effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -z-0 group-hover:bg-primary-500/20 transition-all duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl -z-0"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">stacked_bar_chart</span>
                        Tu Posición Global
                    </h3>
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
                        Reputación: {Math.floor(ranking.reputation_score).toLocaleString()}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-end gap-3 mb-2">
                            <div className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                                Top {Math.max(1, Math.round(ranking.percentile))}%
                            </div>
                        </div>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-md">
                            <span className="text-slate-300 font-bold block mb-1">{statusContext}</span>
                            Tu posición actual es la <strong className="text-white">#{ranking.position.toLocaleString()}</strong> entre {ranking.total_users.toLocaleString()} usuarios activos. Calculado ponderando tu volumen histórico y la completitud de tu perfil.
                        </p>
                    </div>

                    <div className="shrink-0">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-slate-800/80 backdrop-blur-sm flex flex-col items-center justify-center p-3 border border-slate-700/50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badgeColor} flex items-center justify-center shadow-lg mb-2`}>
                                <span className="material-symbols-outlined text-white text-[24px]">{badgeIcon}</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center leading-tight">Nivel<br /><span className="text-white text-xs">{badgeName}</span></p>
                        </div>
                    </div>
                </div>

                {/* Subtle horizontal rule or footer context can go here if needed later */}
            </div>
        </section>
    );
}
