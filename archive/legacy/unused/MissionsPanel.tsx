import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { buildMissions, Mission } from "../loyalty/missionsModel";

type Props = {
    totalSignals: number;
    profileCompleteness: number;
};

function StatusIcon({ status }: { status: Mission["status"] }) {
    if (status === "done") return <span className="material-symbols-outlined text-secondary text-2xl">check_box</span>;
    return <span className="material-symbols-outlined text-text-muted text-2xl">check_box_outline_blank</span>;
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
        <section id="missions" className="card p-6 lg:p-8 shadow-sm group hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">task_alt</span>
                        Misiones Activas
                    </h3>
                    <p className="text-sm text-text-secondary font-medium mt-1">
                        Sube de nivel completando estas acciones clave en la red.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.map((m) => (
                    <div key={m.id} className={`rounded-2xl border ${m.status === 'done' ? 'border-secondary/20 bg-secondary/5' : 'border-stroke bg-white hover:border-primary/20 hover:shadow-sm'} p-5 flex flex-col justify-between transition-all group-hover:bg-white`}>
                        <div className="flex items-start gap-4">
                            <div className="mt-0.5 shrink-0">
                                <StatusIcon status={m.status} />
                            </div>
                            <div>
                                <h4 className={`text-sm font-black ${m.status === 'done' ? 'text-secondary' : 'text-ink'}`}>{m.title}</h4>
                                <p className="text-xs text-text-secondary font-medium mt-1.5 leading-relaxed">{m.description}</p>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-stroke/60 flex items-center justify-between">
                            <div className="flex-1 mr-4">
                                {m.status !== "done" && (
                                    <>
                                        <div className="h-1.5 rounded-full bg-surface2 overflow-hidden border border-stroke">
                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                                                style={{ width: `${Math.round((m.progress || 0) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="mt-1.5 text-[9px] font-black uppercase tracking-widest text-text-muted">
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
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition whitespace-nowrap outline-none ${m.status === "done"
                                        ? "bg-secondary/10 text-secondary cursor-default border border-secondary/20"
                                        : "bg-surface2 text-ink hover:bg-white border border-stroke hover:border-primary/30 active:scale-95 shadow-sm"
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
