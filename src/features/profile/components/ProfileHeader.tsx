import { PowerStats } from '../../identity/hooks/useIdentityEngine';

interface ProfileHeaderProps {
    archetype: string;
    level: number;
    progressPercentage: number;
    completedSignals: number;
    powerStats: PowerStats;
    isLocked: boolean;
    onContinue: () => void;
    onViewResults: () => void;
}

export function ProfileHeader({
    archetype,
    level,
    progressPercentage,
    completedSignals,
    powerStats,
    isLocked,
    onContinue,
    onViewResults
}: ProfileHeaderProps) {
    return (
        <section className="card p-6 lg:p-8 shadow-sm flex flex-col md:flex-row gap-8 bg-gradient-to-br from-white to-blue-50/30 border border-primary/10 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
            
            <div className="flex-1 flex flex-col justify-center relative z-10">
                <div className="flex items-start gap-5 mb-8">
                    {/* Visual Level Ring (B2C) */}
                    <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-surface2" />
                            <circle 
                                cx="50" cy="50" r="46" 
                                fill="transparent" stroke="url(#impact-gradient)" 
                                strokeWidth="8" strokeLinecap="round"
                                strokeDasharray={`${progressPercentage * 2.89} 289`}
                                className="transition-all duration-1000 ease-out"
                            />
                            <defs>
                                <linearGradient id="impact-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#4F46E5" />
                                    <stop offset="100%" stopColor="#10B981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-xl text-primary drop-shadow-sm">local_fire_department</span>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight mb-1">
                            {archetype}
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="badge bg-ink text-white font-black uppercase tracking-widest text-[10px] px-2 py-0.5">Nivel {level}</span>
                            <span className="text-xs font-bold text-text-muted">Impacto Biográfico</span>
                        </div>
                    </div>
                </div>

                {/* ACTION CTA */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                        onClick={onContinue}
                        className="btn-primary w-full sm:w-auto h-12 flex items-center justify-center gap-2 shadow-sm font-black text-sm px-6"
                    >
                        <span className="material-symbols-outlined text-[18px]">{isLocked ? 'lock' : 'add_circle'}</span>
                        {isLocked ? 'Completar Perfil' : 'Aportar Señales'}
                    </button>
                    {!isLocked && (
                        <button onClick={onViewResults} className="btn-secondary w-full sm:w-auto h-12 flex items-center justify-center gap-2 font-bold text-sm px-6 bg-white border border-stroke">
                            <span className="material-symbols-outlined text-[18px]">monitoring</span>
                            Ver Resultados
                        </button>
                    )}
                </div>
            </div>

            <div className="w-full md:w-56 shrink-0 flex flex-col gap-3 relative z-10">
                <div className="bg-white border border-stroke rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Señales Emitidas</span>
                    <span className="text-3xl font-black text-ink tracking-tighter">{completedSignals.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border text-center border-stroke rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Accuracy</span>
                        <span className="text-xl font-black text-ink">{Math.round(powerStats.accuracy * 100)}%</span>
                    </div>
                    <div className="bg-white border text-center border-stroke rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-secondary mb-1">Racha</span>
                        <span className="text-xl font-black text-ink flex items-center gap-0.5">
                            {powerStats.streakDays} <span className="material-symbols-outlined text-sm text-secondary">local_fire_department</span>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProfileHeader;
