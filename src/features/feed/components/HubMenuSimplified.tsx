

interface HubMenuSimplifiedProps {
    onEnterVersus: () => void;
    onEnterProgressive?: () => void;
    onEnterDepth?: () => void;
    onEnterActualidad?: () => void;
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
        category: { slug?: string; name?: string } | null;
        options: { id: string; label: string;[key: string]: unknown }[];
    } | null;
    signalsToday: number;
    signalsLimit: number | string;
}

export default function HubMenuSimplified({
    onEnterVersus,
    onEnterProgressive = () => { },
    onEnterDepth = () => { },
    onEnterActualidad = () => { },
    onViewResults,
    stats,
    topNow,
    previewVersus,
    signalsToday,
    signalsLimit
}: HubMenuSimplifiedProps) {
    return (
        <div className="w-full max-w-ws mx-auto space-y-12">
            {/* Header context */}
            <header className="section-header flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="h1">Tu <span className="text-gradient-brand">Hub</span> de Señales</h1>
                    <p className="body-base mt-2">Explora y participa en las conversaciones del día.</p>
                </div>
                <div className="badge badge-primary py-2 px-4 shadow-sm border border-primary/10">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-700">
                        Señales Hoy: {signalsToday} <span className="text-primary-400">/ {signalsLimit}</span>
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">

                {/* COLUMNA PRINCIPAL (8 cols) - Bento Box Layout */}
                <div className="lg:col-span-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-fr">

                        {/* 1. Versus Rápido (Grande, 2x2) */}
                        <div className="col-span-2 row-span-2 card-interactive p-6 flex flex-col justify-between group cursor-pointer relative overflow-hidden" onClick={onEnterVersus}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700 pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-white border border-stroke rounded-xl flex items-center justify-center shadow-sm text-primary">
                                        <span className="material-symbols-outlined text-2xl">compare_arrows</span>
                                    </div>
                                    <div className="badge badge-primary">Destacado</div>
                                </div>
                                <h3 className="h2 text-2xl mb-2">Versus Rápido</h3>
                                <p className="body-base text-sm text-text-secondary mb-6 max-w-[90%]">
                                    La forma más rápida de señalar. Elige la opción que más te represente y descubre la tendencia al instante.
                                </p>
                            </div>

                            {/* Widget de previsualización (simulado) */}
                            <div className="relative z-10 w-full bg-white/70 backdrop-blur-md border border-stroke rounded-2xl p-4 mt-auto">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                    En Vivo Ahora <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                </div>
                                <h4 className="text-sm font-bold text-ink mb-3 line-clamp-2 leading-snug">
                                    {previewVersus?.title || "¿Cuál es tu sistema operativo favorito?"}
                                </h4>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-surface2 border border-stroke rounded-lg py-1.5 px-2 text-center text-xs font-bold text-ink truncate">
                                        {previewVersus?.options?.[0]?.label || "Mac"}
                                    </div>
                                    <div className="flex-1 bg-surface2 border border-stroke rounded-lg py-1.5 px-2 text-center text-xs font-bold text-ink truncate">
                                        {previewVersus?.options?.[1]?.label || "Windows"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Progresivo (Mediano, 2x1) */}
                        <div className="col-span-2 row-span-1 card-interactive bg-gradient-brand border-none p-5 flex flex-col justify-between group cursor-pointer" onClick={onEnterProgressive}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white backdrop-blur-sm">
                                    <span className="material-symbols-outlined text-xl">emoji_events</span>
                                </div>
                                <div className="badge bg-white/20 text-white border-none py-1 backdrop-blur-sm">Torneo</div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg mb-1 group-hover:underline">Versus Progresivo</h3>
                                <p className="text-white/80 text-xs">El campeón se queda. Mide qué opción sobrevive a todas las demás rondas.</p>
                            </div>
                        </div>

                        {/* 3. Profundidad (Mediano, 2x1) */}
                        <div className="col-span-2 row-span-1 card-interactive border border-primary/20 bg-primary/5 p-5 flex flex-col justify-between group cursor-pointer hover:border-primary/40 transition-colors" onClick={onEnterDepth}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="w-10 h-10 bg-white border border-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm">
                                    <span className="material-symbols-outlined text-xl">psychology</span>
                                </div>
                                <div className="badge border-primary/20 text-primary bg-white py-1">Análisis</div>
                            </div>
                            <div>
                                <h3 className="font-bold text-ink text-lg mb-1 group-hover:text-primary transition-colors">Profundidad</h3>
                                <p className="text-slate-500 text-xs mb-1">Aporta valor cualitativo. Preguntas abiertas donde tu voz cuenta más.</p>
                            </div>
                        </div>

                        {/* 4. Actualidad (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 card-interactive p-4 flex flex-col justify-between group relative overflow-hidden cursor-pointer" onClick={onEnterActualidad}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-primary/10 text-primary flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">public</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black text-ink text-sm group-hover:text-primary transition-colors">Actualidad</h3>
                            </div>
                        </div>

                        {/* 5. Deportes (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 card-interactive p-4 flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-emerald-50 text-emerald-600 flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">sports_soccer</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black text-ink text-sm group-hover:text-emerald-600 transition-colors">Deportes</h3>
                            </div>
                        </div>

                        {/* 6. Productos (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 card-interactive p-4 flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-orange-50 text-orange-600 flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black text-ink text-sm group-hover:text-orange-600 transition-colors">Productos</h3>
                            </div>
                        </div>

                        {/* 7. Restaurantes (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 card-interactive p-4 flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-red-50 text-red-600 flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">restaurant</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black text-ink text-sm group-hover:text-red-600 transition-colors">Comida</h3>
                            </div>
                        </div>

                        {/* 8. Lugares (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 card-interactive p-4 flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-blue-50 text-blue-600 flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">location_on</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black text-ink text-sm group-hover:text-blue-600 transition-colors">Lugares</h3>
                            </div>
                        </div>

                        {/* 9. Servicios (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 card-interactive p-4 flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-purple-50 text-purple-600 flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">support_agent</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black text-ink text-sm group-hover:text-purple-600 transition-colors">Servicios</h3>
                            </div>
                        </div>

                        {/* 10. Tu Pulso (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 card-interactive p-4 flex flex-col justify-between group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-rose-50 text-rose-600 flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">monitor_heart</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-black text-ink text-sm group-hover:text-rose-600 transition-colors">Tu Pulso</h3>
                            </div>
                        </div>

                        {/* Elemento Movido a la parte superior: Profundidad */}

                        {/* 11. Explorar Temas (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 bg-surface2 border border-stroke rounded-2xl p-4 flex flex-col justify-between group hover:bg-slate-100 transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-200/50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-white border border-stroke text-text-secondary flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl group-hover:text-ink transition-colors">search</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-ink text-sm">Explorar</h3>
                            </div>
                        </div>

                        {/* 12. Mis Resultados (Pequeño, 1x1) */}
                        <div className="col-span-1 row-span-1 bg-ink text-white rounded-2xl p-4 flex flex-col justify-between group hover:bg-ink-800 transition-colors shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-[2] duration-700 pointer-events-none"></div>
                            <div className="w-12 h-12 rounded-[1rem] bg-white/10 text-white flex items-center justify-center mb-auto transition-transform group-hover:scale-110 group-hover:-rotate-3 duration-300">
                                <span className="material-symbols-outlined text-2xl">bar_chart</span>
                            </div>
                            <div className="relative z-10">
                                <h3 className="font-bold text-white text-sm">Impacto</h3>
                            </div>
                        </div>

                    </div>
                </div>

                {/* COLUMNA LATERAL (4 cols) - Contexto y Data */}
                <div className="lg:col-span-4 space-y-6">

                    {/* TOP TENDENCIAS AHORA */}
                    <div className="card card-pad">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-xl">trending_up</span>
                            <h3 className="label-sm">Hot Now (24h)</h3>
                        </div>

                        {topNow?.top_versus ? (
                            <div className="bg-surface2 rounded-xl p-4 border border-stroke cursor-pointer hover:border-primary/30 transition-all shadow-sm" onClick={onViewResults}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">#1 en participación</div>
                                <h4 className="font-bold text-ink text-sm sm:text-base leading-snug mb-3">
                                    {topNow.top_versus.title}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="badge bg-white border border-stroke text-primary-600 px-2 py-0.5 text-[10px]">
                                        {new Intl.NumberFormat("es-CL").format(topNow.top_versus.signals_24h)} señales
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 rounded-xl p-4 border border-stroke flex items-center justify-center">
                                <span className="text-xs font-bold text-slate-500">Calculando tendencia actual...</span>
                            </div>
                        )}
                    </div>

                    {/* PLATFORM PULSE */}
                    <div className="card card-pad border-t-4 border-t-primary/80">
                        <h3 className="label-sm mb-4 border-b border-stroke pb-2 text-primary-900 font-bold flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-lg">radar</span>
                            Ecosistema en Tiempo Real
                        </h3>

                        {/* Nueva Tabla de Comparación: Métrica | Global | Tú | Promedio */}
                        <div className="w-full -mx-1.5 mt-1">
                            <div className="grid grid-cols-[1fr_42px_42px_42px] sm:grid-cols-[1fr_48px_48px_48px] gap-1.5 mb-2 px-1.5">
                                <div className="text-[10px] font-black uppercase tracking-wider text-text-muted pl-[32px] truncate">Métrica</div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Global</div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-primary text-center">Tú</div>
                                <div className="text-[10px] font-black uppercase tracking-wider text-text-muted text-center">Prom.</div>
                            </div>

                            <div className="space-y-2">
                                {/* Batallas Disponibles */}
                                <div className="grid grid-cols-[1fr_42px_42px_42px] sm:grid-cols-[1fr_48px_48px_48px] gap-1.5 items-center group bg-surface2/30 hover:bg-surface2/80 p-1.5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-md bg-primary/5 border border-primary/20 flex items-center justify-center transition-colors shrink-0">
                                            <span className="material-symbols-outlined text-primary text-[12px]">compare_arrows</span>
                                        </div>
                                        <span className="font-bold text-[11px] sm:text-[13px] text-text-secondary pr-1 whitespace-nowrap">Versus Activos</span>
                                    </div>
                                    <div className="font-black text-ink text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(stats?.active_battles || 0)}</div>
                                    <div className="font-black text-primary text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(Math.min(Math.max(0, (stats?.active_battles || 0) - signalsToday), stats?.active_battles || 0))}</div>
                                    <div className="font-bold text-text-muted text-center text-xs truncate">-</div>
                                </div>



                                {/* Usuarios Activos Hoy */}
                                <div className="grid grid-cols-[1fr_42px_42px_42px] sm:grid-cols-[1fr_48px_48px_48px] gap-1.5 items-center group bg-surface2/30 hover:bg-surface2/80 p-1.5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-md bg-surface2 border border-stroke flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-text-muted text-[12px] group-hover:text-emerald-500 transition-colors">group</span>
                                        </div>
                                        <span className="font-bold text-[11px] sm:text-[13px] text-text-secondary pr-1 whitespace-nowrap">Activos hoy</span>
                                    </div>
                                    <div className="font-black text-ink text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(stats?.active_users_24h || 0)}</div>
                                    <div className="font-black text-primary text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(Math.min(1, stats?.active_users_24h || 0))}</div>
                                    <div className="font-bold text-text-muted text-center text-xs truncate">-</div>
                                </div>

                                {/* Señales Generadas */}
                                <div className="grid grid-cols-[1fr_42px_42px_42px] sm:grid-cols-[1fr_48px_48px_48px] gap-1.5 items-center group bg-surface2/30 hover:bg-surface2/80 p-1.5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-md bg-surface2 border border-stroke flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-text-muted text-[12px] group-hover:text-blue-500 transition-colors">bolt</span>
                                        </div>
                                        <span className="font-bold text-[11px] sm:text-[13px] text-text-secondary pr-1 whitespace-nowrap">Señales(24h)</span>
                                    </div>
                                    <div className="font-black text-ink text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(stats?.signals_24h || 0)}</div>
                                    <div className="font-black text-primary text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(Math.min(signalsToday, stats?.signals_24h || 0))}</div>
                                    <div className="font-bold text-text-muted text-center text-xs sm:text-sm truncate">
                                        {new Intl.NumberFormat("es-CL").format(stats?.active_users_24h ? Math.min(Math.round(stats.signals_24h / stats.active_users_24h), stats?.signals_24h || 0) : 0)}
                                    </div>
                                </div>

                                {/* Opiniones Extensas (Profundidad) */}
                                <div className="grid grid-cols-[1fr_42px_42px_42px] sm:grid-cols-[1fr_48px_48px_48px] gap-1.5 items-center group bg-surface2/30 hover:bg-surface2/80 p-1.5 rounded-lg transition-colors">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-md bg-surface2 border border-stroke flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-text-muted text-[12px] group-hover:text-purple-500 transition-colors">psychology</span>
                                        </div>
                                        <span className="font-bold text-[11px] sm:text-[13px] text-text-secondary pr-1 whitespace-nowrap">Profundidad</span>
                                    </div>
                                    <div className="font-black text-ink text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(stats?.depth_answers_24h || 0)}</div>
                                    {/* Tú: No puede ser superior al global ni exceder el 10% de signals limitando su valor razonablemente simulado */}
                                    <div className="font-black text-primary text-center text-xs sm:text-sm truncate">{new Intl.NumberFormat("es-CL").format(Math.min(Math.ceil(signalsToday * 0.1), stats?.depth_answers_24h || 0))}</div>
                                    <div className="font-bold text-text-muted text-center text-xs sm:text-sm truncate">
                                        {new Intl.NumberFormat("es-CL").format(stats?.active_users_24h ? Math.min(parseFloat((stats.depth_answers_24h / stats.active_users_24h).toFixed(1)), stats?.depth_answers_24h || 0) : 0)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-kpi pb-6 pt-6">
                        <h3 className="label-sm mb-2">Tu Nivel de Influencia</h3>
                        <p className="body-caption text-xs mb-4">Emite más señales consistentes para desbloquear capas analíticas.</p>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-brand" style={{ width: '45%' }}></div>
                        </div>
                        <div className="flex justify-between w-full mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <span>Analista Jr</span>
                            <span>450 pts</span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
