import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../supabase/client";
import { PageState } from "../../../components/ui/StateBlocks";
import DepthWizard from "../DepthWizard";
import { normalizeRpcError } from "../../../lib/rpcError";
import { depthService } from "../../signals/services/depthService";
import { logger } from "../../../lib/logger";

type BattleRow = { id: string; slug: string; title: string | null };
type OptionRow = {
    id: string;            // battle_options.id  (ESTE se guarda en insert_depth_answers)
    label: string;
    brand_id: string | null;  // entities.id (para cargar depth_definitions)
    image_url: string | null;
};

type DepthDefRow = {
    question_key: string;
    question_text: string;
    question_type: string | null;
    options: any;
    position: number | null;
};

export default function DepthRun() {
    const { battleSlug, optionId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [battle, setBattle] = useState<BattleRow | null>(null);
    const [opt, setOpt] = useState<OptionRow | null>(null);
    const [defs, setDefs] = useState<DepthDefRow[]>([]);

    useEffect(() => {
        let mounted = true;

        async function load() {
            if (!battleSlug || !optionId) {
                setError("Falta battleSlug u optionId.");
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

            const { data: o, error: oErr } = await supabase
                .from("battle_options")
                .select("id,label,brand_id,image_url")
                .eq("id", optionId)
                .eq("battle_id", (b as BattleRow).id)
                .maybeSingle();

            if (!mounted) return;

            if (oErr || !o) {
                setError("No se encontró la opción.");
                setLoading(false);
                return;
            }

            const option = o as OptionRow;
            setOpt(option);

            if (!option.brand_id) {
                setError("Esta opción no tiene brand_id asociado.");
                setLoading(false);
                return;
            }

            const { data: q, error: qErr } = await supabase
                .from("depth_definitions")
                .select("question_key,question_text,question_type,options,position")
                .eq("entity_id", option.brand_id)
                .order("position", { ascending: true });

            if (!mounted) return;

            if (qErr) {
                setError("No se pudieron cargar las preguntas de Profundidad.");
                setLoading(false);
                return;
            }

            setDefs((q as DepthDefRow[]) || []);
            setLoading(false);
        }

        load();
        return () => { mounted = false; };
    }, [battleSlug, optionId]);

    const questions = useMemo(() => {
        return defs.map((d) => {
            let options = d.options;
            if (typeof d.options === "string") {
                try {
                    options = JSON.parse(d.options);
                } catch (e) {
                    logger.warn("Failed to parse options for question", d.question_key, e);
                    options = [];
                }
            }
            if (!Array.isArray(options)) {
                options = [];
            }

            // Forzar nps_0_10 para la primera pregunta o si la clave es 'recomendacion'
            const isFirst = d.position === 1 || d.question_key === 'recomendacion';
            const type = isFirst ? 'nps_0_10' : (d.question_type || (options.length ? "choice" : "scale"));

            return {
                id: d.question_key,
                type,
                question: d.question_text,
                options: options.filter((o: any) => typeof o === 'string'),
            };
        });
    }, [defs]);

    const packTitle = useMemo(() => {
        if (!opt) return "Profundidad";
        return `Profundidad — ${opt.label}`;
    }, [opt]);

    const [saveError, setSaveError] = useState<ReturnType<typeof normalizeRpcError> | null>(null);

    const handleSave = async (answers: Record<string, string | number>) => {
        if (!opt) throw new Error("Option missing");

        const payload = Object.entries(answers).map(([question_key, answer_value]) => ({
            question_key,
            answer_value: String(answer_value),
        }));

        try {
            setSaveError(null);
            await depthService.saveDepthStructured(opt.id, payload);
        } catch (e: unknown) {
            const norm = normalizeRpcError(e);
            setSaveError(norm);
            throw e;
        }
    };

    if (loading) {
        return (
            <div className="container-ws section-y min-h-[60vh] flex flex-col items-center justify-center">
                <PageState type="loading" loadingLabel="Cargando pregunta..." />
            </div>
        );
    }

    if (error || !battle || !opt) {
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

    if (saveError) {
        return (
            <div className="container-ws section-y min-h-[60vh] flex flex-col items-center justify-center">
                <PageState
                    type="error"
                    title={saveError.title}
                    description={saveError.description}
                    icon="lock"
                    primaryAction={{
                        label: saveError.ctaLabel || "Ir",
                        onClick: () => navigate(saveError.ctaPath || "/experience"),
                    }}
                    secondaryAction={{
                        label: "Volver",
                        onClick: () => navigate(`/depth/${battleSlug}`),
                    }}
                />
            </div>
        );
    }

    if (questions.length < 10) {
        return (
            <div className="container-ws section-y min-h-[60vh] flex flex-col items-center justify-center">
                <PageState
                    type="empty"
                    title="Faltan preguntas"
                    description="Esta opción aún no tiene suficientes preguntas de Profundidad (mínimo 10)."
                    icon="warning"
                    primaryAction={{ label: "Volver", onClick: () => navigate(`/depth/${battleSlug}`) }}
                />
            </div>
        );
    }

    return (
        <div className="container-ws section-y pb-24 relative z-10 w-full min-h-screen">
            <DepthWizard
                packTitle={packTitle}
                questions={questions as any}
                onSave={handleSave}
                onCancel={() => navigate(`/experience`)}
                onComplete={() => navigate("/results")}
            />
        </div>
    );
}
