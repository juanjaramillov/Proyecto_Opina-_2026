import { Link } from 'react-router-dom';
import { AccountTier } from '../../auth/types';

interface SignalReputationPanelProps {
    signalWeight: number;
    profileCompleteness: number;
    tier: AccountTier;
    loading?: boolean;
}

export default function SignalReputationPanel({
    signalWeight,
    profileCompleteness,
    tier,
    loading
}: SignalReputationPanelProps) {
    if (loading) {
        return (
            <div className="bg-slate-900 rounded-[2rem] p-6 lg:p-8 animate-pulse border border-slate-800 flex flex-col gap-4">
                <div className="h-6 w-1/3 bg-slate-800 rounded-lg"></div>
                <div className="h-12 w-full bg-slate-800 rounded-xl mt-2"></div>
                <div className="h-4 w-1/2 bg-slate-800 rounded-lg mt-1"></div>
            </div>
        );
    }

    // 1. Determine Status Level based on weight and completeness
    let statusText = "Señal en Desarrollo";
    let statusColor = "text-slate-400";
    let ringColor = "ring-slate-700";
    let icon = "signal_cellular_1_bar";
    let fillWidth = "w-1/4";

    if (signalWeight >= 1.5) {
        statusText = "Señal de Alto Impacto";
        statusColor = "text-primary-400";
        ringColor = "ring-primary-500/50";
        icon = "signal_cellular_4_bar";
        fillWidth = "w-full";
    } else if (profileCompleteness === 100) {
        statusText = "Señal Sólida";
        statusColor = "text-emerald-400";
        ringColor = "ring-emerald-500/50";
        icon = "signal_cellular_3_bar";
        fillWidth = "w-3/4";
    } else if (profileCompleteness > 0) {
        statusText = "Señal Confiable";
        statusColor = "text-blue-400";
        ringColor = "ring-blue-500/50";
        icon = "signal_cellular_2_bar";
        fillWidth = "w-2/4";
    }

    // 2. Determine Actionable Tip
    let tipText = "Tu señal está en su máximo potencial. ¡Sigue opinando!";
    let tipAction = null;

    if (profileCompleteness < 100) {
        tipText = "Completa tu perfil demográfico al 100% para aumentar el peso e impacto de tu opinión en los resultados.";
        tipAction = { label: "Completar perfil", to: "/complete-profile" };
    } else if (tier === "registered" || tier === "guest") {
        tipText = "Verifica tu identidad real para proteger el ecosistema y multiplicar el valor de tu señal sustancialmente.";
        tipAction = { label: "Verificar Identidad", to: "/verify" }; // Assuming /verify is the route, update if different
    }

    return (
        <section className="bg-slate-900 rounded-[2rem] p-6 lg:p-8 shadow-xl border border-slate-800 relative overflow-hidden group">

            {/* Premium glow effect linked to status color */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10 transition-colors duration-700 bg-current ${statusColor}`}></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">

                {/* Left Side: Metrics & Reputation Status */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-slate-400">cell_tower</span>
                        <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest">
                            Reputación de Señal
                        </h3>
                    </div>

                    <div className="flex items-end gap-4">
                        <div className={`text-4xl md:text-5xl font-black tracking-tighter leading-none flex items-center gap-3 ${statusColor}`}>
                            {signalWeight.toFixed(1)}x
                            <span className={`material-symbols-outlined text-4xl opacity-80 ${statusColor}`}>{icon}</span>
                        </div>
                    </div>

                    <div>
                        <div className="text-white font-bold text-lg mb-1">{statusText}</div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                            El valor actual de tus respuestas frente al ecosistema de Opina+. Este multiplicador filtra bots y premia identidades reales.
                        </p>
                    </div>
                </div>

                {/* Right Side: Visual Meter & Call to Action */}
                <div className="w-full md:w-auto shrink-0 flex flex-col gap-4">

                    {/* Visual Bar */}
                    <div className="w-full md:w-56 h-3 bg-slate-800 rounded-full overflow-hidden ring-1 ring-inset ring-slate-700/50">
                        <div className={`h-full bg-gradient-to-r from-slate-600 via-current to-current ${statusColor} ${fillWidth} transition-all duration-1000 ease-out rounded-full`}></div>
                    </div>

                    {/* Actionable Tip Card */}
                    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 ring-1 ring-inset ${ringColor} w-full md:w-64 relative overflow-hidden`}>
                        {/* Soft highlight */}
                        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${statusColor}`}></div>

                        <p className="text-xs text-slate-300 leading-relaxed font-medium mb-3">
                            {tipText}
                        </p>

                        {tipAction && (
                            <Link
                                to={tipAction.to}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider hover:text-primary-400 transition-colors"
                            >
                                {tipAction.label}
                                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </Link>
                        )}
                    </div>

                </div>

            </div>
        </section>
    );
}
