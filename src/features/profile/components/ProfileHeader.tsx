import { PowerStats } from '../../identity/hooks/useIdentityEngine';
import { GradientCTA, GradientText } from '../../../components/ui/foundation';

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
        <section className="card p-6 lg:p-8 shadow-sm flex flex-col md:flex-row gap-8 bg-gradient-to-br from-white to-brand-50/30 border border-brand/10 overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
            
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
                                    <stop offset="0%" stopColor="#2563EB" />
                                    <stop offset="100%" stopColor="#10B981" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="material-symbols-outlined text-xl text-brand drop-shadow-sm">local_fire_department</span>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">
                            <GradientText>{archetype}</GradientText>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="badge bg-ink text-white font-black uppercase tracking-widest text-[10px] px-2 py-0.5">Nivel {level}</span>
                            <span className="text-xs font-bold text-slate-500">Impacto Biográfico</span>
                        </div>
                    </div>
                </div>

                {/* ACTION CTA */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <GradientCTA
                        label={isLocked ? 'Completar Perfil' : 'Aportar Señales'}
                        icon={isLocked ? 'lock' : 'add_circle'}
                        iconPosition="leading"
                        onClick={onContinue}
                        size="md"
                        className="w-full sm:w-auto h-12 shadow-sm"
                    />
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Señales Emitidas</span>
                    <span className="text-3xl font-black text-ink tracking-tighter">{completedSignals.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border text-center border-stroke rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand mb-1">Accuracy</span>
                        <span className="text-xl font-black text-ink">{Math.round(powerStats.accuracy * 100)}%</span>
                    </div>
                    <div className="bg-white border text-center border-stroke rounded-xl p-3 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent mb-1">Racha</span>
                        <span className="text-xl font-black text-ink flex items-center gap-0.5">
                            {powerStats.streakDays} <span className="material-symbols-outlined text-sm text-accent">local_fire_department</span>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ProfileHeader;
