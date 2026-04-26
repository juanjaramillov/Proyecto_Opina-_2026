import React from 'react';
import { FileText, Download, Target, AlertTriangle, CheckCircle, ShieldAlert, Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { B2BEligibility, B2BBattleAnalytics, IntegrityFlags } from "../../signals/services/insightsService";
import { TrendingItem } from "../../../types/trending";
import { generateB2BNarrative } from "../utils/b2bNarrativeEngine";

interface PremiumExportCardProps {
    item: TrendingItem;
    b2bEligibility: B2BEligibility | null;
    b2bAnalytics: B2BBattleAnalytics | null;
    integrityFlags: IntegrityFlags | null;
}

export const PremiumExportCard: React.FC<PremiumExportCardProps> = ({
    item,
    b2bEligibility,
    b2bAnalytics,
    integrityFlags
}) => {
    const narrativeBullets = generateB2BNarrative(b2bEligibility, b2bAnalytics, integrityFlags);
    
    // Status visual mapping
    const getStatusTheme = (status?: string) => {
        if (status === 'PUBLISHABLE') return 'bg-accent/10 text-accent border-accent-200';
        if (status === 'EXPLORATORY') return 'bg-warning-50 text-warning-700 border-warning-200';
        if (status === 'INTERNAL_ONLY') return 'bg-danger-50 text-danger-700 border-danger-200';
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const handleCopyJson = () => {
        const payload = {
            item_id: item.id,
            title: item.title,
            timestamp: new Date().toISOString(),
            metrics: {
                opinascore: b2bEligibility?.opinascore_value,
                n_eff: b2bEligibility?.n_eff,
                integrity: b2bEligibility?.integrity_score
            },
            eligibility: b2bEligibility?.eligibility_status,
            narrative: narrativeBullets.map(b => b.text),
            analytics_payload: b2bAnalytics?.analytics_payload
        };
        navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        toast.success('B2B Payload JSON copiado al portapapeles');
    };

    const handlePrint = () => {
        window.print();
    };

    if (!b2bEligibility) return null;

    return (
        <div id="premium-export-card" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col print:shadow-none print:border-none print:m-0 print:p-0">
            
            {/* Header / Meta */}
            <div className="bg-slate-900 p-6 flex items-center justify-between text-white print:bg-white print:text-black print:border-b print:border-slate-300">
                <div className="flex items-center gap-3">
                    <Box className="w-6 h-6 text-brand-400 print:text-slate-800" />
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-100 print:text-black">Opina+ Premium Insight</h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 print:text-slate-600">ID: {item.id} | Context: {b2bEligibility.opinascore_context}</p>
                    </div>
                </div>
                
                {/* Herramientas de Exportación (Ocultas en print) */}
                <div className="flex items-center gap-2 print:hidden">
                    <button onClick={handleCopyJson} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white" title="Copiar Raw JSON">
                        <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={handlePrint} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white" title="Exportar a PDF (Print)">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
                
                {/* Print only timestamp */}
                <div className="hidden print:block text-xs font-mono text-slate-500">
                    Generado: {new Date().toLocaleString('es-ES')}
                </div>
            </div>

            <div className="p-6">
                <h2 className="text-2xl font-black text-slate-900 mb-6">{item.title}</h2>
                
                {/* Main Metrics Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">OpinaScore Final</div>
                        <div className="text-3xl font-black text-brand">{Math.round(b2bEligibility.opinascore_value || 0)}</div>
                    </div>
                    <div className={`p-4 rounded-2xl border ${getStatusTheme(b2bEligibility.eligibility_status)}`}>
                        <div className="text-[10px] uppercase tracking-widest font-bold mb-1 opacity-80">Elegibilidad B2B</div>
                        <div className="text-sm font-black tracking-tight">{b2bEligibility.eligibility_status}</div>
                        <div className="text-[9px] font-medium mt-1 leading-tight opacity-90 truncate" title={b2bEligibility.eligibility_reasons?.join(', ')}>
                            {b2bEligibility.eligibility_reasons?.join(', ') || 'Dataset limpio'}
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-1">Confianza Muestral</div>
                        <div className="text-xl font-black text-slate-900">N_EFF: {Math.round(b2bEligibility.n_eff || 0)}</div>
                        <div className="text-[9px] font-mono text-slate-400 mt-1">Integridad: {b2bEligibility.integrity_score}%</div>
                    </div>
                </div>

                {/* Síntesis Narrativa Ejecutiva */}
                <div className="mb-8">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4 text-brand" />
                        Síntesis Ejecutiva Automática
                    </h4>
                    <div className="space-y-3">
                        {narrativeBullets.map((bullet, idx) => (
                            <div key={idx} className="flex gap-3 items-start bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                {bullet.type === 'positive' && <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />}
                                {bullet.type === 'critical' && <ShieldAlert className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />}
                                {bullet.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />}
                                {bullet.type === 'neutral' && <Box className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />}
                                <p className="text-sm font-medium text-slate-700 leading-relaxed">{bullet.text}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Compact Competitive Structure (If Versus) */}
                {b2bAnalytics?.analytics_payload && b2bAnalytics.analytics_payload.length > 0 && b2bEligibility.opinascore_context === 'versus' && (
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 border-b border-slate-200 pb-2">
                            Estructura Competitiva (Wilson Inferior/Superior)
                        </h4>
                        <div className="space-y-2">
                            {b2bAnalytics.analytics_payload?.map((opt, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                                    <span className="font-bold text-slate-700">Opción {idx + 1} <span className="font-normal text-[10px] text-slate-400">({String(opt.option_id).substring(0,8)})</span></span>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                                            <div className={`h-full ${opt.is_winner && !b2bAnalytics.analytics_payload[0]?.technical_tie_flag ? 'bg-accent' : 'bg-brand-400'}`} style={{ width: `${Math.max(0, Math.min(100, (opt.normalized_score || opt.raw_win_rate || 0) * 100))}%` }}></div>
                                        </div>
                                        <span className="font-mono font-bold text-slate-900 text-right w-12">{((opt.normalized_score || opt.raw_win_rate || 0) * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {b2bAnalytics.analytics_payload[0]?.technical_tie_flag && (
                            <div className="mt-3 text-[10px] font-bold text-warning-600 bg-warning-50 px-3 py-2 rounded-lg border border-warning-100 inline-block">
                                AVISO: Existe superposición de límites de confianza (Empate Técnico Activo).
                            </div>
                        )}
                    </div>
                )}
                
                {/* Print Footer */}
                <div className="hidden print:block mt-12 pt-6 border-t border-slate-200 text-center">
                    <p className="text-[10px] text-slate-400 font-medium">Este reporte ha sido generado confidencialmente por Opina+ System. No distribuir sin autorización.</p>
                </div>
            </div>
        </div>
    );
};
