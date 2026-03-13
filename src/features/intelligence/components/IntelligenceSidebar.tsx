import { ShieldCheck, Database, ShieldAlert, UserX, Bell } from "lucide-react";
import { SystemHealth, SuspiciousUser, PlatformAlert } from "../../signals/services/healthService";

interface IntelligenceSidebarProps {
    orgName: string | null;
    health: SystemHealth | null;
    suspiciousUsers: SuspiciousUser[];
    alerts: PlatformAlert[];
    handleMarkAlertAsRead: (alertId: string) => void;
}

export function IntelligenceSidebar({ orgName, health, suspiciousUsers, alerts, handleMarkAlertAsRead }: IntelligenceSidebarProps) {
    return (
        <div className="space-y-6">
            {/* DATA HEALTH DASHBOARD */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    {orgName ? "Estado Corporativo" : "Salud del Sistema"}
                </h3>

                <div className="space-y-6">
                    <HealthMetric
                        label="Integridad de Señal"
                        value={`${health?.signal_integrity_pct || 0}% `}
                        desc="Señales de usuarios verificados"
                        color="emerald"
                    />
                    <HealthMetric
                        label="Densidad de Perfil"
                        value={`${health?.profile_completeness_avg || 0}% `}
                        desc="Promedio completitud perfiles"
                        color="primary"
                    />

                    <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Calidad Datos</div>
                            <div className="text-sm font-black text-slate-700">{health?.data_quality_score || 0}</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter mb-1">Estado</div>
                            <div className="text-sm font-black text-emerald-600">Óptimo</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    Estado del Engine
                </h3>
                <ul className="space-y-4">
                    <StatusItem
                        label="Motor de Snapshots"
                        status="Activo"
                        time="Actualizado"
                    />
                    <StatusItem label="Cron: Variación" status="Programado" time="En 2h 46m" />
                    <StatusItem label="Integridad de Señal" status="Activo" />
                    <StatusItem label="Capa RBAC" status="Óptimo" />
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
                                        Confianza: {user.trust_score}
                                    </span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                    Última señal: {user.last_signal_at ? new Date(user.last_signal_at).toLocaleString() : 'N/A'}
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
                    <Bell className="w-5 h-5 text-emerald-500" />
                    Alertas del Sistema
                    {alerts.filter(a => !a.is_read).length > 0 && (
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full">
                            {alerts.filter(a => !a.is_read).length}
                        </span>
                    )}
                </h3>

                <div className="space-y-4">
                    {alerts.length > 0 ? (
                        alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-4 rounded-2xl border transition-all ${alert.is_read ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-emerald-100 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`w-1.5 h-1.5 rounded-full ${alert.type === 'momentum' ? 'bg-blue-400' :
                                                alert.type === 'volatility' ? 'bg-blue-600' :
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
                                            className="p-1.5 hover:bg-emerald-50 text-emerald-400 rounded-lg transition"
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
    );
}

function StatusItem({ label, status, time }: { label: string, status: string, time?: string }) {
    return (
        <li className="flex items-center justify-between">
            <div>
                <div className="text-sm font-bold text-slate-700">{label}</div>
                {time && <div className="text-[10px] text-slate-400 font-medium">{time}</div>}
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${status === 'Activo' || status === 'Óptimo' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                status === 'Programado' ? 'bg-sky-100 text-sky-700 border border-sky-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                {status}
            </span>
        </li>
    );
}

function HealthMetric({ label, value, desc, color }: { label: string, value: string, desc: string, color: string }) {
    const colorClasses: Record<string, string> = {
        emerald: "text-emerald-600"
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-400 tracking-tight">{label}</span>
                <span className={`text-sm font-black ${colorClasses[color]}`}>{value}</span>
            </div>
            <div className="text-[10px] text-slate-500 italic font-medium">{desc}</div>
        </div>
    );
}
