import { useState, useEffect } from "react";
import { platformService, PlatformStats } from "../../signals/services/platformService";
import { TrendingItem } from "../../../types/trending";
import { B2BLeadForm } from "../components/B2BLeadForm";
import { GradientCTA, GradientText, AmbientOrbs } from "../../../components/ui/foundation";
import { ResultsExtendedKPIs } from "../components/ResultsExtendedKPIs";
import { useResultsExperience } from "../hooks/useResultsExperience";
import { IntelligenceKPICatalog } from "../components/intelligence/IntelligenceKPICatalog";
import { IntelligenceTierScopeSelector } from "../components/intelligence/IntelligenceTierScopeSelector";
import { IntelligencePrivacyAccordion } from "../components/intelligence/IntelligencePrivacyAccordion";
import { IntelligenceAPIAccessStub } from "../components/intelligence/IntelligenceAPIAccessStub";
import { KPITier } from "../components/intelligence/kpiCatalog";
import { ScopeType } from "../components/intelligence/tierScopeMatrix";

export default function IntelligenceLanding() {
    const [loading, setLoading] = useState(true);
    const [trendingFeed, setTrendingFeed] = useState<TrendingItem[]>([]);
    const [liveStats, setLiveStats] = useState<PlatformStats | null>(null);
    const [leadPrefill, setLeadPrefill] = useState<{ tier?: KPITier; scope?: ScopeType; source?: string } | null>(null);
    const { snapshot } = useResultsExperience();

    // Scroll al lead form, opcionalmente con prefill de tier/scope/source
    const scrollToLeadForm = (prefill?: typeof leadPrefill) => {
        if (prefill) setLeadPrefill(prefill);
        document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        let mounted = true;
        const fetchStats = async () => {
            const [trending, stats] = await Promise.all([
                platformService.getSegmentedTrending("all", "all", "all"),
                platformService.getLiveStats(),
            ]);
            if (!mounted) return;
            setTrendingFeed(trending || []);
            setLiveStats(stats);
            setLoading(false);
        };
        fetchStats();
        return () => { mounted = false; };
    }, []);

    // Helper para formatear números grandes con separador de miles (es-CL)
    const fmt = (n: number | undefined | null) =>
        n != null ? n.toLocaleString('es-CL') : '—';

    return (
        <div className="min-h-screen bg-white font-sans pb-24 text-ink">
            {/* HERO SECTION - B2B */}
            <header className="relative bg-surface2 overflow-hidden pt-32 pb-24 px-6 md:px-12 border-b border-stroke">
                <AmbientOrbs variant="hero" className="opacity-40" />

                <div className="relative z-10 w-full max-w-[1200px] mx-auto flex flex-col items-center text-center">
                    <div className="badge badge-primary mb-8 animate-fade-in-up">
                        <span className="material-symbols-outlined text-[14px]">query_stats</span>
                        Opina+ Intelligence
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-ink tracking-tight mb-6 leading-tight max-w-4xl">
                        No vendemos encuestas.<br />
                        <GradientText>Entregamos Lectura Estadística Continua.</GradientText>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        Descubre cómo las señales individuales de miles de usuarios se transforman en certezas analíticas, identificando tendencias antes de que sean evidentes para tu industria.
                    </p>

                    {/* STRIP DE CREDIBILIDAD — datos reales del motor */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-10 text-sm font-bold text-slate-700">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand text-[18px]">bolt</span>
                            <span><span className="text-ink font-black">{fmt(liveStats?.signals_24h)}</span> señales · 24h</span>
                        </div>
                        <span className="hidden sm:inline text-stroke">·</span>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand text-[18px]">groups</span>
                            <span><span className="text-ink font-black">{fmt(liveStats?.active_users)}</span> usuarios activos</span>
                        </div>
                        <span className="hidden sm:inline text-stroke">·</span>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-accent text-[18px]">verified_user</span>
                            <span>Datos anonimizados <span className="text-ink font-black">k≥50</span></span>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center flex-col sm:flex-row">
                        <GradientCTA
                            label="Conversar con Ventas"
                            icon="arrow_forward"
                            iconPosition="trailing"
                            size="lg"
                            onClick={() => document.getElementById('b2b-lead-form')?.scrollIntoView({ behavior: 'smooth' })}
                        />
                        <div className="hidden sm:flex items-center gap-2 text-ink text-sm font-bold bg-white px-6 py-4 rounded-xl shadow-sm border border-stroke">
                            <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></span>
                            Motor de Señales Activo
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1200px] mx-auto px-6 md:px-12 pt-16 relative z-20 space-y-24">

                {/* --- 1. BLOQUES DE INTELIGENCIA --- */}
                <div className="text-center flex flex-col items-center">
                    <h2 className="text-3xl lg:text-4xl font-black text-ink tracking-tight">Capacidades <GradientText>Analíticas</GradientText></h2>
                    <p className="text-slate-600 mt-3 font-medium text-lg max-w-2xl">
                        Visualiza cómo operativizamos las respuestas ciudadanas en tableros ejecutivos diseñados para la toma de decisiones estratégicas.
                    </p>
                </div>

                <div className="space-y-12">
                    {/* PILAR 1: TENDENCIAS EN TIEMPO REAL */}
                    <section className="card overflow-hidden group rounded-3xl">
                        <div className="bg-surface2 p-6 md:p-8 border-b border-stroke">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-brand text-[24px]">trending_up</span>
                                <h2 className="text-2xl font-black text-ink tracking-tight">Velocidad y Tendencias</h2>
                            </div>
                            <p className="text-sm font-medium text-slate-600 max-w-xl mb-4">
                                Identifica el Momentum. Monitoreo constante de variaciones en la percepción del consumidor.
                            </p>
                            {/* KPI chips — qué métricas trae este pilar */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Aceleración</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Fastest Riser</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Persistencia</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Momentum 6H</span>
                            </div>
                        </div>

                        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white">
                            <div className="space-y-6">
                                {/* Insight Card */}
                                <div className="border-l-4 border-accent pl-4 py-1">
                                    <p className="text-lg font-bold text-ink italic leading-snug">
                                        "La preferencia por <span className="text-brand">Marcas Locales</span> ha experimentado un repunte sostenido en las últimas 72 horas, superando la media histórica del mes."
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
                                                <span className="text-xl font-black text-stroke group-hover:text-slate-500 transition-colors">0{idx + 1}</span>
                                                {item.direction === 'up' && <span className="badge bg-accent/10 text-accent border-none"><span className="material-symbols-outlined text-[12px] mr-1">arrow_outward</span>{item.variation_percent.toFixed(1)}%</span>}
                                                {item.direction === 'down' && <span className="badge bg-danger/10 text-danger border-none"><span className="material-symbols-outlined text-[12px] mr-1">south_east</span>{item.variation_percent.toFixed(1)}%</span>}
                                                {item.direction === 'stable' && <span className="badge bg-surface2 text-slate-500 border-none"><span className="material-symbols-outlined text-[12px] mr-1">horizontal_rule</span>0%</span>}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-ink leading-tight mb-1">{item.title}</h3>
                                                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{item.slug}</p>
                                            </div>
                                            {/* Sparkline background */}
                                            <svg className="absolute bottom-0 right-0 w-24 h-12 opacity-5 pointer-events-none" viewBox="0 0 100 50" preserveAspectRatio="none">
                                                <path d={item.direction === 'up' ? "M0,50 L20,40 L40,45 L60,20 L80,25 L100,0" : "M0,10 L20,15 L40,10 L60,30 L80,25 L100,50"} fill="none" stroke="currentColor" strokeWidth="4" className={item.direction === 'up' ? 'text-accent' : 'text-danger'} />
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-surface2 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[300px] border border-stroke shadow-sm">
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-accent/10 blur-3xl rounded-full"></div>

                                <div>
                                    <h3 className="text-ink font-black text-xl mb-1">Volumen Agregado</h3>
                                    <p className="text-slate-600 text-sm font-medium">Señales captadas por el motor en las últimas 12h</p>
                                </div>

                                <div className="mt-8 flex items-end justify-between border-b border-stroke pb-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Acumulado</span>
                                        <span className="text-4xl font-black text-ink">42,504</span>
                                    </div>
                                    <div className="flex h-16 w-32 items-end gap-1 opacity-80">
                                        {[20, 30, 25, 40, 35, 60, 80, 100, 95].map((h, i) => (
                                            <div key={i} className={`flex-1 rounded-t-sm transition-all ${i >= 7 ? 'bg-brand' : 'bg-stroke'}`} style={{ height: `${h}%` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* TWO COLUMN GRID FOR PILLAR 2 & 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* PILAR 2: COMPARACIONES */}
                        <section className="card p-8 flex flex-col rounded-3xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-accent text-[24px]">compare_arrows</span>
                                <h2 className="text-2xl font-black text-ink tracking-tight">Share of Preference</h2>
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-4">
                                Mide tu tracción exacta en comparaciones directas de mercado y descubre a quién le estás quitando cuota.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">OpinaScore</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Wilson CI 95%</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">n_eff</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Convicción</span>
                            </div>

                            <div className="flex-1 flex flex-col justify-center gap-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-ink">La Burger - Clásica</span>
                                        <span className="text-xl font-black text-ink text-right">68%</span>
                                    </div>
                                    <div className="h-3 w-full bg-surface2 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-accent rounded-full" style={{ width: '68%' }}></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 text-right uppercase tracking-widest">3,420 señales de respaldo</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-black text-ink">Pizza Mía - Pepperoni</span>
                                        <span className="text-xl font-black text-ink text-right">32%</span>
                                    </div>
                                    <div className="h-3 w-full bg-surface2 rounded-full overflow-hidden flex">
                                        <div className="h-full bg-stroke rounded-full" style={{ width: '32%' }}></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-500 text-right uppercase tracking-widest">1,610 señales de respaldo</p>
                                </div>
                            </div>
                        </section>

                        {/* PILAR 3: SEGMENTACIÓN DEMOGRÁFICA */}
                        <section className="card p-8 flex flex-col rounded-3xl">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-brand text-[24px]">troubleshoot</span>
                                <h2 className="text-2xl font-black text-ink tracking-tight">Segmentación Profunda</h2>
                            </div>
                            <p className="text-sm font-medium text-slate-600 mb-4">
                                Identifica micro-diferencias sociodemográficas al instante para alinear esfuerzos de retargeting.
                            </p>
                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Top Influencers</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Brecha Generacional</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Brecha Territorial</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest bg-surface2 border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Sensibilidad Contextual</span>
                            </div>

                            <div className="border-l-4 border-brand pl-4 py-1 mb-8">
                                <p className="text-sm font-bold text-ink italic leading-snug">
                                    "Aunque la opción B pierde en la general, es hegemónica (+75% share) en mujeres menores de 24 años residentes en la zona urbana."
                                </p>
                            </div>

                            <div className="flex-1 grid grid-cols-2 gap-4">
                                {/* Graphic 1 */}
                                <div className="bg-surface2 border border-stroke rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <div className="text-2xl font-black text-brand mb-2">75%</div>
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mujeres <br /> 18-24</span>
                                </div>

                                {/* Graphic 2 */}
                                <div className="bg-surface2 border border-stroke rounded-xl p-4 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined text-3xl text-brand mb-2">location_on</span>
                                    <h4 className="font-black text-ink text-sm leading-tight">Urbano Céntrico</h4>
                                    <span className="text-[10px] font-black uppercase text-accent tracking-widest mt-2">+40% vs Prom.</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* PILAR 4: EVOLUCIÓN TEMPORAL */}
                    <section className="card p-8 lg:p-12 relative overflow-hidden bg-gradient-to-br from-white to-surface2/50 rounded-3xl">
                        <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-brand/5 rounded-full blur-[100px]"></div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-brand text-[28px]">speed</span>
                                    <h2 className="text-3xl font-black text-ink tracking-tight">Velocidad <GradientText>Temporal</GradientText></h2>
                                </div>
                                <p className="text-slate-600 font-medium mb-4 text-lg max-w-md leading-relaxed">
                                    No importa solo quién gana, sino a qué velocidad está creciendo un fenómeno. Detecta anomalías, picos de viralidad y patrones estacionales.
                                </p>
                                <div className="flex flex-wrap gap-2 mb-8">
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Forecast 7d</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Tipping Point</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Cambio de Régimen</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-white border border-stroke text-slate-700 px-2.5 py-1 rounded-full">Volatilidad 30D</span>
                                </div>

                                <div className="card bg-white border-l-4 border-l-brand/60 border-y-0 border-r-0 rounded-l-none p-5 shadow-sm">
                                    <p className="text-sm font-bold text-ink italic leading-relaxed">
                                        "La intención de compra para la nueva categoría aumentó exponencialmente (x3) justo después del lanzamiento oficial, indicando alta receptividad en early-adopters."
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-6 border border-stroke shadow-sm relative">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h4 className="text-ink font-bold text-lg">Adopción Semanal</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Base: 12,000 señales</p>
                                    </div>
                                    <span className="badge badge-accent bg-brand/10 text-brand border-none">Crecimiento Rápido</span>
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
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-4 px-2">
                                    <span>Lun 12</span>
                                    <span>Mie 14</span>
                                    <span>Vie 16</span>
                                    <span>Dom 18</span>
                                </div>
                            </div>

                        </div>
                    </section>
                </div>


                {/* --- 1.5 KPIs EXTENDIDOS REALES (F9-F13) --- */}
                {snapshot && (
                    <section className="card p-2 md:p-4 bg-white border border-stroke rounded-3xl">
                        <div className="px-6 pt-6 mb-4">
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                <span className="text-brand font-bold uppercase tracking-widest text-xs">Live Intelligence — datos reales</span>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"></span>
                                    En vivo
                                </span>
                            </div>
                            <h2 className="text-2xl lg:text-3xl font-black text-ink tracking-tight mb-2">
                                KPIs del <GradientText>marco metodológico extendido</GradientText>
                            </h2>
                            <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                                Capas predictiva, explicativa y comercial corriendo sobre el motor de señales. Solo aparece lo que tiene datos suficientes, filtrado por el catálogo comercializable.
                            </p>
                        </div>
                        <ResultsExtendedKPIs
                            predictive={snapshot.predictive}
                            explanatory={snapshot.explanatory}
                            productHealth={snapshot.productHealth}
                            integrity={snapshot.integrity}
                            commercial={snapshot.commercial}
                            publicMode={true}
                        />
                    </section>
                )}

                {/* --- 2. CASOS DE USO O DOLORES DE NEGOCIO --- */}
                <section className="bg-surface2 rounded-4xl p-8 md:p-12 border border-stroke">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-3 block">Aplicaciones de Negocio</span>
                        <h2 className="text-3xl font-black text-ink tracking-tight mb-4">Certezas para cada ciclo <GradientText>corporativo</GradientText></h2>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed">
                            El motor se adapta a la necesidad que tengas hoy. Desde evaluar un riesgo hasta diagnosticar la efectividad de una campaña.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-brand transition-colors"><span className="material-symbols-outlined text-2xl">monitor_heart</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Monitoreo de Crisis</h4>
                            <p className="text-[14px] leading-relaxed text-slate-600 font-medium">Sigue el impacto en percepción con actualización estadística tras un evento adverso.</p>
                        </div>
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-brand transition-colors"><span className="material-symbols-outlined text-2xl">swords</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Trackeo Rival</h4>
                            <p className="text-[14px] leading-relaxed text-slate-600 font-medium">Mide tu Share of Preference directamente frente al lanzamiento de competidores.</p>
                        </div>
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-brand transition-colors"><span className="material-symbols-outlined text-2xl">rocket_launch</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Desempeño Launch</h4>
                            <p className="text-[14px] leading-relaxed text-slate-600 font-medium">Detecta tracción inicial y descubre si estás afinando en el segmento deseado.</p>
                        </div>
                        <div className="card card-pad bg-white border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                            <span className="w-14 h-14 rounded-xl bg-surface2 border border-stroke text-ink flex items-center justify-center mb-6 group-hover:text-brand transition-colors"><span className="material-symbols-outlined text-2xl">radar</span></span>
                            <h4 className="font-black text-ink mb-2 text-lg">Detección de Trend</h4>
                            <p className="text-[14px] leading-relaxed text-slate-600 font-medium">Adelántate a la ola masiva identificando la adopción de un concepto emergente.</p>
                        </div>
                    </div>
                </section>


                {/* --- 3. CATÁLOGO DE KPIs POR TIER --- */}
                <IntelligenceKPICatalog />

                {/* --- 4. SELECTOR TIER × SCOPE (pricing config) --- */}
                <IntelligenceTierScopeSelector
                    onRequestQuote={(sel) => scrollToLeadForm({ tier: sel.tier, scope: sel.scope, source: 'tier_scope_selector' })}
                />

                {/* --- 5. PRIVACY & COMPLIANCE --- */}
                <IntelligencePrivacyAccordion />

                {/* --- 6. ACCESO PROGRAMÁTICO / API STUB --- */}
                <IntelligenceAPIAccessStub
                    onRequestEarlyAccess={() => scrollToLeadForm({ source: 'api_early_access' })}
                />


                {/* --- 4. FOOTER B2B CAPTURA DE LEAD --- */}
                <section className="bg-surface2 text-center py-20 px-6 rounded-4xl border border-stroke shadow-sm mb-12">
                    <div className="relative z-10 flex flex-col items-center">
                        <span className="text-brand font-black uppercase tracking-widest text-xs mb-4 block">Capacidad Empresarial</span>
                        <h2 className="text-3xl md:text-5xl lg:text-5xl font-black text-ink mb-6 tracking-tight max-w-3xl mx-auto leading-tight">
                            Suma categorías.<br />Cruza variables.<br />Multiplica tus certezas.
                        </h2>
                        <p className="text-slate-600 font-medium mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
                            Comienza a tomar decisiones respaldadas por señales estadísticas directas. El motor escala analíticamente a la medida de los dolores puntuales de tu industria.
                        </p>

                        <div id="b2b-lead-form" className="w-full max-w-2xl mx-auto mt-4 transition-all duration-500 pt-8 border-t border-stroke">
                            <B2BLeadForm prefill={leadPrefill} />
                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}
