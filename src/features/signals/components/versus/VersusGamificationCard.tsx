import { useEffect, useState } from "react";
import { Scale, Sparkles, Vote } from "lucide-react";
import { supabase } from "../../../../supabase/client";

interface Props {
    /** Battle actual en juego. */
    battleId: string | null | undefined;
    /** Segmento del usuario (opcional, para profile match). */
    userSegment?: {
        generation?: string | null;
        gender?: string | null;
        commune?: string | null;
    };
    /** Variante visual: compact = 1 línea horizontal; full = card con 3 KPIs. */
    variant?: "compact" | "full";
}

interface GamificationData {
    voteWeightPct: number | null;
    profileMatchPct: number | null;
    votesToRevert: number | null;
    leaderName: string | null;
}

/**
 * F14 — KPIs gamificados para el usuario MIENTRAS juega un versus:
 *  - vote_weight_now: cuánto pesa tu voto en este versus específico (incentivo a entrar a categorías nuevas).
 *  - profile_match: qué tan parecido eres al votante promedio del versus (alto = mainstream, bajo = outlier).
 *  - votes_to_revert: gamificación de mass_to_revert ("faltan X votos como el tuyo para revertir").
 *
 * Todos los cálculos se hacen al vuelo desde analytics_daily_entity_rollup + signal_events
 * usando solo el battle_id. Sin nuevas tablas.
 */
