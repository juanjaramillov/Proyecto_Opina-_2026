import { useState, useEffect } from "react";
import { platformService } from "../../signals/services/platformService";
import { TrendingItem } from "../../../types/trending";
import { B2BLeadForm } from "../components/B2BLeadForm";

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [trendingFeed, setTrendingFeed] = useState<TrendingItem[]>([]);

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            const data = await platformService.getSegmentedTrending("all", "all", "all");
            if (!mounted) return;
            setTrendingFeed(data || []);
            setLoading(false);
        };
        fetchStats();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* HERO SECTION - B2B */}
            <header className="relative bg-slate-900 overflow-hidden pt-32 pb-24 px-6">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-[10px] font-black uppercase tracking-widest text-primary-400 mb-8 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[14px]">query_stats</span>
                        Opina+ Intelligence Labs
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-tight max-w-4xl">
                        No vendemos encuestas.<br />
                        <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-emerald-400 bg-clip-text text-transparent">Vendemos Inteligencia en Tiempo Real.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        Descubre cómo las señales individuales de miles de usuarios se transforman en certezas absolutas de mercado, identificando tendencias antes de que sean evidentes.
                    </p>

                    <div className="flex gap-4 items-center">
                        <div className="flex items-center gap-2 text-slate-300 text-sm font-bold bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                            Motor de Señales Activo
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1400px] mx-auto px-6 -mt-10 relative z-20 space-y-8">

                {/* OFERTA COMERCIAL / PLANES DE ACCESO */}
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8 md:p-12 mb-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-primary-500 font-bold uppercase tracking-widest text-xs mb-2 block">Planes de Inteligencia B2B</span>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">La profundidad que tu industria necesita</h2>
                        <p className="text-slate-500 font-medium">Desde un paneo de mercado hasta inteligencia táctica en tiempo real. Configura tu acceso a la velocidad del insight.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Tier 1: BASE */}
                        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex flex-col relative group hover:border-slate-300 transition-colors">
                            <h3 className="text-2xl font-black text-slate-900 mb-1">Market Pulse</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Plan Base</p>
                            <p className="text-sm text-slate-600 mb-8 min-h-[40px]">Entiende la dirección del mercado hoy. Ideal para agencias y consultoras boutique.</p>

                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-700 font-medium leading-tight">Acceso a Feed de Tendencias Nacional</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-700 font-medium leading-tight">Monitoreo Simple de Marca (Variación Semanal)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-slate-400 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-700 font-medium leading-tight">Ranking Global de Categoría</span>
                                </li>
                            </ul>

                            <button onClick={() => document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-4 px-6 rounded-xl bg-slate-50 text-slate-900 font-black text-sm uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-colors">Solicitar Acceso</button>
                        </div>

                        {/* Tier 2: PRO (Highlighted) */}
                        <div className="bg-slate-900 border-2 border-primary-500 rounded-[2rem] p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-primary-500/20">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Recomendado</div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 blur-2xl rounded-full"></div>

                            <h3 className="text-2xl font-black text-white mb-1 relative z-10">Deep Analytics</h3>
                            <p className="text-sm font-bold text-primary-400 uppercase tracking-widest mb-6 relative z-10">Plan Pro</p>
                            <p className="text-sm text-slate-300 mb-8 min-h-[40px] relative z-10">Descubre quién te prefiere y por qué. Insights tácticos para toma de decisiones.</p>

                            <ul className="space-y-4 mb-10 flex-1 relative z-10">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary-400 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-white font-bold leading-tight">Todo lo incluido en Base, además:</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary-400 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-300 font-medium leading-tight">Share of Preference vs Competidores</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary-400 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-300 font-medium leading-tight">Cruces Demográficos (Edad, Género, Región)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary-400 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-300 font-medium leading-tight">Exportación de Reportes PDF/CSV</span>
                                </li>
                            </ul>

                            <button onClick={() => document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' })} className="w-full py-4 px-6 rounded-xl bg-primary-500 text-white font-black text-sm uppercase tracking-widest hover:bg-primary-600 transition-colors shadow-lg relative z-10">Hablar con Ventas</button>
                        </div>

                        {/* Tier 3: ENTERPRISE */}
                        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-8 flex flex-col relative group hover:border-slate-300 transition-colors">
                            <h3 className="text-2xl font-black text-slate-900 mb-1">Velocity & Command</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Enterprise</p>
                            <p className="text-sm text-slate-600 mb-8 min-h-[40px]">Adelántate al mercado con analítica predictiva y monitoreo de adopción en tiempo real.</p>

                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-900 font-bold leading-tight">Todo lo incluido en Pro, además:</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-700 font-medium leading-tight">Segmentación Micro-Granular (Comuna, GSE)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-700 font-medium leading-tight">Métricas Predictivas de Adopción (Velocity)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-emerald-500 text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-slate-700 font-medium leading-tight">Alertas de Anomalía por Crisis RRPP (SMS/Email)</span>
                                </li>
                            </ul>

                            <button className="w-full py-4 px-6 rounded-xl bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-colors">Contactar a un Partner</button>
                        </div>
                    </div>
                </section>

                {/* CASOS DE USO O DOLORES DE NEGOCIO */}
                <section className="mb-16 mt-8">
                    <div className="flex items-center gap-2 mb-6 ml-2">
                        <span className="material-symbols-outlined text-slate-400 text-[24px]">lightbulb</span>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Casos de Uso Estratégico</h2>
                    </div>

                    <div className="grid grid-cols-1 justify-center md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-start">
                            <span className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[20px]">monitor_heart</span></span>
                            <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">Monitoreo de Crisis</h4>
                            <p className="text-[14px] leading-relaxed text-slate-500">Sigue el impacto real en percepción tras un evento adverso de RRPP casi en tiempo real.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-start">
                            <span className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[20px]">swords</span></span>
                            <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">Trackeo Rival</h4>
                            <p className="text-[14px] leading-relaxed text-slate-500">Mide tu Share of Preference directamente frente al lanzamiento de tu competidor más activo.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-start">
                            <span className="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[20px]">target</span></span>
                            <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">Desempeño de Lanzamiento</h4>
                            <p className="text-[14px] leading-relaxed text-slate-500">Detecta tracción inicial y descubre rápidamente si estás afinando en el segmento core deseado.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-start">
                            <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4"><span className="material-symbols-outlined text-[20px]">moving</span></span>
                            <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide">Detección de Trend</h4>
                            <p className="text-[14px] leading-relaxed text-slate-500">Adelántate a la ola masiva identificando la velocidad de adopción de un concepto emergente.</p>
                        </div>
                    </div>
                </section>

                {/* DIVIDER TITLE FOR THE DEMO */}
                <div className="text-center mt-20 mb-8 flex flex-col items-center">
                    <span className="w-px h-12 bg-slate-300 mb-6 block"></span>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">¿Cómo se ve el motor por dentro?</h2>
                    <p className="text-slate-500 mt-2 font-medium">Evidencias visuales de nuestras interfaces ejecutivas de análisis de mercado.</p>
                </div>

                {/* PILAR 1: TENDENCIAS EN TIEMPO REAL (Con Data Real) */}
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-1">
                    <div className="bg-slate-50/50 rounded-[1.8rem] rounded-b-none p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary-500 text-[24px]">trending_up</span>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Velocidad y Tendencias</h2>
                            </div>
                            <p className="text-sm font-medium text-slate-500">
                                Monitoreo constante de variaciones en la percepción del consumidor.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-white rounded-b-[1.8rem]">
                        <div className="space-y-4">
                            {/* Insight Card Literal */}
                            <div className="border-l-4 border-emerald-500 pl-4 py-1 mb-6">
                                <p className="text-lg font-bold text-slate-800 italic">
                                    "La preferencia por <span className="text-primary-600">Marcas Locales</span> ha experimentado un repunte sostenido en las últimas 72 horas, superando la media histórica del mes."
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {loading ? (
                                    <>
                                        <div className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
                                        <div className="h-32 bg-slate-50 rounded-2xl animate-pulse"></div>
                                    </>
                                ) : trendingFeed.slice(0, 4).map((item, idx) => (
                                    <div key={item.id} className="relative overflow-hidden bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between group hover:border-slate-300 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xl font-black text-slate-300 group-hover:text-slate-400 transition-colors">0{idx + 1}</span>
                                            {item.direction === 'up' && <span className="text-[12px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">arrow_outward</span> {item.variation_percent.toFixed(1)}%</span>}
                                            {item.direction === 'down' && <span className="text-[12px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">south_east</span> {item.variation_percent.toFixed(1)}%</span>}
                                            {item.direction === 'stable' && <span className="text-[12px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">horizontal_rule</span> 0%</span>}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{item.title}</h3>
                                            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">{item.slug}</p>
                                        </div>
                                        {/* Background trend line visual mock */}
                                        <svg className="absolute bottom-0 right-0 w-24 h-12 opacity-10" viewBox="0 0 100 50" preserveAspectRatio="none">
                                            <path d={item.direction === 'up' ? "M0,50 L20,40 L40,45 L60,20 L80,25 L100,0" : "M0,10 L20,15 L40,10 L60,30 L80,25 L100,50"} fill="none" stroke="currentColor" strokeWidth="4" className={item.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'} />
                                        </svg>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full"></div>

                            <div>
                                <h3 className="text-white font-black text-xl mb-1">Volumen Agregado</h3>
                                <p className="text-slate-400 text-sm font-medium">Señales captadas por el motor en vivo</p>
                            </div>

                            <div className="mt-8 flex items-end justify-between border-b border-slate-700/50 pb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Hoy</span>
                                    <span className="text-3xl font-black text-white">42,504</span>
                                </div>
                                <div className="flex h-16 w-32 items-end gap-1 opacity-80">
                                    {[20, 30, 25, 40, 35, 60, 80, 100, 95].map((h, i) => (
                                        <div key={i} className={`flex-1 rounded-t-sm ${i >= 7 ? 'bg-primary-500' : 'bg-slate-700'}`} style={{ height: `${h}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>


                {/* TWO COLUMN GRID FOR PILLAR 2 & 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* PILAR 2: COMPARACIONES (Share of Preference) */}
                    <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-emerald-500 text-[24px]">compare_arrows</span>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Share of Preference</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-6">
                            Nudges conductuales y enfrentamientos directos de mercado.
                        </p>

                        <div className="border-l-4 border-primary-500 pl-4 py-1 mb-8">
                            <p className="text-sm font-bold text-slate-800 italic">
                                "En el segmento de comida rápida, <span className="font-black">La Burger</span> absorbe transversalmente el 68% de la tracción frente a opciones de pizza en el Q4."
                            </p>
                        </div>

                        {/* Visual Mock: Battle Bars */}
                        <div className="flex-1 flex flex-col justify-center gap-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-black text-slate-800">
                                    <span>La Burger - Clásica</span>
                                    <span>68%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: '68%' }}></div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 text-right">3,420 señales de respaldo</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-black text-slate-800">
                                    <span>Pizza Mía - Pepperoni</span>
                                    <span>32%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-slate-300 rounded-full" style={{ width: '32%' }}></div>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 text-right">1,610 señales de respaldo</p>
                            </div>
                        </div>
                    </section>


                    {/* PILAR 3: SEGMENTACIÓN DEMOGRÁFICA */}
                    <section className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-6 md:p-8 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-blue-500 text-[24px]">pie_chart</span>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Segmentación Profunda</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-6">
                            Identifica micro-diferencias sociodemográficas al instante.
                        </p>

                        <div className="border-l-4 border-blue-500 pl-4 py-1 mb-8">
                            <p className="text-sm font-bold text-slate-800 italic">
                                "Aunque la opción B pierde en la general, es hegemónica (+75% share) en mujeres menores de 24 años de vitacura."
                            </p>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-4">
                            {/* Graphic 1: Age */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-r-slate-200 flex items-center justify-center mb-3">
                                    <span className="text-sm font-black text-slate-800">75%</span>
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mujeres <br /> 18-24</span>
                            </div>

                            {/* Graphic 2: Geo */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                                <span className="material-symbols-outlined text-[32px] text-primary-500 mb-2">location_on</span>
                                <h4 className="font-black text-slate-800 text-sm">Vitacura</h4>
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">+40% vs Promedio</span>
                            </div>
                        </div>
                    </section>

                </div>


                {/* PILAR 4: EVOLUCIÓN TEMPORAL (Velocity) */}
                <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
                    <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px]"></div>

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-emerald-400 text-[28px]">speed</span>
                                <h2 className="text-3xl font-black text-white tracking-tight">Velocidad del Insight</h2>
                            </div>
                            <p className="text-slate-400 font-medium mb-8 max-w-sm">
                                No importa solo quién gana, sino a qué velocidad está creciendo un fenómeno. Detecta anomalías y picos de viralidad.
                            </p>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-6">
                                <p className="text-sm font-bold text-white italic">
                                    "La intención de compra para la nueva categoría aumentó exponencialmente (x3) justo después del lanzamiento oficial, indicando una alta receptividad en early-adopters."
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-950/50 rounded-3xl p-6 border border-slate-700/50">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h4 className="text-white font-bold text-sm">Adopción Semanal</h4>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Base: 12,000 señales</p>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase tracking-widest">Alerta de Crecimiento</span>
                            </div>

                            {/* Line Chart Mock */}
                            <div className="relative h-40 w-full flex items-end">
                                {/* Grid lines */}
                                <div className="absolute inset-0 flex flex-col justify-between">
                                    <div className="w-full border-b border-slate-800"></div>
                                    <div className="w-full border-b border-slate-800"></div>
                                    <div className="w-full border-b border-slate-800"></div>
                                    <div className="w-full border-b border-slate-800"></div>
                                </div>

                                {/* SVG Line */}
                                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                    <path d="M0,80 Q20,85 40,60 T60,50 T80,20 T100,10" fill="none" stroke="#10b981" strokeWidth="3" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <path d="M0,80 Q20,85 40,60 T60,50 T80,20 T100,10 L100,100 L0,100 Z" fill="url(#gradient)" opacity="0.2" />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="100%" stopColor="transparent" />
                                        </linearGradient>
                                    </defs>
                                    {/* Points */}
                                    <circle cx="0" cy="80" r="2" fill="#fff" />
                                    <circle cx="40" cy="60" r="2" fill="#fff" />
                                    <circle cx="80" cy="20" r="3" fill="#fff" className="animate-pulse" />
                                    <circle cx="100" cy="10" r="2" fill="#fff" />
                                </svg>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-3">
                                <span>Lun 12</span>
                                <span>Mie 14</span>
                                <span>Vie 16</span>
                                <span>Dom 18</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* FOOTER B2B Call to action */}
                <section className="bg-slate-900 text-center py-20 px-6 rounded-[3rem] shadow-2xl mt-16 mb-8 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px]"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-primary-400 font-black uppercase tracking-widest text-xs mb-4 block">Capacidad Ilimitada</span>
                        <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight max-w-3xl mx-auto leading-tight">
                            Suma categorías.<br />Cruza variables.<br />Multiplica tus certezas.
                        </h2>
                        <p className="text-slate-400 font-medium mb-12 max-w-xl mx-auto text-lg leading-relaxed">
                            Comienza a tomar decisiones respaldadas por inteligencia real. El motor escala analíticamente a la medida de los dolores de tu industria.
                        </p>
                        <div id="b2b-lead-form" className="w-full max-w-2xl mx-auto mt-4 transition-all duration-500 pt-8 border-t border-slate-800">
                            <B2BLeadForm />
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
