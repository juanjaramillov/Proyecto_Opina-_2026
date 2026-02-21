import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { rankingService, RankingItem, RankingFilter } from '../services/rankingService';
import { MASTER_CLINICS } from '../../signals/config/clinics';
import { supabase } from '../../../supabase/client';
import { SkeletonRankingTopCard, SkeletonRankingRow } from '../../../components/ui/Skeleton';

interface Attribute {
    id: string;
    slug: string;
    name: string;
}

const Rankings: React.FC = () => {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [activeAttrId, setActiveAttrId] = useState<string | null>(null);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [totalSignals, setTotalSignals] = useState(0);
    const [updatedAt, setUpdatedAt] = useState('');
    const [loading, setLoading] = useState(true);
    const [thresholdMet, setThresholdMet] = useState(true);

    const [filters, setFilters] = useState<RankingFilter>({});
    const [openFilters, setOpenFilters] = useState(false);

    // 1. Cargar Atributos al iniciar
    useEffect(() => {
        const fetchAttrs = async () => {
            const { data } = await (supabase as any).from('attributes').select('id, slug, name');
            if (data) {
                setAttributes(data as Attribute[]);
                if (data.length > 0) setActiveAttrId((data[0] as any).id);
            }
        };
        fetchAttrs();
    }, []);

    // 2. Cargar Ranking cuando cambie el atributo o filtros
    useEffect(() => {
        const loadRanking = async () => {
            if (!activeAttrId) return;
            setLoading(true);
            const data = await rankingService.getRanking(activeAttrId, filters);
            setRanking(data.ranking);
            setTotalSignals(data.totalSignals);
            setUpdatedAt(data.updatedAt);
            setThresholdMet(data.thresholdMet);
            setLoading(false);
        };
        loadRanking();
    }, [activeAttrId, filters]);

    const activeAttr = attributes.find(a => a.id === activeAttrId);

    const toggleFilter = (key: keyof RankingFilter, value: any) => {
        setFilters(prev => {
            const next = { ...prev };
            if (next[key] === value) delete next[key];
            else next[key] = value;

            // Límite de 3 filtros
            if (Object.keys(next).length > 3) return prev;
            return next;
        });
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8 pb-32">

                {/* HEADER */}
                <header className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-black uppercase tracking-widest text-indigo-600">
                        <span className="material-symbols-outlined text-[16px]">military_tech</span>
                        Snapshot B2C · Actualizado cada 3h
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                                Ranking de <span className="text-indigo-600">Clínicas</span>
                            </h1>
                            <p className="text-slate-500 font-medium mt-2 max-w-xl">
                                Análisis dinámico de 30 días con ponderación por antigüedad y verificación de perfiles.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm text-[10px] font-black uppercase tracking-wider text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {updatedAt ? `Hoy · ${new Date(updatedAt).getHours()}:00` : '--:--'}
                            </div>
                            <button
                                onClick={() => {
                                    const attr = attributes.find(a => a.id === activeAttrId);
                                    if (!attr) return;
                                    const baseUrl = window.location.origin;
                                    const hash = rankingService.generateSegmentHash(attr.id, filters);
                                    const shareUrl = `${baseUrl}/clinicas-santiago/${attr.slug}?segment=${encodeURIComponent(hash)}`;
                                    navigator.clipboard.writeText(shareUrl);
                                    alert('Link público del ranking copiado al portapapeles');
                                }}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100"
                            >
                                <span className="material-symbols-outlined text-[16px]">share</span>
                                Compartir
                            </button>
                        </div>
                    </div>
                </header>

                {/* ATTRIBUTE TABS */}
                <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                    {attributes.map(attr => (
                        <button
                            key={attr.id}
                            onClick={() => setActiveAttrId(attr.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border ${activeAttrId === attr.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg'
                                : 'bg-white border-slate-100 text-slate-500 hover:border-indigo-200'
                                }`}
                        >
                            {attr.name}
                        </button>
                    ))}
                </div>

                {/* FILTERS PANEL */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setOpenFilters(!openFilters)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-400">tune</span>
                            <span className="text-sm font-bold text-slate-700">Explorar por Segmento</span>
                            {Object.keys(filters).length > 0 && (
                                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {Object.keys(filters).length} activos
                                </span>
                            )}
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
                                className="px-6 pb-6 border-t border-slate-50 space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    {/* Género */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Género</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['female', 'male'].map(g => (
                                                <button
                                                    key={g}
                                                    onClick={() => toggleFilter('gender', g)}
                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${filters.gender === g ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-500'
                                                        }`}
                                                >
                                                    {g === 'female' ? 'Mujeres' : 'Hombres'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Edad */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rango Etario</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['18–29', '30–45', '46–60', '60+'].map(a => (
                                                <button
                                                    key={a}
                                                    onClick={() => toggleFilter('age_bracket', a)}
                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${filters.age_bracket === a ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-500'
                                                        }`}
                                                >
                                                    {a}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Salud */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Previsión</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['isapre', 'fonasa'].map(h => (
                                                <button
                                                    key={h}
                                                    onClick={() => toggleFilter('health_system', h)}
                                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${filters.health_system === h ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-500'
                                                        }`}
                                                >
                                                    {h.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Atención */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atención Reciente</p>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => toggleFilter('attention_12m', true)}
                                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-95 ${filters.attention_12m === true ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-500'
                                                    }`}
                                            >
                                                &lt; 12 Meses
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* MAIN RANKING CONTENT */}
                <div className="space-y-6">
                    {!thresholdMet ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200 flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-4xl text-slate-200">query_stats</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-900 mb-2">Señales Insuficientes</h3>
                            <p className="text-slate-400 text-sm font-medium max-w-sm">
                                Aún no hay suficientes señales en este segmento para mostrar tendencias estables. Se requieren al menos 80 señales verificadas.
                            </p>
                            <p className="mt-4 text-xs font-black text-indigo-600 uppercase tracking-widest">
                                Basado en {totalSignals} señales actuales
                            </p>
                        </div>
                    ) : loading ? (
                        <div className="space-y-4 w-full">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <SkeletonRankingTopCard />
                                <SkeletonRankingTopCard />
                                <SkeletonRankingTopCard />
                            </div>
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                                <SkeletonRankingRow />
                                <div className="border-t border-slate-50"><SkeletonRankingRow /></div>
                                <div className="border-t border-slate-50"><SkeletonRankingRow /></div>
                                <div className="border-t border-slate-50 hidden md:block"><SkeletonRankingRow /></div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* TOP 3 DESTACADO */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                {ranking.slice(0, 3).map((item, idx) => {
                                    const clinic = MASTER_CLINICS.find(c => c.id === item.option_id);
                                    return (
                                        <motion.div
                                            key={item.option_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`relative p-8 rounded-[40px] border transition-all ${idx === 0
                                                ? 'bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-indigo-500 shadow-2xl scale-105 z-10'
                                                : 'bg-white border-slate-100 text-slate-900 shadow-xl'
                                                }`}
                                        >
                                            <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-xl font-black text-indigo-600 border-4 border-indigo-50">
                                                {idx + 1}
                                            </div>

                                            <div className="flex flex-col items-center text-center gap-4">
                                                <div className={`w-20 h-20 rounded-2xl p-4 flex items-center justify-center bg-white ${idx !== 0 ? 'shadow-sm border border-slate-50' : ''}`}>
                                                    <img
                                                        src={clinic?.image_url || '/images/defaults/clinic.png'}
                                                        alt={clinic?.label}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="font-extrabold text-lg leading-tight">{clinic?.label}</h3>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className={`text-xs font-black uppercase tracking-widest ${idx === 0 ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                            {activeAttr?.name}
                                                        </span>
                                                        <span className={`flex items-center gap-1 text-[10px] font-black border rounded px-1.5 ${item.trend === 'up' ? 'text-emerald-500 border-emerald-100 bg-emerald-50' :
                                                            item.trend === 'down' ? 'text-rose-500 border-rose-100 bg-rose-50' :
                                                                'text-slate-400 border-slate-100 bg-slate-50'
                                                            }`}>
                                                            {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* LISTA COMPLETA */}
                            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                                {ranking.slice(3).map((item) => {
                                    const clinic = MASTER_CLINICS.find(c => c.id === item.option_id);
                                    return (
                                        <div key={item.option_id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <span className="w-6 text-sm font-black text-slate-300 group-hover:text-indigo-600 transition-colors">
                                                    {item.position}
                                                </span>
                                                <div className="w-10 h-10 rounded-lg bg-slate-50 p-2 border border-slate-100">
                                                    <img src={clinic?.image_url || undefined} alt={clinic?.label} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="font-bold text-slate-700">{clinic?.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center gap-1 text-[10px] font-black border rounded px-2 py-0.5 ${item.trend === 'up' ? 'text-emerald-500 border-emerald-100' :
                                                    item.trend === 'down' ? 'text-rose-500 border-rose-100' :
                                                        'text-slate-400 border-slate-100'
                                                    }`}>
                                                    {item.trend === 'up' ? 'Sube' : item.trend === 'down' ? 'Baja' : 'Estable'}
                                                    {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* FOOTER INFO */}
                            <div className="pt-10 text-center space-y-2">
                                <p className="text-[11px] text-slate-400 font-bold max-w-sm mx-auto uppercase tracking-wider">
                                    Basado en {totalSignals} señales registradas en este segmento.
                                </p>
                                <p className="text-[9px] text-slate-300 font-medium max-w-xs mx-auto">
                                    Muestra solo clínicas con un mínimo de 15 señales por segmento para asegurar consistencia estadística.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Rankings;
