import { Building2, Activity } from "lucide-react";

interface OverviewB2BHeaderProps {
  onRefresh: () => void;
}

export function OverviewB2BHeader({ onRefresh }: OverviewB2BHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          <Building2 className="w-8 h-8 text-indigo-600" />
          <span className="text-gradient-brand">Executive Overview</span>
        </h1>
        <p className="text-slate-500 mt-1">
          ¿Qué está pasando en el mercado? Monitor estadístico continuo de preferencias B2C y posicionamiento competitivo.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={onRefresh}
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm flex items-center gap-2"
        >
          <Activity className="w-4 h-4 text-indigo-500" />
          Actualizar Dataset
        </button>
      </div>
    </div>
  );
}
