import { Search, BarChart2 } from 'lucide-react';
import { ActualidadTopic } from '../../signals/services/actualidadService';
import { useActualidadHome } from '../hooks/useActualidadHome';
import { ActualidadHomeHero } from './actualidad/ActualidadHomeHero';
import { ActualidadCategoryFilter } from './actualidad/ActualidadCategoryFilter';
import { ActualidadTopicsGrid } from './actualidad/ActualidadTopicsGrid';

interface ActualidadHomeProps {
    topics: ActualidadTopic[];
    loading: boolean;
    onSelectTopic: (topic: ActualidadTopic) => void;
}

export function ActualidadHome({ topics, loading, onSelectTopic }: ActualidadHomeProps) {
    const {
        selectedCategory,
        setSelectedCategory,
        heroIndex,
        setHeroIndex,
        topHeroTopics,
        gridTopics,
        currentHeroTopic
    } = useActualidadHome(topics);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-[var(--accent-primary)] rounded-full animate-spin"></div>
                <p className="mt-4 text-text-muted font-medium">Buscando el pulso de hoy...</p>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h2 className="text-xl font-black text-ink mb-2">Todo en calma</h2>
                <p className="text-text-secondary max-w-sm">
                    No hay nuevos temas de actualidad en este momento. Vuelve más tarde para participar en la conversación.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col animate-fade-in fade-in max-w-ws mx-auto w-full px-4 sm:px-0">
            <div className="fixed top-0 left-0 w-full h-[500px] overflow-hidden pointer-events-none -z-10 bg-gradient-to-b from-slate-50 to-white"></div>

            <div className="space-y-6">
                {currentHeroTopic && (
                    <ActualidadHomeHero 
                        currentHeroTopic={currentHeroTopic}
                        topHeroTopics={topHeroTopics}
                        heroIndex={heroIndex}
                        setHeroIndex={setHeroIndex}
                        onSelectTopic={onSelectTopic}
                    />
                )}

                <ActualidadCategoryFilter 
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                />

                <ActualidadTopicsGrid 
                    gridTopics={gridTopics}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    onSelectTopic={onSelectTopic}
                />

                <div className="mt-8 pt-8 border-t border-stroke text-center pb-12">
                     <button className="inline-flex items-center justify-center gap-2 border border-stroke bg-white text-ink hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/30 rounded-full px-6 py-3 text-sm font-bold shadow-sm transition-all">
                        <BarChart2 className="w-4 h-4" />
                        Ver Archivos de Actualidad
                    </button>
                </div>
            </div>
        </div>
    );
}
