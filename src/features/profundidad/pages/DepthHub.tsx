import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import { supabase } from "../../../supabase/client";

type BattleRow = { id: string; slug: string; title: string | null };
type OptionRow = {
    id: string;            // battle_options.id (ESTE es el optionId real)
    label: string;
    image_url: string | null;
    brand_id: string | null; // entities.id
};

const TITLE_BY_BATTLE: Record<string, string> = {
    "versus-salud-clinicas-privadas-scl": "Profundidad — Clínicas (Santiago)",
    "versus-salud-farmacias-scl": "Profundidad — Farmacias (Santiago)",
};

export default function DepthHub() {
    const { battleSlug } = useParams();
    const navigate = useNavigate();

    const title = useMemo(() => {
        if (!battleSlug) return "Profundidad";
        return TITLE_BY_BATTLE[battleSlug] || `Profundidad — ${battleSlug}`;
    }, [battleSlug]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [battle, setBattle] = useState<BattleRow | null>(null);
    const [options, setOptions] = useState<OptionRow[]>([]);

    useEffect(() => {
        let mounted = true;

        async function load() {
            if (!battleSlug) {
                setError("Falta battleSlug.");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            const { data: b, error: bErr } = await supabase
                .from("battles")
                .select("id,slug,title")
                .eq("slug", battleSlug)
                .maybeSingle();

            if (!mounted) return;

            if (bErr || !b) {
                setError("No se encontró la batalla.");
                setLoading(false);
                return;
            }

            setBattle(b as BattleRow);

            const { data: bo, error: boErr } = await supabase
                .from("battle_options")
                .select("id,label,image_url,brand_id")
                .eq("battle_id", (b as BattleRow).id)
                .order("sort_order", { ascending: true });

            if (!mounted) return;

            if (boErr) {
                setError("No se pudieron cargar las opciones.");
                setOptions([]);
                setLoading(false);
                return;
            }

            setOptions((bo as OptionRow[]) || []);
            setLoading(false);
        }

        load();
        return () => { mounted = false; };
    }, [battleSlug]);

    if (loading) {
        return (
            <div className="container-ws section-y">
                <PageState type="loading" loadingLabel="Cargando Profundidad..." />
            </div>
        );
    }

    if (error || !battle) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="error"
                    title="No se pudo cargar Profundidad"
                    description={error || "Error desconocido."}
                    icon="cloud_off"
                    primaryAction={{ label: "Volver a Participa", onClick: () => navigate("/experience") }}
                />
            </div>
        );
    }

    return (
        <div className="container-ws section-y space-y-6 pb-24">
            <PageHeader
                variant="simple"
                eyebrow={<span className="badge badge-emerald">Profundidad</span>}
                title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-ink">{title}</h1>}
                subtitle={
                    <p className="text-sm text-muted font-medium">
                        Elige una opción y responde el pack. Esto explica el “por qué”.
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

            {options.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-8 text-slate-700">
                    Esta batalla no tiene opciones cargadas.
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {options.map((o) => (
                            <button
                                key={o.id}
                                onClick={() => navigate(`/depth/run/${battle.slug}/${o.id}`)}
                                className="group text-left rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-sm p-4 transition-all active:scale-[0.99]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                                        {o.image_url ? (
                                            <img src={o.image_url} alt={o.label} className="h-10 w-10 object-contain" />
                                        ) : (
                                            <div className="text-xs font-black text-slate-400">N/A</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-slate-900">{o.label}</div>
                                        <div className="text-xs text-slate-500">Responder pack</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
