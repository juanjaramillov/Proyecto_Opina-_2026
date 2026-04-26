import { Search, ChevronRight } from "lucide-react";
import { LeaderboardEntry } from "../../metrics/services/metricsService";

interface BenchmarkB2BRankingTableProps {
    loading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filteredRankings: LeaderboardEntry[];
    totalRankings: number;
    selectedEntity: LeaderboardEntry | null;
    onSelectEntity: (entity: LeaderboardEntry) => void;
}

/**
 * Tabla principal de Benchmark B2B: búsqueda + ranking completo con filas clicables.
 * Extraída de `BenchmarkB2B` como parte de DEBT-004 (partición de pages densas).
 */
export function BenchmarkB2BRankingTable({
    loading,
    searchTerm,
    setSearchTerm,
    filteredRankings,
    totalRankings,
    selectedEntity,
    onSelectEntity
}: BenchmarkB2BRankingTableProps) {
    return (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Ranking Competitivo Completo
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

            <div className="overflow-x-auto min-h-[500px]">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Entidad</th>
                            <th className="px-6 py-4 text-center">Win Rate</th>
                            <th className="px-6 py-4 text-center">Volumen de Batallas</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            Array(10).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-6 py-4 h-16 bg-slate-50/30"></td>
                                </tr>
                            ))
                        ) : filteredRankings.length > 0 ? (
                            filteredRankings.map((entity, index) => (
                                <tr
                                    key={entity.entity_id}
                                    onClick={() => onSelectEntity(entity)}
                                    className={`hover:bg-slate-50/50 transition cursor-pointer group ${selectedEntity?.entity_id === entity.entity_id ? 'bg-brand-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4 w-1/3">
                                        <div className="font-semibold text-slate-900">{entity.entity_name}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">Rank #{index + 1} • Global</div>
                                    </td>
                                    <td className="px-6 py-4 text-center w-1/3">
                                        <div className="flex flex-col items-center">
                                            <div className="text-sm font-bold text-slate-700">{(entity.win_rate * 100).toFixed(1)}%</div>
                                            <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-2">
                                                <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${entity.win_rate * 100}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-bold text-slate-700">{entity.total_comparisons}</div>
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
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 text-sm">
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
