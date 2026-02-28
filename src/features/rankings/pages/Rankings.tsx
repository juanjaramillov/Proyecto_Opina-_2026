import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rankingService, RankSnapshot } from '../services/rankingService';
import { adminConfigService } from '../../admin/services/adminConfigService';
import { supabase } from '../../../supabase/client';
import { useAuth } from '../../auth/hooks/useAuth';

import { SkeletonRankingTopCard, SkeletonRankingRow } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { logger } from '../../../lib/logger';
import PageHeader from "../../../components/ui/PageHeader";
import { useToast } from "../../../components/ui/useToast";

interface Category {
    id: string;
    slug: string;
    name: string;
}

type ModuleType = 'versus' | 'progressive';

const Rankings: React.FC = () => {
    const initialParams = new URLSearchParams(window.location.search);
    const initialCategory = initialParams.get("category") || "streaming";
    const initialModule = (initialParams.get("module") === "progressive" ? "progressive" : "versus") as ModuleType;
    const initialSegment = initialParams.get("segment") || "global";

    const [categories, setCategories] = useState<Category[]>([]);
    const [activeCategorySlug, setActiveCategorySlug] = useState<string>(initialCategory);
    const [moduleType, setModuleType] = useState<ModuleType>(initialModule);
    const [ranking, setRanking] = useState<RankSnapshot[]>([]);
    const [loading, setLoading] = useState(true);

    const [analyticsMode, setAnalyticsMode] = useState<'all' | 'clean' | null>(null);

    const { profile } = useAuth();
    const isAdmin = (profile as any)?.role === 'admin';

    const [segmentId, setSegmentId] = useState<string>(initialSegment);
    const [openFilters, setOpenFilters] = useState(false); // filters UI

    const { showToast } = useToast();

    const SEGMENTS = [
        { id: "global", label: "Global" },
        { id: "gender:female", label: "Mujeres" },
        { id: "gender:male", label: "Hombres" },
        { id: "region:Metropolitana", label: "RM" },
        { id: "gender:male|region:Metropolitana", label: "Hombres RM" }
    ];
    const segmentLabel = SEGMENTS.find(s => s.id === segmentId)?.label || segmentId;

    // 1. Fetch Categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('id, slug, name');
            if (data) {
                setCategories(data as Category[]);
                setActiveCategorySlug(prev => {
                    const exists = (data as Category[]).some(c => c.slug === prev);
                    if (!exists) {
                        const streaming = (data as Category[]).find(c => c.slug === 'streaming');
                        return streaming ? streaming.slug : (data as Category[])[0].slug;
                    }
                    return prev;
                });
            }
        };
        fetchCategories();
    }, []);

    // 2. Load Ranking when category, moduleType or segment changes
    useEffect(() => {
        const loadRanking = async () => {
            setLoading(true);
            try {
                const response = await rankingService.getLatestRankings(moduleType, segmentId, 50, activeCategorySlug);
                setRanking(response.rows);

            } catch (err) {
                logger.error('Failed to load ranking:', err);
            } finally {
                setLoading(false);
            }
        };
        loadRanking();
    }, [activeCategorySlug, moduleType, segmentId]);

    // 3. Load Analytics Mode if admin
    useEffect(() => {
        if (!isAdmin) return;
        let mounted = true;
        const loadMode = async () => {
            try {
                const mode = await adminConfigService.getAnalyticsMode();
                if (mounted) setAnalyticsMode(mode);
            } catch (err: any) {
                // Fallo silencioso
            }
        };
        loadMode();
        return () => { mounted = false; };
    }, [isAdmin]);

    // 4. Sync URL with state
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        params.set("category", activeCategorySlug);
        params.set("module", moduleType);
        params.set("segment", segmentId);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);
    }, [activeCategorySlug, moduleType, segmentId]);

    const lastSnapshotAt = React.useMemo(() => {
        if (!ranking?.length) return null;
        let max = 0;

        for (const r of ranking as any[]) {
            const raw = r?.snapshot_at ?? r?.snapshotAt ?? r?.created_at ?? null;
            if (!raw) continue;
            const t = new Date(raw).getTime();
            if (!Number.isFinite(t)) continue;
            if (t > max) max = t;
        }

        return max ? new Date(max).toISOString() : null;
    }, [ranking]);

    const lastSnapshotLabel = React.useMemo(() => {
        if (!lastSnapshotAt) return "—";
        return new Date(lastSnapshotAt).toLocaleString("es-CL", {
            hour12: false,
            dateStyle: "short",
            timeStyle: "short",
        });
    }, [lastSnapshotAt]);

    const activeCategory = categories.find(c => c.slug === activeCategorySlug);

    return (
        <div className="container-ws section-y space-y-8 pb-32">

            <PageHeader
                eyebrow={
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[11px] font-black uppercase tracking-widest text-primary-600">
                        <span className="material-symbols-outlined text-[16px]">military_tech</span>
                        Snapshot Opina+ · Ponderado por relevancia
                    </div>
                }
                title={
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-ink leading-tight">
                        Ranking de{" "}
                        {activeCategory ? (
                            <span className="text-primary-600 capitalize">{activeCategory.name}</span>
                        ) : (
                            <span className="inline-block h-8 w-44 bg-slate-200 rounded-xl animate-pulse align-middle" />
                        )}
                    </h1>
                }
                subtitle={
                    <div>
                        <p className="text-muted font-medium mt-1 max-w-xl">
                            Análisis dinámico basado en señales de calidad, preferencia y volumen.
                        </p>
                        <div className="mt-2 text-[11px] font-bold text-muted flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            Actualizado cada 3 horas
                            <span className="opacity-60">·</span>
                            Últ. snapshot: {lastSnapshotLabel}
                        </div>
                    </div>
                }
                meta={
                    <div className="flex flex-col gap-2">


                        {isAdmin && analyticsMode && (
                            <div className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded border text-[10px] font-black uppercase tracking-wider ${analyticsMode === "clean" ? "bg-primary-50 border-primary-200 text-primary-700" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                                <span className="material-symbols-outlined text-[14px]">
                                    {analyticsMode === "clean" ? "filter_alt" : "filter_alt_off"}
                                </span>
                                <span>Clean {analyticsMode === "clean" ? "ON" : "OFF"}</span>
                            </div>
                        )}
                    </div>
                }
                actions={
                    <button
                        onClick={async () => {
                            const baseUrl = window.location.origin;
                            const shareUrl = `${baseUrl}/rankings?category=${encodeURIComponent(activeCategorySlug)}&module=${encodeURIComponent(moduleType)}&segment=${encodeURIComponent(segmentId)}`;
                            try {
                                await navigator.clipboard.writeText(shareUrl);
                                showToast("Link copiado", "success");
                            } catch {
                                const el = document.createElement("textarea");
                                el.value = shareUrl;
                                document.body.appendChild(el);
                                el.select();
                                document.execCommand("copy");
                                document.body.removeChild(el);
                                showToast("Link copiado", "success");
                            }
                        }}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-ink text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary-100"
                    >
                        <span className="material-symbols-outlined text-[16px]">share</span>
                        Compartir
                    </button>
                }
            />

            {/* CONTROL MODULE & TABS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* CATEGORY TABS */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none max-w-full">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategorySlug(cat.slug)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${activeCategorySlug === cat.slug
                                ? 'bg-primary-600 border-primary-600 text-white shadow-lg'
                                : 'bg-white border-slate-100 text-muted hover:border-primary-200'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* MODULE TOGGLE */}
                <div className="flex bg-slate-200/50 p-1 rounded-xl shrink-0">
                    <button
                        onClick={() => setModuleType('versus')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${moduleType === 'versus' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Versus
                    </button>
                    <button
                        onClick={() => setModuleType('progressive')}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${moduleType === 'progressive' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Progresivo
                    </button>
                </div>
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
                        <span className="bg-primary-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                            {segmentLabel}
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
                                        {SEGMENTS.map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSegmentId(s.id)}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 capitalize ${segmentId === s.id ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-slate-100 text-muted'
                                                    }`}
                                            >
                                                {s.label}
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <SkeletonRankingTopCard />
                            <SkeletonRankingTopCard />
                            <SkeletonRankingTopCard />
                        </div>
                        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                            <SkeletonRankingRow />
                            <SkeletonRankingRow />
                            <SkeletonRankingRow />
                            <SkeletonRankingRow />
                            <SkeletonRankingRow />
                        </div>
                    </div>
                ) : ranking.length === 0 ? (
                    <EmptyState
                        title="Aún no hay rankings"
                        description="Cuando existan más señales, aparecerán aquí."
                        icon="query_stats"
                    />
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
                                        ? 'bg-ink text-white border-primary-500 shadow-2xl scale-105 z-10'
                                        : 'bg-white border-slate-100 text-ink shadow-xl'
                                        }`}
                                >
                                    <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xl font-black text-primary-600 border-4 border-primary-50">
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
                                        <span className="w-6 text-sm font-black text-slate-300 group-hover:text-primary-600 transition-colors">
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
    );
};

export default Rankings;
