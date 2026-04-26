import { Newspaper, Zap, Loader2 } from "lucide-react";

interface AdminActualidadHeaderProps {
  totalTopics: number;
  loading: boolean;
  onExtract: () => void;
  isExtracting: boolean;
}

export function AdminActualidadHeader({ totalTopics, loading, onExtract, isExtracting }: AdminActualidadHeaderProps) {
  return (
    <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 saturate-0 pointer-events-none">
        <Newspaper className="w-64 h-64 rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-brand/10 p-2.5 rounded-xl text-brand border border-brand-100/50">
            <Newspaper className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mesa Editorial</h1>
        </div>
        <p className="text-slate-500 max-w-xl text-base leading-relaxed">
          Revisa, edita y publica los temas generados por IA a partir de las noticias recientes. 
          Asegura el estándar editorial antes de llegar a la audiencia.
        </p>
        
        <div className="flex items-center gap-6 mt-8">
           <div className="flex flex-col">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total en Bandeja</span>
             <span className="text-2xl font-black text-slate-800">{loading ? '-' : totalTopics}</span>
           </div>
           
           <div className="h-10 w-px bg-slate-200" />
           
           <button
             onClick={onExtract}
             disabled={isExtracting}
             className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isExtracting ? (
               <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
             ) : (
               <Zap className="w-4 h-4 text-accent-400" />
             )}
             {isExtracting ? 'Generando (Toma ~20seg)...' : 'Extraer Nuevas Noticias (IA)'}
           </button>
        </div>
      </div>
    </div>
  );
}
