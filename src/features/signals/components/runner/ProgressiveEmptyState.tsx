import { TorneoTournament, BattleOption } from '../../types';

interface ProgressiveEmptyStateProps {
    progressiveData: Omit<TorneoTournament, 'stage'> | null;
}

export function ProgressiveEmptyState({ progressiveData }: ProgressiveEmptyStateProps) {
    const candidates = progressiveData?.candidates || [];
    
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-[400px]">
            <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">inventory_2</span>
            <h3 className="text-2xl font-bold text-ink mb-2">No hay progresivo disponible</h3>
            <p className="text-slate-500 font-medium max-w-sm mb-6">Estamos armando la próxima escalera. Vuelve en un rato.</p>
            <div className="text-xs text-left w-full max-w-lg overflow-auto bg-slate-100 p-4 rounded mb-6">
                <pre>{JSON.stringify({
                    industry: progressiveData?.industry,
                    hasData: !!progressiveData,
                    candidates: candidates?.length,
                    candidatesList: (candidates as BattleOption[])?.map((c) => c?.label)
                }, null, 2)}
                </pre>
            </div>
            <button
                onClick={() => window.location.href = '/signals'}
                className="btn-primary"
            >
                Volver a Participa
            </button>
        </div>
    );
}
