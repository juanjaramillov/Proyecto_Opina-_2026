import { Search, ChevronRight } from "lucide-react";
import { IntelligenceBenchmarkEntry } from "../../../read-models/b2b/intelligenceAnalyticsTypes";

interface OverviewB2BEntityListProps {
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (t: string) => void;
  filteredRankings: IntelligenceBenchmarkEntry[];
  totalRankings: number;
  selectedEntity: IntelligenceBenchmarkEntry | null;
  onSelectEntity: (entity: IntelligenceBenchmarkEntry) => void;
}

export function OverviewB2BEntityList({
  loading,
  searchTerm,
  setSearchTerm,
  filteredRankings,
  totalRankings,
  selectedEntity,
  onSelectEntity
}: OverviewB2BEntityListProps) {
  return (
    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Top Performers (Global)
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{totalRankings}</span>
        </h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar entidad..."
            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-brand-500 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Entidad</th>
              <th className="px-6 py-4 text-center">Pref. Share</th>
              <th className="px-6 py-4 text-center">Estabilidad</th>
              <th className="px-6 py-4 text-center">Muestra (n_eff)</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-4 h-16 bg-slate-50/30"></td>
                </tr>
              ))
            ) : filteredRankings.length > 0 ? (
              filteredRankings.map((entity, index) => (
                <tr 
                  key={entity.entityId} 
                  onClick={() => onSelectEntity(entity)}
                  className={`hover:bg-slate-50/50 transition cursor-pointer group ${selectedEntity?.entityId === entity.entityId ? 'bg-brand-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{entity.entityName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Rank #{index + 1} • General</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-slate-700">{(entity.weightedPreferenceShare * 100).toFixed(1)}%</div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${entity.weightedPreferenceShare * 100}%` }}></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                          entity.stabilityLabel === 'volátil' ? 'bg-warning-500 animate-pulse' : 
                          entity.stabilityLabel === 'estable' ? 'bg-accent' : 'bg-slate-400'
                      }`}></div>
                      <span className="text-sm font-semibold capitalize text-slate-700">
                        {entity.stabilityLabel.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-sm font-bold text-slate-700">{entity.nEff > 0 ? entity.nEff.toFixed(0) : 0}</div>
                    <div className="text-[10px] text-slate-400">interacciones</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 group-hover:text-brand-500 transition">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                  Sin resultados encontrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
