import { Newspaper } from "lucide-react";

interface AdminActualidadHeaderProps {
  totalTopics: number;
  loading: boolean;
}

export function AdminActualidadHeader({ totalTopics, loading }: AdminActualidadHeaderProps) {
  return (
    <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5 saturate-0 pointer-events-none">
        <Newspaper className="w-64 h-64 rotate-12" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600 border border-primary-100/50">
            <Newspaper className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mesa Editorial</h1>
        </div>
        <p className="text-slate-500 max-w-xl text-base leading-relaxed">
          Revisa, edita y publica los temas generados por IA a partir de las noticias recientes. 
          Asegura el estándar editorial antes de llegar a la audiencia.
        </p>
        
        <div className="flex gap-6 mt-6">
           <div className="flex flex-col">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total en Bandeja</span>
             <span className="text-2xl font-black text-slate-800">{loading ? '-' : totalTopics}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
