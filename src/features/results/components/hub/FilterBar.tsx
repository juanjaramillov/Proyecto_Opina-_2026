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
    <div className="bg-white border border-stroke rounded-2xl p-4 shadow-sm relative z-20 flex flex-col md:flex-row gap-4 items-center justify-between">
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center border border-stroke">
          <Filter className="w-5 h-5 text-text-secondary" />
        </div>
        <div>
           <h3 className="text-sm font-black text-ink uppercase tracking-widest leading-none">Mi Cohorte</h3>
           <p className="text-[10px] text-text-muted font-bold tracking-widest mt-1 uppercase">
             {isFiltered ? `Comparando VS grupo (~${cohortSize || 0})` : 'Comparando VS toda la comunidad'}
           </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Filtro Género */}
        <select 
          className="bg-surface2/80 hover:bg-surface border-none rounded-xl px-4 py-2 text-[13px] font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none transition-colors cursor-pointer appearance-none"
          value={filters.gender || ''}
          onChange={e => updateFilter('gender', e.target.value || null)}
        >
          <option value="">Cualquier Género</option>
          <option value="male">Hombres</option>
          <option value="female">Mujeres</option>
          <option value="other">Otro</option>
        </select>

        {/* Filtro Edad */}
        <select 
          className="bg-surface2/80 hover:bg-surface border-none rounded-xl px-4 py-2 text-[13px] font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none transition-colors cursor-pointer appearance-none"
          value={filters.ageRange || ''}
          onChange={e => updateFilter('ageRange', e.target.value || null)}
        >
          <option value="">Cualquier Edad</option>
          <option value="18-24">18-24 años</option>
          <option value="25-34">25-34 años</option>
          <option value="35-44">35-44 años</option>
          <option value="45+">45+ años</option>
        </select>

        {/* Filtro Tiempo */}
        <select 
          className="bg-surface2/80 hover:bg-surface border-none rounded-xl px-4 py-2 text-[13px] font-bold text-ink focus:ring-2 focus:ring-primary/20 outline-none transition-colors cursor-pointer appearance-none"
          value={filters.period || 'all'}
          onChange={e => updateFilter('period', e.target.value)}
        >
          <option value="all">Histórico</option>
          <option value="30d">Últimos 30 días</option>
          <option value="7d">Últimos 7 días</option>
        </select>

        {isFiltered && (
          <button 
             onClick={clearFilters}
             className="ml-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
             title="Limpiar filtros"
          >
             <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {privacyBlocked && (
         <div className="absolute -bottom-10 left-0 right-0 max-w-xl mx-auto flex items-center justify-center gap-2 py-1.5 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-lg shadow-sm">
             <span className="material-symbols-outlined text-[16px]">info</span>
             <p className="text-[11px] font-bold">Filtro demasiado estrecho. Amplíalo para garantizar un cohorte seguro y desbloquear los datos.</p>
         </div>
      )}
    </div>
  );
}
