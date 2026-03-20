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
    <div className="flex flex-col items-center gap-1 w-full relative z-50">
      {/* Primera Fila: Principal */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 p-1.5 md:p-2 shadow-sm rounded-[2rem] flex flex-row items-center gap-2 transition-all w-[95vw] md:w-auto md:max-w-[1000px] mx-auto overflow-x-auto hide-scrollbar snap-x">
      
      {/* Selector de Módulo */}
      <div className="flex items-center gap-1 shrink-0 px-1">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => onModuleChange(mod.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-all snap-start ${
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
      <div className="w-px h-6 bg-slate-200 shrink-0 mx-1" />

      {/* Selector de Periodo */}
      <div className="flex items-center gap-2 px-1 shrink-0 snap-start">
        <select 
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5 text-[13px] font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors cursor-pointer appearance-none text-center"
          value={activePeriod}
          onChange={(e) => onPeriodChange(e.target.value as ResultsPeriod)}
        >
          {periods.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Divisor */}
      <div className="w-px h-6 bg-slate-200 shrink-0 mx-1" />

      {/* Selector de Vista */}
      <div className="flex items-center gap-1 shrink-0 px-1">
        {views.map(view => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id as ResultsView)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-bold transition-all snap-start ${
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

      {/* Segunda Fila: Generaciones (Secundaria) - Más ligera */}
      <div className="flex items-center justify-start md:justify-center gap-1 transition-all w-[95vw] md:w-auto mx-auto overflow-x-auto hide-scrollbar snap-x px-2 pt-1 pb-2">
        {generations.map(gen => (
          <button
            key={gen.id}
            onClick={() => onGenerationChange(gen.id as ResultsGeneration)}
            className={`whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-bold transition-colors snap-start shrink-0 ${
              activeGeneration === gen.id 
                ? 'bg-slate-800 text-white shadow-sm' 
                : 'bg-white/60 md:bg-transparent backdrop-blur-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/50 md:border-transparent'
            }`}
          >
            {gen.label}
          </button>
        ))}
      </div>
    </div>
  );
}
