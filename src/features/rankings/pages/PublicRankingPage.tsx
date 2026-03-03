import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Attribute, RankingItem } from '../services/rankingService';
import { rankingService } from '../services/rankingService';
import { MASTER_CLINICS } from '../../signals/config/clinics';
import SEO from '../../../components/common/SEO';
import { motion } from 'framer-motion';
import PageHeader from '../../../components/ui/PageHeader';
import { PageState } from '../../../components/ui/StateBlocks';
import { BrandLogo } from '../../../components/ui/BrandLogo';

const PublicRankingPage: React.FC = () => {
    const { attributeSlug } = useParams<{ attributeSlug: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const segmentHashFromUrl = searchParams.get('segment');

    const [attribute, setAttribute] = useState<Attribute | null>(null);
    const [ranking, setRanking] = useState<RankingItem[]>([]);
    const [totalSignals, setTotalSignals] = useState(0);
    const [updatedAt, setUpdatedAt] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadPublicData = async () => {
            if (!attributeSlug) {
                setErrorMsg('Falta el identificador del ranking.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setErrorMsg(null);

            try {
                // 1) Atributo
                const attr = await rankingService.getAttributeBySlug(attributeSlug);
                if (!attr) {
                    if (!mounted) return;
                    setAttribute(null);
                    setErrorMsg('El atributo solicitado no existe o no tiene datos públicos aún.');
                    setLoading(false);
                    return;
                }

                if (!mounted) return;
                setAttribute(attr);

                // 2) Ranking público (snapshot)
                const data = await rankingService.getPublicRanking(attr.id, segmentHashFromUrl || '');
                if (!data) {
                    if (!mounted) return;
                    setErrorMsg('No pudimos cargar el ranking público.');
                    setLoading(false);
                    return;
                }

                if (!mounted) return;
                setRanking(data.ranking || []);
                setTotalSignals(data.totalSignals || 0);
                setUpdatedAt(data.updatedAt || '');
                setLoading(false);
            } catch (err: any) {
                if (!mounted) return;
                setErrorMsg(err?.message || 'Error inesperado cargando el ranking.');
                setLoading(false);
            }
        };

        loadPublicData();

        return () => {
            mounted = false;
        };
    }, [attributeSlug, segmentHashFromUrl]);

    const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);
    const rest = useMemo(() => ranking.slice(3), [ranking]);

    if (loading) {
        return (
            <div className="container-ws section-y">
                <PageState type="loading" loadingLabel="Cargando ranking público..." />
            </div>
        );
    }

    if (errorMsg || !attribute) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="error"
                    title="Ranking no disponible"
                    description={errorMsg || 'No se pudo cargar este ranking.'}
                    icon="cloud_off"
                    primaryAction={{ label: "Volver al inicio", onClick: () => navigate('/') }}
                    secondaryAction={{ label: "Crear cuenta", onClick: () => navigate('/register') }}
                />
            </div>
        );
    }

    if (ranking.length === 0) {
        return (
            <div className="container-ws section-y">
                <PageState
                    type="empty"
                    title="Aún no hay señales suficientes"
                    description="Este ranking público necesita más actividad para mostrarse con confianza."
                    icon="query_stats"
                    primaryAction={{ label: "Volver al inicio", onClick: () => navigate('/') }}
                    secondaryAction={{ label: "Probar Opina+", onClick: () => navigate('/register') }}
                />
            </div>
        );
    }

    const updatedLabel = updatedAt
        ? new Date(updatedAt).toLocaleString('es-CL', { hour12: false, dateStyle: 'short', timeStyle: 'short' })
        : '';

    const topLabel = (idx: number) => {
        const item = top3[idx];
        if (!item) return '';
        const clinic = MASTER_CLINICS.find((c) => c.id === item.option_id);
        return clinic?.label || '';
    };

    return (
        <div className="container-ws section-y space-y-10 pb-24">
            <SEO
                title={`Top Clínicas en ${attribute.name} – Santiago`}
                description={`Ranking público de clínicas mejor evaluadas en ${attribute.name} según señales recientes. Total: ${totalSignals} señales.`}
            />

            <PageHeader
                eyebrow={
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 border border-primary-100 text-[10px] font-black uppercase tracking-widest text-primary-600">
                        <span className="material-symbols-outlined text-[14px]">public</span>
                        Snapshot público · Santiago
                    </div>
                }
                title={
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-ink leading-tight">
                        Las mejores clínicas en <span className="text-gradient-brand">{attribute.name}</span>
                    </h1>
                }
                subtitle={
                    <p className="text-sm md:text-base text-muted font-medium max-w-2xl">
                        Esto no es “review de Google”. Es percepción agregada de usuarios en los últimos 30 días. (Sí, con sesgos humanos. Como todo.)
                    </p>
                }
                meta={
                    <div className="flex flex-wrap gap-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="material-symbols-outlined text-[14px] text-emerald-500">schedule</span>
                            {updatedLabel ? `Actualizado: ${updatedLabel}` : 'Actualizado periódicamente'}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="material-symbols-outlined text-[14px] text-primary-500">bar_chart</span>
                            {totalSignals.toLocaleString('es-CL')} señales
                        </div>
                    </div>
                }
                actions={
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => {
                                const msg =
                                    `Hoy en Santiago, la percepción en ${attribute.name} está liderada por:\n\n` +
                                    `1. ${topLabel(0)}\n2. ${topLabel(1)}\n3. ${topLabel(2)}\n\n` +
                                    `Ver ranking completo:\n${window.location.href}`;
                                window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="h-10 px-4 rounded-xl bg-[#25D366] text-white font-black text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">share</span>
                            WhatsApp
                        </button>

                        <button
                            onClick={() => {
                                const text =
                                    `Interesante movimiento en la percepción de ${attribute.name} en clínicas privadas en Santiago.\n\n` +
                                    `Top 3 actual:\n🥇 ${topLabel(0)}\n🥈 ${topLabel(1)}\n🥉 ${topLabel(2)}\n\n` +
                                    `Ranking público (actualiza periódicamente):\n${window.location.href}`;
                                navigator.clipboard.writeText(text);
                                alert('Texto copiado para LinkedIn');
                            }}
                            className="h-10 px-4 rounded-xl bg-[#0A66C2] text-white font-black text-[11px] uppercase tracking-wider hover:opacity-90 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">content_copy</span>
                            Copiar LinkedIn
                        </button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {top3.map((item, idx) => {
                    const clinic = MASTER_CLINICS.find((c) => c.id === item.option_id);
                    const isFirst = idx === 0;

                    return (
                        <motion.div
                            key={item.option_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={[
                                'relative p-8 rounded-[40px] border-2 flex flex-col items-center text-center transition-all',
                                isFirst
                                    ? 'bg-gradient-brand border-transparent text-white shadow-xl shadow-primary-100 scale-[1.03] z-10'
                                    : 'bg-white border-slate-100 text-slate-900',
                            ].join(' ')}
                        >
                            <div
                                className={[
                                    'w-12 h-12 rounded-full flex items-center justify-center font-black text-xl mb-4',
                                    isFirst ? 'bg-white/20 text-white' : 'bg-primary-50 text-primary-600',
                                ].join(' ')}
                            >
                                {idx + 1}
                            </div>

                            <div className={['w-20 h-20 rounded-2xl p-4 mb-4', isFirst ? 'bg-white' : 'bg-slate-50 border border-slate-100'].join(' ')}>
                                <BrandLogo name={clinic?.label || 'Clínica'} imageUrl={clinic?.image_url} />
                            </div>

                            <h2 className="font-black text-xl tracking-tight leading-tight">{clinic?.label}</h2>

                            <div className={['mt-4 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest', isFirst ? 'text-white/80' : 'text-slate-400'].join(' ')}>
                                Líder en este segmento
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {rest.length > 0 ? (
                <div className="bg-slate-50 rounded-[40px] p-2">
                    <div className="bg-white rounded-[38px] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                        {rest.map((item) => {
                            const clinic = MASTER_CLINICS.find((c) => c.id === item.option_id);

                            return (
                                <div key={item.option_id} className="px-8 py-6 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <span className="text-2xl font-black text-slate-200 w-6">{item.position}</span>

                                        <div className="w-12 h-12 rounded-xl bg-slate-50 p-2 border border-slate-100">
                                            <BrandLogo name={clinic?.label || 'Clínica'} imageUrl={clinic?.image_url} className="w-full h-full object-contain" fallbackClassName="w-full h-full flex items-center justify-center text-[8px] text-slate-400 font-bold text-center" />
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
            ) : null}

            <footer className="text-center space-y-6 pt-6">
                <div className="bg-primary-50 border border-primary-100 p-8 rounded-[40px] max-w-2xl mx-auto">
                    <p className="text-primary-900 font-medium italic mb-2">
                        “Resultados basados en señales declaradas por usuarios registrados en la plataforma.”
                    </p>
                    <p className="text-primary-600/60 text-xs font-black uppercase tracking-widest">Metodología Opina+ · Santiago</p>
                </div>

                <div className="pt-2">
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-ink text-white rounded-2xl font-black hover:opacity-90 transition-all group"
                    >
                        Quiero dejar mi señal
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </footer>
        </div>
    );
};

export default PublicRankingPage;
