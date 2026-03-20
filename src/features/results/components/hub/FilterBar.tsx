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
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 p-2 md:p-3 shadow-md rounded-[2.5rem] flex flex-row items-center gap-2 hover:gap-3 transition-all w-max md:max-w-max mx-auto overflow-x-auto hide-scrollbar snap-x max-w-[95vw]">
      
      {/* Selector de Módulo */}
      <div className="flex items-center gap-1.5 shrink-0 px-1">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => onModuleChange(mod.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-bold transition-all snap-start ${
              activeModule === mod.id 
                ? 'bg-indigo-600 text-white shadow-md scale-105' 
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

      {/* Segunda Fila: Generaciones (Secundaria) - Más ligera y subordinada */}
      <div className="flex items-center justify-start md:justify-center gap-2 w-full max-w-[95vw] md:max-w-[800px] mx-auto overflow-x-auto hide-scrollbar snap-x px-2 pt-3 pb-2 mt-1 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 md:hidden bg-gradient-to-r from-slate-50 to-transparent h-full z-10 pointer-events-none" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 md:hidden bg-gradient-to-l from-slate-50 to-transparent h-full z-10 pointer-events-none" />
        
        {generations.map(gen => (
          <button
            key={gen.id}
            onClick={() => onGenerationChange(gen.id as ResultsGeneration)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all snap-start shrink-0 ${
              activeGeneration === gen.id 
                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm' 
                : 'bg-transparent text-slate-400 hover:text-slate-700 hover:bg-slate-100/50'
            }`}
          >
            {gen.label}
          </button>
        ))}
      </div>
    </div>
  );
}
