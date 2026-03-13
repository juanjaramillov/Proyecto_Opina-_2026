import {
    Activity,
    Users,
    Target,
    BarChart3,
    Filter,
    Clock,
    Building2,
    ShieldAlert,
    TrendingUp
} from "lucide-react";

import { useIntelligence } from "../../intelligence/hooks/useIntelligence";
import { RankingTable } from "../../intelligence/components/RankingTable";
import { IntelligenceSidebar } from "../../intelligence/components/IntelligenceSidebar";
import { DepthInsightsDrawer } from "../../intelligence/components/DepthInsightsDrawer";

export default function AdminSystemOverview() {
    const {
        stats, activity, health, kpis, retention, rankings,
        suspiciousUsers, alerts, loading,
        role, orgName, orgRole,
        searchTerm, setSearchTerm,
        ageRange, setAgeRange,
        gender, setGender,
        commune, setCommune,
        selectedBattle, setSelectedBattle,
        depthInsights, temporalComparison, volatility, polarization, segmentInfluence, earlySignals,
        daysBack, setDaysBack,
        loadingDetails, aiSummary, isGeneratingAi,
        loadData, loadDepthData,
        handleGenerateAiSummary, handleMarkAlertAsRead,
        filteredRankings
    } = useIntelligence();

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
            {/* CTA Empresas B2B */}
            <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">
                    Inteligencia para empresas
                </div>
                <div className="mt-1 text-sm text-slate-600">
                    Cruces por segmento, evolución temporal y rankings verificados. Si quieres un snapshot comercial o demo, pídelo acá.
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <a
                        href="mailto:contacto@opina.plus?subject=Opina%2B%20-%20Solicitud%20Demo%20B2B&body=Hola%2C%20quiero%20una%20demo%20B2B%20y%20un%20snapshot%20comercial.%0A%0AIndustria%3A%20%0APa%C3%ADs%3A%20%0AObjetivo%3A%20%0ASegmentos%20de%20inter%C3%A9s%3A%20%0AVentana%20de%20tiempo%3A%20"
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
                    >
                        Solicitar demo / snapshot
                    </a>

                    <a
                        href="/about"
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                        Cómo funciona
                    </a>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        {orgName && <Building2 className="w-8 h-8 text-emerald-600" />}
                        {orgName ? `Panel: ${orgName} ` : <span className="text-gradient-brand">Inteligencia</span>}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {orgName
                            ? `Vista corporativa para ${orgName} (${orgRole}).`
                            : "Panel interno. Lectura agregada, snapshots y salud del sistema."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Clock className="w-4 h-4 text-emerald-500" />
                        Actualizar
                    </button>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Sistema Online"></div>
                </div>
            </div>

            {/* NOTA ADMINISTRATIVA (ACCIONES DE IMPACTO) */}
            {role === 'admin' && (
                <div className="mb-8 rounded-xl bg-amber-50 border border-amber-200 p-4">
                    <div className="flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-amber-900">Modo Administrador</h4>
                            <p className="text-sm text-amber-700 mt-1">Ojo: estas acciones (limpieza, recálculo) afectan datos agregados. Úsalas solo si sabes qué estás haciendo.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* SEGMENTATION FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 mr-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Segmentación</span>
                </div>

                <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">Todas las edades</option>
                    <option value="18-24">18-24 años</option>
                    <option value="25-34">25-34 años</option>
                    <option value="35-44">35-44 años</option>
                    <option value="45+">45+ años</option>
                </select>

                <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">Todos los géneros</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro / No binario</option>
                </select>

                <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="all">Todas las comunas</option>
                    <option value="Santiago">Santiago</option>
                    <option value="Las Condes">Las Condes</option>
                    <option value="Providencia">Providencia</option>
                    <option value="Vitacura">Vitacura</option>
                </select>

                {(ageRange !== 'all' || gender !== 'all' || commune !== 'all') && (
                    <button
                        onClick={() => { setAgeRange('all'); setGender('all'); setCommune('all'); }}
                        className="text-emerald-600 text-xs font-bold hover:underline"
                    >
                        Limpiar Filtros
                    </button>
                )}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm animate-pulse h-32">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4"></div>
                            <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
                            <div className="h-3 w-32 bg-slate-100 rounded"></div>
                        </div>
                    ))
                ) : (
                    <>
                        <StatCard
                            title="Señales (24h)"
                            value={stats?.signals_24h || 0}
                            icon={<Activity className="w-5 h-5 text-emerald-600" />}
                            color="emerald"
                            trend={[120, 150, 130, 180, 200, 250, stats?.signals_24h || 260]}
                        />
                        <StatCard
                            title="Usuarios Activos"
                            value={stats?.active_users || 0}
                            icon={<Users className="w-5 h-5 text-emerald-600" />}
                            color="emerald"
                            trend={[50, 60, 55, 70, 90, 110, stats?.active_users || 120]}
                        />
                        <StatCard
                            title="Señales Recientes (3h)"
                            value={activity?.signals_last_3h || 0}
                            icon={<Target className="w-5 h-5 text-blue-600" />}
                            color="amber"
                            subtitle={`${activity?.verified_signals_last_3h || 0} verificadas`}
                            trend={[10, 25, 15, 40, 30, 45, activity?.signals_last_3h || 50]}
                        />
                        <StatCard
                            title="Región Activa"
                            value={stats?.active_region || "SCL"}
                            icon={<BarChart3 className="w-5 h-5 text-slate-600" />}
                            color="slate"
                        />
                    </>
                )}
            </div>

            {/* ACTIVATION & RETENTION KPIs */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-1 bg-emerald-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-slate-900">Métricas de Tracción</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={`trac-${i}`} className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm animate-pulse h-32">
                                <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4"></div>
                                <div className="h-6 w-24 bg-slate-200 rounded mb-2"></div>
                                <div className="h-3 w-32 bg-slate-100 rounded"></div>
                            </div>
                        ))
                    ) : (
                        <>
                            <StatCard
                                title="DAU (Diarios)"
                                value={kpis?.dau || 0}
                                icon={<Users className="w-5 h-5 text-emerald-500" />}
                                color="emerald"
                                subtitle="Usuarios únicos hoy"
                                trend={[30, 45, 40, 60, 55, 75, kpis?.dau || 80]}
                            />
                            <StatCard
                                title="WAU (Semanales)"
                                value={kpis?.wau || 0}
                                icon={<Users className="w-5 h-5 text-emerald-500" />}
                                color="emerald"
                                subtitle="Últimos 7 días"
                                trend={[200, 250, 240, 280, 310, 350, kpis?.wau || 380]}
                            />
                            <StatCard
                                title="MAU (Mensuales)"
                                value={kpis?.mau || 0}
                                icon={<Users className="w-5 h-5 text-emerald-500" />}
                                color="emerald"
                                subtitle="Últimos 30 días"
                                trend={[800, 850, 820, 950, 1100, 1250, kpis?.mau || 1400]}
                            />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {loading ? (
                        Array(2).fill(0).map((_, i) => (
                            <div key={`ret-${i}`} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm animate-pulse h-40">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4"></div>
                                <div className="h-8 w-20 bg-slate-200 rounded mb-2"></div>
                                <div className="h-3 w-full max-w-[200px] bg-slate-100 rounded"></div>
                            </div>
                        ))
                    ) : (
                        <>
                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-emerald-50 rounded-2xl">
                                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retención D1</p>
                                            <h3 className="text-2xl font-black text-slate-900">
                                                {((retention?.retention_day_1 || 0) * 100).toFixed(1)}%
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500">Usuarios que regresan después de 24 horas.</p>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-emerald-50 rounded-2xl">
                                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retención D7</p>
                                            <h3 className="text-2xl font-black text-slate-900">
                                                {((retention?.retention_day_7 || 0) * 100).toFixed(1)}%
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500">Usuarios que regresan después de 7 días.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <RankingTable 
                    loading={loading}
                    rankings={rankings}
                    filteredRankings={filteredRankings}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedBattle={selectedBattle}
                    loadDepthData={loadDepthData}
                />

                <IntelligenceSidebar 
                    orgName={orgName}
                    health={health}
                    suspiciousUsers={suspiciousUsers}
                    alerts={alerts}
                    handleMarkAlertAsRead={handleMarkAlertAsRead}
                />
            </div>

            {/* DEPTH INSIGHTS DRAWER/OVERLAY */}
            {selectedBattle && (
                <DepthInsightsDrawer 
                    selectedBattle={selectedBattle}
                    setSelectedBattle={setSelectedBattle}
                    loadingDetails={loadingDetails}
                    aiSummary={aiSummary}
                    isGeneratingAi={isGeneratingAi}
                    handleGenerateAiSummary={handleGenerateAiSummary}
                    role={role}
                    volatility={volatility}
                    polarization={polarization}
                    segmentInfluence={segmentInfluence}
                    daysBack={daysBack}
                    earlySignals={earlySignals}
                    temporalComparison={temporalComparison}
                    setDaysBack={setDaysBack}
                    loadDepthData={loadDepthData}
                    depthInsights={depthInsights}
                />
            )}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "primary" | "emerald" | "amber" | "slate";
    subtitle?: string;
    trend?: number[];
}

function StatCard({ title, value, icon, color, subtitle, trend }: StatCardProps) {
    const colorMap: Record<string, string> = {
        primary: "bg-primary-50 border-primary-100 text-primary-600",
        emerald: "bg-emerald-50 border-emerald-100 text-emerald-600",
        amber: "bg-blue-50 border-blue-100 text-blue-600",
        slate: "bg-slate-50 border-slate-100 text-slate-600",
    };

    const renderSparkline = () => {
        if (!trend || trend.length < 2) return null;
        
        const min = Math.min(...trend);
        const max = Math.max(...trend);
        const range = max - min || 1;
        
        const width = 100;
        const height = 30;
        
        const points = trend.map((val, i) => {
            const x = (i / (trend.length - 1)) * width;
            const y = height - ((val - min) / range) * height;
            return `${x},${y}`;
        }).join(" ");
        
        return (
            <svg viewBox={`0 -5 ${width} ${height + 10}`} preserveAspectRatio="none" className={`absolute bottom-0 left-0 w-full h-1/3 opacity-20 pointer-events-none ${colorMap[color].split(' ')[2]}`}>
                <polyline 
                    points={points} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }

    return (
        <div className={`p-6 rounded-3xl border ${colorMap[color].split(' ').slice(0, 2).join(' ')} shadow-sm relative overflow-hidden`}>
            {renderSparkline()}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white rounded-xl shadow-xs">
                        {icon}
                    </div>
                    {subtitle && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</span>}
                </div>
                <div className="text-2xl font-black text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">{title}</div>
            </div>
        </div>
    );
}
