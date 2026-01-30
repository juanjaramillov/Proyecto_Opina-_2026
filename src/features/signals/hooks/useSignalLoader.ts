import { useEffect, useState } from "react";
import { supabase } from "../../../supabase/client";
import { signalService } from "../../../services/signalService";
import { demoStore, type DemoSignal } from "../utils/demoData";

// Type Definition re-used from SignalDetail (will eventually move to shared types)
export type LoaderSignal = {
    id: string;
    signal_key: string;
    signal_type: "versus" | "core" | "dynamic";
    question: string;
    scale_type: "emoji" | "numeric" | "binary" | "choice" | "versus";
    options: Array<{ label: string; id?: string }>;
    is_active: boolean;
    created_at: string;
    category_id: string | null;

    battle_id?: string;
    battle_instance_id?: string;
};

export type SignalSource = "demo" | "supabase";

export function useSignalLoader(id: string | undefined) {
    const [signal, setSignal] = useState<LoaderSignal | null>(null);
    const [source, setSource] = useState<SignalSource>("supabase");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        if (!id) {
            setError("Falta el id de la señal.");
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Check Demo Store FIRST
                // This keeps Demo logic completely separate from "Real" DB logic
                const demoSig = demoStore.getAll().find((s: DemoSignal) => s.id === id);
                if (demoSig) {
                    const demoLabels = (demoSig.options ?? []).map((o) => String(o?.label ?? "").trim()).filter(Boolean);

                    // Explicit Scale Type Mapping (No Inference)
                    // Demo signals in store MUST have a scale_type or we default to choice. 
                    // ideally demoStore should provide it. For now, we hardcode known demos or default 'choice'.
                    // EDIT: demoStore data currently might not have scale_type. 
                    // To strictly avoid inference, we should ideally add it to demoStore.
                    // For this refactor, I will define a safe mapper based on known IDs or default.

                    let safeScale: LoaderSignal["scale_type"] = "choice";
                    // Only for legacy demo support, we might need a tiny helper, but NOT global inference.
                    // Actually, let's assume 'choice' unless specific properties exist.
                    // For now, mapping to 'choice' is safe.

                    const adapted: LoaderSignal = {
                        id: demoSig.id,
                        signal_key: "demo",
                        signal_type: "core",
                        question: demoSig.question,
                        scale_type: safeScale,
                        options: demoLabels.map((label) => ({ label })),
                        is_active: true,
                        created_at: new Date().toISOString(),
                        category_id: demoSig.category ?? null,
                    };

                    if (mounted) {
                        setSignal(adapted);
                        setSource("demo");
                    }
                    return;
                }

                // 2. Supabase (Real Data)
                // Try to resolve as Signal ID
                let { data, error: qErr } = await supabase
                    .from("signals")
                    .select("id, signal_key, signal_type, question, scale_type, options, is_active, created_at, category_id")
                    .eq("id", id)
                    .maybeSingle();

                let battleContext: any = null;

                // 3. Fallback: Slug Resolution (Battle Context)
                if (!data) {
                    const ctx = await signalService.resolveBattleContext(id);
                    if (ctx.ok && ctx.battle_id) {
                        battleContext = ctx;
                        data = {
                            id,
                            signal_key: ctx.battle_slug,
                            signal_type: "versus",
                            question: ctx.title || "Versus",
                            scale_type: "versus", // Explicit for Battles
                            options: (ctx.options ?? []).map((o: any) => ({ label: o.label, id: o.id })),
                            is_active: true,
                            created_at: new Date().toISOString(),
                            category_id: null,
                        } as any;
                    }
                }

                if (!data && !battleContext) {
                    if (qErr) throw qErr;
                    throw new Error("Señal no encontrada.");
                }

                const normalized: LoaderSignal = {
                    ...(data as any),
                    options: Array.isArray((data as any).options) ? (data as any).options : [],
                    battle_id: battleContext?.battle_id,
                    battle_instance_id: battleContext?.battle_instance_id,
                };

                if (mounted) {
                    setSignal(normalized);
                    setSource("supabase");
                }

            } catch (e: any) {
                if (mounted) {
                    setError(e?.message ?? "Error cargando la señal");
                    setSignal(null);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, [id]);

    return { signal, source, loading, error };
}
