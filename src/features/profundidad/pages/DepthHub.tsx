import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../../components/ui/PageHeader";
import { PageState } from "../../../components/ui/StateBlocks";
import { supabase } from "../../../supabase/client";
import { BrandLogo } from "../../../components/ui/BrandLogo";

type BattleRow = { id: string; slug: string; title: string | null };
type OptionRow = {
    id: string;            // battle_options.id (ESTE es el optionId real)
    label: string;
    image_url: string | null;
    brand_id: string | null; // entities.id
    entities?: {
        domain?: string | null;
        image_url?: string | null;
    };
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
                setError("No se encontró la evaluación.");
                setLoading(false);
                return;
            }

            setBattle(b as BattleRow);

            const { data: bo, error: boErr } = await supabase
                .from("battle_options")
                .select("id,label,image_url,brand_id,entities(domain,image_url)")
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
                <PageState type="loading" loadingLabel="Cargando packs..." />
            </div>
        );
    }

    if (error || !battle) {
        return (
            <div className="container-ws section-y min-h-[60vh] flex flex-col items-center justify-center">
                <PageState
                    type="error"
                    title="Algo falló"
                    description={error || "No pudimos cargar Profundidad. Intenta de nuevo."}
                    icon="wifi_off"
                    primaryAction={{ label: "Reintentar", onClick: () => window.location.reload() }}
                    secondaryAction={{ label: "Volver a Participa", onClick: () => navigate("/experience") }}
                />
            </div>
        );
    }

    return (
        <div className="container-ws section-y space-y-6 pb-24 relative z-10 w-full min-h-screen">
            <PageHeader
                variant="simple"
                eyebrow={
                    <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm font-bold tracking-widest uppercase">
                        Profundidad
                    </span>
                }
                title={<h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 drop-shadow-sm">{title}</h1>}
                subtitle={
                    <div className="space-y-1">
                        <p className="text-sm text-slate-500 font-medium tracking-wide mt-2">
                            Acá no eliges rápido: explicas el <span className="text-slate-800 font-bold">por qué</span>. Y eso vale oro.
                        </p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                            Packs cortos de 3–7 preguntas. Sin eternidad.
                        </p>
                    </div>
                }
                actions={
                    <button
                        onClick={() => navigate("/experience")}
                        className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-slate-900 font-bold text-sm transition-all shadow-sm active:scale-95 shrink-0 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        Volver
                    </button>
                }
            />

            {options.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/50 rounded-full blur-[40px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-400 shadow-inner">
                            <span className="material-symbols-outlined text-3xl">inbox</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2 drop-shadow-sm">No hay packs disponibles</h3>
                        <p className="text-slate-500 font-medium mb-8 max-w-sm">Estamos armando los próximos. Vuelve en un rato.</p>
                        <button
                            onClick={() => navigate("/experience")}
                            className="px-6 py-3 bg-gradient-brand text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] hover:-translate-y-0.5 transition-all active:scale-95"
                        >
                            Volver a Participa
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] p-6 md:p-8 relative overflow-hidden group">
                    {/* Decorative background gradients */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full blur-[80px] pointer-events-none transition-colors duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] pointer-events-none transition-colors duration-700"></div>

                    <div className="relative z-10 mb-8 border-b border-slate-100 pb-4">
                        <h2 className="text-2xl font-black text-slate-900 drop-shadow-sm flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary-500">layers</span>
                            Packs por tema
                        </h2>
                        <p className="text-sm text-slate-500 font-medium mt-1 ml-9">Elige un pack. Tus respuestas se cruzan con el algoritmo para descubrir tendencias.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                        {options.map((o) => (
                            <button
                                key={o.id}
                                onClick={() => navigate(`/depth/run/${battle.slug}/${o.id}`)}
                                className="group/card text-left rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md p-5 transition-all duration-300 active:scale-95 relative overflow-hidden"
                            >
                                {/* Hover glow interior */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="h-14 w-14 shrink-0 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden p-[2px] shadow-sm transition-transform group-hover/card:scale-105">
                                        <BrandLogo
                                            name={o.label || 'Opción'}
                                            imageUrl={o.image_url || o.entities?.image_url}
                                            brandDomain={o.entities?.domain}
                                            className="h-full w-full object-contain"
                                            fallbackClassName="flex h-full w-full items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 text-center"
                                        />
                                    </div>
                                    <div className="flex-1 mt-1">
                                        <div className="text-base font-black text-slate-900 leading-tight drop-shadow-sm transition-colors">{o.label}</div>
                                        <div className="text-[11px] font-black uppercase tracking-widest text-primary-500 mt-2 flex items-center gap-1 opacity-80 group-hover/card:opacity-100 transition-opacity">
                                            Responder pack
                                            <span className="material-symbols-outlined text-[14px] group-hover/card:translate-x-1 transition-transform">arrow_forward</span>
                                        </div>
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
