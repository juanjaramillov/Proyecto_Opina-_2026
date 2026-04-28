import { useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from "react-router-dom";
import VersusGame from "../components/VersusGame";
import { signalService } from "../services/signalService";
import type { Battle } from "../types";
import { useToast } from "../../../components/ui/useToast";
import { logger } from "../../../lib/logger";
import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";

/**
 * FASE 3D React Query (2026-04-26): el contexto de la batalla se cachea por
 * queryKey ['battle','context',slug]. El fetch arranca solo cuando hay slug
 * (`enabled`); el array `battles` se memoriza en client. El submit del voto
 * sigue siendo fire-and-forget (no bloquea la UI).
 */
export default function BattlePage() {
    const { battleSlug } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const battleQuery = useQuery<Battle, Error>({
        queryKey: ['battle', 'context', battleSlug],
        queryFn: async () => {
            const ctx = await signalService.resolveBattleContext(battleSlug as string);

            if (!ctx.ok || !ctx.battle_id || !ctx.title || !ctx.options || ctx.options.length < 2) {
                throw new Error(ctx.error || "No se pudo cargar la evaluación.");
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

            return built;
        },
        enabled: !!battleSlug,
    });

    const battle = battleQuery.data ?? null;
    const loading = battleQuery.isLoading || (!!battleSlug && battleQuery.isPending);
    const error = !battleSlug
        ? "Falta el identificador de la evaluación."
        : battleQuery.error?.message ?? null;

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
                        <span className="badge bg-brand/10 text-brand border border-brand/20 shadow-sm font-bold tracking-widest uppercase">Versus</span>
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Módulo de Señales</span>
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
                            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                                <span className="material-symbols-outlined text-[14px] text-brand">bolt</span>
                                <span className="text-slate-700">Evaluación rápida</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-100 shadow-sm">
                                <span className="material-symbols-outlined text-[14px] text-accent">lock</span>
                                <span className="text-slate-700">100% Anónimo</span>
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

            <div className="bg-white rounded-5xl border border-slate-100 shadow-glass p-4 md:p-6 transition-all relative overflow-hidden group">
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
