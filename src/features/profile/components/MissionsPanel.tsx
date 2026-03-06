import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildMissions, Mission } from "../loyalty/missionsModel";

type Props = {
    totalSignals: number;
    profileCompleteness: number;
};

function StatusIcon({ status }: { status: Mission["status"] }) {
    if (status === "done") return <span className="material-symbols-outlined text-emerald-500 text-2xl">check_box</span>;
    return <span className="material-symbols-outlined text-slate-300 text-2xl">check_box_outline_blank</span>;
}

function openWhatsAppFeedback() {
    const enabled = import.meta.env.VITE_FEEDBACK_WHATSAPP_ENABLED !== "false";
    const waFromEnv = (import.meta.env.VITE_FEEDBACK_WHATSAPP_NUMBER as string | undefined) || "";
    const waFallback = import.meta.env.DEV ? "56991284219" : "";
    const waNumber = waFromEnv || waFallback;
    if (!enabled || !waNumber) return;

    const message = [
        "¡Hola! 👋 Quería invitar a alguien a probar Opina+.",
        "",
        "Puedes sumarte aquí:",
        "https://opinaplus.com",
    ].join("\n");

    try { navigator.clipboard.writeText(message); } catch { /* noop */ }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
}

export default function MissionsPanel(props: Props) {
    const navigate = useNavigate();

    const missions = useMemo(() => {
        return buildMissions({
            totalSignals: props.totalSignals,
            profileCompleteness: props.profileCompleteness,
        });
    }, [props.totalSignals, props.profileCompleteness]);

    const handleCta = (m: Mission) => {
        if (m.status === "done") return;
        if (m.ctaTo === "whatsapp") {
            openWhatsAppFeedback();
            return;
        }
        if (m.ctaTo) navigate(m.ctaTo);
    };

    return (
        <section id="missions" className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary-500">task_alt</span>
                        Misiones Activas
                    </h3>
                    <p className="text-sm text-muted font-medium mt-1">
                        Sube de nivel completando estas acciones clave en la red.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.map((m) => (
                    <div key={m.id} className={`rounded-2xl border ${m.status === 'done' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-white'} p-5 flex flex-col justify-between transition-colors`}>
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 shrink-0">
                                <StatusIcon status={m.status} />
                            </div>
                            <div>
                                <h4 className={`text-sm font-black ${m.status === 'done' ? 'text-emerald-900' : 'text-ink'}`}>{m.title}</h4>
                                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{m.description}</p>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex-1 mr-4">
                                {m.status !== "done" && (
                                    <>
                                        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-100">
                                            <div
                                                className="h-full rounded-full bg-primary-500 transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.round((m.progress || 0) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {Math.round((m.progress || 0) * 100)}% Completado
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="shrink-0">
                                <button
                                    type="button"
                                    disabled={m.status === "done"}
                                    onClick={() => handleCta(m)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${m.status === "done"
                                            ? "bg-emerald-100 text-emerald-700 cursor-default"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
                                        }`}
                                >
                                    {m.status === "done" ? "Logrado" : (m.ctaLabel || "Completar")}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
