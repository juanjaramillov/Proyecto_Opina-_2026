import { useState, useEffect, useCallback } from 'react';
import { actualidadService, ActualidadTopicDetail, ActualidadTopic } from '../../signals/services/actualidadService';
import { ActualidadTopicView } from './ActualidadTopicView';
import { ActualidadHome } from './ActualidadHome';
import { useToast } from '../../../components/ui/useToast';
import { recordNewsSignalsFromLegacy } from '../../../lib/signals/recordNewsSignalsFromLegacy';

interface ActualidadHubManagerProps {
    onClose: () => void;
}

export function ActualidadHubManager({ onClose }: ActualidadHubManagerProps) {
    const [topics, setTopics] = useState<ActualidadTopic[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Store either the detail of the selected topic or null to show Home
    const [selectedTopicDetail, setSelectedTopicDetail] = useState<ActualidadTopicDetail | null>(null);
    const [loadingTopic, setLoadingTopic] = useState(false);
    
    const { showToast } = useToast();

    const loadTopics = useCallback(async () => {
        setLoading(true);
        try {
            const activeTopics = await actualidadService.getPublishedTopics();
            setTopics(activeTopics);
        } catch (error) {
            console.error("Error loading actualidad topics", error);
            showToast("Error al cargar temas de actualidad.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadTopics();
    }, [loadTopics]);

    const handleSelectTopic = async (topic: ActualidadTopic) => {
        setLoadingTopic(true);
        try {
            const detail = await actualidadService.getTopicDetail(topic.id);
            if (detail) {
                setSelectedTopicDetail(detail);
            } else {
                showToast("No se pudo cargar el detalle del tema.", "error");
            }
        } catch (error) {
            console.error("Error fetching topic detail:", error);
            showToast("Ocurrió un error inesperado al abrir el tema.", "error");
        } finally {
            setLoadingTopic(false);
        }
    };

    const handleComplete = async (answers: { question_id: string, answer_value: string }[]) => {
        if (!selectedTopicDetail) return;

        try {
            const success = await actualidadService.submitAnswers(
                selectedTopicDetail.id,
                answers,
                'live'
            );

            if (success) {
                showToast("¡Respuestas registradas con éxito!", "award", 1);
                
                // --- INICIO DOBLE ESCRITURA (Double Write) hacia signal_events (1 resp = 1 CONTEXT_SIGNAL) ---
                try {
                     recordNewsSignalsFromLegacy(selectedTopicDetail, answers)
                         .catch(e => console.warn('[ActualidadHubManager] Double write failed silently', e));
                } catch (dwErr) {
                     console.warn('[ActualidadHubManager] Double write init error', dwErr);
                }
                // --- FIN DOBLE ESCRITURA ---

                // Update local topics state to reflect 'has_answered'
                setTopics(prev => prev.map(t => t.id === selectedTopicDetail.id ? { ...t, has_answered: true, stats: { ...t.stats, total_participants: (t.stats?.total_participants || 0) + 1, total_signals: (t.stats?.total_signals || 0) + answers.length } } as ActualidadTopic : t));
            } else {
                showToast("Hubo un error al guardar tu respuesta.", "error");
            }
        } catch (error) {
            console.error("Error submitting response", error);
            showToast("Hubo un error al procesar tu respuesta.", "error");
        } finally {
            setSelectedTopicDetail(null);
        }
    };

    if (selectedTopicDetail || loadingTopic) {
        if (loadingTopic) {
            return (
                 <div className="flex-1 flex flex-col h-full bg-slate-50 relative items-center justify-center p-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                    <p className="mt-4 text-sm font-bold text-text-muted">Desglosando el tema...</p>
                 </div>
            );
        }
        
        return (
            <ActualidadTopicView
                topic={selectedTopicDetail!}
                onComplete={handleComplete}
                onCancel={() => setSelectedTopicDetail(null)}
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 relative overflow-y-auto w-full">
            <header className="p-4 sm:p-6 mb-2 flex items-center justify-between z-10 sticky top-0 bg-slate-50/80 backdrop-blur-md">
                <div className="flex flex-col max-w-ws w-full mx-auto">
                    <div className="flex items-center gap-3 w-full">
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-stroke text-text-secondary hover:text-[var(--accent-primary)] rounded-full shadow-sm hover:border-[var(--accent-primary)]/50 transition-colors"
                            aria-label="Volver al Hub"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-ink">Actualidad</h1>
                            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Radiografía del momento</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 pb-24 px-4 sm:px-6">
                <ActualidadHome 
                    topics={topics} 
                    loading={loading} 
                    onSelectTopic={handleSelectTopic} 
                />
            </div>
        </div>
    );
}
