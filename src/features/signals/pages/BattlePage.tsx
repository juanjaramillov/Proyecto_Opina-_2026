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
                setError("Falta el identificador de la batalla.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const ctx = await signalService.resolveBattleContext(battleSlug);

            if (!mounted) return;

            if (!ctx.ok || !ctx.battle_id || !ctx.title || !ctx.options || ctx.options.length < 2) {
                setError(ctx.error || "No se pudo cargar la batalla.");
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
                showToast("No se pudo registrar la señal. (Sí, lo sé…)", "error");
            });

        return {};
    };

    if (loading) {
        return (
            <div className="container-ws section-y">
                <PageState type="loading" loadingLabel="Cargando batalla..." />
            </div>
        );
    }

    if (error || !battle) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="error"
                    title="No se pudo cargar la batalla"
                    description={error || "Error desconocido."}
                    icon="cloud_off"
                    primaryAction={{ label: "Volver al Hub", onClick: () => navigate("/experience") }}
                    secondaryAction={{ label: "Ir al Home", onClick: () => navigate("/") }}
                />
            </div>
        );
    }

    return (
        <div className="container-ws section-y space-y-6 pb-24">
            <PageHeader
                variant="simple"
                eyebrow={<span className="badge badge-primary">Versus</span>}
                title={
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">{battle.title}</h1>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{battleSlug}</span>
                    </div>
                }
                subtitle={
                    <p className="text-sm text-muted font-medium">
                        Elige una opción. Rápido. Sin tesis. (Para eso está el doctorado.)
                    </p>
                }
                actions={
                    <button
                        onClick={() => navigate("/experience")}
                        className="h-10 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95"
                    >
                        ← Volver
                    </button>
                }
            />

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
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
    );
}
