import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Attribute, RankingItem } from '../services/rankingService';
import { rankingService } from '../services/rankingService';
import { MASTER_CLINICS } from '../../signals/config/clinics';
import SEO from '../../../components/common/SEO';
import { motion } from 'framer-motion';

const PublicRankingPage: React.FC = () => {
    const { attributeSlug } = useParams<{ attributeSlug: string }>();
    const [searchParams] = useSearchParams();
    const segmentHashFromUrl = searchParams.get('segment');

    const [attribute, setAttribute] = useState<Attribute | null>(null);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [totalSignals, setTotalSignals] = useState(0);
    const [updatedAt, setUpdatedAt] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadPublicData = async () => {
            if (!attributeSlug) return;
            setLoading(true);

            // 1. Obtener atributo
            const attr = await rankingService.getAttributeBySlug(attributeSlug);
            if (!attr) {
                setError(true);
                setLoading(false);
                return;
            }
            setAttribute(attr);

            // 2. Obtener Ranking (Snapshot Estricto para rutas públicas)
            const data = await rankingService.getPublicRanking(attr.id, segmentHashFromUrl || '');

            if (!data) {
                setError(true);
                setLoading(false);
                return;
            }

            setRanking(data.ranking);
            setTotalSignals(data.totalSignals);
            setUpdatedAt(data.updatedAt);
            setLoading(false);
        };
        loadPublicData();
    }, [attributeSlug, segmentHashFromUrl]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error || !attribute) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Ranking no encontrado</h1>
            <p className="text-slate-500 mb-8">El atributo solicitado no existe o no tiene datos públicos aún.</p>
            <Link to="/" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Volver al inicio</Link>
        </div>
    );

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);

    return (
        <div className="min-h-screen bg-white font-sans">
            <SEO
                title={`Top 3 en ${attribute.name} – Clínicas Santiago`}
                description={`Descubre cuáles son las clínicas mejor evaluadas en ${attribute.name} según el ranking público de Opina+. Basado en ${totalSignals} señales recientes.`}
            />

            {/* BARRA SUPERIOR BRANDED */}
            <nav className="border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-xs">O+</span>
                    </div>
                    <span className="font-black tracking-tighter text-xl text-slate-900">Opina<span className="text-indigo-600">+</span></span>
                </Link>
                <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Snapshot Público · Santiago
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">

                {/* HERO PUBLICO */}
                <header className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        Actualizado: {new Date(updatedAt).toLocaleDateString('es-CL')}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-tight">
                        Las mejores Clínicas en <br />
                        <span className="text-indigo-600">{attribute.name}</span>
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto text-lg leading-relaxed">
                        Este ranking refleja la percepción de los usuarios en Santiago basada en su experiencia real en los últimos 30 días.
                    </p>

                    {/* BOTONES DE COMPARTIR */}
                    <div className="flex flex-wrap justify-center gap-4 pt-4">
                        <button
                            onClick={() => {
                                const msg = `Hoy en Santiago, la percepción en ${attribute.name} está liderada por:\n\n1. ${top3[0]?.option_id ? MASTER_CLINICS.find(c => c.id === top3[0].option_id)?.label : ''}\n2. ${top3[1]?.option_id ? MASTER_CLINICS.find(c => c.id === top3[1].option_id)?.label : ''}\n3. ${top3[2]?.option_id ? MASTER_CLINICS.find(c => c.id === top3[2].option_id)?.label : ''}\n\nVer tendencia completa:\n${window.location.href}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-emerald-100"
                        >
                            <span className="material-symbols-outlined text-[20px]">share</span>
                            WhatsApp
                        </button>

                        <button
                            onClick={() => {
                                const text = `Interesante movimiento en la percepción de ${attribute.name} en clínicas privadas en Santiago.\n\nTop 3 actual:\n🥇 ${top3[0]?.option_id ? MASTER_CLINICS.find(c => c.id === top3[0].option_id)?.label : ''}\n🥈 ${top3[1]?.option_id ? MASTER_CLINICS.find(c => c.id === top3[1].option_id)?.label : ''}\n🥉 ${top3[2]?.option_id ? MASTER_CLINICS.find(c => c.id === top3[2].option_id)?.label : ''}\n\nDatos actualizados periódicamente:\n${window.location.href}`;
                                navigator.clipboard.writeText(text);
                                alert('Texto editorial copiado para LinkedIn');
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-[#0A66C2] text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg shadow-blue-100"
                        >
                            <span className="material-symbols-outlined text-[20px]">content_copy</span>
                            Copiar para LinkedIn
                        </button>
                    </div>
                </header>

                {/* PODIUM TOP 3 (MINIMALISTA) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {top3.map((item, idx) => {
                        const clinic = MASTER_CLINICS.find(c => c.id === item.option_id);
                        const isFirst = idx === 0;
                        return (
                            <motion.div
                                key={item.option_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`relative p-8 rounded-[40px] border-2 flex flex-col items-center text-center transition-all ${isFirst ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 scale-105 z-10' : 'bg-white border-slate-100 text-slate-900'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mb-4 ${isFirst ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                    {idx + 1}
                                </div>
                                <div className={`w-20 h-20 rounded-2xl p-4 mb-4 ${isFirst ? 'bg-white' : 'bg-slate-50 border border-slate-100'}`}>
                                    <img src={clinic?.image_url || undefined} alt={clinic?.label} className="w-full h-full object-contain" />
                                </div>
                                <h2 className="font-black text-xl tracking-tight leading-tight">{clinic?.label}</h2>
                                <div className={`mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest ${isFirst ? 'text-white/70' : 'text-slate-400'}`}>
                                    Líder en este segmento
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* RESTO DEL RANKING */}
                <div className="bg-slate-50 rounded-[40px] p-2">
                    <div className="bg-white rounded-[38px] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                        {rest.map((item) => {
                            const clinic = MASTER_CLINICS.find(c => c.id === item.option_id);
                            return (
                                <div key={item.option_id} className="px-8 py-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <span className="text-2xl font-black text-slate-200 w-6">
                                            {item.position}
                                        </span>
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 border border-slate-100">
                                            <img src={clinic?.image_url || undefined} alt={clinic?.label} className="w-full h-full object-contain" />
                                        </div>
                                        <span className="font-bold text-slate-700 text-lg">{clinic?.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.trend === 'up' && <span className="text-emerald-500 material-symbols-outlined text-[20px]">trending_up</span>}
                                        {item.trend === 'down' && <span className="text-rose-500 material-symbols-outlined text-[20px]">trending_down</span>}
                                        {item.trend === 'stable' && <span className="text-slate-300 material-symbols-outlined text-[20px]">horizontal_rule</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* DISCLAIMER Y FUENTE */}
                <footer className="text-center space-y-6 pt-12">
                    <div className="bg-indigo-50 border border-indigo-100 p-8 rounded-[40px] max-w-2xl mx-auto">
                        <p className="text-indigo-900 font-medium italic mb-2">
                            "Resultados basados en señales declaradas por usuarios registrados en la plataforma."
                        </p>
                        <p className="text-indigo-600/60 text-xs font-bold uppercase tracking-widest">
                            Metodología Opina+ · Santiago
                        </p>
                    </div>

                    <div className="pt-8">
                        <Link to="/participa" className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all group">
                            Quiero Opinia mi experiencia
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </Link>
                    </div>
                </footer>

            </main>
        </div>
    );
};

export default PublicRankingPage;
