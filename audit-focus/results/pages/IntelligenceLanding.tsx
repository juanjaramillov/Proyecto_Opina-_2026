import { useState, useEffect } from "react";
import { platformService } from "../../signals/services/platformService";
import { TrendingItem } from "../../../types/trending";
import { B2BLeadForm } from "../components/B2BLeadForm";

export default function IntelligenceLanding() {
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
        <div className="min-h-screen bg-white font-sans pb-24 text-ink">
            {/* HERO SECTION - B2B */}
            <header className="relative bg-surface2 overflow-hidden pt-32 pb-24 px-6 md:px-12 border-b border-stroke">
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]"></div>
                </div>

                <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
                    <div className="badge badge-primary mb-8 animate-fade-in-up">
                        <span className="material-symbols-outlined text-[14px]">query_stats</span>
                        Opina+ Intelligence
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-ink tracking-tight mb-6 leading-tight max-w-4xl">
                        No vendemos encuestas.<br />
                        <span className="text-primary">Vendemos Inteligencia en Tiempo Real.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-text-secondary font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        Descubre cómo las señales individuales de miles de usuarios se transforman en certezas analíticas, identificando tendencias antes de que sean evidentes para tu industria.
                    </p>

                    <div className="flex gap-4 items-center flex-col sm:flex-row">
                        <button onClick={() => document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary text-base px-10 py-4 w-full sm:w-auto">
                            Conversar con Ventas
                        </button>
                        <div className="hidden sm:flex items-center gap-2 text-ink text-sm font-bold bg-white px-6 py-4 rounded-xl shadow-sm border border-stroke">
                            <span className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
                            Motor de Señales Activo
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pt-16 relative z-20 space-y-24">

                {/* --- 1. BLOQUES DE INTELIGENCIA --- */}
                <div className="text-center flex flex-col items-center">
                    <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight">Capacidades <span className="text-gradient-brand">Analíticas</span></h2>
                    <p className="text-text-secondary mt-3 font-medium text-lg max-w-2xl">
                        Visualiza cómo operativizamos las respuestas ciudadanas en tableros ejecutivos diseñados para la toma de decisiones estratégicas.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* PILAR 1: TENDENCIAS EN TIEMPO REAL */}
                    <section className="card overflow-hidden group">
                        <div className="bg-surface2 p-6 md:p-8 border-b border-stroke">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary text-[24px]">trending_up</span>
                                <h2 className="text-2xl font-black text-ink tracking-tight">Velocidad y Tendencias</h2>
                            </div>
                            <p className="text-sm font-medium text-text-secondary max-w-xl">
                                Identifica el Momentum. Monitoreo constante de variaciones en la percepción del consumidor.
                            </p>
                        </div>

                        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white">
                            <div className="space-y-6">
                                {/* Insight Card */}
                                <div className="border-l-4 border-secondary pl-4 py-1">
                                    <p className="text-lg font-bold text-ink italic leading-snug">
                                        "La preferencia por <span className="text-primary">Marcas Locales</span> ha experimentado un repunte sostenido en las últimas 72 horas, superando la media histórica del mes."
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {loading ? (
                                        <>
                                            <div className="h-32 bg-surface2 rounded-xl animate-pulse"></div>
                                            <div className="h-32 bg-surface2 rounded-xl animate-pulse"></div>
                                            <div className="h-32 bg-surface2 rounded-xl animate-pulse"></div>
                                            <div className="h-32 bg-surface2 rounded-xl animate-pulse"></div>
                                        </>
                                    ) : trendingFeed.slice(0, 4).map((item, idx) => (
                                        <div key={item.id} className="relative overflow-hidden bg-white border border-stroke rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xl font-black text-stroke group-hover:text-text-muted transition-colors">0{idx + 1}</span>
                                                {item.direction === 'up' && <span className="badge bg-secondary/10 text-secondary border-none"><span className="material-symbols-outlined text-[12px] mr-1">arrow_outward</span>{item.variation_percent.toFixed(1)}%</span>}
                                                {item.direction === 'down' && <span className="badge bg-danger/10 text-danger border-none"><span className="material-symbols-outlined text-[12px] mr-1">south_east</span>{item.variation_percent.toFixed(1)}%</span>}
                                                {item.direction === 'stable' && <span className="badge bg-surface2 text-text-muted border-none"><span className="material-symbols-outlined text-[12px] mr-1">horizontal_rule</span>0%</span>}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-ink leading-tight mb-1">{item.title}</h3>
                                                <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest">{item.slug}</p>
                                            </div>
                                            {/* Sparkline background */}
                                            <svg className="absolute bottom-0 right-0 w-24 h-12 opacity-5 pointer-events-none" viewBox="0 0 100 50" preserveAspectRatio="none">
                                                <path d={item.direction === 'up' ? "M0,50 L20,40 L40,45 L60,20 L80,25 L100,0" : "M0,10 L20,15 L40,10 L60,30 L80,25 L100,50"} fill="none" stroke="currentColor" strokeWidth="4" className={item.direction === 'up' ? 'text-secondary' : 'text-danger'} />
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-surface2 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-stroke shadow-sm">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 blur-3xl rounded-full"></div>

                                <div>
                                    <h3 className="text-ink font-black text-xl mb-1">Volumen Agregado</h3>
                                    <p className="text-text-secondary text-sm font-medium">Señales captadas por el motor en las últimas 12h</p>
                                </div>

                                <div className="mt-8 flex items-end justify-between border-b border-stroke pb-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest">Acumulado</span>
                                        <span className="text-4xl font-black text-ink">42,504</span>
                                    </div>
                                    <div className="flex h-16 w-32 items-end gap-1 opacity-80">
                                        {[20, 30, 25, 40, 35, 60, 80, 100, 95].map((h, i) => (
                                            <div key={i} className={`flex-1 rounded-t-sm transition-all ${i >= 7 ? 'bg-primary' : 'bg-stroke'}`} style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* TWO COLUMN GRID FOR PILLAR 2 & 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* PILAR 2: COMPARACIONES */}
                        <section className="card p-8 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-secondary text-[24px]">compare_arrows</span>
                                <h2 className="text-2xl font-black text-ink tracking-tight">Share of Preference</h2>
                            </div>
                            <p className="text-sm font-medium text-text-secondary mb-8">
                                Mide tu tracción exacta en comparaciones directas de mercado y descubre a quién le estás quitando cuota.
                            </p>

                            <div className="flex-1 flex flex-col justify-center gap-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-ink">La Burger - Clásica</span>
                                        <span className="text-xl font-black text-ink text-right">68%</span>
                                    </div>
                                    <div className="h-3 w-full bg-surface2 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-secondary rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-text-muted text-right uppercase tracking-widest">3,420 señales de respaldo</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-ink">Pizza Mía - Pepperoni</span>
                                        <span className="text-xl font-black text-ink text-right">32%</span>
                                    </div>
                                    <div className="h-3 w-full bg-surface2 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-stroke rounded-full" style={{ width: '32%' }}></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-text-muted text-right uppercase tracking-widest">1,610 señales de respaldo</p>
                                </div>
                            </div>
                        </section>

                        {/* PILAR 3: SEGMENTACIÓN DEMOGRÁFICA */}
                        <section className="card p-8 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary text-[24px]">troubleshoot</span>
                                <h2 className="text-2xl font-black text-ink tracking-tight">Segmentación Profunda</h2>
                            </div>
                            <p className="text-sm font-medium text-text-secondary mb-8">
                                Identifica micro-diferencias sociodemográficas al instante para alinear esfuerzos de retargeting.
                            </p>

                            <div className="border-l-4 border-primary pl-4 py-1 mb-8">
                                <p className="text-sm font-bold text-ink italic leading-snug">
                                    "Aunque la opción B pierde en la general, es hegemónica (+75% share) en mujeres menores de 24 años residentes en la zona urbana."
                                </p>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {/* Graphic 1 */}
                                <div className="bg-surface2 border border-stroke rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <div className="text-2xl font-black text-primary mb-2">75%</div>
                                    <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Mujeres <br /> 18-24</span>
                                </div>

                                {/* Graphic 2 */}
                                <div className="bg-surface2 border border-stroke rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined text-3xl text-primary mb-2">location_on</span>
                                    <h4 className="font-black text-ink text-sm leading-tight">Urbano Céntrico</h4>
                                    <span className="text-[10px] font-black uppercase text-secondary tracking-widest mt-2">+40% vs Prom.</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* PILAR 4: EVOLUCIÓN TEMPORAL */}
                    <section className="card p-8 lg:p-12 relative overflow-hidden bg-gradient-to-br from-white to-surface2/50">
                        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-primary/5 rounded-full blur-[100px]"></div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-primary text-[28px]">speed</span>
                                    <h2 className="text-3xl font-black text-ink tracking-tight">Velocidad <span className="text-primary">Temporal</span></h2>
                                </div>
                                <p className="text-text-secondary font-medium mb-8 text-lg max-w-md leading-relaxed">
                                    No importa solo quién gana, sino a qué velocidad está creciendo un fenómeno. Detecta anomalías, picos de viralidad y patrones estacionales.
                                </p>

                                <div className="card bg-white border-l-4 border-l-primary/60 border-y-0 border-r-0 rounded-l-none p-5 shadow-sm">
                                    <p className="text-sm font-bold text-ink italic leading-relaxed">
                                        "La intención de compra para la nueva categoría aumentó exponencialmente (x3) justo después del lanzamiento oficial, indicando alta receptividad en early-adopters."
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-stroke shadow-sm relative">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h4 className="text-ink font-bold text-lg">Adopción Semanal</h4>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">Base: 12,000 señales</p>
                                    </div>
                                    <span className="badge badge-accent bg-primary/10 text-primary border-none">Crecimiento Rápido</span>
                                </div>

                                {/* Line Chart Structure */}
                                <div className="relative h-48 w-full flex items-end">
                                    {/* Grid */}
                                    <div className="absolute inset-0 flex flex-col justify-between">
                                        <div className="w-full border-b border-stroke border-dashed"></div>
                                        <div className="w-full border-b border-stroke border-dashed"></div>
                                        <div className="w-full border-b border-stroke border-dashed"></div>
                                        <div className="w-full border-b border-stroke border-dashed"></div>
                                    </div>

                                    {/* SVG Line */}
                                    <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                        <path d="M0,80 Q20,85 40,60 T60,50 T80,20 T100,10" fill="none" stroke="var(--brand-opina-blue)" strokeWidth="3" />
                                        <path d="M0,80 Q20,85 40,60 T60,50 T80,20 T100,10 L100,100 L0,100 Z" fill="var(--brand-opina-blue)" opacity="0.05" />
                                        <circle cx="0" cy="80" r="3" fill="var(--brand-opina-blue)" />
                                        <circle cx="40" cy="60" r="3" fill="var(--brand-opina-blue)" />
                                        <circle cx="80" cy="20" r="4" fill="var(--brand-opina-blue)" className="animate-pulse" />
                                        <circle cx="100" cy="10" r="3" fill="var(--brand-opina-blue)" />
                                    </svg>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-text-muted uppercase tracking-widest mt-4 px-2">
                                    <span>Lun 12</span>
                                    <span>Mie 14</span>
                                    <span>Vie 16</span>
                                    <span>Dom 18</span>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>


                {/* --- 2. CASOS DE USO O DOLORES DE NEGOCIO --- */}
                <section className="bg-surface2 rounded-[2rem] p-8 md:p-12 border border-stroke">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-text-muted font-bold uppercase tracking-widest text-xs mb-3 block">Aplicaciones de Negocio</span>
                        <h2 className="text-3xl font-black text-ink tracking-tight mb-4">Certezas para cada ciclo <span className="text-primary">corporativo</span></h2>
                        <p className="text-text-secondary font-medium text-lg leading-relaxed">
                            El motor se adapta a la necesidad que tengas hoy. Desde evaluar un riesgo hasta diagnosticar la efectividad de una campaña.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-primary transition-colors"><span className="material-symbols-outlined text-2xl">monitor_heart</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Monitoreo de Crisis</h4>
                            <p className="text-[14px] leading-relaxed text-text-secondary font-medium">Sigue el impacto real en percepción tras un evento adverso casi en tiempo real.</p>
                        </div>
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-primary transition-colors"><span className="material-symbols-outlined text-2xl">swords</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Trackeo Rival</h4>
                            <p className="text-[14px] leading-relaxed text-text-secondary font-medium">Mide tu Share of Preference directamente frente al lanzamiento de competidores.</p>
                        </div>
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-primary transition-colors"><span className="material-symbols-outlined text-2xl">rocket_launch</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Desempeño Launch</h4>
                            <p className="text-[14px] leading-relaxed text-text-secondary font-medium">Detecta tracción inicial y descubre si estás afinando en el segmento deseado.</p>
                        </div>
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-primary transition-colors"><span className="material-symbols-outlined text-2xl">radar</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Detección de Trend</h4>
                            <p className="text-[14px] leading-relaxed text-text-secondary font-medium">Adelántate a la ola masiva identificando la adopción de un concepto emergente.</p>
                        </div>
                    </div>
                </section>


                {/* --- 3. OFERTA COMERCIAL / PLANES DE ACCESO --- */}
                <section className="card p-8 md:p-12 mb-20 border-none shadow-lg">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-primary font-bold uppercase tracking-widest text-xs mb-3 block">Accesos Especializados</span>
                        <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight mb-4">La profundidad que tu <span className="text-gradient-brand">industria</span> necesita</h2>
                        <p className="text-text-secondary font-medium text-lg">Desde un paneo de mercado hasta inteligencia táctica en tiempo real. Configura tu acceso a la velocidad del insight.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-end">
                        {/* Tier 1: BASE */}
                        <div className="card p-8 flex flex-col relative group hover:border-primary/30 transition-colors">
                            <h3 className="text-2xl font-black text-ink mb-1">Market Pulse</h3>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Plan Base</p>
                            <p className="text-sm text-text-secondary mb-8 font-medium border-b border-stroke pb-6">Entiende la dirección del mercado hoy. Ideal para agencias boutique.</p>

                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-text-muted text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-medium leading-tight">Feed de Tendencias Nacional</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-text-muted text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-medium leading-tight">Monitoreo Marca (Semanal)</span>
                                </li>
                            </ul>
                            <button onClick={() => document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary w-full">Solicitar Acceso</button>
                        </div>

                        {/* Tier 2: PRO (Highlighted) */}
                        <div className="card p-10 border-2 border-primary relative shadow-xl flex flex-col md:-translate-y-4">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Recomendado</div>

                            <h3 className="text-2xl font-black text-ink mb-1">Deep Analytics</h3>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">Plan Pro</p>
                            <p className="text-sm text-text-secondary mb-8 font-medium border-b border-stroke pb-6">Descubre quién te prefiere y por qué. Insights tácticos inmediatos.</p>

                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-bold leading-tight">Todo lo de Base</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-medium leading-tight">Share of Preference vs Rivals</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-medium leading-tight">Cruces Demográficos Libres</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-medium leading-tight">Exportación PDF/CSV</span>
                                </li>
                            </ul>
                            <button onClick={() => document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' })} className="btn-primary w-full">Hablar con Ventas</button>
                        </div>

                        {/* Tier 3: ENTERPRISE */}
                        <div className="card p-8 flex flex-col relative group hover:border-primary/30 transition-colors">
                            <h3 className="text-2xl font-black text-ink mb-1">Velocity</h3>
                            <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-6">Enterprise</p>
                            <p className="text-sm text-text-secondary mb-8 font-medium border-b border-stroke pb-6">Adelántate al mercado con analítica predictiva en tiempo real.</p>

                            <ul className="space-y-4 mb-10 flex-1">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-bold leading-tight">Todo lo de Pro</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-medium leading-tight">Segmentación Micro-Granular</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">check_circle</span>
                                    <span className="text-sm text-ink font-medium leading-tight">Alertas de Crisis Inmediatas</span>
                                </li>
                            </ul>
                            <button onClick={() => document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary w-full">Contactar Partner</button>
                        </div>
                    </div>
                </section>


                {/* --- 4. FOOTER B2B CAPTURA DE LEAD --- */}
                <section className="bg-surface2 text-center py-20 px-6 rounded-[2rem] border border-stroke shadow-sm mb-12">
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-primary font-black uppercase tracking-widest text-xs mb-4 block">Capacidad Empresarial</span>
                        <h2 className="text-3xl md:text-5xl lg:text-5xl font-black text-ink mb-6 tracking-tight max-w-3xl mx-auto leading-tight">
                            Suma categorías.<br />Cruza variables.<br />Multiplica tus certezas.
                        </h2>
                        <p className="text-text-secondary font-medium mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
                            Comienza a tomar decisiones respaldadas por inteligencia real en tiempo real. El motor escala analíticamente a la medida de los dolores puntuales de tu industria.
                        </p>

                        <div id="b2b-lead-form" className="w-full max-w-2xl mx-auto mt-4 transition-all duration-500 pt-8 border-t border-stroke">
                            {/* Assuming B2BLeadForm was also styled safely, if not it needs CSS review */}
                            <B2BLeadForm />
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
