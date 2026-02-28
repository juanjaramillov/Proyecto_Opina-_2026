import React from 'react';
import { motion } from 'framer-motion';
import { SegmentComparison } from '../services/profileService';

interface Props {
    data: SegmentComparison;
}

const ComparisonRow = ({ label, value, userScore }: { label: string, value: number, userScore: number }) => {
    if (!value || value === 0) return null;
    const diff = userScore - value;
    const isAbove = diff > 0.1;
    const isBelow = diff < -0.1;

    return (
        <div className="flex justify-between items-center text-[10px] py-1">
            <span className="text-muted font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono font-black text-ink">{value.toFixed(1)}</span>
                <span className={`flex items-center font-bold px-1 rounded ${isAbove ? 'text-emerald-500' : isBelow ? 'text-amber-500' : 'text-slate-300'
                    }`}>
                    {isAbove ? '↑' : isBelow ? '↓' : '='}
                    <span className="ml-0.5">{Math.abs(diff).toFixed(1)}</span>
                </span>
            </div>
        </div>
    );
};

const SegmentComparisonCard: React.FC<Props> = ({ data }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
        >
            {/* Coherence Badge */}
            <div className="absolute top-0 right-0 p-4">
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${data.coherence_level === 'Alta' ? 'bg-primary-50 text-primary-600 border-primary-100' :
                        data.coherence_level === 'Media' ? 'bg-slate-50 text-slate-500 border-slate-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                    Coherencia {data.coherence_level}
                </div>
            </div>

            <div className="mb-4">
                <h4 className="text-lg font-black text-ink group-hover:text-primary-600 transition-colors tracking-tight">
                    {data.entity_name}
                </h4>
                <div className="mt-2 inline-flex items-baseline gap-1">
                    <span className="text-2xl font-black text-ink">{data.user_score.toFixed(1)}</span>
                    <span className="text-[10px] text-muted font-bold uppercase tracking-widest">Tu Nota</span>
                </div>
            </div>

            <div className="space-y-1 divide-y divide-slate-50">
                <ComparisonRow label="vs Rango Etario" value={data.avg_age} userScore={data.user_score} />
                <ComparisonRow label="vs Tu Sexo" value={data.avg_gender} userScore={data.user_score} />
                <ComparisonRow label="vs Tu Comuna" value={data.avg_commune} userScore={data.user_score} />
                <ComparisonRow label="vs Global" value={data.avg_global} userScore={data.user_score} />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    Muestra de señales
                </div>
                <div className="text-[10px] font-black text-ink">
                    {data.signals_count} versus
                </div>
            </div>
        </motion.div>
    );
};

export default SegmentComparisonCard;
