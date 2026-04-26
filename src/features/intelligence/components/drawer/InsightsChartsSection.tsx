import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend as ChartLegend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartTitle,
    ChartTooltip,
    ChartLegend,
    Filler
);

import { Zap, PieChart, Users, Clock, TrendingUp, TrendingDown, Activity, Database, CheckCircle } from "lucide-react";
import { TrendingItem } from "../../../../types/trending";
import { DepthInsight, TemporalComparison, VolatilityData, PolarizationData, SegmentInfluence, EarlySignal, B2BBattleAnalytics, B2BEligibility } from "../../../signals/services/insightsService";

interface InsightsChartsSectionProps {
    selectedBattle: TrendingItem | null;
    aiSummary: string | null;
    isGeneratingAi: boolean;
    handleGenerateAiSummary: () => void;
    role: string | null;
    b2bEligibility?: B2BEligibility | null;
    b2bAnalytics?: B2BBattleAnalytics | null;
    volatility: VolatilityData | null;
    polarization: PolarizationData | null;
    segmentInfluence: SegmentInfluence[];
    earlySignals: EarlySignal[];
    temporalComparison: TemporalComparison[];
    daysBack: number;
    setDaysBack: (days: number) => void;
    loadDepthData: (item: TrendingItem, days?: number) => void;
    depthInsights: DepthInsight[];
}

