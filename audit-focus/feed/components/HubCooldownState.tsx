import { useHubSession } from '../hooks/useHubSession';
import { useNavigate } from 'react-router-dom';
import { useIdentityEngine } from '../../identity/hooks/useIdentityEngine';

export default function HubCooldownState() {
    const { formattedTimeLeft, sessionSignals, sessionLimit } = useHubSession();
    const navigate = useNavigate();

    // Integración del Engine de Identidad en Tiempo Real
    const { 
        level, 
        archetype, 
        progressPercentage,
        visuals
    } = useIdentityEngine();

    return (
        <div className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden animate-in fade-in duration-500">
            {/* Soft Ambient Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
                
                {/* Radial Progress / Identity Badge */}
                <div className="relative w-48 h-48 mb-8 group">
                    {/* Pulsing ring background */}
                    <div className="absolute inset-0 rounded-full border border-slate-200/50 shadow-sm transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full -rotate-90 transform drop-shadow-md" viewBox="0 0 100 100">
                        {/* Track */}
                        <circle cx="50" cy="50" r="46" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                        {/* Progress */}
                        <circle 
                            cx="50" 
                            cy="50" 
                            r="46" 
                            fill="transparent" 
                            stroke="url(#progress-gradient)" 
                            strokeWidth="4" 
                            strokeLinecap="round"
                            strokeDasharray={`${progressPercentage * 2.89} 289`}
                            className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                            <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Central Identity Inner Core */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-2xl ${visuals.bgClass} flex items-center justify-center mb-1 ${visuals.colorClass} shadow-sm border border-white animate-in zoom-in duration-700`}>
                            <span className="material-symbols-outlined text-2xl drop-shadow-sm">{visuals.icon}</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nivel {level}</span>
                    </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest shadow-sm mb-6">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    Misión cumplida ({sessionSignals}/{sessionLimit})
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tight mb-3">
                    Batería en recarga
                </h2>
                <p className="text-slate-500 font-medium mb-10 max-w-sm">
                    Has dejado un impacto profundo hoy, <span className="text-primary font-bold">{archetype}</span>. Tus señales están siendo procesadas por la comunidad.
                </p>

                {/* The Premium Countdown Timer */}
                <div className="bg-white/80 backdrop-blur-xl border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-3xl p-6 w-full max-w-sm mb-10 transform transition-transform hover:scale-[1.02]">
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm">schedule</span> Próxima Ventana
                        </span>
                        <div className="text-4xl md:text-5xl font-display font-black text-ink tracking-tighter tabular-nums drop-shadow-sm">
                            {formattedTimeLeft || "00:00:00"}
                        </div>
                        <div className="mt-4 text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                            <span className="material-symbols-outlined text-[14px] text-amber-500">notifications_active</span> Notificarme al abrir
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/results')}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-ink text-white rounded-2xl font-black shadow-[0_10px_30px_rgba(15,23,42,0.2)] hover:bg-slate-800 hover:-translate-y-1 transition-all overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    <span className="relative z-10 text-sm tracking-wider uppercase">Ver mi impacto</span>
                    <span className="material-symbols-outlined relative z-10 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </div>
            
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}
