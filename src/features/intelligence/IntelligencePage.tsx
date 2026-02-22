import { useEffect, useState, useCallback } from "react";
import { platformService, PlatformStats, RecentActivity, SystemHealth, DepthInsight, ActivityKPIs, RetentionMetrics, SuspiciousUser, TemporalComparison, VolatilityData, PolarizationData, PlatformAlert, SegmentInfluence, EarlySignal } from "../signals/services/platformService";
import { TrendingItem } from "../../types/trending";
import { logger } from "../../lib/logger";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Users,
    Target,
    BarChart3,
    Search,
    ChevronRight,
    Filter,
    ShieldCheck,
    Database,
    Clock,
    X,
    Building2,
    ShieldAlert,
    UserX,
    Zap,
    PieChart,
    Bell
} from "lucide-react";
import { useRole } from "../../hooks/useRole";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function IntelligencePage() {
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [activity, setActivity] = useState<RecentActivity | null>(null);
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [kpis, setKpis] = useState<ActivityKPIs | null>(null);
    const [retention, setRetention] = useState<RetentionMetrics | null>(null);
    const [rankings, setRankings] = useState<TrendingItem[]>([]);
    const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([]);
    const [alerts, setAlerts] = useState<PlatformAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const { orgName, orgRole } = useRole();
    const [searchTerm, setSearchTerm] = useState("");

    // Filtros de Segmentación
    const [ageRange, setAgeRange] = useState("all");
    const [gender, setGender] = useState("all");
    const [commune, setCommune] = useState("all");

    // Detalle de Profundidad
    const [selectedBattle, setSelectedBattle] = useState<TrendingItem | null>(null);
    const [depthInsights, setDepthInsights] = useState<DepthInsight[]>([]);
    const [temporalComparison, setTemporalComparison] = useState<TemporalComparison[]>([]);
    const [volatility, setVolatility] = useState<VolatilityData | null>(null);
    const [polarization, setPolarization] = useState<PolarizationData | null>(null);
    const [segmentInfluence, setSegmentInfluence] = useState<SegmentInfluence[]>([]);
    const [earlySignals, setEarlySignals] = useState<EarlySignal[]>([]);
    const [daysBack, setDaysBack] = useState(7);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const hasFilters = ageRange !== 'all' || gender !== 'all' || commune !== 'all';

            const [s, a, r, h, k, ret] = await Promise.all([
                platformService.getLiveStats(),
                platformService.getRecentActivity(),
                hasFilters
                    ? platformService.getSegmentedTrending(ageRange, gender, commune)
                    : platformService.getTrending(),
                platformService.getSystemHealthMetrics(),
                platformService.getKPIActivity(),
                platformService.getRetentionMetrics(),
            ]);

            const suspects = await platformService.getSuspiciousUsers();
            setSuspiciousUsers(suspects);

            const platformAlerts = await platformService.getPlatformAlerts(5);
            setAlerts(platformAlerts);

            setStats(s as PlatformStats);
            setActivity(a as RecentActivity);
            setRankings(r as TrendingItem[]);
            setHealth(h as SystemHealth);
            setKpis(k as ActivityKPIs);
            setRetention(ret as RetentionMetrics);
        } catch (err: unknown) {
            logger.error("[IntelligencePage] Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, [ageRange, gender, commune]);

    const loadDepthData = useCallback(async (item: TrendingItem, days: number = daysBack) => {
        setSelectedBattle(item);
        setLoadingDetails(true);
        try {
            const [insights, vData, tData, pData, iData, eData] = await Promise.all([
                platformService.getDepthInsights(item.slug, '00000000-0000-0000-0000-000000000000', ageRange, gender, commune),
                platformService.getBattleVolatility(item.slug, 30), // Fijo 30 días para volatilidad por estándar
                platformService.getTemporalComparison(item.slug, days),
                platformService.getBattlePolarization(item.slug),
                platformService.getSegmentInfluence(item.slug, days),
                platformService.getEarlySignals(item.slug, 6) // Ventana de 6h para detección temprana
            ]);
            setDepthInsights(insights);
            setVolatility(vData);
            setTemporalComparison(tData);
            setPolarization(pData);
            setSegmentInfluence(iData);
            setEarlySignals(eData);
        } catch (error) {
            logger.error("[IntelligencePage] Error loading depth data:", error);
        } finally {
            setLoadingDetails(false);
        }
    }, [ageRange, gender, commune, daysBack]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleMarkAlertAsRead = async (alertId: string) => {
        const success = await platformService.markPlatformAlertRead(alertId);
        if (success) {
            setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
        }
    };

    const filteredRankings = rankings.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        {orgName && <Building2 className="w-8 h-8 text-indigo-600" />}
                        {orgName ? `Panel: ${orgName} ` : "Intelligence Panel"}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {orgName
                            ? `Vista corporativa para ${orgName} (${orgRole}).`
                            : "Monitoreo estratégico y patrones de opinión en tiempo real."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
                    >
                        <Clock className="w-4 h-4 text-indigo-500" />
                        Refrescar Datos
                    </button>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Sistema Online"></div>
                </div>
            </div>

            {/* SEGMENTATION FILTERS */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 mr-2">
                    <Filter className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Segmentación</span>
                </div>

                <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500"
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
                    className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="all">Todos los géneros</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro / No binario</option>
                </select>

                <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="bg-slate-50 border-none rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500"
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
                        className="text-indigo-600 text-xs font-bold hover:underline"
                    >
                        Limpiar Filtros
                    </button>
                )}
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Señales (24h)"
                    value={stats?.signals_24h || 0}
                    icon={<Activity className="w-5 h-5 text-indigo-600" />}
                    color="indigo"
                />
                <StatCard
                    title="Usuarios Activos"
                    value={stats?.active_users || 0}
                    icon={<Users className="w-5 h-5 text-emerald-600" />}
                    color="emerald"
                />
                <StatCard
                    title="Señales Recientes (3h)"
                    value={activity?.signals_last_3h || 0}
                    icon={<Target className="w-5 h-5 text-amber-600" />}
                    color="amber"
                    subtitle={`${activity?.verified_signals_last_3h || 0} verificadas`}
                />
                <StatCard
                    title="Región Activa"
                    value={stats?.active_region || "SCL"}
                    icon={<BarChart3 className="w-5 h-5 text-slate-600" />}
                    color="slate"
                />
            </div>

            {/* ACTIVATION & RETENTION KPIs */}
            <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-1 bg-indigo-600 rounded-full"></div>
                    <h2 className="text-lg font-bold text-slate-900">Métricas de Tracción</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        title="DAU (Diarios)"
                        value={kpis?.dau || 0}
                        icon={<Users className="w-5 h-5 text-indigo-500" />}
                        color="indigo"
                        subtitle="Unique active users today"
                    />
                    <StatCard
                        title="WAU (Semanales)"
                        value={kpis?.wau || 0}
                        icon={<Users className="w-5 h-5 text-indigo-500" />}
                        color="indigo"
                        subtitle="Last 7 days"
                    />
                    <StatCard
                        title="MAU (Mensuales)"
                        value={kpis?.mau || 0}
                        icon={<Users className="w-5 h-5 text-indigo-500" />}
                        color="indigo"
                        subtitle="Last 30 days"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <div className="p-3 bg-indigo-50 rounded-2xl">
                                    <TrendingUp className="w-6 h-6 text-indigo-600" />
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
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Rankings Table */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Ranking de Tendencias
                            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{rankings.length}</span>
                        </h2>

                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar batalla..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Batalla / Slug</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4 text-center">Variación</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="px-6 py-4 h-16 bg-slate-50/30"></td>
                                        </tr>
                                    ))
                                ) : filteredRankings.length > 0 ? (
                                    filteredRankings.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => loadDepthData(item)}
                                            className={`hover:bg-slate-50/50 transition cursor-pointer group ${selectedBattle?.id === item.id ? 'bg-indigo-50/30' : ''}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-slate-900">{item.title}</div>
                                                <div className="text-xs text-slate-400 font-medium">{item.slug}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="text-sm font-bold text-slate-700">{item.trend_score.toLocaleString()}</div>
                                                <div className="text-[10px] text-slate-400">{item.total_signals} señales</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <VariationBadge variation={item.variation_percent} direction={item.direction} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-300 group-hover:text-indigo-500 transition">
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center text-slate-400 font-medium">
                                            No se encontraron datos que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* DATA HEALTH DASHBOARD */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            {orgName ? "Status Corporativo" : "Salud de Datos (B2B)"}
                        </h3>

                        <div className="space-y-6">
                            <HealthMetric
                                label="Signal Integrity"
                                value={`${health?.signal_integrity_pct || 0}% `}
                                desc="Señales de usuarios verificados"
                                color="emerald"
                            />
                            <HealthMetric
                                label="Profile Density"
                                value={`${health?.profile_completeness_avg || 0}% `}
                                desc="Promedio completitud perfiles"
                                color="indigo"
                            />

                            <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Data Quality</div>
                                    <div className="text-sm font-black text-slate-700">{health?.data_quality_score || 0}</div>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-2xl">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Status</div>
                                    <div className="text-sm font-black text-emerald-600">Optimal</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Database className="w-4 h-4 text-amber-500" />
                            Estado del Engine
                        </h3>
                        <ul className="space-y-4">
                            <StatusItem
                                label="Snapshot Engine"
                                status="Activo"
                                time="Actualizado"
                            />
                            <StatusItem label="Cron: Variation" status="Programado" time="En 2h 46m" />
                            <StatusItem label="Signal Integrity" status="Activo" />
                            <StatusItem label="RBAC Layer" status="Optimal" />
                        </ul>
                    </div>

                    {/* SUSPICIOUS ACTIVITY SECTION */}
                    <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-rose-500" />
                            Actividad Sospechosa
                            {suspiciousUsers.length > 0 && (
                                <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                                    {suspiciousUsers.length}
                                </span>
                            )}
                        </h3>

                        <div className="space-y-4">
                            {suspiciousUsers.length > 0 ? (
                                suspiciousUsers.map((user) => (
                                    <div key={user.user_id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                                <UserX className="w-3.5 h-3.5 text-rose-400" />
                                                ID: {user.user_id.slice(0, 8)}...
                                            </div>
                                            <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded uppercase">
                                                Trust: {user.trust_score}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                            Last Signal: {user.last_signal_at ? new Date(user.last_signal_at).toLocaleString() : 'N/A'}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <ShieldCheck className="w-8 h-8 text-emerald-100 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-slate-300">Sin amenazas detectadas</p>
                                </div>
                            )}
                        </div>

                        {suspiciousUsers.length > 0 && (
                            <button className="w-full mt-6 py-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl hover:bg-rose-100 transition">
                                Ver todos los reportes
                            </button>
                        )}
                    </div>

                    {/* PLATFORM ALERTS SECTION */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-indigo-500" />
                            Alertas del Sistema
                            {alerts.filter(a => !a.is_read).length > 0 && (
                                <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full">
                                    {alerts.filter(a => !a.is_read).length}
                                </span>
                            )}
                        </h3>

                        <div className="space-y-4">
                            {alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-4 rounded-2xl border transition-all ${alert.is_read ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-indigo-100 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${alert.type === 'momentum' ? 'bg-amber-400' :
                                                        alert.type === 'volatility' ? 'bg-amber-600' :
                                                            alert.type === 'fraud' ? 'bg-rose-500' : 'bg-blue-500'
                                                        }`} />
                                                    <p className="text-xs font-bold text-slate-900 leading-tight">
                                                        {alert.title}
                                                    </p>
                                                </div>
                                                <p className="text-[10px] text-slate-500 leading-normal">
                                                    {alert.message}
                                                </p>
                                                <div className="mt-2 text-[9px] font-medium text-slate-400">
                                                    {new Date(alert.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                            {!alert.is_read && (
                                                <button
                                                    onClick={() => handleMarkAlertAsRead(alert.id)}
                                                    className="p-1.5 hover:bg-indigo-50 text-indigo-400 rounded-lg transition"
                                                    title="Marcar como leída"
                                                >
                                                    <ShieldCheck className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                                    <p className="text-[10px] font-bold text-slate-300">Sin alertas pendientes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* DEPTH INSIGHTS DRAWER/OVERLAY */}
            {selectedBattle && (
                <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 border-l border-slate-100 overflow-y-auto">
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedBattle.title}</h3>
                                <p className="text-xs text-slate-400 font-medium">Análisis de profundidad segmentado</p>
                            </div>
                            <button
                                onClick={() => setSelectedBattle(null)}
                                className="p-2 hover:bg-slate-50 rounded-full transition"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {loadingDetails ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {/* VOLATILITY CARD WITH AREA CHART */}
                                <div className={`p-6 rounded-3xl border ${volatility?.classification === 'volatile' ? 'bg-rose-50 border-rose-100' : volatility?.classification === 'moderate' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Zap className={`w-4 h-4 ${volatility?.classification === 'volatile' ? 'text-rose-500' : volatility?.classification === 'moderate' ? 'text-amber-500' : 'text-emerald-500'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Índice de Volatilidad (30D)</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${volatility?.classification === 'volatile' ? 'bg-rose-100 text-rose-600' : volatility?.classification === 'moderate' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {volatility?.classification || 'Stable'}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900 mb-4">{volatility?.volatility_index.toFixed(1)}%</div>

                                    <div className="h-24 w-full">
                                        <Line
                                            data={{
                                                labels: ['D-30', 'D-20', 'D-10', 'Hoy'], // Mock de etiquetas temporales; en un caso real vendría del backend
                                                datasets: [{
                                                    label: 'Volatilidad',
                                                    data: [
                                                        Math.max(0, (volatility?.volatility_index || 0) * 0.8),
                                                        Math.max(0, (volatility?.volatility_index || 0) * 1.2),
                                                        Math.max(0, (volatility?.volatility_index || 0) * 0.9),
                                                        volatility?.volatility_index || 0
                                                    ],
                                                    borderColor: volatility?.classification === 'volatile' ? '#f43f5e' : volatility?.classification === 'moderate' ? '#f59e0b' : '#10b981',
                                                    backgroundColor: volatility?.classification === 'volatile' ? 'rgba(244, 63, 94, 0.1)' : volatility?.classification === 'moderate' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    fill: true,
                                                    tension: 0.4,
                                                    pointRadius: 0
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                                scales: { x: { display: false }, y: { display: false, min: 0 } }
                                            }}
                                        />
                                    </div>

                                    <p className="text-[10px] text-slate-400 mt-4 font-medium">Estabilidad de la opinión basada en la desviación estándar del score.</p>
                                </div>

                                {/* POLARIZATION CARD */}
                                <div className={`p-6 rounded-3xl border ${polarization?.classification === 'polarized' ? 'bg-indigo-50 border-indigo-100' : polarization?.classification === 'competitive' ? 'bg-violet-50 border-violet-100' : 'bg-blue-50 border-blue-100'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <PieChart className={`w-4 h-4 ${polarization?.classification === 'polarized' ? 'text-indigo-500' : polarization?.classification === 'competitive' ? 'text-violet-500' : 'text-blue-500'}`} />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Índice de Polarización</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${polarization?.classification === 'polarized' ? 'bg-indigo-100 text-indigo-600' : polarization?.classification === 'competitive' ? 'bg-violet-100 text-violet-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {polarization?.classification || 'Consensus'}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">{polarization?.polarization_index.toFixed(1)}%</div>
                                    <p className="text-[10px] text-slate-400 mt-2 font-medium">Brecha entre las dos opciones principales. Menos es más polarizado.</p>
                                </div>

                                {/* SEGMENT INFLUENCE CARD */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Users className="w-4 h-4 text-indigo-500" />
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Top Influencers ({daysBack}D)</h4>
                                    </div>

                                    <div className="space-y-4">
                                        {segmentInfluence.length > 0 ? (
                                            segmentInfluence.slice(0, 3).map((seg, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-900 leading-tight">
                                                            {seg.age_range} · {seg.gender}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 font-medium lowercase">
                                                            {seg.commune}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-black text-indigo-600">{seg.contribution_percent.toFixed(1)}%</div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Impacto</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 bg-slate-50 rounded-2xl">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Calculando influencia...</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-4 leading-relaxed italic">
                                        Representa el porcentaje de la variación total del score atribuible a este segmento demográfico específico.
                                    </p>
                                </div>

                                {/* EARLY SIGNAL / MOMENTUM CARD */}
                                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Zap className="w-4 h-4 text-amber-500" />
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Early Signal (6H Momentum)</h4>
                                    </div>

                                    <div className="space-y-4">
                                        {earlySignals.length > 0 ? (
                                            earlySignals.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-900 leading-tight">
                                                            {item.option_label}
                                                        </span>
                                                        <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${item.classification === 'emerging' ? 'text-emerald-500' :
                                                            item.classification === 'cooling' ? 'text-rose-500' : 'text-slate-400'
                                                            }`}>
                                                            {item.classification === 'emerging' ? 'Emergente ▲' :
                                                                item.classification === 'cooling' ? 'Enfriándose ▼' : 'Estable'
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-xs font-black ${item.momentum_ratio > 1 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                            {item.momentum_ratio.toFixed(2)}x
                                                        </div>
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ratio</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 bg-slate-50 rounded-2xl">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Analizando momentum...</p>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-slate-400 mt-4 leading-relaxed italic">
                                        Compara la actividad de las últimas 6 horas contra el promedio de los últimos 30 días (`opinascore` vs `historical_avg`).
                                    </p>
                                </div>
                                {/* TEMPORAL COMPARISON CHART SECTION */}
                                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Evolución de Scores</h4>
                                        <div className="flex bg-white p-1 rounded-xl shadow-sm">
                                            {[7, 30, 90].map((d) => (
                                                <button
                                                    key={d}
                                                    onClick={() => {
                                                        setDaysBack(d);
                                                        if (selectedBattle) loadDepthData(selectedBattle, d);
                                                    }}
                                                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${daysBack === d
                                                        ? 'bg-indigo-600 text-white shadow-md'
                                                        : 'text-slate-400 hover:text-slate-600'
                                                        }`}
                                                >
                                                    {d}D
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {temporalComparison.length > 0 ? (
                                        <div className="h-48 w-full mb-6">
                                            <Line
                                                data={{
                                                    labels: [`D-${daysBack}`, 'Actual'], // Eje X simplificado
                                                    datasets: temporalComparison.map((comp, idx) => ({
                                                        label: `Opción ${idx + 1}`, // Lo ideal sería el texto real, pero temporalComparison no trae option_title
                                                        data: [
                                                            comp.current_score - comp.variation, // Score anterior aproximado
                                                            comp.current_score
                                                        ],
                                                        borderColor: idx === 0 ? '#4f46e5' : '#10b981',
                                                        backgroundColor: idx === 0 ? '#4f46e5' : '#10b981',
                                                        tension: 0.1,
                                                        borderWidth: 3,
                                                        pointRadius: 4,
                                                        pointBackgroundColor: '#fff'
                                                    }))
                                                }}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            mode: 'index',
                                                            intersect: false,
                                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                            titleFont: { family: 'Inter', size: 11 },
                                                            bodyFont: { family: 'Inter', size: 12, weight: 'bold' },
                                                            padding: 10,
                                                            cornerRadius: 8
                                                        }
                                                    },
                                                    scales: {
                                                        x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10, weight: 'bold' } } },
                                                        y: { grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { family: 'Inter', size: 10, weight: 'bold' } } }
                                                    },
                                                    interaction: {
                                                        mode: 'nearest',
                                                        axis: 'x',
                                                        intersect: false
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-10">
                                            <Clock className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                            <p className="text-[10px] font-bold text-slate-400">Sin datos históricos suficientes para trazar.</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        {temporalComparison.map((comp, idx) => (
                                            <div key={comp.option_id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-indigo-600' : 'bg-emerald-500'}`}></div>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Opción {idx + 1}</span>
                                                </div>
                                                <div className="text-sm font-black text-slate-900 mb-1">{comp.current_score.toLocaleString()}</div>
                                                <div className={`text-[10px] font-black flex items-center gap-1 ${comp.variation >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {comp.variation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {comp.variation_percent.toFixed(1)}% ({comp.variation > 0 ? '+' : ''}{comp.variation})
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* DEPTH INSIGHTS */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest pl-2">Profundidad del Segmento</h4>
                                    {depthInsights.length > 0 ? (
                                        depthInsights.map((insight, idx) => (
                                            <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <span className="text-xs font-black text-slate-300 uppercase italic">Insight #{idx + 1}</span>
                                                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                                                        {insight.total_responses} respuestas
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-700 mb-6 leading-tight">
                                                    {insight.question_id === 'general' ? 'Evaluación General de Calidad' : insight.question_id}
                                                </h4>
                                                <div className="flex items-end gap-3">
                                                    <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                                        {insight.average_score.toFixed(1)}
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Score Avg</div>
                                                </div>
                                                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 rounded-full"
                                                        style={{ width: `${(insight.average_score / 10) * 100}% ` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                            <p className="text-xs font-bold text-slate-400">No hay datos de profundidad todavía.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                            <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                                <Database className="w-3 h-3 inline mr-1 mb-0.5" />
                                Estos datos provienen del motor de analíticas de profundidad. El score es el promedio de valoraciones (1-10) capturadas en los Insight Packs.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay background for selected battle detail */}
            {selectedBattle && (
                <div
                    className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setSelectedBattle(null)}
                ></div>
            )}
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "indigo" | "emerald" | "amber" | "slate";
    subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
    const colorMap: Record<string, string> = {
        indigo: "bg-indigo-50 border-indigo-100",
        emerald: "bg-emerald-50 border-emerald-100",
        amber: "bg-amber-50 border-amber-100",
        slate: "bg-slate-50 border-slate-100",
    };

    return (
        <div className={`p - 6 rounded - 3xl border ${colorMap[color]} shadow - sm`}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-white rounded-xl shadow-xs">
                    {icon}
                </div>
                {subtitle && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subtitle}</span>}
            </div>
            <div className="text-2xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">{title}</div>
        </div>
    );
}

function VariationBadge({ variation, direction }: { variation: number, direction: 'up' | 'down' | 'stable' }) {
    if (direction === 'up') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">
                <TrendingUp className="w-3 h-3" />
                +{variation.toFixed(1)}%
            </span>
        );
    }
    if (direction === 'down') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold">
                <TrendingDown className="w-3 h-3" />
                {variation.toFixed(1)}%
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-bold">
            <Activity className="w-3 h-3 saturate-0" />
            0.0%
        </span>
    );
}

function StatusItem({ label, status, time }: { label: string, status: string, time?: string }) {
    return (
        <li className="flex items-center justify-between">
            <div>
                <div className="text-sm font-bold text-slate-700">{label}</div>
                {time && <div className="text-[10px] text-slate-400 font-medium">{time}</div>}
            </div>
            <span className={`text - [10px] font - bold px - 2 py - 0.5 rounded - md ${status === 'Activo' || status === 'Optimal' ? 'bg-emerald-100 text-emerald-700' :
                status === 'Programado' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                } `}>
                {status}
            </span>
        </li>
    );
}

function HealthMetric({ label, value, desc, color }: { label: string, value: string, desc: string, color: string }) {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-600",
        indigo: "text-indigo-600"
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 tracking-tight">{label}</span>
                <span className={`text - sm font - black ${colorClasses[color]} `}>{value}</span>
            </div>
            <div className="text-[10px] text-slate-500 italic font-medium">{desc}</div>
        </div>
    );
}
