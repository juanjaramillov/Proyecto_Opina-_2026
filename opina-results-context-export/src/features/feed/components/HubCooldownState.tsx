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
        visuals
    } = useIdentityEngine();

    return (
        <div className="w-full max-w-3xl mx-auto my-6 md:my-10 p-8 md:p-12 relative flex flex-col items-center justify-center bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* Soft Ambient Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] pointer-events-none -justify-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-400/10 rounded-full blur-[80px]" />
                <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-blue-400/5 rounded-full blur-[60px]" />
            </div>

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
                
                {/* Light Dynamic Illustration (Pulse Radar) */}
                <div className="relative w-20 h-20 md:w-24 md:h-24 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30 duration-1000" />
                    <div className="absolute inset-1.5 bg-emerald-50 rounded-full animate-pulse" />
                    <div className="relative w-12 h-12 md:w-14 md:h-14 bg-white rounded-full border border-emerald-100 shadow-sm flex items-center justify-center z-10 text-emerald-500">
                        <span className="material-symbols-outlined text-[24px] md:text-[28px]">radar</span>
                    </div>
                </div>

                {/* Badges de Identidad y Misión Compactos */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm`}>
                        <span className="material-symbols-outlined text-[14px]">{visuals.icon}</span>
                        Nivel {level} • {archetype}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        {sessionSignals}/{sessionLimit} procesadas
                    </div>
                </div>

                {/* Main Message */}
                <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-2">
                    Tu señal ya entró al radar
                </h2>
                <p className="text-sm md:text-base text-slate-600 font-medium mb-8 max-w-sm">
                    La comunidad está procesando esta ronda. Misión cumplida. Sigue explorando.
                </p>

                {/* Secondary Compact Timer */}
                <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 text-slate-700 font-bold text-sm">
                    <span className="material-symbols-outlined text-[18px] text-slate-500">schedule</span>
                    Siguiente ventana: <span className="text-emerald-600 font-black tabular-nums tracking-tight text-lg">{formattedTimeLeft || "00:00:00"}</span>
                </div>

                {/* Primary CTA: Explorar Grid */}
                <button 
                    onClick={() => {
                        const tracks = document.getElementById('hub-tracks');
                        if (tracks) {
                            tracks.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}
                    className="group relative inline-flex items-center justify-center gap-3 w-full md:w-auto px-8 py-3.5 bg-ink text-white rounded-xl font-bold hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(15,23,42,0.15)] mb-3"
                >
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    Explorar dinámicas
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-y-1 transition-transform ml-[-4px]">arrow_downward</span>
                </button>

                {/* Secondary CTA: Impacto */}
                <button 
                    onClick={() => navigate('/results')}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs md:text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors rounded-xl group"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">bar_chart</span>
                    Ver resultados
                </button>
            </div>
        </div>
    );
}
