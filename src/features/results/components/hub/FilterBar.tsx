import { ResultsModule, ResultsPeriod, ResultsView, ResultsGeneration } from "../../hooks/useResultsExperience";

interface FilterBarProps {
  activeModule: ResultsModule;
  onModuleChange: (mod: ResultsModule) => void;
  activePeriod: ResultsPeriod;
  onPeriodChange: (period: ResultsPeriod) => void;
  activeView: ResultsView;
  onViewChange: (view: ResultsView) => void;
  activeGeneration: ResultsGeneration;
  onGenerationChange: (gen: ResultsGeneration) => void;
}

export function FilterBar({ 
  activeModule, onModuleChange, 
  activePeriod, onPeriodChange,
  activeView, onViewChange,
  activeGeneration, onGenerationChange
}: FilterBarProps) {
  const modules = [
    { id: "ALL", label: "Todas" },
    { id: "VERSUS", label: "Versus" },
    { id: "TOURNAMENT", label: "Torneo" },
    { id: "PROFUNDIDAD", label: "Profundidad" },
    { id: "ACTUALIDAD", label: "Actualidad" },
    { id: "LUGARES", label: "Lugares" }
  ] as const;

  const periods = [
    { id: "7D", label: "Últimos 7 días" },
    { id: "30D", label: "Últimos 30 días" },
    { id: "90D", label: "Últimos 90 días" }
  ] as const;

  const views = [
    { id: "GENERAL", label: "General" },
    { id: "CONSENSO", label: "Consenso" },
    { id: "POLARIZACION", label: "Polarización" },
    { id: "TENDENCIA", label: "Tendencia" }
  ] as const;

  const generations = [
    { id: "ALL", label: "Todas las generaciones" },
    { id: "BOOMERS", label: "Boomers" },
    { id: "GEN_X", label: "Gen X" },
    { id: "MILLENNIALS", label: "Millennials" },
    { id: "GEN_Z", label: "Gen Z" }
  ] as const;

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      {/* Primera Fila: Principal */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-1.5 md:p-2 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-3 transition-all w-[95vw] md:w-auto md:max-w-[1000px] mx-auto overflow-x-auto hide-scrollbar">
      
      {/* Selector de Módulo */}
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar w-full md:w-auto px-2">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => onModuleChange(mod.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
              activeModule === mod.id 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {mod.label}
          </button>
        ))}
      </div>

      {/* Divisor */}
      <div className="hidden md:block w-px h-6 bg-slate-200 mx-2" />

      {/* Selector de Periodo */}
      <div className="flex items-center gap-2 px-2 w-full md:w-auto justify-between border-t border-slate-100 md:border-none pt-2 md:pt-0 shrink-0">
        <select 
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 flex-1 md:flex-none text-[13px] font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors cursor-pointer appearance-none text-center"
          value={activePeriod}
          onChange={(e) => onPeriodChange(e.target.value as ResultsPeriod)}
        >
          {periods.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Divisor */}
      <div className="hidden md:block w-px h-6 bg-slate-200 mx-2" />

      {/* Selector de Vista */}
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar w-full md:w-auto px-2 shrink-0 border-t border-slate-100 md:border-none pt-2 md:pt-0">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id as ResultsView)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-bold transition-all ${
              activeView === view.id 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
      
      </div>

      {/* Segunda Fila: Generaciones (Secundaria) */}
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200/50 p-1 md:p-1.5 shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)] rounded-full flex items-center justify-center gap-1 transition-all w-[90vw] md:w-auto mx-auto overflow-x-auto hide-scrollbar">
        {generations.map(gen => (
          <button
            key={gen.id}
            onClick={() => onGenerationChange(gen.id as ResultsGeneration)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
              activeGeneration === gen.id 
                ? 'bg-slate-100 text-slate-800 border border-slate-300 shadow-sm' 
                : 'bg-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-transparent'
            }`}
          >
            {gen.label}
          </button>
        ))}
      </div>
    </div>
  );
}
