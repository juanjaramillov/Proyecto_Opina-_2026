import React from 'react';
import { motion } from 'framer-motion';

interface SummaryCardProps {
    kpiTitle: string;
    kpiValue: string;
    conclusion: string;
    trend: 'up' | 'down' | 'neutral';
    totalParticipants?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ kpiTitle, kpiValue, conclusion, trend, totalParticipants }) => {
    const trendIcon = trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat';
    const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';

    return (
        <div className="w-full max-w-sm text-left text-white px-2">
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                className="flex justify-between items-center mb-2"
            >
                <div className="text-sm font-bold text-white/60 uppercase tracking-widest">
                    Conclusión Clave
                </div>
                {totalParticipants && (
                    <div className="text-xs font-bold text-white/40 flex items-center gap-1 bg-white/5 px-2 py-1 rounded-full">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        {totalParticipants.toLocaleString()}
                    </div>
                )}
            </motion.div>

            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-6xl font-black tracking-tighter mb-4 flex items-center gap-4"
            >
                {kpiValue}
                <div className={`flex flex-col items-center justify-center h-12 w-12 rounded-full ${trend === 'up' ? 'bg-emerald-500/20' : trend === 'down' ? 'bg-rose-500/20' : 'bg-slate-500/20'}`}>
                    <span className={`material-symbols-outlined text-3xl ${trendColor}`}>{trendIcon}</span>
                </div>
            </motion.div>

            <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-6 text-white/90"
            >
                {kpiTitle}
            </motion.h3>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
            >
                <p className="text-lg leading-relaxed font-medium">
                    “{conclusion}”
                </p>
            </motion.div>

            <div className="mt-8 flex gap-3">
                <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">#Economía</div>
                <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">#Confianza</div>
            </div>
        </div>
    );
};

export default SummaryCard;
