import { ChevronDown, Filter } from "lucide-react";
import { TopicCategory } from "../../../signals/types/actualidad";
import { SortOption } from "../../hooks/useAdminActualidad";

interface AdminActualidadFiltersProps {
  categoryFilter: string | 'all';
  setCategoryFilter: (cat: TopicCategory | 'all') => void;
  sourceFilter: string | 'all';
  setSourceFilter: (source: string | 'all') => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  uniqueSources: string[];
}

export function AdminActualidadFilters({
  categoryFilter,
  setCategoryFilter,
  sourceFilter,
  setSourceFilter,
  sortBy,
  setSortBy,
  uniqueSources
}: AdminActualidadFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap w-full justify-start lg:justify-end overflow-x-auto pb-2 lg:pb-0 mt-3 md:mt-0">
      {/* Category Filter */}
      <div className="relative group/filter">
        <select 
          value={categoryFilter} 
          onChange={e => setCategoryFilter(e.target.value as TopicCategory | 'all')}
          className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand shadow-sm transition-all cursor-pointer"
        >
          <option value="all">Todas las Categorías</option>
          {['País', 'Economía', 'Ciudad / Vida diaria', 'Marcas y Consumo', 'Deportes y Cultura', 'Tendencias y Sociedad'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Source Filter */}
      {uniqueSources.length > 0 && (
        <div className="relative group/filter">
          <select 
            value={sourceFilter} 
            onChange={e => setSourceFilter(e.target.value)}
            className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand shadow-sm transition-all cursor-pointer"
          >
            <option value="all">Todas las Fuentes</option>
            {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      {/* Sort Menu */}
      <div className="relative group/filter flex items-center bg-white border border-slate-200 rounded-xl px-2 shadow-sm transition-all">
         <Filter className="w-4 h-4 text-slate-400 ml-2" />
         <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value as SortOption)}
          className="appearance-none bg-transparent text-slate-700 text-sm font-bold rounded-xl pl-2 pr-8 py-2.5 outline-none cursor-pointer"
        >
          <option value="recent">Más Recientes</option>
          <option value="confidence">Mayor Confianza IA</option>
          <option value="intensity">Mayor Intensidad</option>
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
