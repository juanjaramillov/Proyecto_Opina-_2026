
import { useSignalStore } from '../../../store/signalStore';

type Props = {
    compact?: boolean;
    className?: string; // Add className prop
};

export default function DailyMissionCard({ compact, className = '' }: Props) {
    const { dailyMission } = useSignalStore();
    const { count, goal, completed } = dailyMission || { count: 0, goal: 3, completed: false };

    const progress = Math.min(100, (count / goal) * 100);

    if (compact) {
        return (
            <div className={`bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between shadow-sm sticky top-[73px] z-10 ${className}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${completed ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <span className="material-symbols-outlined text-lg">
                            {completed ? 'check' : 'target'}
                        </span>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Misión de hoy</div>
                        <div className="text-xs font-black text-slate-900 leading-none">
                            {completed ? '¡Completada!' : `${count}/${goal} señales`}
                        </div>
                    </div>
                </div>
                {!completed && (
                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm relative overflow-hidden group ${className}`}>
            {completed && (
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-6xl text-emerald-500">celebration</span>
                </div>
            )}

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined ${completed ? 'text-emerald-500' : 'text-indigo-500'}`}>
                            {completed ? 'trophy' : 'flag'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">Misión Diaria</h3>
                    </div>
                    {completed ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Listo
                        </span>
                    ) : (
                        <span className="text-xs font-bold text-slate-500">
                            {count} / {goal}
                        </span>
                    )}
                </div>

                {!completed ? (
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            Emite {goal - count} señales más para subir de nivel.
                        </p>
                    </div>
                ) : (
                    <div>
                        <p className="text-xs text-emerald-600 font-bold">
                            ¡Misión cumplida! Vuelve mañana para mantener tu racha.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
