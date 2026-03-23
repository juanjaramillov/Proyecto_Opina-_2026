interface HubSecondaryTracksProps {
    setMode: (mode: 'menu' | 'versus' | 'torneo' | 'profundidad' | 'actualidad' | 'lugares') => void;
}

export function HubSecondaryTracks({ setMode }: HubSecondaryTracksProps) {
    return (
        <div className="w-full relative bg-slate-50/50 pb-20">
            {/* CTA Versus Específico removido como caja top y movido abajo */}

            {/* Track Secundarios: Exploración de Módulos (Bento Grid) */}
            <div className="w-full max-w-6xl mx-auto px-4 md:px-6 pb-12 pt-12 md:pt-16">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-ink tracking-tight mb-2">Más formas de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">opinar</span></h2>
                        <p className="text-sm md:text-base text-slate-500 font-medium max-w-2xl">Explora temas específicos y modos avanzados diseñados para tu perspectiva.</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    
                    {/* 0. VERSUS TEMÁTICO (Wide Card) */}
                    <button 
                        onClick={() => setMode('versus')}
                        className="group relative flex flex-col px-6 py-6 md:px-8 md:py-8 rounded-[2rem] bg-gradient-to-br from-white to-blue-50/80 border border-blue-200/60 hover:border-primary/40 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] transition-all duration-500 text-left overflow-hidden min-h-[220px] md:col-span-2"
                    >
                        {/* Glow and Grid Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                        <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full h-full">
                            <div className="flex-1 md:pr-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow-sm text-blue-600 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all duration-300">
                                        <span className="material-symbols-outlined text-xl">category</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200/50 text-[10px] font-bold uppercase tracking-wider">A Medida</span>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-slate-800 group-hover:text-primary transition-colors">Tus Temas Favoritos</h3>
                                <p className="text-[14px] md:text-base text-slate-600 leading-relaxed font-medium mt-2 max-w-md">Descubre combates cara a cara en las categorías y marcas que más te apasionan jugar.</p>
                            </div>
                            
                            {/* Decorative element on the right */}
                            <div className="relative shrink-0 flex items-center justify-end w-full md:w-auto h-24 md:h-auto mt-4 md:mt-0">
                                <div className="absolute inset-0 md:relative z-10 w-full overflow-hidden flex flex-col justify-center gap-2 pointer-events-none">
                                    <div className="flex items-center gap-2 justify-end -translate-x-4 md:-translate-x-0 group-hover:translate-x-[-10px] transition-transform duration-300">
                                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 font-bold text-[10px] md:text-xs shadow-sm transform -rotate-3 text-right">👨‍💻 Tecnología</span>
                                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 font-bold text-[10px] md:text-xs shadow-sm transform rotate-2">🍔 Fast Food</span>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 group-hover:translate-x-[10px] transition-transform duration-300">
                                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 font-bold text-[10px] md:text-xs shadow-sm transform rotate-1">🎬 Entretenimiento</span>
                                        <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-600 font-bold text-[10px] md:text-xs shadow-sm transform -rotate-2 hidden sm:flex">🛍️ Retail</span>
                                    </div>
                                    {/* Arrow CTA */}
                                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md border border-slate-200 flex-col items-center justify-center text-blue-600 transition-all opacity-0 group-hover:opacity-100 group-hover:translate-x-4">
                                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </button>
                    
                    {/* 1. TORNEOS */}
                    <button 
                        onClick={() => setMode('torneo')}
                        className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-primary/50 hover:shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] transition-all duration-300 text-left overflow-hidden min-h-[220px]"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0 transition-transform duration-500 group-hover:scale-110" />
                        
                        <div className="relative z-10 mb-auto">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 border border-blue-100">
                                <span className="material-symbols-outlined text-2xl">emoji_events</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-xl group-hover:text-primary transition-colors">Torneos</h3>
                            <p className="text-[15px] text-slate-600 mt-2 leading-relaxed">Llaves eliminatorias intensas. Selecciona a los mejores y elige a un solo campeón.</p>
                        </div>
                        
                        <div className="relative z-10 flex items-center gap-2 mt-6 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                            Entrar al estadio <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                    </button>

                    {/* 2. PROFUNDIDAD */}
                    <button 
                        onClick={() => setMode('profundidad')}
                        className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-sky-400 hover:shadow-[0_20px_40px_-15px_rgba(14,165,233,0.15)] transition-all duration-300 text-left overflow-hidden min-h-[220px]"
                    >
                        <div className="absolute inset-0 opacity-[0.02] mix-blend-multiply pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #0ea5e9 1px, transparent 1px), linear-gradient(to bottom, #0ea5e9 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-sky-400/5 rounded-full blur-2xl -z-0 transition-transform duration-700 group-hover:scale-150" />
                        
                        <div className="relative z-10 mb-auto">
                            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white border border-sky-100 shadow-sm">
                                <span className="material-symbols-outlined text-2xl">psychology</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-xl group-hover:text-sky-600 transition-colors">Profundidad</h3>
                            <p className="text-[15px] text-slate-600 mt-2 leading-relaxed">Encuestas multivariables. Evalúa con rigor y descubre capas ocultas de insights.</p>
                        </div>
                    </button>

                    {/* 3. ACTUALIDAD */}
                    <button 
                        onClick={() => setMode('actualidad')}
                        className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] transition-all duration-300 text-left overflow-hidden min-h-[220px]"
                    >
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">En Vivo</span>
                        </div>
                        
                        <div className="relative z-10 mb-auto mt-2">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12 border border-emerald-100">
                                <span className="material-symbols-outlined text-2xl">bolt</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-xl group-hover:text-emerald-600 transition-colors">Actualidad</h3>
                            <p className="text-[15px] text-slate-600 mt-2 leading-relaxed">Reacciona a noticias de última hora y marca tendencia minuto a minuto.</p>
                        </div>
                    </button>

                    {/* 4. LUGARES */}
                    <button 
                        onClick={() => setMode('lugares')}
                        className="group relative flex flex-col p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-blue-300 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.12)] transition-all duration-300 text-left overflow-hidden min-h-[220px]"
                    >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #2563eb 1.5px, transparent 1.5px)', backgroundSize: '16px 16px' }} />
                        
                        <div className="relative z-10 mb-auto mt-2">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4 transition-all duration-300 group-hover:-translate-y-2 border border-slate-200 shadow-sm relative group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                                <span className="material-symbols-outlined text-2xl relative z-10">place</span>
                                <div className="absolute -bottom-2 w-6 h-1.5 bg-blue-200 rounded-full blur-[2px] opacity-0 group-hover:opacity-100" />
                            </div>
                            <h3 className="font-bold text-slate-800 text-xl group-hover:text-blue-600 transition-colors">Lugares</h3>
                            <p className="text-[15px] text-slate-600 mt-2 leading-relaxed">Experiencia on-site. Evalúa sucursales, tiendas y tu entorno de inmediato.</p>
                        </div>
                    </button>

                    {/* 5. PRÓXIMAMENTE: PREDICCIONES */}
                    <div className="group relative flex flex-col p-6 rounded-[2rem] bg-slate-50 border border-slate-200/50 grayscale hover:grayscale-0 transition-all duration-500 text-left overflow-hidden min-h-[220px]">
                        <div className="absolute top-4 right-4 px-2 py-1 bg-slate-200 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            Próximamente
                        </div>
                        
                        <div className="relative z-10 mb-auto mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mb-4 border border-slate-300">
                                <span className="material-symbols-outlined text-2xl">query_stats</span>
                            </div>
                            <h3 className="font-bold text-slate-500 text-xl">Predicciones</h3>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">Apuesta tus señales en eventos futuros y compite por los pozos de recompensas.</p>
                        </div>
                    </div>

                    {/* 6. PRÓXIMAMENTE: DESAFÍOS */}
                    <div className="group relative flex flex-col p-6 rounded-[2rem] bg-slate-50 border border-slate-200/50 grayscale hover:grayscale-0 transition-all duration-500 text-left overflow-hidden min-h-[220px]">
                        <div className="absolute top-4 right-4 px-2 py-1 bg-slate-200 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-wider">
                            Próximamente
                        </div>
                        
                        <div className="relative z-10 mb-auto mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center mb-4 border border-slate-300">
                                <span className="material-symbols-outlined text-2xl">verified</span>
                            </div>
                            <h3 className="font-bold text-slate-500 text-xl">Desafíos</h3>
                            <p className="text-sm text-slate-400 mt-2 leading-relaxed">Retos patrocinados por marcas. Completa misiones y estira tus beneficios reales.</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default HubSecondaryTracks;
