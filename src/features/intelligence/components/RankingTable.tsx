import { Search, ChevronRight, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { TrendingItem } from "../../../types/trending";

interface RankingTableProps {
    loading: boolean;
    rankings: TrendingItem[];
    filteredRankings: TrendingItem[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    selectedBattle: TrendingItem | null;
    loadDepthData: (item: TrendingItem) => void;
}

export function RankingTable({
    loading,
    rankings,
    filteredRankings,
    searchTerm,
    setSearchTerm,
    selectedBattle,
    loadDepthData
}: RankingTableProps) {
    return (
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    Ranking de Tendencias
                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{rankings.length}</span>
                </h2>

                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar evaluación..."
                        className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-accent/50 transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Evaluación / Slug</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4 text-center">Variación</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            Array(5).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-6 py-4 h-16 bg-slate-50/30"></td>
                                </tr>
                            ))
                        ) : filteredRankings.length > 0 ? (
                            filteredRankings.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => loadDepthData(item)}
                                    className={`hover:bg-slate-50/50 transition cursor-pointer group ${selectedBattle?.id === item.id ? 'bg-brand-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-900">{item.title}</div>
                                        <div className="text-xs text-slate-400 font-medium">{item.slug}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-bold text-slate-700">{item.trend_score.toLocaleString()}</div>
                                        <div className="text-[10px] text-slate-400">{item.total_signals} señales</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <VariationBadge variation={item.variation_percent} direction={item.direction} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-300 group-hover:text-accent transition">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12">
                                    <div className="flex flex-col items-center justify-center text-center">
                                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-1">Sin resultados</h3>
                                        <p className="text-xs text-slate-500 max-w-sm">
                                            No se encontraron evaluaciones que coincidan con tu búsqueda o filtros actuales.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function VariationBadge({ variation, direction }: { variation: number, direction: 'up' | 'down' | 'stable' }) {
    if (direction === 'up') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold shadow-sm border border-accent-100/50">
                <TrendingUp className="w-3 h-3" />
                +{variation.toFixed(1)}%
            </span>
        );
    }
    if (direction === 'down') {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-danger-50 text-danger-600 text-xs font-bold shadow-sm border border-danger-100/50">
                <TrendingDown className="w-3 h-3" />
                {variation.toFixed(1)}%
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 text-xs font-bold shadow-sm border border-slate-100/50">
            <Activity className="w-3 h-3 saturate-0" />
            0.0%
        </span>
    );
}
