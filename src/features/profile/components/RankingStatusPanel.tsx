import { UserRanking } from '../services/profileService';

interface RankingStatusPanelProps {
    ranking: UserRanking | null;
    loading?: boolean;
}

export default function RankingStatusPanel({ ranking, loading }: RankingStatusPanelProps) {
    if (loading) {
        return (
            <div className="card p-6 lg:p-8 animate-pulse shadow-sm flex flex-col gap-4">
                <div className="h-6 w-1/3 bg-surface2 rounded-lg"></div>
                <div className="h-12 w-2/3 bg-surface2 rounded-xl mt-2"></div>
                <div className="h-4 w-1/2 bg-surface2 rounded-lg mt-1"></div>
            </div>
        );
    }

    if (!ranking) {
        return null;
    }

    // Interpretation logic based on percentile
    let statusContext = "Estás construyendo tu estatus en la red.";
    let badgeColor = "bg-surface2 text-text-secondary border-stroke";
    let badgeIcon = "military_tech";
    let badgeName = "Observador";

    if (ranking.percentile <= 5) {
        statusContext = "Perteneces a la élite absoluta de la red.";
        badgeColor = "bg-primary/10 text-primary border-primary/20";
        badgeIcon = "workspace_premium";
        badgeName = "Élite";
    } else if (ranking.percentile <= 15) {
        statusContext = "Estás entre los informantes de más alta fidelidad y alcance.";
        badgeColor = "bg-secondary/10 text-secondary border-secondary/20";
        badgeIcon = "star";
        badgeName = "Avanzado";
    } else if (ranking.percentile <= 35) {
        statusContext = "Tu constancia supera al promedio ampliamente.";
        badgeColor = "bg-secondary/5 text-secondary border-stroke";
        badgeIcon = "trending_up";
        badgeName = "Destacado";
    } else if (ranking.percentile <= 60) {
        statusContext = "Tus señales son una parte sólida de la base rítmica de Opina+.";
        badgeColor = "bg-primary/5 text-primary border-stroke";
        badgeIcon = "radar";
        badgeName = "Fijo";
    }

    return (
        <section className="card p-6 lg:p-8 shadow-sm relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-sm font-black text-ink uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">stacked_bar_chart</span>
                        Tu Posición Global
                    </h3>
                    <div className="px-3 py-1.5 bg-surface2 rounded-full border border-stroke text-[10px] font-black uppercase tracking-widest text-text-muted">
                        Reputación: <span className="text-ink ml-1">{Math.floor(ranking.reputation_score).toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-end gap-3 mb-2">
                            <div className="text-4xl md:text-5xl font-black text-ink tracking-tighter leading-none">
                                Top {Math.max(1, Math.round(ranking.percentile))}%
                            </div>
                        </div>
                        <p className="text-text-secondary font-medium text-sm leading-relaxed max-w-md mt-4">
                            <span className="text-ink font-bold block mb-1">{statusContext}</span>
                            Tu posición actual es la <strong className="text-primary font-black">#{ranking.position.toLocaleString()}</strong> entre {ranking.total_users.toLocaleString()} usuarios activos. Calculado ponderando tu volumen histórico y la completitud de tu perfil.
                        </p>
                    </div>

                    <div className="shrink-0 pt-4 md:pt-0">
                        <div className="w-full md:w-32 md:h-32 rounded-3xl bg-surface2 flex flex-col items-center justify-center p-4 border border-stroke shadow-inner group-hover:shadow-md transition-shadow duration-500 bg-white">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm mb-3 border ${badgeColor}`}>
                                <span className="material-symbols-outlined text-[24px]">{badgeIcon}</span>
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted text-center leading-tight">Nivel<br /><span className="text-ink text-xs">{badgeName}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
