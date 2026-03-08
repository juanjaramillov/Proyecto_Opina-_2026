import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2 } from 'lucide-react';
import { actualidadService, ActualidadTopic } from '../../signals/services/actualidadService';
import { ActualidadTopicView } from './ActualidadTopicView';
import { useToast } from '../../../components/ui/useToast';

interface ActualidadHubManagerProps {
    onClose: () => void;
}

export function ActualidadHubManager({ onClose }: ActualidadHubManagerProps) {
    const [topics, setTopics] = useState<ActualidadTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<ActualidadTopic | null>(null);
    const { showToast } = useToast();

    const loadTopics = useCallback(async () => {
        setLoading(true);
        try {
            const activeTopics = await actualidadService.getActiveTopicsUnanswered();
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

    const handleSelectTopic = (topic: ActualidadTopic) => {
        setSelectedTopic(topic);
    };

    const handleComplete = async (postura: string, impacto: string) => {
        if (!selectedTopic) return;

        try {
            const success = await actualidadService.submitResponse(
                selectedTopic.id,
                selectedTopic.categoria,
                postura,
                impacto
            );

            if (success) {
                showToast("¡Respuesta registrada!", "award", 1);
                // Remove topic from list
                setTopics(prev => prev.filter(t => t.id !== selectedTopic.id));
            } else {
                showToast("Hubo un error al guardar tu respuesta.", "error");
            }
        } catch (error) {
            console.error("Error submitting response", error);
            showToast("Hubo un error al procesar tu respuesta.", "error");
        } finally {
            setSelectedTopic(null);
        }
    };

    if (selectedTopic) {
        return (
            <ActualidadTopicView
                topic={selectedTopic}
                onComplete={handleComplete}
                onCancel={() => setSelectedTopic(null)}
            />
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            <header className="p-4 border-b border-gray-100 bg-white flex items-center justify-between z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Volver al Hub"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Actualidad</h1>
                        <span className="text-xs text-gray-500">Temas de coyuntura</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 md:w-12 md:h-12 text-[var(--accent-primary)] animate-spin" />
                        </div>
                    ) : topics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                            <div className="w-16 h-16 bg-blue-50 text-[var(--accent-primary)] rounded-full flex items-center justify-center mb-6">
                                <Zap className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">¡Todo al día!</h2>
                            <p className="text-gray-500 max-w-sm">
                                Has respondido todos los temas de actualidad disponibles por ahora. Vuelve más tarde.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence>
                                {topics.map((topic, index) => (
                                    <motion.button
                                        key={topic.id}
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        onClick={() => handleSelectTopic(topic)}
                                        className={`card-interactive p-5 text-left flex flex-col justify-between group h-full relative overflow-hidden
                                            ${index === 0 ? 'md:col-span-2 md:row-span-2 bg-[var(--accent-primary)] text-white border-transparent' : 'bg-white'}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md
                                                ${index === 0 ? 'bg-white/20 text-white' : 'bg-gray-100 text-[var(--accent-primary)]'}
                                            `}>
                                                {topic.categoria}
                                            </span>
                                            {index === 0 && (
                                                <span className="flex items-center gap-1 text-xs font-medium bg-white/20 px-2 py-1 rounded-full text-white">
                                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" /> Destacado
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h3 className={`font-bold mb-2 line-clamp-2 ${index === 0 ? 'text-2xl md:text-3xl' : 'text-lg text-gray-900'}`}>
                                                {topic.titulo}
                                            </h3>
                                            <p className={`text-sm line-clamp-3 
                                                ${index === 0 ? 'text-white/80' : 'text-gray-500'}
                                            `}>
                                                {topic.contexto_corto}
                                            </p>
                                        </div>

                                        <div className={`mt-6 flex items-center gap-2 text-sm font-medium transition-transform group-hover:translate-x-1
                                            ${index === 0 ? 'text-white' : 'text-[var(--accent-primary)]'}
                                        `}>
                                            Opinar ahora →
                                        </div>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