export function InsightsChartsSection({
    selectedBattle,
    aiSummary,
    isGeneratingAi,
    handleGenerateAiSummary,
    role,
    b2bEligibility,
    b2bAnalytics,
    volatility,
    polarization,
    segmentInfluence,
    earlySignals,
    temporalComparison,
    daysBack,
    setDaysBack,
    loadDepthData,
    depthInsights
}: InsightsChartsSectionProps) {
    return (
        <div className="space-y-8">
            {/* MAGIC INSIGHTS (AI SUMMARY) */}
            <div className="bg-gradient-to-br from-brand-900 to-slate-900 p-6 rounded-3xl border border-brand-800 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="w-24 h-24 text-white" />
                </div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-brand/20 rounded-lg">
                            <Zap className="w-4 h-4 text-brand-300" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-300">Magic Insight B2B</span>
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
                        <div className="text-sm font-medium text-brand-200 animate-pulse italic">
                            El Analista IA está interpretando los datos de la evaluación...
                        </div>
                    ) : aiSummary ? (
                        <p className="text-sm font-medium text-white leading-relaxed">
                            {aiSummary}
                        </p>
                    ) : (
                        <p className="text-sm font-medium text-brand-200/60 italic">
                            No hay un resumen generado. Haz clic en "Generar IA" para obtener un análisis mágico.
                        </p>
                    )}
                </div>
            </div>

            {/* PREMIUM COMPARATIVE TABLE (B2B) */}
            {b2bAnalytics?.analytics_payload && b2bAnalytics.analytics_payload.length > 0 && b2bEligibility?.opinascore_context === 'versus' && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mt-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-brand" />
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Estructura Competitiva</h4>
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded-md">
                            Wilson Confidence Interval
                        </div>
                    </div>
                    <div className="space-y-4">
                        {b2bAnalytics.analytics_payload?.map((opt, idx) => (
                            <div key={idx} className={`p-4 rounded-2xl border ${opt.is_winner && !b2bAnalytics.analytics_payload[0]?.technical_tie_flag ? 'bg-accent-50/50 border-accent-100' : 'bg-slate-50/50 border-slate-100'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-slate-800 text-sm">Opción {idx + 1} <span className="text-[10px] font-mono text-slate-400 font-normal ml-1">({String(opt.option_id).substring(0,8)})</span></span>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-black text-brand">{Math.round((opt.normalized_score || opt.raw_win_rate || 0) * 1000)}</span>
                                        {opt.is_winner && !b2bAnalytics.analytics_payload[0]?.technical_tie_flag && (
                                            <CheckCircle className="w-3 h-3 text-accent ml-1" />
                                        )}
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2 overflow-hidden">
                                    <div className={`h-1.5 rounded-full ${opt.is_winner && !b2bAnalytics.analytics_payload[0]?.technical_tie_flag ? 'bg-accent' : 'bg-brand-400'}`} style={{ width: `${Math.max(0, Math.min(100, (opt.normalized_score || opt.raw_win_rate || 0) * 100))}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[9px] font-mono text-slate-400 font-bold mt-3 pt-2 border-t border-slate-200/50">
                                    <span>Límite Inferior: {((opt.lower_bound || 0) * 100).toFixed(1)}%</span>
                                    <span>Límite Superior: {((opt.upper_bound || 0) * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Las bandas (Lower/Upper) representan el intervalo de confianza de Wilson al 95%. Un <strong className="text-warning-600">empate técnico</strong> se declara cuando el límite inferior del líder se solapa matemáticamente con el límite superior del contendiente más cercano.
                        </p>
                    </div>
                </div>
            )}

            {/* VOLATILITY CARD WITH AREA CHART */}
            <div className={`p-6 rounded-3xl border ${volatility?.classification === 'volatile' ? 'bg-danger-50 border-danger-100' : volatility?.classification === 'moderate' ? 'bg-accent/10 border-accent-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${volatility?.classification === 'volatile' ? 'text-danger-500' : volatility?.classification === 'moderate' ? 'text-accent' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Índice de Volatilidad (30D)</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${volatility?.classification === 'volatile' ? 'bg-danger-100 text-danger-600' : volatility?.classification === 'moderate' ? 'bg-accent/20 text-accent' : 'bg-slate-100 text-slate-500'}`}>
                        {volatility?.classification === 'volatile' ? 'Volátil' : volatility?.classification === 'moderate' ? 'Moderado' : 'Estable'}
                    </span>
                </div>
                <div className="text-3xl font-black text-slate-900 mb-4">{(volatility?.volatility_index || 0).toFixed(1)}%</div>

                <div className="h-24 w-full">
                    <Line
                        key={`volatility-${selectedBattle?.id}`}
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
            <div className={`p-6 rounded-3xl border ${polarization?.classification === 'polarized' ? 'bg-accent/10 border-accent-100' : polarization?.classification === 'competitive' ? 'bg-accent-50 border-accent-100' : 'bg-brand-50 border-brand-100'}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <PieChart className={`w-4 h-4 ${polarization?.classification === 'polarized' ? 'text-accent' : polarization?.classification === 'competitive' ? 'text-accent-500' : 'text-slate-400'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Índice de Polarización</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${polarization?.classification === 'polarized' ? 'bg-accent/20 text-accent' : polarization?.classification === 'competitive' ? 'bg-accent-100 text-accent-600' : 'bg-slate-100 text-slate-500'}`}>
                        {polarization?.classification === 'polarized' ? 'Polarizado' : polarization?.classification === 'competitive' ? 'Competitivo' : 'Consenso'}
                    </span>
                </div>
                <div className="text-3xl font-black text-slate-900">{(polarization?.polarization_index || 0).toFixed(1)}%</div>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">Brecha entre las dos opciones principales. Menos es más polarizado.</p>
            </div>

            {/* SEGMENT INFLUENCE CARD */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Users className="w-4 h-4 text-accent" />
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
                                    <div className="text-xs font-black text-accent">{(seg.contribution_percent || 0).toFixed(1)}%</div>
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
                    <Zap className="w-4 h-4 text-accent" />
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
                                    <span className={`text-[9px] font-black uppercase tracking-tighter mt-1 ${item.classification === 'emerging' ? 'text-accent' :
                                        item.classification === 'cooling' ? 'text-danger-500' : 'text-slate-400'
                                        }`}>
                                        {item.classification === 'emerging' ? 'Emergente ▲' :
                                            item.classification === 'cooling' ? 'Enfriándose ▼' : 'Estable'
                                        }
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-black ${item.momentum_ratio > 1 ? 'text-accent' : 'text-slate-600'}`}>
                                        {(item.momentum_ratio || 0).toFixed(2)}x
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
                                    ? 'bg-accent text-white shadow-md'
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
                            key={`temporal-${selectedBattle?.id}`}
                            data={{
                                labels: [`D-${daysBack}`, 'Actual'], // Eje X simplificado
                                datasets: temporalComparison.map((comp, idx) => ({
                                    label: `Opción ${idx + 1}`, // Lo ideal sería el texto real, pero temporalComparison no trae option_title
                                    data: [
                                        comp.current_score - comp.variation, // Score anterior aproximado
                                        comp.current_score
                                    ],
                                    borderColor: idx === 0 ? '#2563EB' : '#10B981',
                                    backgroundColor: idx === 0 ? '#2563EB' : '#10B981',
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
                                <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-brand' : 'bg-accent'}`}></div>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Opción {idx + 1}</span>
                            </div>
                            <div className="text-sm font-black text-slate-900 mb-1">{comp.current_score.toLocaleString()}</div>
                            <div className={`text-[10px] font-black flex items-center gap-1 ${comp.variation >= 0 ? 'text-accent' : 'text-danger-500'}`}>
                                {comp.variation >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {(comp.variation_percent || 0).toFixed(1)}% ({comp.variation > 0 ? '+' : ''}{comp.variation})
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
                                <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded uppercase">
                                    {insight.total_responses} respuestas
                                </span>
                            </div>
                            <h4 className="font-bold text-slate-700 mb-6 leading-tight">
                                {insight.question_id === 'general' ? 'Evaluación General de Calidad' : insight.question_id}
                            </h4>
                            <div className="flex items-end gap-3">
                                <div className="text-4xl font-black text-slate-900 tracking-tighter">
                                    {(insight.average_score || 0).toFixed(1)}
                                </div>
                                <div className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Promedio</div>
                            </div>
                            <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-brand rounded-full"
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
    );
}
