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
        <div className="flex justify-between items-center text-[10px] py-2">
            <span className="text-text-secondary font-medium">{label}</span>
            <div className="flex items-center gap-2">
                <span className="font-mono font-black text-ink">{value.toFixed(1)}</span>
                <span className={`flex items-center font-bold px-1.5 py-0.5 rounded text-[9px] border ${isAbove ? 'text-secondary bg-secondary/10 border-secondary/20' : isBelow ? 'text-primary bg-primary/10 border-primary/20' : 'text-text-muted bg-surface2 border-stroke'
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
            className="card p-5 group overflow-hidden relative shadow-sm hover:border-primary/20 transition-all border border-stroke bg-white"
        >
            {/* Coherence Badge */}
            <div className="absolute top-0 right-0 p-4">
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${data.coherence_level === 'Alta' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                    data.coherence_level === 'Media' ? 'bg-surface2 text-text-secondary border-stroke' :
                        'bg-danger/10 text-danger border-danger/20'
                    }`}>
                    Coherencia {data.coherence_level}
                </div>
            </div>

            <div className="mb-4 pt-2">
                <h4 className="text-lg font-black text-ink group-hover:text-primary transition-colors tracking-tight">
                    {data.entity_name}
                </h4>
                <div className="mt-2 inline-flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-ink">{data.user_score.toFixed(1)}</span>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Tu Nota</span>
                </div>
            </div>

            <div className="space-y-1 divide-y divide-stroke/60 mt-4 border-t border-stroke/80 pt-2">
                <ComparisonRow label="vs Rango Etario" value={data.avg_age} userScore={data.user_score} />
                <ComparisonRow label="vs Tu Sexo" value={data.avg_gender} userScore={data.user_score} />
                <ComparisonRow label="vs Tu Comuna" value={data.avg_commune} userScore={data.user_score} />
                <ComparisonRow label="vs Global" value={data.avg_global} userScore={data.user_score} />
            </div>

            <div className="mt-4 pt-4 border-t border-stroke flex justify-between items-center">
                <div className="text-[9px] font-black text-text-muted uppercase tracking-widest">
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
