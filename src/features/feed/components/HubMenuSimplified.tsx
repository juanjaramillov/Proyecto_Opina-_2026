import React from 'react';

interface HubMenuSimplifiedProps {
    onEnterVersus: () => void;
    onViewResults: () => void;
    stats: {
        active_users_24h: number;
        signals_24h: number;
        depth_answers_24h: number;
        active_battles: number;
    } | null;
    topNow: {
        top_versus: { slug: string; title: string; signals_24h: number } | null;
        top_tournament: { slug: string; title: string; signals_24h: number } | null;
    } | null;
    previewVersus: {
        id: string;
        title: string;
        category: any;
        options: any[];
    } | null;
    signalsToday: number;
    signalsLimit: number | string;
}

const AnimatedNumber = ({ value }: { value: number }) => {
    const [display, setDisplay] = React.useState(0);
    React.useEffect(() => {
        const start = display;
        const end = value;
        if (start === end) return;
        const duration = 1000;
        const startTime = performance.now();
        const run = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            setDisplay(current);
            if (progress < 1) requestAnimationFrame(run);
        };
        requestAnimationFrame(run);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return <span>{new Intl.NumberFormat("es-CL").format(display)}</span>;
};

const SparkBars24h = () => {
    const bars = [30, 45, 20, 60, 80, 40, 55, 90, 35, 50, 70, 40];
    return (
        <div className="flex items-end gap-0.5 h-6">
            {bars.map((v, i) => (
                <div
                    key={i}
                    className="w-1 bg-slate-200 rounded-t-sm"
                    style={{ height: `${v}%` }}
                />
            ))}
        </div>
    );
};

export default function HubMenuSimplified({
    onEnterVersus,
    onViewResults,
    stats,
    topNow,
    previewVersus,
    signalsToday,
    signalsLimit
}: HubMenuSimplifiedProps) {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMNA IZQUIERDA: HERO + VERSUS PREVIEW (65%) */}
                <div className="lg:col-span-8 space-y-8">
                    {/* HERO SECTION */}
                    <div className="bg-white/50 backdrop-blur-sm p-8 md:p-12 rounded-[32px] border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 flex flex-col items-end gap-1">
                            <span className="badge badge-primary bg-primary-50 text-primary-600 border-primary-100 uppercase text-[10px] font-black tracking-widest">
                                • HUB ACTIVO
                            </span>
                            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400">
                                <span>{signalsToday}</span>
                                <span className="opacity-30">/</span>
                                <span>{signalsLimit}</span>
                                <span className="ml-1 opacity-50">SEÑALES HOY</span>
                            </div>
                        </div>

                        <div className="relative z-10 space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.05]">
                                Elige tu forma <br />
                                de <span className="text-gradient-brand">señalar</span>
                            </h1>
                            <p className="text-slate-500 font-medium text-lg max-w-md">
                                Versus para decidir rápido. Profundidad para explicar. Rankings para ver cómo va la cosa.
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    onClick={onEnterVersus}
                                    className="px-8 h-14 bg-gradient-brand hover:opacity-90 text-white font-black rounded-2xl shadow-xl shadow-primary-500/20 transition-all active:scale-95 uppercase tracking-wider"
                                >
                                    Emitir una señal
                                </button>
                                <button
                                    onClick={onViewResults}
                                    className="px-8 h-14 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-95"
                                >
                                    Ver resultados
                                </button>
                            </div>
                        </div>

                        {/* Subtle background element */}
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />
                    </div>

                    {/* VERSUS PREVIEW CARD */}
                    <div className="group relative bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
                        <div className="p-8 md:p-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-slate-400">swap_horiz</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Versus</h3>
                                    <p className="text-slate-500 font-medium">Dos opciones. Una señal. Cero excusas.</p>
                                </div>
                            </div>

                            {/* PREVIEW WIDGET */}
                            <div className="bg-slate-50/50 rounded-3xl border border-slate-100 p-6 md:p-8 relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        AHORA ACTIVO (24H)
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white border border-slate-100">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-tight text-slate-500">VERSUS</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-sm font-black text-slate-900">
                                        {previewVersus?.title || "Cargando temática..."}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 bg-white border border-slate-100 p-4 rounded-xl text-center shadow-sm">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">OPCIÓN A</div>
                                            <div className="text-sm font-bold text-slate-700 truncate">
                                                {previewVersus?.options?.[0]?.label || "..."}
                                            </div>
                                        </div>

                                        <div className="w-10 h-10 rounded-full bg-gradient-brand text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary-500/20 shrink-0">
                                            VS
                                        </div>

                                        <div className="flex-1 bg-white border border-slate-100 p-4 rounded-xl text-center shadow-sm">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">OPCIÓN B</div>
                                            <div className="text-sm font-bold text-slate-700 truncate">
                                                {previewVersus?.options?.[1]?.label || "..."}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={onEnterVersus}
                                    className="w-full mt-6 h-12 bg-gradient-brand hover:opacity-90 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group-hover:gap-3"
                                >
                                    Ir a Versus
                                    <span className="material-symbols-outlined text-xl">arrow_right_alt</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: STATS + OTROS (35%) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* LIVE STATS WIDGET */}
                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary-500 text-xl font-bold">query_stats</span>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">LIVE STATS (24H)</h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Actualizado</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                                <span className="material-symbols-outlined text-slate-400 text-lg">group</span>
                                <div className="mt-2 text-xl font-black text-slate-900">
                                    <AnimatedNumber value={stats?.active_users_24h || 0} />
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">ACTIVOS 24H</div>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                                <span className="material-symbols-outlined text-slate-400 text-lg">bolt</span>
                                <div className="mt-2 text-xl font-black text-slate-900">
                                    <AnimatedNumber value={stats?.signals_24h || 0} />
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">SEÑALES 24H</div>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                                <span className="material-symbols-outlined text-slate-400 text-lg">bar_chart</span>
                                <div className="mt-2 text-xl font-black text-slate-900">
                                    <AnimatedNumber value={stats?.depth_answers_24h || 0} />
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">PROFUNDIDAD 24H</div>
                            </div>
                            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-4">
                                <span className="material-symbols-outlined text-slate-400 text-lg">layers</span>
                                <div className="mt-2 text-xl font-black text-slate-900">
                                    <AnimatedNumber value={stats?.active_battles || 0} />
                                </div>
                                <div className="text-[8px] font-black uppercase tracking-widest text-slate-400">BATALLAS ACTIVAS</div>
                            </div>
                        </div>

                        <div className="flex items-end justify-between pt-2">
                            <SparkBars24h />
                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-tight">AHORA</span>
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">TOP AHORA (24H)</div>
                            {topNow?.top_versus ? (
                                <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-between text-white group/top cursor-pointer hover:bg-slate-800 transition-colors" onClick={onViewResults}>
                                    <div className="flex flex-col truncate pr-4">
                                        <span className="text-[10px] font-bold truncate">{topNow.top_versus.title}</span>
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{topNow.top_versus.signals_24h} señales</span>
                                    </div>
                                    <button className="material-symbols-outlined text-slate-500 text-lg group-hover/top:text-white transition-colors">arrow_forward</button>
                                </div>
                            ) : (
                                <div className="bg-slate-900 rounded-xl p-3 flex items-center justify-center text-white">
                                    <span className="text-[10px] font-bold">Aún no hay suficientes señales en 24h.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: STATS + OTROS (35%) */}
                    {/* PROGRESIVO/PROFUNDIDAD WERE REMOVED AS NON-CORE EXPERIENCES */}
                </div>
            </div>
        </div>
    );
}
