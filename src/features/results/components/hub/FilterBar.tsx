import { HubFilters } from '../../../../read-models/b2c/hub-types';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  filters: HubFilters;
  onChange: (f: HubFilters) => void;
  isFiltered: boolean;
  cohortSize?: number;
  privacyBlocked?: boolean;
}

export function FilterBar({ filters, onChange, isFiltered, cohortSize, privacyBlocked }: FilterBarProps) {
  const updateFilter = (key: keyof HubFilters, val: string | null) => {
    onChange({ ...filters, [key]: val });
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-2 md:p-3 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] rounded-full flex items-center justify-between gap-3 md:gap-6 transition-all duration-500 w-auto min-w-[320px] hover:bg-slate-900 max-w-[95vw] md:max-w-2xl">
      
      {/* Indicador de Filtro y Contexto */}
      <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 shrink-0">
        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors ${isFiltered ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/50'}`}>
          <Filter className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div className="hidden sm:block">
           <h3 className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest leading-none">Cohorte</h3>
           {isFiltered && (
               <p className="text-[8px] md:text-[10px] text-indigo-300 font-bold tracking-widest mt-0.5 uppercase">
                 Vs ~{cohortSize || 0}
               </p>
           )}
        </div>
      </div>

      {/* Selectores */}
      <div className="flex flex-nowrap items-center gap-1.5 md:gap-2 overflow-x-auto hide-scrollbar shrink">
        {/* Filtro Género */}
        <select 
          className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-[13px] font-bold text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors cursor-pointer appearance-none text-center whitespace-nowrap min-w-max"
          value={filters.gender || ''}
          onChange={e => updateFilter('gender', e.target.value || null)}
        >
          <option value="" className="text-ink">Género</option>
          <option value="male" className="text-ink">Hombres</option>
          <option value="female" className="text-ink">Mujeres</option>
          <option value="other" className="text-ink">Otro</option>
        </select>

        {/* Filtro Edad */}
        <select 
          className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-[11px] md:text-[13px] font-bold text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors cursor-pointer appearance-none text-center whitespace-nowrap min-w-max"
          value={filters.ageRange || ''}
          onChange={e => updateFilter('ageRange', e.target.value || null)}
        >
          <option value="" className="text-ink">Edad</option>
          <option value="18-24" className="text-ink">18-24</option>
          <option value="25-34" className="text-ink">25-34</option>
          <option value="35-44" className="text-ink">35-44</option>
          <option value="45+" className="text-ink">45+</option>
        </select>

        {/* Desactivado Filtro Histórico para ahorro de espacio, se enfoca en demografía p/cohorte */}
      </div>

      {/* Acciones */}
      <div className="flex shrink-0 pr-1 md:pr-2">
        {isFiltered ? (
          <button 
             onClick={clearFilters}
             className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
             title="Limpiar filtros"
          >
             <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        ) : (
          <div className="w-8 md:w-10 h-1 flex items-center justify-center"></div>
        )}
      </div>

      {/* Advertencia Privacidad */}
      {privacyBlocked && (
         <div className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 w-max max-w-[90vw] flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 border border-amber-400 text-amber-950 rounded-full shadow-lg">
             <span className="material-symbols-outlined text-[14px]">warning</span>
             <p className="text-[10px] md:text-[11px] font-black uppercase tracking-wider">Filtro demasiado estrecho. Amplíalo.</p>
         </div>
      )}
    </div>
  );
}
