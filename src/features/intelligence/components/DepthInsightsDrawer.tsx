import { X, Zap, PieChart, Users, Clock, TrendingUp, TrendingDown, Activity, Database } from "lucide-react";
import { TrendingItem } from "../../../types/trending";
import { DepthInsight, TemporalComparison, VolatilityData, PolarizationData, SegmentInfluence, EarlySignal } from "../../signals/services/insightsService";
import { Line } from 'react-chartjs-2';

interface DepthInsightsDrawerProps {
    selectedBattle: TrendingItem;
    setSelectedBattle: (item: TrendingItem | null) => void;
    loadingDetails: boolean;
    aiSummary: string | null;
    isGeneratingAi: boolean;
    handleGenerateAiSummary: () => void;
    role: string | null;
    volatility: VolatilityData | null;
    polarization: PolarizationData | null;
    segmentInfluence: SegmentInfluence[];
    daysBack: number;
    earlySignals: EarlySignal[];
    temporalComparison: TemporalComparison[];
    setDaysBack: (days: number) => void;
    loadDepthData: (item: TrendingItem, days?: number) => void;
    depthInsights: DepthInsight[];
}

export function DepthInsightsDrawer({
    selectedBattle,
    setSelectedBattle,
    loadingDetails,
    aiSummary,
    isGeneratingAi,
    handleGenerateAiSummary,
    role,
    volatility,
    polarization,
    segmentInfluence,
    daysBack,
    earlySignals,
    temporalComparison,
    setDaysBack,
    loadDepthData,
    depthInsights
}: DepthInsightsDrawerProps) {
    return (
        <>
            <div className="fixed inset-y-0 right-0 w-full lg:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 border-l border-slate-100 overflow-y-auto">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{selectedBattle.title}</h3>
                            <p className="text-xs text-slate-400 font-medium">Análisis de profundidad segmentado</p>
                        </div>
                        <button
                            onClick={() => setSelectedBattle(null)}
                            className="p-2 hover:bg-slate-50 rounded-full transition"
                        >
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    {loadingDetails ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* MAGIC INSIGHTS (AI SUMMARY) */}
                            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl border border-indigo-800 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Zap className="w-24 h-24 text-white" />
                                </div>
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                                            <Zap className="w-4 h-4 text-indigo-300" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Magic Insight B2B</span>
                                    </div>
                                    {(!aiSummary || role === 'admin') && (
                                        <button
                                            onClick={handleGenerateAiSummary}
                                            disabled={isGeneratingAi}
                                            className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-50"
                                        >
                                            {isGeneratingAi ? 'Generando...' : 'Generar IA'}
                                        </button>
                                    )}
                                </div>
                                <div className="relative z-10">
                                    {isGeneratingAi ? (
                                        <div className="text-sm font-medium text-indigo-200 animate-pulse italic">
                                            El Analista IA está interpretando los datos de la evaluación...
                                        </div>
                                    ) : aiSummary ? (
                                        <p className="text-sm font-medium text-white leading-relaxed">
                                            {aiSummary}
                                        </p>
                                    ) : (
                                        <p className="text-sm font-medium text-indigo-200/60 italic">
                                            No hay un resumen generado. Haz clic en "Generar IA" para obtener un análisis mágico.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* VOLATILITY CARD WITH AREA CHART */}
                            <div className={`p-6 rounded-3xl border ${volatility?.classification === 'volatile' ? 'bg-rose-50 border-rose-100' : volatility?.classification === 'moderate' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Zap className={`w-4 h-4 ${volatility?.classification === 'volatile' ? 'text-rose-500' : volatility?.classification === 'moderate' ? 'text-emerald-500' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Índice de Volatilidad (30D)</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${volatility?.classification === 'volatile' ? 'bg-rose-100 text-rose-600' : volatility?.classification === 'moderate' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {volatility?.classification === 'volatile' ? 'Volátil' : volatility?.classification === 'moderate' ? 'Moderado' : 'Estable'}
                                    </span>
                                </div>
                                <div className="text-3xl font-black text-slate-900 mb-4">{volatility?.volatility_index.toFixed(1)}%</div>

                                <div className="h-24 w-full">
                                    <Line
                                        data={{
                                            labels: ['D-30', 'D-20', 'D-10', 'Hoy'], // Mock de etiquetas temporales; en un caso real vendría del backend
                                            datasets: [{
                                                label: 'Volatilidad',
                                                data: [
                                                    Math.max(0, (volatility?.volatility_index || 0) * 0.8),
                                                    Math.max(0, (volatility?.volatility_index || 0) * 1.2),
                                                    Math.max(0, (volatility?.volatility_index || 0) * 0.9),
                                                    volatility?.volatility_index || 0
                                                ],
                                                borderColor: volatility?.classification === 'volatile' ? '#f43f5e' : volatility?.classification === 'moderate' ? '#f59e0b' : '#10b981',
                                                backgroundColor: volatility?.classification === 'volatile' ? 'rgba(244, 63, 94, 0.1)' : volatility?.classification === 'moderate' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                fill: true,
                                                tension: 0.4,
                                                pointRadius: 0
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                            scales: { x: { display: false }, y: { display: false, min: 0 } }
                                        }}
                                    />
                                </div>

                                <p className="text-[10px] text-slate-400 mt-4 font-medium">Estabilidad de la opinión basada en la desviación estándar del score.</p>
                            </div>

                            {/* POLARIZATION CARD */}
                            <div className={`p-6 rounded-3xl border ${polarization?.classification === 'polarized' ? 'bg-emerald-50 border-emerald-100' : polarization?.classification === 'competitive' ? 'bg-secondary-50 border-secondary-100' : 'bg-blue-50 border-blue-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <PieChart className={`w-4 h-4 ${polarization?.classification === 'polarized' ? 'text-emerald-500' : polarization?.classification === 'competitive' ? 'text-secondary-500' : 'text-slate-400'}`} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Índice de Polarización</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${polarization?.classification === 'polarized' ? 'bg-emerald-100 text-emerald-600' : polarization?.classification === 'competitive' ? 'bg-secondary-100 text-secondary-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {polarization?.classification === 'polarized' ? 'Polarizado' : polarization?.classification === 'competitive' ? 'Competitivo' : 'Consenso'}
                                    </span>
                                </div>
                                <div className="text-3xl font-black text-slate-900">{polarization?.polarization_index.toFixed(1)}%</div>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Brecha entre las dos opciones principales. Menos es más polarizado.</p>
                            </div>

                            {/* SEGMENT INFLUENCE CARD */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Users className="w-4 h-4 text-emerald-500" />
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Top Influencers ({daysBack}D)</h4>
                                </div>

                                <div className="space-y-4">
                                    {segmentInfluence.length > 0 ? (
                                        segmentInfluence.slice(0, 3).map((seg, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-900 leading-tight">
                                                        {seg.age_range} · {seg.gender}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium lowercase">
                                                        {seg.commune}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-xs font-black text-emerald-600">{seg.contribution_percent.toFixed(1)}%</div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Impacto</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Calculando influencia...</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-slate-400 mt-4 leading-relaxed italic">
                                    Representa el porcentaje de la variación total del score atribuible a este segmento demográfico específico.
                                </p>
                            </div>

                            {/* EARLY SIGNAL / MOMENTUM CARD */}
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-6">
                                    <Zap className="w-4 h-4 text-emerald-500" />
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Señal Temprana (Momentum 6H)</h4>
                                </div>

                                <div className="space-y-4">
                                    {earlySignals.length > 0 ? (
                                        earlySignals.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-slate-900 leading-tight">
                                                        {item.option_label}
                                                    </span>
                                                    <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${item.classification === 'emerging' ? 'text-emerald-500' :
                                                        item.classification === 'cooling' ? 'text-rose-500' : 'text-slate-400'
                                                        }`}>
                                                        {item.classification === 'emerging' ? 'Emergente ▲' :
                                                            item.classification === 'cooling' ? 'Enfriándose ▼' : 'Estable'
                                                        }
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xs font-black ${item.momentum_ratio > 1 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                                        {item.momentum_ratio.toFixed(2)}x
                                                    </div>
                                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ratio</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Analizando momentum...</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-slate-400 mt-4 leading-relaxed italic">
                                    Compara la actividad de las últimas 6 horas contra el promedio de los últimos 30 días (`score_actual` vs `promedio_histórico`).
                                </p>
                            </div>
                            {/* TEMPORAL COMPARISON CHART SECTION */}
                            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Evolución de Scores</h4>
                                    <div className="flex bg-white p-1 rounded-xl shadow-sm">
                                        {[7, 30, 90].map((d) => (
                                            <button
                                                key={d}
                                                onClick={() => {
                                                    setDaysBack(d);
                                                    if (selectedBattle) loadDepthData(selectedBattle, d);
                                                }}
                                                className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${daysBack === d
                                                    ? 'bg-emerald-600 text-white shadow-md'
                                                    : 'text-slate-400 hover:text-slate-600'
                                                    }`}
                                            >
                                                {d}D
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {temporalComparison.length > 0 ? (
                                    <div className="h-48 w-full mb-6">
                                        <Line
                                            data={{
                                                labels: [`D-${daysBack}`, 'Actual'], // Eje X simplificado
                                                datasets: temporalComparison.map((comp, idx) => ({
                                                    label: `Opción ${idx + 1}`, // Lo ideal sería el texto real, pero temporalComparison no trae option_title
                                                    data: [
                                                        comp.current_score - comp.variation, // Score anterior aproximado
                                                        comp.current_score
                                                    ],
                                                    borderColor: idx === 0 ? '#4f46e5' : '#10b981',
                                                    backgroundColor: idx === 0 ? '#4f46e5' : '#10b981',
                                                    tension: 0.1,
                                                    borderWidth: 3,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: '#fff'
                                                }))
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: { display: false },
                                                    tooltip: {
                                                        mode: 'index',
                                                        intersect: false,
                                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                        titleFont: { family: 'Inter', size: 11 },
                                                        bodyFont: { family: 'Inter', size: 12, weight: 'bold' },
                                                        padding: 10,
                                                        cornerRadius: 8
                                                    }
                                                },
                                                scales: {
                                                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 10, weight: 'bold' } } },
                                                    y: { grid: { color: '#f1f5f9' }, border: { dash: [4, 4] }, ticks: { font: { family: 'Inter', size: 10, weight: 'bold' } } }
                                                },
                                                interaction: {
                                                    mode: 'nearest',
                                                    axis: 'x',
                                                    intersect: false
                                                }
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <Clock className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                                        <p className="text-[10px] font-bold text-slate-400">Sin datos históricos suficientes para trazar.</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    {temporalComparison.map((comp, idx) => (
                                        <div key={comp.option_id} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary-600' : 'bg-emerald-500'}`}></div>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Opción {idx + 1}</span>
                                            </div>
                                            <div className="text-sm font-black text-slate-900 mb-1">{comp.current_score.toLocaleString()}</div>
                                            <div className={`text-[10px] font-black flex items-center gap-1 ${comp.variation >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {comp.variation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                {comp.variation_percent.toFixed(1)}% ({comp.variation > 0 ? '+' : ''}{comp.variation})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* DEPTH INSIGHTS */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest pl-2">Profundidad del Segmento</h4>
                                {depthInsights.length > 0 ? (
                                    depthInsights.map((insight, idx) => (
                                        <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-xs font-black text-slate-300 uppercase italic">Insight #{idx + 1}</span>
                                                <span className="text-[10px] font-bold text-primary-400 bg-primary-50 px-2 py-0.5 rounded uppercase">
                                                    {insight.total_responses} respuestas
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-slate-700 mb-6 leading-tight">
                                                {insight.question_id === 'general' ? 'Evaluación General de Calidad' : insight.question_id}
                                            </h4>
                                            <div className="flex items-end gap-3">
                                                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                                    {insight.average_score.toFixed(1)}
                                                </div>
                                                <div className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Promedio</div>
                                            </div>
                                            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary-500 rounded-full"
                                                    style={{ width: `${(insight.average_score / 10) * 100}% ` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                            <Activity className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-800 mb-2">Aún sin profundidad</h4>
                                        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                                            No hay suficientes respuestas analíticas capturadas para esta evaluación en el segmento seleccionado. Se requieren más señales para desbloquear la radiografía.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mt-12 p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] text-emerald-700 font-bold leading-relaxed">
                            <Database className="w-3 h-3 inline mr-1 mb-0.5" />
                            Estos datos provienen del motor de analíticas de profundidad. El score es el promedio de valoraciones (1-10) capturadas en los Insight Packs.
                        </p>
                    </div>
                </div>
            </div>
            
            <div
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={() => setSelectedBattle(null)}
            ></div>
        </>
    );
}
