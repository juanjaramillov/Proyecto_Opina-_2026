interface HubSecondaryTracksProps {
    setMode: (mode: 'menu' | 'versus' | 'torneo' | 'profundidad' | 'actualidad' | 'lugares') => void;
}

export function HubSecondaryTracks({ setMode }: HubSecondaryTracksProps) {
    return (
        <div className="w-full relative bg-slate-50/50 pb-20">
            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-12 pt-8 md:pt-12">
                
                {/* Header Corto y Funcional */}
                <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-2">
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
                            Radar de Experiencias
                        </h2>
                        <p className="text-sm md:text-base text-slate-600 font-medium mt-1">Explora otras dinámicas activas en la comunidad.</p>
                    </div>
                </div>
                
                {/* ACTIVE MODULES - Asymmetrical Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 mb-12">
                    
                    {/* 1. TORNEOS (Featured / Col Span 2) */}
                    <button 
                        onClick={() => setMode('torneo')}
                        className="group relative flex flex-col md:col-span-2 p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.15)] transition-all duration-300 text-left overflow-hidden min-h-[160px] md:min-h-[220px]"
                    >
                        {/* Deco: Stadium Light / Bracket Glow */}
                        <div className="absolute right-0 top-0 w-1/2 h-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at top right, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
                        <div className="absolute -right-10 -top-10 w-48 h-48 bg-indigo-500/5 rounded-full blur-[30px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">emoji_events</span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] md:text-[11px] font-bold uppercase tracking-wider border border-indigo-100">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                                    1 llave cerrando hoy
                                </span>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-end">
                                <h3 className="font-black text-slate-800 text-xl md:text-3xl group-hover:text-indigo-600 transition-colors tracking-tight">Torneos</h3>
                                <p className="text-sm md:text-base text-slate-600 mt-1.5 md:mt-2 leading-relaxed max-w-sm w-full line-clamp-2 md:line-clamp-none">
                                    Llaves eliminatorias intensas. Elige a tus favoritos y corona al campeón de la comunidad.
                                </p>
                                <div className="flex items-center gap-1.5 mt-4 text-[13px] md:text-sm font-bold text-slate-400 group-hover:text-indigo-600 transition-all">
                                    Ver torneo <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 2. ACTUALIDAD */}
                    <button 
                        onClick={() => setMode('actualidad')}
                        className="group relative flex flex-col p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all duration-300 text-left overflow-hidden min-h-[160px] md:min-h-[220px]"
                    >
                        {/* Deco: News Pulse Ticker */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white group-hover:-rotate-6">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">campaign</span>
                                </div>
                                <span className="text-[10px] md:text-[11px] font-bold text-emerald-700 uppercase tracking-wider animate-pulse">En vivo</span>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-end">
                                <h3 className="font-black text-slate-800 text-xl md:text-2xl group-hover:text-emerald-600 transition-colors tracking-tight">Actualidad</h3>
                                <p className="text-sm md:text-base text-slate-600 mt-1.5 md:mt-2 leading-relaxed w-full line-clamp-2 md:line-clamp-none">
                                    Reacciona a noticias de última hora y traza el pulso.
                                </p>
                                <div className="mt-4 text-xs md:text-sm text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 group-hover:text-emerald-600 transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">local_fire_department</span> Ver actualidad
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 3. LUGARES */}
                    <button 
                        onClick={() => setMode('lugares')}
                        className="group relative flex flex-col p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white border border-slate-200 hover:border-orange-400 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] transition-all duration-300 text-left overflow-hidden min-h-[160px] md:min-h-[200px]"
                    >
                        {/* Deco: Physical Map Location */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
                            <div className="w-full h-full rounded-full border-[2px] border-orange-500 scale-150" />
                            <div className="absolute inset-0 m-auto w-1/2 h-1/2 rounded-full border-[2px] border-orange-500" />
                        </div>

                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-sm transition-transform duration-300 group-hover:-translate-y-1.5">
                                    <span className="material-symbols-outlined text-xl md:text-2xl relative z-10">place</span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200/60 bg-slate-50 text-slate-700 text-[10px] md:text-[11px] font-bold uppercase tracking-wider shadow-sm">
                                    <span className="material-symbols-outlined text-[14px] text-orange-500">near_me</span> 2.4k m
                                </span>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-end mt-4">
                                <h3 className="font-black text-slate-800 text-xl md:text-2xl group-hover:text-orange-600 transition-colors tracking-tight">Lugares</h3>
                                <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2 leading-relaxed w-full line-clamp-2 md:line-clamp-none">
                                    Evalúa sucursales y espacios físicos a tu alrededor.
                                </p>
                                <div className="mt-4 text-xs md:text-sm text-slate-400 font-bold flex items-center gap-1.5 group-hover:text-orange-600 transition-colors uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[16px]">explore</span> Ver lugares
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 4. VERSUS (INDUSTRIA) */}
                    <button 
                        onClick={() => setMode('versus')}
                        className="group relative flex flex-col p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-white border border-slate-200 hover:border-violet-400 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.15)] transition-all duration-300 text-left overflow-hidden min-h-[160px] md:min-h-[200px]"
                    >
                        {/* Deco: Simple abstract comparison lines */}
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-violet-50 text-violet-600 flex items-center justify-center border border-violet-100 shadow-sm transition-transform duration-300 group-hover:scale-110">
                                    <span className="material-symbols-outlined text-xl md:text-2xl relative z-10">category</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-end mt-4">
                                <h3 className="font-black text-slate-800 text-xl md:text-2xl group-hover:text-violet-600 transition-colors tracking-tight">Industrias</h3>
                                <p className="text-sm md:text-base text-slate-600 mt-1 md:mt-2 leading-relaxed w-full line-clamp-2 md:line-clamp-none">
                                    Explora y filtra batallas de marcas por categoría.
                                </p>
                                <div className="mt-4 text-xs md:text-sm text-slate-400 font-bold flex items-center gap-1.5 group-hover:text-violet-600 transition-colors uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[16px]">compare_arrows</span> Abrir radar
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 5. PROFUNDIDAD (Standard) */}
                    <button 
                        onClick={() => setMode('profundidad')}
                        className="group relative flex flex-col p-5 md:p-6 rounded-[24px] md:rounded-[32px] bg-slate-800 border border-slate-700 hover:border-sky-400 hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.3)] transition-all duration-300 text-left overflow-hidden min-h-[160px] md:min-h-[200px]"
                    >
                        {/* Deco: Radar / Deep Analysis */}
                        <div className="absolute inset-0 opacity-[0.05] group-hover:opacity-10 pointer-events-none transition-opacity duration-500" style={{ backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                        <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-sky-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] bg-slate-700 text-sky-400 flex items-center justify-center border border-slate-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
                                    <span className="material-symbols-outlined text-xl md:text-2xl">psychology</span>
                                </div>
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-end">
                                <h3 className="font-black text-white text-xl md:text-3xl group-hover:text-sky-400 transition-colors tracking-tight">Profundidad</h3>
                                <p className="text-sm md:text-base text-slate-300 mt-1 md:mt-2 leading-relaxed max-w-sm line-clamp-2 md:line-clamp-none">
                                    Encuestas multivariables seriadas. Evalúa con calma y descubre capas más profundas de entendimiento.
                                </p>
                                <div className="flex items-center gap-1.5 mt-4 text-[11px] md:text-xs font-bold text-slate-400 group-hover:text-sky-400 transition-colors uppercase tracking-wider">
                                    <span className="material-symbols-outlined text-[16px]">layers</span> Ver análisis
                                </div>
                            </div>
                        </div>
                    </button>

                </div>

                {/* LABORATORY / UPCOMING MODULES */}
                <div className="mt-8 pt-8 border-t border-slate-200/60 w-full flex flex-col">
                    <div className="flex items-center gap-2 mb-4 md:mb-6 px-1">
                        <span className="material-symbols-outlined text-slate-500 text-[16px]">science</span>
                        <h3 className="text-xs md:text-sm font-bold text-slate-500 tracking-wider uppercase">En el laboratorio</h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {/* PREDICCIONES */}
                        <div className="relative flex flex-col p-4 md:p-5 rounded-[20px] bg-white border border-slate-200/60 shadow-sm text-left min-h-[110px]">
                            <div className="flex items-center gap-2 mb-2 md:mb-3">
                                <span className="material-symbols-outlined text-[20px] text-slate-400">query_stats</span>
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm md:text-base">Predicciones</h4>
                            <p className="text-[11px] md:text-xs text-slate-500 mt-1 leading-snug hidden md:block">
                                Apuesta señales en eventos.
                            </p>
                            <div className="absolute top-4 right-4 text-[9px] md:text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 uppercase tracking-wider">
                                Soon
                            </div>
                        </div>

                        {/* DESAFÍOS */}
                        <div className="relative flex flex-col p-4 md:p-5 rounded-[20px] bg-white border border-slate-200/60 shadow-sm text-left min-h-[110px]">
                            <div className="flex items-center gap-2 mb-2 md:mb-3">
                                <span className="material-symbols-outlined text-[20px] text-slate-400">verified</span>
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm md:text-base">Desafíos</h4>
                            <p className="text-[11px] md:text-xs text-slate-500 mt-1 leading-snug hidden md:block">
                                Misiones de marcas y logros.
                            </p>
                            <div className="absolute top-4 right-4 text-[9px] md:text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200 uppercase tracking-wider">
                                Soon
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default HubSecondaryTracks;
