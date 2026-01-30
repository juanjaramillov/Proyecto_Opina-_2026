import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Chip from '../../../components/ui/Chip';

interface InsightCardProps {
    title: string;
    dataValue: string;
    description: string;
    source: string;
    chart?: React.ReactNode;
    hasParticipated?: boolean;
    totalParticipants?: number;
    trend?: 'up' | 'down' | 'split' | 'stable';
    delta24h?: number;
}

const InsightCard: React.FC<InsightCardProps> = ({ title, dataValue, description, source, chart, hasParticipated = false, totalParticipants, trend, delta24h }) => {
    return (
        <div className="w-full text-center text-slate-900 relative">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
                className="mb-2 flex justify-center gap-2"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-sm">insights</span>
                    Insight
                </div>
                {/* PILLAR 4 & 5: reusable Chip */}
                {trend && (
                    <Chip
                        label={
                            trend === 'up' ? 'Subiendo' :
                                trend === 'down' ? 'Bajando' :
                                    trend === 'split' ? 'Dividido' : 'Estable'
                        }
                        variant={
                            trend === 'up' ? 'status-up' :
                                trend === 'down' ? 'status-down' :
                                    trend === 'split' ? 'status-split' : 'status-stable'
                        }
                        size="sm"
                    />
                )}
                {delta24h !== undefined && (
                    <span className={`text-[10px] font-bold self-center ${delta24h >= 0 ? 'text-slate-400' : 'text-rose-500'}`}>
                        ({delta24h > 0 ? '+' : ''}{delta24h}%)
                    </span>
                )}
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
                className="text-3xl font-black tracking-tight mb-6 leading-tight"
            >
                {title}
            </motion.h2>

            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
                className="my-8"
            >
                <div className="text-8xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-slate-900 to-slate-600 drop-shadow-sm">
                    {dataValue}
                </div>
            </motion.div>

            {chart && (
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
                    className="my-6 h-32 w-full bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center"
                >
                    {chart}
                </motion.div>
            )}

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-medium text-slate-600 leading-relaxed max-w-sm mx-auto mb-8"
            >
                {description}
            </motion.p>

            {/* Participation CTA */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
                className="mb-8"
            >
                {hasParticipated ? (
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
                        <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                        <span className="text-sm font-bold text-emerald-700">Ya diste tu señal</span>
                    </div>
                ) : (
                    <div className="w-full max-w-xs mx-auto">
                        <Link
                            to="/surveys"
                            className="group relative inline-flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold tracking-tight shadow-xl shadow-emerald-900/20 hover:scale-105 transition-transform"
                        >
                            <span className="material-symbols-outlined">how_to_vote</span>
                            Dar mi opinión sobre esto
                        </Link>
                        <div className="mt-2 text-xs text-slate-400">Tu voz ayuda a cambiar este número.</div>
                    </div>
                )}
            </motion.div>


            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3, ease: "easeOut" }}
                className="flex flex-col gap-1 text-xs font-medium text-slate-400"
            >
                {totalParticipants && (
                    <div className="flex items-center justify-center gap-1 text-slate-500">
                        <span className="material-symbols-outlined text-sm">groups</span>
                        {totalParticipants.toLocaleString()} participantes
                    </div>
                )}
                <div>Fuente: {source}</div>
            </motion.div>

            {/* Actions */}
            <div className="absolute right-0 bottom-24 flex flex-col gap-6 items-center">
                <button className="group flex flex-col items-center gap-1">
                    <div className="p-3 rounded-full bg-white shadow-sm border border-slate-200 group-hover:bg-rose-50 group-hover:border-rose-200 transition-all">
                        <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-rose-500 transition-colors">favorite</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">2.4k</span>
                </button>

                <button className="group flex flex-col items-center gap-1">
                    <div className="p-3 rounded-full bg-white shadow-sm border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-all">
                        <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-indigo-500 transition-colors">share</span>
                    </div>
                    <span className="text-xs font-bold text-slate-500">Share</span>
                </button>
            </div>
        </div>
    );
};

export default InsightCard;
