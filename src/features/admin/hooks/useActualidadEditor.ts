import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';
import { Topic, TopicQuestion, TopicStatus, QuestionType } from "../../signals/types/actualidad";
import { adminActualidadService } from "../services/adminActualidadService";
import { logger } from '../../../lib/logger';

export function useActualidadEditor(id: string | undefined) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [topic, setTopic] = useState<Topic | null>(null);

    const [formData, setFormData] = useState<Partial<Topic>>({});
    const [questions, setQuestions] = useState<TopicQuestion[]>([]);
    const [tagsInput, setTagsInput] = useState("");
    const [actorsInput, setActorsInput] = useState("");

    const fetchTopic = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await adminActualidadService.getAdminTopicById(id);
            if (data) {
                setTopic(data);
                setFormData({
                    title: data.title,
                    summary: data.summary,
                    impact_phrase: data.impact_phrase, // Removed window.impact_quote fallback which used any
                    category: data.category,
                    intensity: data.intensity,
                    relevance_chile: data.relevance_chile,
                    event_stage: data.event_stage,
                    topic_duration: data.topic_duration,
                    opinion_maturity: data.opinion_maturity,
                    status: data.status,
                    tags: data.tags,
                    actors: data.actors,
                    metadata: data.metadata,
                });

                // Helper para asegurar que las opciones sean SIEMPRE un arreglo de strings
                const sanitizeOptions = (opts: unknown): string[] => {
                    if (!Array.isArray(opts)) return [];
                    return opts.map((opt: unknown) => {
                        if (typeof opt === 'string') return opt;
                        if (opt && typeof opt === 'object') {
                            const o = opt as Record<string, unknown>;
                            return (o.text as string) || (o.label as string) || (o.value as string) || (o.title as string) || Object.values(o).find(v => typeof v === 'string') as string || "Opción";
                        }
                        return String(opt);
                    }).filter(Boolean) as string[];
                };

                let sortedQ = [...(data.questions || [])].sort((a, b) => a.order - b.order);

                if (sortedQ.length === 0) {
                    const aiPayload = data.metadata?.raw_ai_payload as Record<string, unknown> | undefined;
                    const aiQuestions = aiPayload?.questions as Array<Record<string, unknown>> | undefined;
                    if (aiQuestions && Array.isArray(aiQuestions)) {
                        sortedQ = aiQuestions.map((q) => ({
                            id: crypto.randomUUID(),
                            order: (typeof q.order === 'number' ? q.order : 1),
                            text: typeof q.text === 'string' ? q.text : "",
                            type: 'single_choice' as const,
                            options: sanitizeOptions(q.options)
                        })).sort((a, b) => a.order - b.order);
                    }
                }

                // Asegurar que TODAS las preguntas en el State, vengan de DB o de IA, tengan options sanitizadas
                sortedQ = sortedQ.map(q => ({ ...q, options: sanitizeOptions(q.options) }));

                while (sortedQ.length < 3) {
                    const defaultTypes: QuestionType[] = ['scale_0_10', 'single_choice', 'single_choice_polar'];
                    sortedQ.push({
                        id: crypto.randomUUID(),
                        order: sortedQ.length + 1,
                        text: "",
                        type: defaultTypes[sortedQ.length] || 'single_choice',
                        options: []
                    });
                }
                setQuestions(sortedQ.slice(0, 3));
                setTagsInput(data.tags?.join(", ") || "");
                setActorsInput(data.actors?.join(", ") || "");
            }
        } catch (err) {
            logger.error("Error fetching topic", { domain: 'actualidad_editorial', origin: 'useActualidadEditor', action: 'fetch_topic', state: 'failed' }, err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchTopic();
    }, [fetchTopic]);

    const handleTagsChange = (val: string) => {
        setTagsInput(val);
        setFormData(prev => ({ ...prev, tags: val.split(',').map(t => t.trim()).filter(Boolean) }));
    };

    const handleActorsChange = (val: string) => {
        setActorsInput(val);
        setFormData(prev => ({ ...prev, actors: val.split(',').map(a => a.trim()).filter(Boolean) }));
    };

    const handleQuestionChange = (orderIdx: number, field: string, value: string | string[] | number) => {
        setQuestions(prev => {
            const newQ = [...prev];
            newQ[orderIdx] = { ...newQ[orderIdx], [field]: value };
            return newQ;
        });
    };

    const handleQuestionOptionAdd = (orderIdx: number) => {
        setQuestions(prev => {
            const newQ = [...prev];
            newQ[orderIdx].options = [...(newQ[orderIdx].options || []), "Nueva Opción"];
            return newQ;
        });
    };

    const handleQuestionOptionChange = (orderIdx: number, optIdx: number, value: string) => {
        setQuestions(prev => {
            const newQ = [...prev];
            const newOpts = [...(newQ[orderIdx].options || [])];
            newOpts[optIdx] = value;
            newQ[orderIdx].options = newOpts;
            return newQ;
        });
    };

    const handleQuestionOptionRemove = (orderIdx: number, optIdx: number) => {
        setQuestions(prev => {
            const newQ = [...prev];
            const newOpts = [...(newQ[orderIdx].options || [])];
            newOpts.splice(optIdx, 1);
            newQ[orderIdx].options = newOpts;
            return newQ;
        });
    };

    const validateForm = (isDraft: boolean = false) => {
        if (!formData.title?.trim()) return "El título es obligatorio.";
        
        // Si es borrador, permitimos guardar con datos parciales siempre que tenga título
        if (isDraft) return null;

        if (!formData.summary?.trim()) return "El resumen neutral es obligatorio.";
        if (!formData.category) return "Debe tener una categoría.";

        for (let i = 0; i < 3; i++) {
            const q = questions[i];
            if (!q.text.trim()) return `La Pregunta ${i + 1} debe tener texto.`;
            if (q.type === 'single_choice' || q.type === 'single_choice_polar') {
                if (!q.options || q.options.length < 2) return `La Pregunta ${i + 1} (${q.type}) requiere al menos 2 opciones.`;
                if (q.options.some(opt => !opt.trim())) return `La Pregunta ${i + 1} tiene opciones vacías.`;
            }
        }
        return null;
    };

    const handleSave = async (silent = false, enforceValidation = false) => {
        if (!topic || !id) return false;

        const isDraftLike = formData.status === 'detected' || formData.status === 'draft' || formData.status === 'rejected';
        const err = validateForm(isDraftLike && !enforceValidation);
        
        if (err) {
            if (!silent) toast.error(err);
            return false;
        }

        setSaving(true);
        try {
            const updates = { ...formData };
            const editorialSuccess = await adminActualidadService.updateTopicEditorialData(id, updates, true);
            const questionsSuccess = await adminActualidadService.updateTopicQuestions(id, questions);

            if (!editorialSuccess || !questionsSuccess) {
                if (!silent) toast.error("No se pudo guardar en la base de datos");
                return false;
            }

            setTopic(prev => prev ? { ...prev, ...formData, admin_edited: true } as Topic : null);

            if (!silent) toast.success("Cambios guardados");
            return true;
        } catch (e) {
            logger.error("Error al guardar cambios de actualidad", { domain: 'actualidad_editorial', origin: 'useActualidadEditor', action: 'save_topic', state: 'failed', topic_id: id }, e);
            if (!silent) toast.error("Error al guardar cambios");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: TopicStatus) => {
        if (!id || !topic) return;

        if (newStatus === 'published' || newStatus === 'approved' || newStatus === 'review') {
            const err = validateForm(false); // Validacion estricta siempre
            if (err) {
                toast.error(`No se puede transicionar a ${newStatus}: ${err}`);
                return;
            }
            const saved = await handleSave(true, true);
            if (!saved) {
                toast.error("Error técnico al guardar antes de transicionar (revisá la consola)");
                return;
            }
        }

        setSaving(true);
        try {
            const res = await adminActualidadService.updateTopicStatus(id, newStatus);
            if (res.success) {
                setTopic(prev => prev ? { ...prev, status: newStatus } : null);
                setFormData(prev => ({ ...prev, status: newStatus }));
                if (newStatus === 'published') {
                    navigate('/admin/actualidad');
                }
            } else {
                toast.error(res.error || "No se pudo cambiar el estado");
            }
        } catch (e) {
            logger.error("Error changing topic status", { domain: 'actualidad_editorial', origin: 'useActualidadEditor', action: 'change_status', state: 'failed', topic_id: id, new_status: newStatus }, e);
        } finally {
            setSaving(false);
        }
    };

    return {
        topic,
        formData,
        setFormData,
        questions,
        tagsInput,
        actorsInput,
        loading,
        saving,
        handleTagsChange,
        handleActorsChange,
        handleQuestionChange,
        handleQuestionOptionAdd,
        handleQuestionOptionChange,
        handleQuestionOptionRemove,
        handleSave,
        handleStatusChange,
        navigate
    };
}
