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
            <div className="card p-6 lg:p-8 animate-pulse shadow-sm flex flex-col gap-4">
                <div className="h-6 w-1/3 bg-surface2 rounded-lg"></div>
                <div className="h-12 w-full bg-surface2 rounded-xl mt-2"></div>
                <div className="h-4 w-1/2 bg-surface2 rounded-lg mt-1"></div>
            </div>
        );
    }

    // 1. Determine Status Level based on weight and completeness
    let statusText = "Señal en Desarrollo";
    let statusColor = "text-slate-600";
    let bgPulseColor = "bg-surface2";
    let ringColor = "border-stroke";
    let icon = "signal_cellular_1_bar";
    let fillWidth = "w-1/4";
    let barColor = "bg-slate-600";

    if (signalWeight >= 1.5) {
        statusText = "Señal de Alto Impacto";
        statusColor = "text-accent";
        bgPulseColor = "bg-accent/10";
        ringColor = "border-accent/20 bg-accent/5";
        icon = "signal_cellular_4_bar";
        fillWidth = "w-full";
        barColor = "bg-accent";
    } else if (profileCompleteness === 100) {
        statusText = "Señal Sólida";
        statusColor = "text-brand";
        bgPulseColor = "bg-brand/10";
        ringColor = "border-brand/20 bg-brand/5";
        icon = "signal_cellular_3_bar";
        fillWidth = "w-3/4";
        barColor = "bg-brand";
    } else if (profileCompleteness > 0) {
        statusText = "Señal Confiable";
        statusColor = "text-ink";
        bgPulseColor = "bg-ink/5";
        ringColor = "border-stroke bg-surface2";
        icon = "signal_cellular_2_bar";
        fillWidth = "w-2/4";
        barColor = "bg-ink";
    }

    // 2. Determine Actionable Tip
    let tipText = "Tu señal está en su máximo potencial. ¡Sigue opinando!";
    let tipAction = null;

    if (profileCompleteness < 100) {
        tipText = "Completa tu perfil demográfico al 100% para aumentar el peso e impacto de tu opinión en los resultados.";
        tipAction = { label: "Completar perfil", to: "/complete-profile" };
    } else if (tier === "registered" || tier === "guest") {
        tipText = "Verifica tu identidad real para proteger el ecosistema y multiplicar el valor de tu señal sustancialmente.";
        tipAction = { label: "Verificar Identidad", to: "/verify" };
    }

    return (
        <section className="card p-6 lg:p-8 shadow-sm relative overflow-hidden group hover:border-brand/20 transition-all">

            {/* Premium glow effect linked to status color */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-50 transition-colors duration-700 pointer-events-none ${bgPulseColor}`}></div>

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">

                {/* Left Side: Metrics & Reputation Status */}
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-slate-500">cell_tower</span>
                        <h3 className="text-sm font-black text-ink uppercase tracking-widest">
                            Reputación de Señal
                        </h3>
                    </div>

                    <div className="flex items-end gap-4 mt-2">
                        <div className={`text-4xl md:text-5xl font-black tracking-tighter leading-none flex items-center gap-3 ${statusColor}`}>
                            {signalWeight.toFixed(1)}x
                            <span className={`material-symbols-outlined text-4xl opacity-80 ${statusColor}`}>{icon}</span>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-ink font-bold text-lg mb-1">{statusText}</div>
                        <p className="text-slate-600 text-sm leading-relaxed max-w-sm mt-2">
                            El valor actual de tus respuestas frente al ecosistema de Opina+. Este multiplicador filtra bots y premia identidades reales.
                        </p>
                    </div>
                </div>

                {/* Right Side: Visual Meter & Call to Action */}
                <div className="w-full md:w-auto shrink-0 flex flex-col gap-5 mt-4 md:mt-0">

                    {/* Visual Bar */}
                    <div className="w-full md:w-56 h-3 bg-surface2 rounded-full overflow-hidden border border-stroke shadow-inner">
                        <div className={`h-full ${barColor} ${fillWidth} transition-all duration-1000 ease-out rounded-full`}></div>
                    </div>

                    {/* Actionable Tip Card */}
                    <div className={`rounded-2xl p-5 border ${ringColor} w-full md:w-64 relative overflow-hidden shadow-sm`}>
                        <p className="text-xs text-ink leading-relaxed font-bold mb-4">
                            {tipText}
                        </p>

                        {tipAction && (
                            <Link
                                to={tipAction.to}
                                className="inline-flex items-center gap-1.5 text-xs font-black text-ink uppercase tracking-wider hover:text-brand transition-colors border border-stroke bg-white px-3 py-1.5 rounded-lg shadow-sm w-max"
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
