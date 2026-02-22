import { useEffect, useState } from 'react';
import PageShell from '../../../components/layout/PageShell';
import { platformService } from '../../signals/services/platformService';
import {
    Key,
    ShieldCheck,
    Server,
    FileText,
    Download,
    Eye,
    EyeOff,
    Copy,
    CheckCircle2,
    Activity
} from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';

interface B2BDashboardData {
    client_id: string;
    client_name: string;
    api_key: string;
    requests_used: number;
    plan_name: string;
    request_limit: number;
    monthly_price: number;
    features: {
        segment_access?: boolean;
        depth_access?: boolean;
    };
}

interface ExecutiveReport {
    id: string;
    report_type: 'executive' | 'benchmark';
    battle_slug?: string;
    report_period_days: number;
    generated_at: string;
}

export default function B2BDashboard() {
    const { profile } = useAuth();
    const [dashboardData, setDashboardData] = useState<B2BDashboardData | null>(null);
    const [reports, setReports] = useState<ExecutiveReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (profile) {
            loadDashboard();
        }
    }, [profile]);

    const loadDashboard = async () => {
        setIsLoading(true);
        try {
            const data = await platformService.getB2BDashboardStatus();
            setDashboardData(data as unknown as B2BDashboardData);

            if (data) {
                const reps = await platformService.listExecutiveReports();
                setReports(reps as unknown as ExecutiveReport[]);
            }
        } catch (error) {
            console.error("Error loading B2B dashboard", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyKey = () => {
        if (dashboardData?.api_key) {
            navigator.clipboard.writeText(dashboardData.api_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <PageShell>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </PageShell>
        );
    }

    if (!dashboardData) {
        return (
            <PageShell>
                <div className="max-w-4xl mx-auto py-12">
                    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center">
                        <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Acceso Corporativo No Detectado</h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Tu cuenta actual no está vinculada a un perfil de cliente API. Si representas a una organización,
                            por favor contacta a soporte para habilitar tu entorno empresarial.
                        </p>
                    </div>
                </div>
            </PageShell>
        );
    }

    const usagePercentage = Math.min(100, Math.round((dashboardData.requests_used / dashboardData.request_limit) * 100));

    return (
        <PageShell>
            <div className="max-w-6xl mx-auto py-8">

                {/* HEAD */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{dashboardData.client_name}</h1>
                    <p className="text-slate-500 font-medium">Panel de control de integración y consumo API</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* PLAN INFO */}
                    <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs uppercase tracking-widest rounded-full">
                                    {dashboardData.plan_name}
                                </span>
                            </div>

                            <div className="mb-2">
                                <span className="text-4xl font-black text-slate-900">${dashboardData.monthly_price}</span>
                                <span className="text-slate-500 font-medium">/mes</span>
                            </div>
                            <p className="text-sm text-slate-500 mb-6">Suscripción activa gestionada por Opina+ B2B.</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`w-5 h-5 ${dashboardData.features?.segment_access ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span className="text-sm font-bold text-slate-700">Segmentación Demográfica</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className={`w-5 h-5 ${dashboardData.features?.depth_access ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span className="text-sm font-bold text-slate-700">Insights de Profundidad</span>
                            </div>
                        </div>
                    </div>

                    {/* USAGE AND KEYS */}
                    <div className="lg:col-span-2 flex flex-col gap-8">

                        {/* USAGE KIP */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-5 h-5 text-slate-400" />
                                <h3 className="text-lg font-black text-slate-900">Consumo de Cuota API</h3>
                            </div>

                            <div className="flex justify-between items-end mb-2">
                                <div>
                                    <div className="text-sm font-bold text-slate-500">Llamadas realizadas</div>
                                    <div className="text-2xl font-black text-slate-900">
                                        {dashboardData.requests_used.toLocaleString()} <span className="text-sm text-slate-400 font-medium">/ {dashboardData.request_limit.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="text-lg font-black text-indigo-600">{usagePercentage}%</div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                                <div
                                    className={`h-3 rounded-full ${usagePercentage > 90 ? 'bg-rose-500' : usagePercentage > 75 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                                    style={{ width: `${usagePercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs font-medium text-slate-500 text-right">Se reinicia el día 1 de cada mes</p>
                        </div>

                        {/* API KEY */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <Key className="w-5 h-5 text-slate-400" />
                                <h3 className="text-lg font-black text-slate-900">Credenciales de Integración</h3>
                            </div>
                            <p className="text-sm text-slate-500 mb-4">Utiliza esta llave en el header <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 text-xs">x-api-key</code> para autenticar tus peticiones.</p>

                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-sm text-slate-700 tracking-wider">
                                    {showKey ? dashboardData.api_key : '•'.repeat(Math.min(dashboardData.api_key.length, 30))}
                                </div>
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="p-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                <button
                                    onClick={handleCopyKey}
                                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors flex items-center justify-center min-w-[48px]"
                                >
                                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* REPORTS TABLE */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <h3 className="text-lg font-black text-slate-900">Repositorio de Inteligencia</h3>
                    </div>

                    {reports.length === 0 ? (
                        <div className="text-center py-8">
                            <Server className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium text-sm">No se han generado reportes ejecutivos todavía.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="pb-3 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                                        <th className="pb-3 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Contenido (Batalla)</th>
                                        <th className="pb-3 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Periodo</th>
                                        <th className="pb-3 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Generado</th>
                                        <th className="pb-3 pt-2 px-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${report.report_type === 'benchmark'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                                        : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
                                                    }`}>
                                                    {report.report_type === 'benchmark' ? 'Benchmark' : 'Executive'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-900">
                                                {report.report_type === 'benchmark' ? <span className="text-slate-500 italic">Global Market Aggregation</span> : report.battle_slug}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-slate-500 font-medium">{report.report_period_days} días</td>
                                            <td className="py-4 px-4 text-sm text-slate-500 font-medium">{new Date(report.generated_at).toLocaleDateString()}</td>
                                            <td className="py-4 px-4 text-right">
                                                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors">
                                                    <Download className="w-3.5 h-3.5" />
                                                    JSON
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </PageShell>
    );
}
