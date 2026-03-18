import React, { useState } from 'react';

interface HubMenuSimplifiedProps {
    onEnterVersus: () => void;
    onEnterTorneo?: () => void;
    onEnterProfundidad?: () => void;
    onEnterActualidad?: () => void;
    onEnterLugares?: () => void;
    onViewResults: () => void;
    stats: {
        active_users_24h: number;
        signals_24h: number;
        depth_answers_24h: number;
        active_battles: number;
        entities_elo: number;
    } | null;
    topNow: {
        top_versus: { slug: string; title: string; signals_24h: number } | null;
        top_tournament: { slug: string; title: string; signals_24h: number } | null;
    } | null;
    previewVersus: {
        id: string;
        title: string;
        category: { slug?: string; name?: string } | string | null;
        options: { id: string; label: string;[key: string]: unknown }[];
    } | null;
    signalsToday: number;
    signalsLimit: number | string;
}

export default function HubMenuSimplified({
    onEnterVersus,
    onEnterTorneo = () => { },
    onEnterProfundidad = () => { },
    onEnterActualidad = () => { },
    onEnterLugares = () => { },
    onViewResults,
    stats,
    topNow,
    previewVersus,
    signalsToday,
    signalsLimit
}: HubMenuSimplifiedProps) {
    // MOCK DATA PARA NIVELES (Iteración Avanzada Engagement)
    const userProgress = {
        level: 4,
        levelName: "Referente",
        currentSignals: 842,
        nextLevelSignals: 1000,
        dailyTarget: typeof signalsLimit === 'number' ? signalsLimit : 10
    };
    const signalsLeftToday = Math.max(0, userProgress.dailyTarget - signalsToday);

    const [feedbackEvents, setFeedbackEvents] = useState<{ id: string, x: number, y: number }[]>([]);

    const handleModuleClick = (e: React.MouseEvent, callback: () => void) => {
        const id = Math.random().toString(36).substr(2, 9);
        const x = e.clientX;
        const y = e.clientY;
        
        // Add new feedback event
        setFeedbackEvents(prev => [...prev, { id, x, y }]);
        
        // Remove it after animation completes (800ms)
        setTimeout(() => {
            setFeedbackEvents(prev => prev.filter(event => event.id !== id));
        }, 800);

        // Slightly delay navigation so user feels the feedback
        setTimeout(callback, 300);
    };

    return (
        <div className="w-full relative min-h-screen bg-white font-sans text-ink">
            {/* Inline styles for the feedback animation */}
            <style>{`
                @keyframes signalFeedbackPop {
                    0% { opacity: 0; transform: translateY(10px) scale(0.8); }
                    20% { opacity: 1; transform: translateY(-15px) scale(1.1); }
                    100% { opacity: 0; transform: translateY(-40px) scale(1); }
                }
                .animate-signal-pop {
                    animation: signalFeedbackPop 0.8s ease-out forwards;
                }
            `}</style>

            {/* Render any active feedback events */}
            {feedbackEvents.map(event => (
                <div 
                    key={event.id} 
                    className="fixed z-50 pointer-events-none animate-signal-pop px-3 py-1 bg-white/90 backdrop-blur-sm border border-emerald-100 rounded-full shadow-lg flex items-center gap-1.5"
                    style={{ left: event.x - 40, top: event.y - 30 }}
                >
                    <span className="material-symbols-outlined text-emerald-500 text-sm">bolt</span>
                    <span className="text-emerald-600 font-extrabold text-sm tracking-tight">+1 señal</span>
                </div>
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
                {/* Hero Section Gamificado */}
            <section className="relative w-full rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 md:p-12">
                {/* Fondos dinámicos removidos por limpieza de UI */}

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-center h-full">
                    {/* Contenido Principal */}
                    <div className="space-y-6 pr-0 lg:pr-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Señales en vivo
                        </div>
                        
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display tracking-tight text-ink mb-2">
                                Tus señales<br />
                                construyen <span className="text-gradient-brand pb-1">esto.</span>
                            </h1>
                            <p className="text-slate-500 font-medium max-w-md text-lg leading-relaxed mb-6">
                                Cada decisión suma valor real. Descubre las tendencias y compárate con la comunidad en tiempo real.
                            </p>

                            <button
                                onClick={(e) => handleModuleClick(e, onEnterVersus)}
                                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-white rounded-xl font-bold shadow-lg shadow-ink/20 hover:bg-ink-800 transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                                <span className="relative z-10">Seguir participando</span>
                                <span className="material-symbols-outlined relative z-10 text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>

                        {/* Capa de Urgencia / Escasez Diaria */}
                        <div className="bg-orange-50/80 border border-orange-100 rounded-2xl p-4 mt-8 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-orange-50 transition-colors group">
                            <div className="w-10 h-10 shrink-0 bg-white shadow-sm border border-orange-100 text-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className={`material-symbols-outlined text-xl ${signalsLeftToday > 0 ? 'animate-pulse' : ''}`}>
                                    {signalsLeftToday > 0 ? 'local_fire_department' : 'task_alt'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-orange-900 text-sm">
                                    {signalsLeftToday > 0 ? "Tu racha diaria está activa" : "¡Meta diaria cumplida!"}
                                </h4>
                                <p className="text-orange-700/80 text-xs font-bold mt-0.5">
                                    {signalsLeftToday > 0 
                                        ? `Aporta ${signalsLeftToday} señales más hoy para mantener tu racha de crecimiento.` 
                                        : "Gran impacto aportado. ¡Vuelve mañana para seguir escalando!"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Composición Visual Central Hero (El Núcleo Opina+ - Gran Red) */}
                    <div className="hidden md:flex flex-col items-center justify-center relative pointer-events-none w-full h-[300px] lg:h-[380px] perspective-1000 -mr-12 lg:-mr-24 scale-[1.15] lg:scale-[1.3] transform-origin-right">
                        {/* Red de satélites / conexiones Espaciales */}
                        <div className="absolute inset-0 flex items-center justify-center transform-style-3d">
                            {/* Superficie base (Malla de energía) */}
                            <div className="absolute w-[150%] h-[150%] bg-[linear-gradient(to_right,#3b82f6_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 transform rotate-x-60 -rotate-z-45 animate-[pulse_4s_ease-in-out_infinite]"></div>

                            {/* Anillos orbitales entrelazados */}
                            <div className="absolute w-[80%] h-[80%] max-w-[400px] max-h-[400px] border-[2px] border-primary/20 rounded-full animate-[spin_15s_linear_infinite]" style={{ transform: 'rotateX(60deg) rotateY(15deg)' }}></div>
                            <div className="absolute w-[95%] h-[95%] max-w-[450px] max-h-[450px] border-[1.5px] border-emerald-500/30 rounded-full animate-[spin_20s_linear_infinite_reverse]" style={{ transform: 'rotateX(50deg) rotateY(-20deg)' }}></div>
                            <div className="absolute w-[70%] h-[70%] max-w-[350px] max-h-[350px] border-[2px] border-purple-500/20 rounded-full animate-[spin_10s_linear_infinite]" style={{ transform: 'rotateX(70deg) rotateZ(30deg)' }}></div>
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent transform rotate-45 rotate-x-60 animate-[shimmer_3s_infinite] blur-md mix-blend-overlay"></div>
                            
                            {/* Partículas viajeras MASIVAS */}
                            <div className="absolute w-full h-full">
                                <span className="absolute top-[20%] left-[20%] w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] blur-[1px] animate-[ping_3s_infinite]"></span>
                                <span className="absolute top-[80%] left-[70%] w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_#10b981] animate-pulse"></span>
                                <span className="absolute top-[30%] right-[30%] w-4 h-4 bg-purple-500 rounded-full shadow-[0_0_20px_#8b5cf6] blur-[2px] animate-[bounce_4s_infinite]"></span>
                                <span className="absolute bottom-[20%] right-[40%] w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_#facc15] animate-[ping_2s_infinite]"></span>
                                
                                {/* Más puntos simulando señales masivas */}
                                <span className="absolute top-[40%] left-[10%] w-2 h-2 bg-blue-300 rounded-full shadow-[0_0_10px_#93c5fd] animate-[ping_2.5s_infinite]"></span>
                                <span className="absolute bottom-[40%] left-[30%] w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_#34d399] animate-[bounce_3s_infinite]"></span>
                                <span className="absolute top-[60%] right-[15%] w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a78bfa] animate-[ping_3.5s_infinite]"></span>
                                <span className="absolute top-[10%] right-[50%] w-3 h-3 bg-yellow-300 rounded-full shadow-[0_0_12px_#fde047] blur-[1px] animate-[pulse_2s_infinite]"></span>
                                <span className="absolute bottom-[10%] right-[20%] w-2 h-2 bg-pink-400 rounded-full shadow-[0_0_10px_#f472b6] animate-[ping_1.5s_infinite]"></span>
                            </div>
                        </div>

                        {/* Núcleo de Vida (Pulsante e inmersivo) */}
                        <div className="relative z-20 w-40 h-40 flex items-center justify-center transition-transform duration-700 animate-[bounce_6s_ease-in-out_infinite]">
                            {/* Resplandores Profundos */}
                            <div className="absolute inset-[-50%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.3),transparent_70%)] rounded-full blur-3xl animate-[pulse_3s_linear_infinite]"></div>
                            <div className="absolute inset-[-30%] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.3),transparent_60%)] rounded-full blur-2xl animate-[ping_5s_linear_infinite]"></div>
                            <div className="absolute inset-0 bg-white/40 rounded-full blur-xl animate-pulse"></div>

                            {/* Esfera Central Glassmorphism Hiper-Premium */}
                            <div className="relative w-32 h-32 bg-white/20 backdrop-blur-2xl border border-white/80 shadow-[0_30px_60px_rgba(0,0,0,0.15),inset_0_2px_10px_rgba(255,255,255,1)] rounded-[2.5rem] flex items-center justify-center overflow-hidden rotate-45 transform-style-3d group-hover:rotate-[40deg] transition-all duration-700">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-emerald-400/30 animate-[spin_10s_linear_infinite]"></div>
                                {/* Pulso interno 3D con LOGO OPINA+ */}
                                <div className="w-20 h-20 bg-gradient-brand rounded-full shadow-[inset_0_-8px_15px_rgba(0,0,0,0.3),0_10px_30px_rgba(59,130,246,0.5)] flex items-center justify-center text-white relative z-10 -rotate-45 transform-style-3d perspective-1000">
                                    <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></div>
                                    <div className="absolute top-1 left-2 w-6 h-6 bg-white/60 rounded-full blur-[4px] mix-blend-overlay"></div>
                                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 drop-shadow-md animate-[pulse_2s_ease-in-out_infinite] transform translate-z-10">
                                      <path d="M20 10V30" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                      <path d="M14 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                      <path d="M26 15V25" stroke="white" strokeWidth="4" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Etiquetas de datos flotantes en 3D (Secciones de Opina+) */}
                        {/* Versus */}
                        <div className="absolute top-[15%] left-[15%] bg-white/90 backdrop-blur-xl border border-slate-100 text-ink px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg transform rotate-[-5deg] flex items-center gap-1.5 animate-[bounce_4.5s_ease-in-out_infinite] z-40">
                            <span className="material-symbols-outlined text-[14px] text-blue-500">compare_arrows</span>
                            Versus
                        </div>
                        
                        {/* Torneos */}
                        <div className="absolute top-[25%] right-[10%] lg:right-[5%] bg-ink/90 backdrop-blur-xl border border-ink-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg transform rotate-6 flex items-center gap-1.5 animate-[bounce_5.5s_ease-in-out_infinite] z-40">
                            <span className="material-symbols-outlined text-[14px] text-purple-400">emoji_events</span>
                            Torneos
                        </div>

                        {/* Actualidad */}
                        <div className="absolute top-[50%] left-[5%] lg:left-[2%] bg-pink-50/90 backdrop-blur-xl border border-pink-200 text-pink-800 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg transform rotate-[2deg] flex items-center gap-1.5 animate-[bounce_5s_ease-in-out_infinite] z-40">
                            <span className="material-symbols-outlined text-[14px] text-pink-600">newspaper</span>
                            Actualidad
                        </div>

                        {/* Productos */}
                        <div className="absolute top-[60%] right-[5%] lg:right-[2%] bg-amber-50/90 backdrop-blur-xl border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg transform rotate-[-4deg] flex items-center gap-1.5 animate-[bounce_4.8s_ease-in-out_infinite] z-40">
                            <span className="material-symbols-outlined text-[14px] text-amber-600">category</span>
                            Productos
                        </div>

                        {/* Profundidad */}
                        <div className="absolute bottom-[25%] left-[20%] bg-blue-50/90 backdrop-blur-xl border border-blue-200 text-blue-800 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg transform rotate-[4deg] flex items-center gap-1.5 animate-[bounce_4s_ease-in-out_infinite] z-40">
                            <span className="material-symbols-outlined text-[14px] text-blue-600">psychology</span>
                            Profundidad
                        </div>

                        {/* Lugares */}
                        <div className="absolute bottom-[15%] right-[15%] lg:right-[10%] bg-emerald-50/90 backdrop-blur-xl border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-lg transform rotate-[-3deg] flex items-center gap-1.5 animate-[bounce_6s_ease-in-out_infinite] z-40">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">place</span>
                            Lugares
                        </div>
                    </div>
                </div>
            </section>

            {/* Franja de KPIs (Ocupa el ancho completo aquí o arriba de la grilla) */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {/* KPI 1 */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col hover:border-primary/20 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <span className="material-symbols-outlined text-[18px]">group</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Activos hoy</span>
                    </div>
                    <div className="text-2xl font-black text-ink">{new Intl.NumberFormat("es-CL").format(stats?.active_users_24h || 0)}</div>
                </div>
                {/* KPI 2 */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col hover:border-emerald-500/20 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-2 mb-2 text-emerald-500">
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Señales hoy</span>
                    </div>
                    <div className="text-2xl font-black text-ink">{new Intl.NumberFormat("es-CL").format(stats?.signals_24h || 0)}</div>
                </div>
                {/* KPI 3 */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col hover:border-indigo-500/20 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-2 mb-2 text-indigo-500">
                        <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">En juego ahora</span>
                    </div>
                    <div className="text-2xl font-black text-ink">{new Intl.NumberFormat("es-CL").format(stats?.active_battles || 0)}</div>
                </div>
                {/* KPI 4 */}
                <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm flex flex-col hover:border-blue-600/20 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Moviéndose hoy</span>
                    </div>
                    <div className="text-2xl font-black text-ink">{new Intl.NumberFormat("es-CL").format(stats?.depth_answers_24h || 0)}</div>
                </div>
            </section>

            {/* Hilo conector visual (Continuidad espacial) */}
            <div className="w-px h-12 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent mx-auto hidden md:block -my-8 z-0 relative" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start relative z-10">
                
                {/* COLUMNA PRINCIPAL (8 cols) - Bento Box Layout Premium */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    <div className="flex items-center gap-2 px-1">
                        <span className="material-symbols-outlined text-primary text-xl">view_cozy</span>
                        <h2 className="text-xl font-bold text-ink tracking-tight">Formatos de Señal</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">
                        
                        {/* 1. Versus Rápido (Protagonista Grande, 2x2) - TRUE Mini-Experience Split */}
                        <div 
                            className="col-span-2 row-span-2 flex flex-col relative overflow-hidden bg-white border border-slate-200 hover:border-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[2rem]" 
                            style={{ minHeight: '380px' }}
                        >
                            {/* Cabecera del Versus (Z-30 para estar por encima del split) */}
                            <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-start p-6 md:p-8 pointer-events-none">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden group/vsicon">
                                        <svg className="w-10 h-10 relative z-10" viewBox="0 0 100 100">
                                            {/* Eje Central */}
                                            <line x1="50" y1="20" x2="50" y2="80" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" className="opacity-60" />
                                            
                                            {/* Polo A (Azul) */}
                                            <circle cx="30" cy="50" r="12" fill="#3b82f6" className="opacity-80 group-hover/left:r-[16] transition-all duration-500" />
                                            <circle cx="30" cy="50" r="4" fill="white" className="animate-pulse" />
                                            
                                            {/* Polo B (Esmeralda) */}
                                            <circle cx="70" cy="50" r="12" fill="#10b981" className="opacity-80 group-hover/right:r-[16] transition-all duration-500" />
                                            <circle cx="70" cy="50" r="4" fill="white" className="animate-pulse delay-150" />
                                            
                                            {/* Tensión / Conexión (A -> B) */}
                                            <path d="M 42 50 Q 50 35 58 50" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="animate-[dash_2s_linear_infinite] opacity-50" strokeDasharray="4 4" />
                                            <path d="M 42 50 Q 50 65 58 50" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="animate-[dash_2s_linear_infinite_reverse] opacity-50" strokeDasharray="4 4" />
                                        </svg>
                                    </div>
                                    <div className="pt-0.5">
                                        <div className="badge border-none bg-surface2/60 backdrop-blur-md text-ink px-3 py-1 font-bold text-[10px] tracking-widest uppercase mb-2 shadow-sm inline-block">
                                            En juego ahora
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-black text-ink leading-tight drop-shadow-sm max-w-sm">
                                            {previewVersus?.title || "¿Cuál es tu sistema operativo favorito?"}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Contenedor Flex Split (El módulo activo en sí) */}
                            <div className="flex-1 flex w-full relative group/versus" onClick={(e) => handleModuleClick(e, onEnterVersus)}>
                                
                                {/* Lado Izquierdo (Opción A) */}
                                <div className="flex-1 relative cursor-pointer overflow-hidden transition-all duration-700 ease-out flex items-end justify-center p-8 pb-10 hover:flex-[1.6] group/left">
                                    {/* Fondo gradiente dinámico */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-white transition-colors duration-700 group-hover/left:from-blue-50 group-hover/left:to-blue-100/30"></div>
                                    <div className="absolute inset-0 opacity-0 bg-[radial-gradient(#3b82f6_1.5px,transparent_1.5px)] [background-size:24px_24px] group-hover/left:opacity-10 transition-opacity duration-700"></div>
                                    
                                    {/* Opción A Texto */}
                                    <h4 className="relative z-10 text-3xl md:text-4xl font-black text-slate-800 text-center transform transition-all duration-500 group-hover/left:-translate-y-4 group-hover/left:scale-110 group-hover/left:text-blue-900 group-hover/left:drop-shadow-md line-clamp-2 overflow-hidden text-ellipsis">
                                        {previewVersus?.options?.[0]?.label || "Mac OS"}
                                    </h4>
                                    
                                    {/* CTA Sutil - Solo visible on hover */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/left:opacity-100 transform translate-y-4 group-hover/left:translate-y-0 transition-all duration-500 flex items-center gap-2 text-blue-700 font-bold text-sm bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-blue-100 whitespace-nowrap z-20">
                                        Elegir Opción A <span className="material-symbols-outlined text-base">arrow_forward</span>
                                    </div>
                                </div>

                                {/* Pilar Central Físico (Punted con VS, se mueve natural si los flex items crecen) */}
                                <div className="w-0 z-20 flex flex-col items-center justify-center relative pointer-events-none">
                                    <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>
                                    {/* VS Badge */}
                                    <div className="w-16 h-16 bg-ink rounded-full text-white flex items-center justify-center font-black text-xl border-[6px] border-white shadow-xl transform transition-transform duration-500 group-hover/versus:scale-110">
                                        VS
                                    </div>
                                </div>

                                {/* Lado Derecho (Opción B) */}
                                <div className="flex-1 relative cursor-pointer overflow-hidden transition-all duration-700 ease-out flex items-end justify-center p-8 pb-10 hover:flex-[1.6] group/right">
                                    {/* Fondo gradiente dinámico */}
                                    <div className="absolute inset-0 bg-gradient-to-bl from-slate-50 to-white transition-colors duration-700 group-hover/right:from-emerald-50 group-hover/right:to-emerald-100/30"></div>
                                    <div className="absolute inset-0 opacity-0 bg-[radial-gradient(#10b981_1.5px,transparent_1.5px)] [background-size:24px_24px] group-hover/right:opacity-10 transition-opacity duration-700"></div>
                                    
                                    {/* Opción B Texto */}
                                    <h4 className="relative z-10 text-3xl md:text-4xl font-black text-slate-800 text-center transform transition-all duration-500 group-hover/right:-translate-y-4 group-hover/right:scale-110 group-hover/right:text-emerald-900 group-hover/right:drop-shadow-md line-clamp-2 overflow-hidden text-ellipsis">
                                        {previewVersus?.options?.[1]?.label || "Windows 11"}
                                    </h4>

                                    {/* CTA Sutil - Solo visible on hover */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover/right:opacity-100 transform translate-y-4 group-hover/right:translate-y-0 transition-all duration-500 flex items-center gap-2 text-emerald-700 font-bold text-sm bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg border border-emerald-100 whitespace-nowrap z-20">
                                        <span className="material-symbols-outlined text-base">arrow_back</span> Elegir Opción B
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* 2. Torneo (Mediano, 2x1) */}
                        <div 
                            className="col-span-2 row-span-1 card-interactive bg-indigo-50/40 border border-indigo-100 p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden hover:bg-white hover:border-indigo-300 transition-all shadow-sm hover:shadow-md" 
                            onClick={(e) => handleModuleClick(e, onEnterTorneo)}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none"></div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>

                            <div className="relative z-10 flex justify-between items-start mb-4">
                                {/* Micro-escena Animada para Torneo (Progresión Visual) */}
                                <div className="w-16 h-16 bg-gradient-to-t from-indigo-50 to-white rounded-2xl border border-indigo-100 flex items-end justify-center pb-2 shadow-sm relative overflow-hidden group-hover:border-indigo-300 transition-colors">
                                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <svg className="w-12 h-12 relative z-10 overflow-visible" viewBox="0 0 100 100">
                                        {/* Base Grid */}
                                        <path d="M 10 90 L 90 90" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" />
                                        
                                        {/* Escalón 1 (Izquierda) */}
                                        <rect x="20" y="70" width="16" height="20" rx="4" fill="#6366f1" opacity="0.4" className="group-hover:opacity-60 transition-opacity duration-300" />
                                        
                                        {/* Escalón 2 (Derecha) */}
                                        <rect x="64" y="55" width="16" height="35" rx="4" fill="#6366f1" opacity="0.6" className="group-hover:opacity-80 transition-opacity duration-300 delay-100" />
                                        
                                        {/* Nivel Superior (Centro) */}
                                        <rect x="40" y="30" width="20" height="60" rx="4" fill="url(#torneo-grad)" className="group-hover:-translate-y-2 transition-transform duration-500" />
                                        
                                        {/* Conexiones / Flujo */}
                                        <path d="M 28 65 L 45 40" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_3s_linear_infinite_reverse] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" />
                                        <path d="M 72 50 L 55 40" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 4" className="animate-[dash_3s_linear_infinite_reverse] opacity-0 group-hover:opacity-100 transition-opacity delay-150" fill="none" />
                                        
                                        {/* Corona/Brillo Superior */}
                                        <circle cx="50" cy="15" r="4" fill="#4f46e5" className="animate-[ping_2s_infinite] opacity-0 group-hover:opacity-100" />
                                        <circle cx="50" cy="15" r="2" fill="white" className="opacity-0 group-hover:opacity-100" />

                                        <defs>
                                            <linearGradient id="torneo-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                                                <stop offset="0%" stopColor="#4f46e5" />
                                                <stop offset="100%" stopColor="#818cf8" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <div className="badge bg-white text-indigo-600 border border-indigo-100 py-1 text-xs shadow-sm font-bold">Modo Supervivencia</div>
                                    <div className="text-[9px] font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[12px]">schedule</span> Cerrando pronto
                                    </div>
                                </div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-ink text-xl mb-1 group-hover:text-indigo-600 transition-colors">El Gran Torneo</h3>
                                <p className="text-slate-500 text-sm font-medium">Solo una opción puede sobrevivir. ¿Cuál defenderás?</p>
                            </div>
                        </div>

                        {/* 3. Profundidad (Mediano, 2x1) */}
                        <div 
                            className="col-span-2 row-span-1 card-interactive bg-white border border-slate-200 p-6 flex flex-col justify-between group cursor-pointer hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden" 
                            onClick={(e) => handleModuleClick(e, onEnterProfundidad)}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700 pointer-events-none"></div>
                            
                            <div className="relative z-10 flex justify-between items-start mb-4">
                                {/* Micro-escena Animada para Profundidad (Exploración por Capas) */}
                                <div className="w-16 h-16 bg-white rounded-2xl border border-blue-100 flex items-center justify-center shadow-sm relative overflow-visible group-hover:border-blue-300 group-hover:shadow-md transition-all duration-500 perspective-1000">
                                    <div className="relative w-10 h-10 group-hover:rotate-x-12 group-hover:-rotate-y-12 transition-transform duration-700 transform-style-3d">
                                        {/* Capa Base */}
                                        <div className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-xl transform translate-z-0 group-hover:translate-z-[-20px] group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-700 opacity-40"></div>
                                        {/* Capa Media */}
                                        <div className="absolute inset-0 bg-blue-100/80 border border-blue-300 rounded-xl transform translate-z-[10px] group-hover:translate-z-[0px] group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-700 delay-75 opacity-70 flex items-center justify-center">
                                            <div className="w-4 h-1 bg-blue-300 rounded-full"></div>
                                        </div>
                                        {/* Capa Superior (Foco) */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 border border-blue-400 rounded-xl transform translate-z-[20px] group-hover:translate-z-[30px] group-hover:-translate-x-2 group-hover:-translate-y-2 transition-transform duration-700 delay-150 shadow-lg flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        </div>
                                        
                                        {/* Líneas de conexión (visibles solo en hover) */}
                                        <svg className="absolute inset-[-50%] w-[200%] h-[200%] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-300" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="30" fill="none" stroke="#60a5fa" strokeWidth="0.5" strokeDasharray="2 4" className="animate-[spin_20s_linear_infinite]" />
                                            <circle cx="50" cy="50" r="40" fill="none" stroke="#93c5fd" strokeWidth="0.5" strokeDasharray="2 4" className="animate-[spin_30s_linear_infinite_reverse]" />
                                        </svg>
                                    </div>
                                    <style>{`
                                        .perspective-1000 { perspective: 1000px; }
                                        .transform-style-3d { transform-style: preserve-3d; }
                                        .translate-z-\\[-20px\\] { transform: translateZ(-20px); }
                                        .translate-z-\\[0px\\] { transform: translateZ(0px); }
                                        .translate-z-\\[10px\\] { transform: translateZ(10px); }
                                        .translate-z-\\[20px\\] { transform: translateZ(20px); }
                                        .translate-z-\\[30px\\] { transform: translateZ(30px); }
                                        .rotate-x-12 { transform: rotateX(12deg); }
                                        .-rotate-y-12 { transform: rotateY(-12deg); }
                                    `}</style>
                                </div>
                                <div className="badge border-blue-100 text-blue-600 bg-blue-50 py-1 text-xs font-bold">Análisis Cualitativo</div>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-ink text-xl mb-1 group-hover:text-blue-600 transition-colors">Profundidad</h3>
                                <p className="text-slate-500 text-sm font-medium">Aporta razones y argumentos. Donde tu voz pesa más.</p>
                            </div>
                        </div>

                        {/* 4. Actualidad (Pequeño, 1x1) */}
                        <div 
                            className="col-span-1 row-span-1 card-interactive bg-emerald-50/40 border border-emerald-100 p-5 flex flex-col justify-between group cursor-pointer hover:bg-white hover:shadow-md hover:border-emerald-300 transition-all relative overflow-hidden" 
                            onClick={(e) => handleModuleClick(e, onEnterActualidad)}
                        >
                            {/* Micro-escena Animada para Actualidad (Pulso en Vivo) */}
                            <div className="w-full h-16 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center mb-auto relative overflow-hidden group-hover:bg-emerald-100 transition-colors duration-500">
                                <div className="absolute left-4 z-10 font-black text-emerald-700 text-xs tracking-widest uppercase flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 duration-300">
                                    LIVE <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                                    {/* Grid de fondo */}
                                    <line x1="0" y1="30" x2="200" y2="30" stroke="#34d399" strokeWidth="1" strokeDasharray="2 4" opacity="0.3" />
                                    
                                    {/* Línea de pulso principal */}
                                    <path d="M 0 30 L 40 30 L 45 15 L 55 45 L 60 30 L 100 30 L 110 10 L 120 50 L 130 30 L 200 30" fill="none" stroke="url(#actualidad-grad)" strokeWidth="2.5" className="animate-[pulseWave_3s_linear_infinite]" strokeDasharray="200" strokeDashoffset="200" />
                                    
                                    {/* Nodos de eventos */}
                                    <circle cx="50" cy="30" r="3" fill="#10b981" className="animate-[ping_2s_infinite]" style={{ animationDelay: '0.5s' }} />
                                    <circle cx="115" cy="30" r="4" fill="white" stroke="#10b981" strokeWidth="2" className="animate-[pulse_1.5s_infinite]" />

                                    <defs>
                                        <linearGradient id="actualidad-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
                                            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <style>{`
                                    @keyframes pulseWave {
                                        0% { stroke-dashoffset: 200; transform: translateX(-20%); }
                                        100% { stroke-dashoffset: -200; transform: translateX(20%); }
                                    }
                                `}</style>
                            </div>
                            <div className="relative z-10 mt-4">
                                <h3 className="font-bold text-ink text-base group-hover:text-emerald-700 transition-colors">Actualidad</h3>
                                <p className="text-slate-500 text-xs font-medium leading-snug mt-1">Sigue el pulso en tiempo real.</p>
                                <div className="text-[10px] font-bold text-emerald-600 uppercase mt-2 tracking-wider flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Nuevo hoy
                                </div>
                            </div>
                        </div>

                        {/* 5. Lugares (Pequeño, 1x1) */}
                        <div 
                            className="col-span-1 row-span-1 card-interactive bg-indigo-50/40 border border-indigo-100 p-5 flex flex-col justify-between group cursor-pointer hover:bg-white hover:shadow-md hover:border-indigo-300 transition-all relative overflow-hidden" 
                            onClick={(e) => handleModuleClick(e, onEnterLugares)}
                        >
                            {/* Micro-escena Animada para Lugares (Contexto Espacial) */}
                            <div className="w-full h-16 rounded-2xl bg-indigo-50/80 border border-indigo-100 mb-auto relative overflow-hidden group-hover:bg-indigo-100 transition-colors duration-500 flex items-center justify-center">
                                {/* Isometric Grid Surface */}
                                <div className="absolute inset-0 transform rotate-x-60 -rotate-z-45 scale-150 origin-center pointer-events-none transition-transform duration-700 group-hover:rotate-x-45 group-hover:scale-125">
                                    <div className="w-full h-full bg-[linear-gradient(to_right,#818cf8_1px,transparent_1px),linear-gradient(to_bottom,#818cf8_1px,transparent_1px)] bg-[size:20px_20px] opacity-10"></div>
                                </div>
                                
                                {/* Puntos de Calor / Lugares */}
                                <div className="relative z-10 w-full h-full">
                                    {/* Punto Principal */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group-hover:-translate-y-6 transition-transform duration-500">
                                        <div className="w-4 h-4 bg-indigo-500 rounded-xl rounded-br-sm rotate-45 shadow-md border-2 border-white relative z-10"></div>
                                        <div className="w-6 h-6 border border-indigo-400 rounded-full absolute -bottom-1 -left-1 animate-ping opacity-60"></div>
                                        <div className="w-4 h-1.5 bg-indigo-800/20 blur-[2px] rounded-full absolute -bottom-2"></div>
                                    </div>
                                    
                                    {/* Puntos Secundarios (Visibles on hover) */}
                                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-300 delay-100 shadow-sm"></div>
                                    <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-indigo-300 rounded-full opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all duration-500 delay-200 shadow-sm border border-white"></div>
                                </div>
                                <style>{`
                                    .rotate-x-60 { transform: rotateX(60deg) rotateZ(-45deg); }
                                    .rotate-x-45 { transform: rotateX(45deg) rotateZ(-45deg); }
                                `}</style>
                            </div>
                            <div className="relative z-10 mt-4">
                                <h3 className="font-bold text-ink text-base group-hover:text-indigo-700 transition-colors">Lugares</h3>
                                <p className="text-slate-500 text-xs font-medium leading-snug mt-1">Impacto geolocalizado en tu entorno.</p>
                                <div className="text-[10px] font-bold text-indigo-500 uppercase mt-2 tracking-wider">Geolocalizado</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA LATERAL (4 cols) - Contexto y Data */}
                <div className="lg:col-span-4 space-y-6">

                    {/* TOP TENDENCIAS AHORA */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-xl animate-[pulse_2s_ease-in-out_infinite]">local_fire_department</span>
                            <h3 className="font-bold text-ink">Hot Now (24h)</h3>
                        </div>

                        {topNow?.top_versus ? (
                            <div className="bg-surface2/50 rounded-xl p-5 border border-stroke cursor-pointer hover:bg-surface2 hover:border-primary/30 transition-all shadow-sm group" onClick={onViewResults}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">#1 en participación</div>
                                <h4 className="font-bold text-ink text-base leading-snug mb-4 group-hover:text-primary transition-colors">
                                    {topNow.top_versus.title}
                                </h4>
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                                        <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-white flex items-center justify-center"><span className="text-[8px] font-bold text-primary">+{Math.floor(topNow.top_versus.signals_24h / 10)}</span></div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500">
                                        {new Intl.NumberFormat("es-CL").format(topNow.top_versus.signals_24h)} señales
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl p-8 border border-stroke flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-slate-300 text-3xl mb-2 animate-spin-slow">sync</span>
                                <span className="text-xs font-bold text-slate-500">Calculando tendencia actual...</span>
                            </div>
                        )}
                    </div>

                    {/* BLOQUE: TUS SEÑALES CONSTRUYEN ESTO */}
                    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl p-6 border border-indigo-100 shadow-[0_8px_30px_rgba(99,102,241,0.05)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        
                        <h3 className="font-bold text-ink mb-2">Tus señales construyen esto</h3>
                        <p className="text-xs text-slate-500 font-medium mb-5">El ecosistema depende de tu participación. Cada clic suma.</p>

                        <div className="space-y-3 relative z-10">
                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-colors cursor-default" onClick={onViewResults}>
                                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-lg">leaderboard</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-ink">Poder de Marca</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Rankings de preferencias</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-colors cursor-default" onClick={onViewResults}>
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-lg">donut_large</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-ink">Tendencias de Consumo</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">Hacia dónde va el mercado</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-colors cursor-default" onClick={onViewResults}>
                                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-lg">fingerprint</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-ink">Tu Propia Huella</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">El impacto que dejas en el sistema</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MIS RESULTADOS BUTTON (Moved from grid to sidebar for better UX) */}
                    <div className="bg-ink text-white rounded-2xl p-6 flex items-center justify-between group hover:bg-ink-800 transition-colors shadow-lg shadow-ink/10 cursor-pointer overflow-hidden relative" onClick={onViewResults}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tu Impacto</div>
                            <h3 className="font-bold text-white text-lg group-hover:text-primary-300 transition-colors">Ver Resultados</h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white">arrow_forward</span>
                        </div>
                    </div>

                </div>
            </div>

            </div>
        </div>
    );
}
