import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rankingService, RankSnapshot } from '../services/rankingService';
import { supabase } from '../../../supabase/client';
import { SkeletonRankingTopCard } from '../../../components/ui/Skeleton';
import { logger } from '../../../lib/logger';

interface Category {
    id: string;
    slug: string;
    name: string;
}

const Rankings: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string>('streaming');
    const [ranking, setRanking] = useState<RankSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatedAt, setUpdatedAt] = useState('');

    const [segmentId, setSegmentId] = useState<string>('global');
    const [openFilters, setOpenFilters] = useState(false);

    // 1. Fetch Categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('id, slug, name');
            if (data) {
                setCategories(data as Category[]);
                if (data.length > 0) {
                    const streaming = (data as Category[]).find(c => c.slug === 'streaming');
                    setActiveCategorySlug(streaming ? streaming.slug : data[0].slug);
                }
            }
        };
        fetchCategories();
    }, []);

    // 2. Load Ranking when category or segment changes
    useEffect(() => {
        const loadRanking = async () => {
            setLoading(true);
            try {
                const data = await rankingService.getLatestRankings(activeCategorySlug, segmentId);
                setRanking(data);
                if (data.length > 0) {
                    setUpdatedAt(data[0].snapshot_date);
                }
            } catch (err) {
                logger.error('Failed to load ranking:', err);
            } finally {
                setLoading(false);
            }
        };
        loadRanking();
    }, [activeCategorySlug, segmentId]);

    const activeCategory = categories.find(c => c.slug === activeCategorySlug);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans text-ink">
            <div className="max-w-4xl mx-auto space-y-8 pb-32">

                {/* HEADER */}
                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-black uppercase tracking-widest text-indigo-600">
                        <span className="material-symbols-outlined text-[16px]">military_tech</span>
                        Snapshot Opina+ · Ponderado por relevancia
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-ink leading-tight">
                                Ranking de <span className="text-indigo-600 capitalize">{activeCategory?.name || 'Cargando...'}</span>
                            </h1>
                            <p className="text-muted font-medium mt-2 max-w-xl">
                                Análisis dinámico basado en señales de calidad, preferencia y volumen.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-wider text-muted">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {updatedAt ? `Actualizado: ${new Date(updatedAt).toLocaleDateString()}` : '--:--'}
                            </div>
                            <button
                                onClick={() => {
                                    const baseUrl = window.location.origin;
                                    const shareUrl = `${baseUrl}/rankings/${activeCategorySlug}?segment=${segmentId}`;
                                    navigator.clipboard.writeText(shareUrl);
                                    alert('Link de ranking copiado');
                                }}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-ink text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                            >
                                <span className="material-symbols-outlined text-[16px]">share</span>
                                Compartir
                            </button>
                        </div>
                    </div>
                </header>

                {/* CATEGORY TABS */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategorySlug(cat.slug)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${activeCategorySlug === cat.slug
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                : 'bg-white border-slate-100 text-muted hover:border-indigo-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* SEGMENT FILTERS */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setOpenFilters(!openFilters)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">tune</span>
                            <span className="text-sm font-bold text-ink">Filtrar por Segmento</span>
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                {segmentId}
                            </span>
                        </div>
                        <span className={`material-symbols-outlined transition-transform ${openFilters ? 'rotate-180' : ''}`}>
                            expand_more
                        </span>
                    </button>

                    <AnimatePresence>
                        {openFilters && (
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                className="px-6 pb-6 border-t border-slate-50"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Segmentos Principales</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['global', 'female', 'male', 'young', 'adult'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSegmentId(s)}
                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 capitalize ${segmentId === s ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-muted'
                                                        }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* MAIN RANKING CONTENT */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="space-y-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <SkeletonRankingTopCard />
                                <SkeletonRankingTopCard />
                                <SkeletonRankingTopCard />
                            </div>
                        </div>
                    ) : ranking.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">query_stats</span>
                            <h3 className="text-lg font-black text-ink">Sin datos para este segmento</h3>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* TOP 3 DESTACADO */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                {ranking.slice(0, 3).map((item, idx) => (
                                    <motion.div
                                        key={item.entity_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`relative p-8 rounded-[40px] border transition-all ${idx === 0
                                            ? 'bg-ink text-white border-indigo-500 shadow-2xl scale-105 z-10'
                                            : 'bg-white border-slate-100 text-ink shadow-xl'
                                            }`}
                                    >
                                        <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xl font-black text-indigo-600 border-4 border-indigo-50">
                                            {idx + 1}
                                        </div>

                                        <div className="flex flex-col items-center text-center gap-4">
                                            <div className={`w-20 h-20 rounded-2xl p-4 flex items-center justify-center bg-white ${idx !== 0 ? 'shadow-sm border border-slate-50' : ''}`}>
                                                <img
                                                    src={item.entity?.image_url || '/images/defaults/entity.png'}
                                                    alt={item.entity?.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-extrabold text-lg leading-tight">{item.entity?.name}</h3>
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`text-[10px] font-black border rounded px-1.5 ${item.trend === 'up' ? 'text-emerald-500 border-emerald-100 bg-emerald-50' :
                                                        item.trend === 'down' ? 'text-rose-500 border-rose-100 bg-rose-50' :
                                                            'text-slate-400 border-slate-100 bg-slate-50'
                                                        }`}>
                                                        {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                                                    </span>
                                                    <span className="text-xs font-black opacity-60">Score: {item.composite_index.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* LISTA COMPLETA */}
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                                {ranking.slice(3).map((item, idx) => (
                                    <div key={item.entity_id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-6">
                                            <span className="w-6 text-sm font-black text-slate-300 group-hover:text-indigo-600 transition-colors">
                                                {idx + 4}
                                            </span>
                                            <div className="w-10 h-10 rounded-lg bg-slate-50 p-2 border border-slate-100 overflow-hidden">
                                                <img src={item.entity?.image_url || '/images/defaults/entity.png'} alt={item.entity?.name} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="font-bold text-slate-700">{item.entity?.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-black text-muted">{(item.composite_index).toFixed(1)}</span>
                                            <span className={`flex items-center gap-1 text-[10px] font-black border rounded px-2 py-0.5 ${item.trend === 'up' ? 'text-emerald-500 border-emerald-100' :
                                                item.trend === 'down' ? 'text-rose-500 border-rose-100' :
                                                    'text-slate-400 border-slate-100'
                                                }`}>
                                                {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rankings;
