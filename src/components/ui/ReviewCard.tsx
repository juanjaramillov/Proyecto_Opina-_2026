import React from 'react';
import { motion } from 'framer-motion';

interface ReviewCardProps {
    id: string;
    userId: string;
    rating: number;
    date: string; // e.g., "Hace 2 días"
    text: string;
    helpfulCount: number;
    delay?: number;
    verifiedPurchase?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
    id,
    userId,
    rating,
    date,
    text,
    helpfulCount,
    delay = 0,
    verifiedPurchase = true,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
                        {userId.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="text-sm font-bold text-slate-900">Usuario Verificado</div>
                            {verifiedPurchase && (
                                <span className="material-symbols-outlined text-emerald-500 text-[16px]">verified</span>
                            )}
                        </div>
                        <div className="text-xs font-medium text-slate-400">{date} • Compra verificada</div>
                    </div>
                </div>
                <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, stars) => (
                        <span key={stars} className="material-symbols-outlined text-[18px]">
                            {stars < rating ? 'star' : 'star_border'}
                        </span>
                    ))}
                </div>
            </div>

            <p className="text-slate-700 leading-relaxed text-sm">
                {text}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                        Útil ({helpfulCount})
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">flag</span>
                        Reportar
                    </button>
                </div>
                <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    ID: {id}
                </div>
            </div>
        </motion.div>
    );
};
