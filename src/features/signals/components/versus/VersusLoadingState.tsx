
import { useNavigate } from 'react-router-dom';

export function VersusLoadingState() {
    const navigate = useNavigate();
    return (
        <div className="w-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white border border-slate-100 shadow-glass rounded-4xl min-h-[400px]">
            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center mb-6 text-slate-400">
                <span className="material-symbols-outlined text-slate-500 text-5xl mb-4">hourglass_empty</span>
            </div>
            <h2 className="text-2xl font-black text-ink tracking-tight mb-2">No hay combates disponibles</h2>
            <p className="text-slate-600 font-medium text-sm mb-6 max-w-xs mx-auto">
                Estamos preparando nuevas opciones. Vuelve en un rato.
            </p>
            <div className="mt-8">
                <button onClick={() => navigate('/experience')} className="px-6 py-3 bg-gradient-to-br from-brand to-accent text-white rounded-xl font-black shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 uppercase tracking-wider text-sm">
                    Volver a Participa
                </button>
            </div>
        </div>
    );
}

export default VersusLoadingState;
