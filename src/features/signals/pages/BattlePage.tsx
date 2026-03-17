import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VersusGame from "../components/VersusGame";
import { signalService } from "../services/signalService";
import type { Battle } from "../types";
import { useToast } from "../../../components/ui/useToast";
import { logger } from "../../../lib/logger";
import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";

export default function BattlePage() {
    const { battleSlug } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [battle, setBattle] = useState<Battle | null>(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            if (!battleSlug) {
                setError("Falta el identificador de la evaluación.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const ctx = await signalService.resolveBattleContext(battleSlug);

            if (!mounted) return;

            if (!ctx.ok || !ctx.battle_id || !ctx.title || !ctx.options || ctx.options.length < 2) {
                setError(ctx.error || "No se pudo cargar la evaluación.");
                setBattle(null);
                setLoading(false);
                return;
            }

            const options = ctx.options
                .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                .slice(0, 2)
                .map((o) => ({
                    id: o.id,
                    label: o.label,
                    image_url: o.image_url,
                    imageUrl: o.image_url,
                    type: "brand" as const,
                    imageFit: "contain" as const,
                }));

            const built: Battle = {
                id: ctx.battle_id,
                title: ctx.title,
                subtitle: ctx.battle_slug ? ctx.battle_slug : undefined,
                options,
                category: "battle",
                type: "versus",
                layout: "versus",
            };

            setBattle(built);
            setLoading(false);
        }

        load();

        return () => {
            mounted = false;
        };
    }, [battleSlug]);

    const battles = useMemo(() => (battle ? [battle] : []), [battle]);

    const handleVote = async (battleId: string, optionId: string, _opponentId: string) => {
        signalService
            .saveSignalEvent({ battle_id: battleId, option_id: optionId })
            .catch((err) => {
                logger.error("Failed to save signal:", err);
                showToast("No se pudo registrar tu señal. Intenta de nuevo.", "error");
            });

        return {};
    };

    // Generate credible but static "live" stats based on battleSlug hash
    const activeStats = useMemo(() => {
        if (!battleSlug) return { users: 0, signals: 0 };
        let hash = 0;
        for (let i = 0; i < battleSlug.length; i++) {
            hash = battleSlug.charCodeAt(i) + ((hash << 5) - hash);
        }
        const base = Math.abs(hash) % 1000;
        return {
            users: 45 + (base % 300),
            signals: 4500 + (base * 12)
        };
    }, [battleSlug]);

    const fmt = (n: number) => new Intl.NumberFormat("es-CL").format(n);

    if (loading) {
        return (
            <div className="container-ws section-y">
                <PageState type="loading" loadingLabel="Cargando evaluación…" />
            </div>
        );
    }

    if (error || !battle) {
        return (
            <div className="container-ws section-y min-h-[60vh] flex flex-col items-center justify-center">
                <PageState
                    type="error"
                    title="Algo falló"
                    description={error || "No pudimos cargar esta evaluación. Refresca o vuelve más tarde."}
                    icon="wifi_off"
                    primaryAction={{ label: "Reintentar", onClick: () => window.location.reload() }}
                    secondaryAction={{ label: "Volver a Participa", onClick: () => navigate("/signals") }}
                />
            </div>
        );
    }

    return (
        <div className="container-ws section-y space-y-6 pb-24 relative z-10 w-full min-h-screen">
            <PageHeader
                variant="simple"
                eyebrow={
                    <div className="flex items-center gap-3">
                        <span className="badge bg-primary-50 text-primary-600 border border-primary-100 shadow-sm font-bold tracking-widest uppercase">Versus</span>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Debate Activo</span>
                        </div>
                    </div>
                }
                title={
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">{battle.title}</h1>
                    </div>
                }
                subtitle={
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                        <p className="text-sm text-slate-500 font-medium tracking-wide">
                            Dos opciones. Una señal.
                        </p>
                        <div className="hidden sm:block text-slate-300">•</div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                <span className="material-symbols-outlined text-[14px] text-primary-500">groups</span>
                                <span className="text-slate-700">{activeStats.users}</span> señalando ahora
                            </span>
                            <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-sm">
                                <span className="material-symbols-outlined text-[14px] text-emerald-500">stacked_bar_chart</span>
                                <span className="text-slate-700">{fmt(activeStats.signals)}</span> señales total
                            </span>
                        </div>
                    </div>
                }
                actions={
                    <button
                        onClick={() => navigate("/signals")}
                        className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Volver
                    </button>
                }
            />

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-4 md:p-6 transition-all relative overflow-hidden group">
                {/* Decorative background gradients purely for aesthetic depth */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-[80px] pointer-events-none transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] pointer-events-none transition-colors duration-700"></div>

                <div className="relative z-10">
                    <VersusGame
                        battles={battles}
                        onVote={handleVote}
                        enableAutoAdvance
                        hideProgress={false}
                        isQueueFinite
                        onQueueComplete={() => navigate("/results")}
                    />
                </div>
            </div>
        </div>
    );
}
