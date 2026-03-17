import { Battle } from '../../signals/types';
import { motion } from 'framer-motion';
import BrandLogo from '../../../components/ui/BrandLogo';

interface HubMenuSimplifiedProps {
    onEnterVersus: () => void;
    onEnterTorneo?: () => void;
    onEnterProfundidad?: () => void;
    onViewResults: () => void;
    topNow: {
        top_versus: { slug: string; title: string; signals_24h: number } | null;
        top_torneo: { slug: string; title: string; signals_24h: number } | null;
    } | null;
    previewVersus: Battle | null;
    signalsToday: number;
    signalsLimit: number | string;
}

export default function HubMenuSimplified({
    onEnterVersus,
    onEnterTorneo,
    onEnterProfundidad,
    onViewResults,
    topNow,
    previewVersus,
    signalsToday,
    signalsLimit
}: HubMenuSimplifiedProps) {
    return (
        <div className="w-full max-w-[1200px] mx-auto space-y-8 px-4 sm:px-6 md:px-8 pb-12 pt-4">
            {/* ENCABEZADO SUPERIOR */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Tu <span className="text-gradient-brand">Hub</span> de Señales
                    </h1>
                    <p className="text-slate-600 font-medium mt-2 text-sm md:text-base">
                        Explora y participa en las conversaciones del día.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md rounded-2xl py-2 px-4 shadow-sm border border-slate-200/50">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                    </span>
                    <span className="text-sm font-black text-slate-700 tracking-widest uppercase">
                        Señales Hoy: <span className="text-primary-600">{signalsToday}</span> <span className="text-slate-400">/ {signalsLimit === 'Infinity' ? '∞' : signalsLimit}</span>
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* COLUMNA PRINCIPAL (8 cols) - Interacciones */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* BLOQUE 1: VERSUS RÁPIDO (Activo) */}
                    <motion.div 
                        whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 cursor-pointer relative overflow-hidden group"
                        onClick={onEnterVersus}
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-transform group-hover:scale-110 duration-700 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-primary-500">
                                        <span className="material-symbols-outlined text-2xl">bolt</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-none">Versus Rápido</h3>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-primary-500 mt-1">Alta prioridad</div>
                                    </div>
                                </div>
                                <div className="bg-primary-50 text-primary-600 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg">
                                    En Vivo
                                </div>
                            </div>
                            
                            <p className="text-slate-600 font-medium mb-8 max-w-[90%] md:max-w-[80%]">
                                La forma más rápida de generar impacto. Compara dos opciones y señala tu preferencia al instante.
                            </p>

                            {/* Preview interactivo simulado - "Arena Flotante" */}
                            {previewVersus && previewVersus.options.length >= 2 && (
                                <div className="mt-auto flex flex-col items-center justify-center gap-6 relative">
                                    <h4 className="text-xl font-black text-slate-800 text-center line-clamp-2 max-w-[80%] z-20">
                                        {previewVersus.title}
                                    </h4>
                                    
                                    {/* Las opciones flotan sin cajas estructuradas duras */}
                                    <div className="flex w-full items-center justify-between px-4 relative z-20">
                                        
                                        {/* Opción A */}
                                        <motion.div 
                                            whileHover={{ scale: 1.1, translateY: -5 }}
                                            className="w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center group/opt relative"
                                        >
                                            <div className="absolute inset-0 bg-primary-500/0 rounded-full blur-xl group-hover/opt:bg-primary-500/20 transition-colors duration-500"></div>
                                            {previewVersus.options[0].image_url ? (
                                                <BrandLogo src={previewVersus.options[0].image_url} alt="Option A" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md group-hover/opt:drop-shadow-xl transition-all" />
                                            ) : (
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-400 shadow-inner">A</div>
                                            )}
                                        </motion.div>

                                        {/* Separador fluido / Rayo */}
                                        <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center text-slate-300 font-black text-xs shrink-0 z-30">VS</div>

                                        {/* Opción B */}
                                        <motion.div 
                                            whileHover={{ scale: 1.1, translateY: -5 }}
                                            className="w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center group/opt relative"
                                        >
                                            <div className="absolute inset-0 bg-emerald-500/0 rounded-full blur-xl group-hover/opt:bg-emerald-500/20 transition-colors duration-500"></div>
                                            {previewVersus.options[1].image_url ? (
                                                <BrandLogo src={previewVersus.options[1].image_url} alt="Option B" className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md group-hover/opt:drop-shadow-xl transition-all" />
                                            ) : (
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-black text-slate-400 shadow-inner">B</div>
                                            )}
                                        </motion.div>
                                    </div>
                                    
                                    {/* Indicador de interacción fluido */}
                                    <div className="text-white text-xs font-bold uppercase tracking-widest bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-300">
                                        Toca para señalar <span className="material-symbols-outlined text-[14px] animate-bounce">ads_click</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* BLOQUE 2: TORNEO (Activo) */}
                        <motion.div 
                            whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(16, 185, 129, 0.2)" }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-emerald-500 rounded-3xl p-6 shadow-md cursor-pointer relative overflow-hidden group border border-emerald-400"
                            onClick={onEnterTorneo}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-emerald-400/30 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                                        <span className="material-symbols-outlined text-xl">emoji_events</span>
                                    </div>
                                    <div className="text-white/90 text-xs font-black uppercase tracking-wider bg-black/10 px-3 py-1 rounded-lg">
                                        Especial
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 italic tracking-tight">Torneo</h3>
                                <p className="text-emerald-50/80 text-sm font-medium leading-relaxed mb-6">
                                    🏆 El campeón se queda. Mide qué opción sobrevive a todas las rondas y llega a la cima.
                                </p>

                                {/* Estructura Bracket Fluida Simulada */}
                                <div className="mt-auto relative h-16 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent rounded-xl"></div>
                                    <div className="flex items-center gap-1 z-10 w-full justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                                        {[1,2,3,4].map((i) => (
                                           <motion.div key={i} animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }} className="w-8 h-8 bg-white/10 rounded-lg border border-emerald-400/30 flex items-center justify-center">
                                              <span className="material-symbols-outlined text-[14px] text-emerald-200">sports_esports</span>
                                           </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-center gap-2 text-emerald-200 group-hover:text-white transition-colors">
                                    <span className="text-sm font-black uppercase tracking-widest">Gameday</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                </div>
                            </div>
                        </motion.div>

                        {/* BLOQUE 3: ACTUALIDAD Y PROFUNDIDAD (Activo) - Diseño: "Editorial Oscuro" */}
                        <motion.div 
                            whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(15, 23, 42, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-slate-900 rounded-3xl p-6 shadow-md cursor-pointer relative overflow-hidden group border border-slate-800"
                            onClick={onEnterProfundidad}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-primary-400 border border-slate-700">
                                        <span className="material-symbols-outlined text-xl">psychology</span>
                                    </div>
                                    <div className="text-slate-300 text-[10px] font-black uppercase tracking-widest bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg">
                                        Análisis Abierto
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 leading-tight">Profundidad</h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                                    Desarrolla tus ideas sobre contingencia política y social en respuestas cualitativas.
                                </p>
                                
                                {/* Campo expansible fluido */}
                                <div className="mt-auto w-full h-12 bg-slate-800 rounded-xl border border-slate-700 flex items-center px-4 group-hover:bg-slate-700/50 transition-colors relative overflow-hidden">
                                     <span className="text-slate-500 text-sm font-medium z-10">Opina aquí...</span>
                                     <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                        <span className="material-symbols-outlined text-white text-[16px]">arrow_forward</span>
                                     </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* BLOQUE 4: RADAR DE SEÑALES (Cristal Empañado) */}
                    <div className="relative w-full rounded-3xl p-1 overflow-hidden group">
                        {/* Borde sutil tipo cristal */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 via-slate-100 to-slate-200/50 rounded-3xl"></div>
                        <div className="absolute inset-[1px] bg-slate-50/90 backdrop-blur-3xl rounded-[23px] flex flex-col justify-center p-6">
                            
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400 text-lg">radar</span>
                                        Radar de Señales
                                    </h3>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">Nuevas conversaciones se están cocinando.</p>
                                </div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-200 px-2 py-1 rounded-md opacity-80">
                                    Próximamente
                                </div>
                            </div>

                            {/* Carrusel con máscara de desvanecimiento en los bordes */}
                            <div className="relative w-full">
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 to-transparent z-10"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 to-transparent z-10"></div>
                                
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x px-4">
                                    {[
                                        { icon: 'sports_soccer', name: 'Deportes', color: 'slate' },
                                        { icon: 'restaurant', name: 'Comida', color: 'slate' },
                                        { icon: 'location_on', name: 'Lugares', color: 'slate' },
                                        { icon: 'shopping_bag', name: 'Productos', color: 'slate' },
                                        { icon: 'support_agent', name: 'Servicios', color: 'slate' }
                                    ].map((cat, i) => (
                                        <div key={i} className="shrink-0 snap-start bg-white/40 backdrop-blur-md border border-slate-200/50 rounded-2xl p-4 w-28 flex flex-col items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-all cursor-default">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100/50 text-slate-400 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">{cat.icon}</span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500">{cat.name}</span>
                                            <span className="material-symbols-outlined text-[12px] text-slate-300 absolute top-2 right-2">lock</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA LATERAL (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* BLOQUE 5: HOT NOW (Dinámico fluido) */}
                    <div className="bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-6 relative overflow-hidden">
                        {/* Brillo dinámico de fondo */}
                        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-50"></div>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-rose-500 text-xl animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">local_fire_department</span>
                            <h3 className="text-base font-black text-slate-900">Hot Now (24h)</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mb-6">El pulso actual de la comunidad Opina+</p>

                        <div className="relative h-[120px] overflow-hidden -mx-2 px-2">
                            {/* Gradientes de desvanecimiento para el ticker */}
                            <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent z-10"></div>
                            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>

                            {topNow?.top_versus ? (
                                <motion.div 
                                    animate={{ y: [20, 0, 0, -20] }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}
                                    onClick={onViewResults}
                                    className="bg-transparent rounded-2xl p-3 border border-slate-100 cursor-pointer hover:bg-slate-50 hover:border-slate-200 transition-all absolute w-full"
                                >
                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-2 flex items-center gap-1">
                                       Trending Topic <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 text-sm leading-snug mb-2 line-clamp-2">
                                        {topNow.top_versus.title}
                                    </h4>
                                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                                        <span>{new Intl.NumberFormat("es-CL").format(topNow.top_versus.signals_24h)} señales</span>
                                        <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                        <span className="animate-spin material-symbols-outlined text-[14px]">sync</span> Analizando...
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <button onClick={onViewResults} className="w-full mt-2 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-colors flex justify-center items-center gap-2">
                            Ver Dashboard Público
                        </button>
                    </div>

                    {/* BLOQUE 6: NIVEL DE INFLUENCIA (Gamificado) */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-amber-400 text-xl">military_tech</span>
                                Tu Nivel de Influencia
                            </h3>
                            <p className="text-xs text-slate-400 font-medium mb-6">
                                Acumula señales para desbloquear analíticas avanzadas y funcionalidades B2B.
                            </p>
                            
                            <div className="bg-slate-950/50 rounded-2xl p-4 border border-slate-700/50">
                                <div className="flex justify-between items-end mb-2">
                                    <div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rango Actual</div>
                                        <div className="text-sm font-black text-white mt-0.5">Analista Jr.</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Puntos</div>
                                        <div className="text-sm font-black text-amber-400 mt-0.5">450 <span className="text-slate-500 text-xs">/ 1000</span></div>
                                    </div>
                                </div>
                                <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden mt-3">
                                    <div className="h-full bg-gradient-brand relative">
                                        <div className="absolute top-0 right-0 bottom-0 w-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]"></div>
                                    </div>
                                </div>
                                <div className="mt-3 text-[10px] font-medium text-slate-400 text-center">
                                    Faltan 550 pts para <span className="text-white font-bold">Analista Pleno</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