export function VersusGamificationCard({ battleId, userSegment, variant = "compact" }: Props) {
    const [data, setData] = useState<GamificationData>({
        voteWeightPct: null,
        profileMatchPct: null,
        votesToRevert: null,
        leaderName: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!battleId) return;
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                // 1. Obtener las 2 opciones de la battle (battle_options usa brand_id, no entity_id)
                const { data: opts } = await supabase
                    .from("battle_options")
                    .select("id, brand_id, label, sort_order")
                    .eq("battle_id", battleId);
                if (!opts || opts.length < 2 || cancelled) return;

                // 2. Total de signals en esta battle (para vote_weight)
                const { count: totalVotes } = await supabase
                    .from("signal_events")
                    .select("*", { count: "exact", head: true })
                    .eq("battle_id", battleId);

                const voteWeightPct = totalVotes != null
                    ? Math.max(0.1, Math.min(100, (1 / (totalVotes + 1)) * 100))
                    : null;

                // 3. Para mass_to_revert por battle: usar wins de cada opción en el rollup
                const entityIds = opts.map(o => o.brand_id).filter(Boolean) as string[];
                const { data: rolls } = await supabase
                    .from("analytics_daily_entity_rollup")
                    .select("entity_id, total_battles, wins, preference_share")
                    .in("entity_id", entityIds)
                    .order("summary_date", { ascending: false })
                    .limit(50);

                let votesToRevert: number | null = null;
                let leaderName: string | null = null;
                if (rolls && rolls.length > 0) {
                    const byEntity = new Map<string, { battles: number; wins: number }>();
                    for (const r of rolls) {
                        if (!byEntity.has(r.entity_id)) byEntity.set(r.entity_id, { battles: 0, wins: 0 });
                        const e = byEntity.get(r.entity_id)!;
                        e.battles += r.total_battles || 0;
                        e.wins += r.wins || 0;
                    }
                    const entries = Array.from(byEntity.entries())
                        .map(([id, v]) => ({ id, ...v, share: v.battles > 0 ? v.wins / v.battles : 0 }))
                        .sort((a, b) => b.share - a.share);
                    if (entries.length >= 2) {
                        const lead = entries[0];
                        const second = entries[1];
                        const margin = lead.share - second.share;
                        const localTotal = totalVotes || lead.battles + second.battles;
                        votesToRevert = Math.max(1, Math.ceil(margin * localTotal));
                        const { data: ent } = await supabase.from("entities").select("name").eq("id", lead.id).single();
                        leaderName = ent?.name || null;
                    }
                }

                // 4. Profile match: % de votantes que comparten al menos uno de gen/gender/commune.
                let profileMatchPct: number | null = null;
                if (userSegment && (userSegment.generation || userSegment.gender || userSegment.commune)) {
                    const { count: total } = await supabase
                        .from("signal_events")
                        .select("*", { count: "exact", head: true })
                        .eq("battle_id", battleId);
                    if (total && total > 0) {
                        // 3 consultas secuenciales (más simple que batch de PromiseLike de Supabase)
                        const counts: number[] = [];
                        if (userSegment.generation) {
                            const { count } = await supabase.from("signal_events")
                                .select("*", { count: "exact", head: true })
                                .eq("battle_id", battleId)
                                .eq("age_bucket", userSegment.generation);
                            counts.push(count || 0);
                        }
                        if (userSegment.gender) {
                            const { count } = await supabase.from("signal_events")
                                .select("*", { count: "exact", head: true })
                                .eq("battle_id", battleId)
                                .eq("gender", userSegment.gender);
                            counts.push(count || 0);
                        }
                        if (userSegment.commune) {
                            const { count } = await supabase.from("signal_events")
                                .select("*", { count: "exact", head: true })
                                .eq("battle_id", battleId)
                                .eq("commune", userSegment.commune);
                            counts.push(count || 0);
                        }
                        if (counts.length > 0) {
                            const matches = counts.reduce((a, b) => a + b, 0) / counts.length;
                            profileMatchPct = Math.round((matches / total) * 100);
                        }
                    }
                }

                if (!cancelled) {
                    setData({ voteWeightPct, profileMatchPct, votesToRevert, leaderName });
                }
            } catch (err) {
                console.warn("[VersusGamificationCard]", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [battleId, userSegment]);

    if (!battleId || loading) return null;
    const hasAny = data.voteWeightPct != null || data.profileMatchPct != null || data.votesToRevert != null;
    if (!hasAny) return null;

    if (variant === "compact") {
        return (
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-2">
                {data.voteWeightPct != null && (
                    <span className="px-2.5 py-1 bg-brand/10 text-brand border border-brand/20 rounded-full" title="Cuánto pesa tu voto en este versus">
                        Tu voto pesa {data.voteWeightPct < 1 ? data.voteWeightPct.toFixed(2) : data.voteWeightPct.toFixed(1)}%
                    </span>
                )}
                {data.votesToRevert != null && data.leaderName && (
                    <span className="px-2.5 py-1 bg-warning-50 text-warning-700 border border-warning-100 rounded-full" title="Votos como el tuyo para revertir el liderazgo actual">
                        ~{data.votesToRevert} votos para volcar a {data.leaderName}
                    </span>
                )}
                {data.profileMatchPct != null && (
                    <span className="px-2.5 py-1 bg-accent-50 text-accent-700 border border-accent-100 rounded-full" title="Qué tan parecido eres al votante promedio">
                        Match {data.profileMatchPct}% con la audiencia
                    </span>
                )}
            </div>
        );
    }

    // variant full
    return (
        <div className="bg-white rounded-2xl border border-stroke shadow-sm p-4 max-w-md mx-auto mt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
                {data.voteWeightPct != null && (
                    <div>
                        <Vote className="w-4 h-4 text-brand mx-auto mb-1" />
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tu peso</div>
                        <div className="text-lg font-black text-ink tracking-tighter">{data.voteWeightPct < 1 ? data.voteWeightPct.toFixed(2) : data.voteWeightPct.toFixed(1)}%</div>
                    </div>
                )}
                {data.votesToRevert != null && (
                    <div>
                        <Scale className="w-4 h-4 text-warning-600 mx-auto mb-1" />
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Para revertir</div>
                        <div className="text-lg font-black text-ink tracking-tighter">~{data.votesToRevert}</div>
                    </div>
                )}
                {data.profileMatchPct != null && (
                    <div>
                        <Sparkles className="w-4 h-4 text-accent mx-auto mb-1" />
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Match</div>
                        <div className="text-lg font-black text-ink tracking-tighter">{data.profileMatchPct}%</div>
                    </div>
                )}
            </div>
        </div>
    );
}
