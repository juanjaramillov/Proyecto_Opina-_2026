import { useEffect, useState } from 'react';
import { supabase } from '../../../supabase/client';
import toast from 'react-hot-toast';
import { logger } from '../../../lib/logger';
import { GradientCTA } from '../../../components/ui/foundation';
import { KPITier } from './intelligence/kpiCatalog';
import { ScopeType } from './intelligence/tierScopeMatrix';

export interface B2BLeadPrefill {
    tier?: KPITier;
    scope?: ScopeType;
    source?: string;
}

interface Props {
    prefill?: B2BLeadPrefill | null;
}

const TIER_OPTIONS: { value: string; label: string }[] = [
    { value: 'basic',      label: 'Basic — Market Pulse' },
    { value: 'pro',        label: 'Pro — Deep Analytics' },
    { value: 'enterprise', label: 'Enterprise — Velocity' },
    { value: 'undecided',  label: 'No estoy seguro todavía' },
];

const SCOPE_OPTIONS: { value: string; label: string }[] = [
    { value: 'entity',    label: 'Una marca específica' },
    { value: 'category',  label: 'Una categoría completa' },
    { value: 'industry',  label: 'Una industria' },
    { value: 'all',       label: 'All access (catálogo completo)' },
    { value: 'undecided', label: 'Quiero conversarlo con ventas' },
];

const SIZE_OPTIONS: { value: string; label: string }[] = [
    { value: 'lt_50',     label: 'Menos de 50 personas' },
    { value: 'b50_200',   label: '50 a 200 personas' },
    { value: 'b200_1000', label: '200 a 1.000 personas' },
    { value: 'gt_1000',   label: 'Más de 1.000 personas' },
];

export const B2BLeadForm = ({ prefill }: Props = {}) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [interest, setInterest] = useState('');
    const [tierInteresado, setTierInteresado] = useState('');
    const [scopeInteresado, setScopeInteresado] = useState('');
    const [tamanoEmpresa, setTamanoEmpresa] = useState('');
    const [industria, setIndustria] = useState('');
    const [source, setSource] = useState('manual');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Aplica el prefill cuando viene de un CTA del selector / API stub
    useEffect(() => {
        if (!prefill) return;
        if (prefill.tier)   setTierInteresado(prefill.tier);
        if (prefill.scope)  setScopeInteresado(prefill.scope);
        if (prefill.source) setSource(prefill.source);
    }, [prefill]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name,
                email,
                company,
                role,
                interest,
                tier_interesado:  tierInteresado  || null,
                scope_interesado: scopeInteresado || null,
                tamano_empresa:   tamanoEmpresa   || null,
                industria:        industria       || null,
                source,
            };

            const { error } = await supabase.from('b2b_leads').insert([payload]);

            if (error) {
                logger.error("Error saving lead", { domain: 'b2b_intelligence', origin: 'B2BLeadForm', action: 'submit_lead', state: 'failed' }, error);
                // Fail graceful in UI as requested by user.
            }
            toast.success("Solicitud recibida. Te contactaremos pronto.");
            setSubmitted(true);
        } catch (error) {
            logger.error("Error in lead form submission", { domain: 'b2b_intelligence', origin: 'B2BLeadForm', action: 'submit_lead_fatal', state: 'failed' }, error);
            toast.success("Solicitud recibida. Te contactaremos pronto.");
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white border border-stroke rounded-3xl p-10 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h3 className="text-2xl font-black text-ink mb-2 relative z-10">Solicitud Recibida</h3>
                <p className="text-slate-600 relative z-10">Nuestro equipo comercial analizará tu perfil y te contactaremos en breve al correo <strong>{email}</strong> para coordinar tu acceso.</p>
            </div>
        );
    }

    const inputCls = "w-full bg-surface2 border border-stroke rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-slate-500/50";
    const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-wider";

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-stroke rounded-4xl p-8 md:p-10 text-left w-full mx-auto relative overflow-hidden shadow-sm">
            <h3 className="text-2xl font-black text-ink mb-2">Solicitar Acceso B2B</h3>
            <p className="text-slate-600 text-sm mb-8">Déjanos tus datos para coordinar una demostración personalizada del motor de inteligencia Opina+.</p>

            {/* DATOS BÁSICOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className={labelCls}>Nombre Completo</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Ej. Ana Pérez" />
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>Correo Corporativo</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="ana@empresa.com" />
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>Empresa</label>
                    <input required type="text" value={company} onChange={e => setCompany(e.target.value)} className={inputCls} placeholder="Tu Empresa" />
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>Cargo</label>
                    <input required type="text" value={role} onChange={e => setRole(e.target.value)} className={inputCls} placeholder="Ej. Director de Marketing" />
                </div>
            </div>

            {/* CUALIFICACIÓN B2B */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className={labelCls}>Tier de interés</label>
                    <div className="relative">
                        <select value={tierInteresado} onChange={e => setTierInteresado(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                            <option value="">— Sin definir —</option>
                            {TIER_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                        </select>
                        <span className="material-symbols-outlined text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>Alcance que necesitás</label>
                    <div className="relative">
                        <select value={scopeInteresado} onChange={e => setScopeInteresado(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                            <option value="">— Sin definir —</option>
                            {SCOPE_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                        </select>
                        <span className="material-symbols-outlined text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>Tamaño de empresa</label>
                    <div className="relative">
                        <select value={tamanoEmpresa} onChange={e => setTamanoEmpresa(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                            <option value="">— Sin definir —</option>
                            {SIZE_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                        </select>
                        <span className="material-symbols-outlined text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className={labelCls}>Industria</label>
                    <input type="text" value={industria} onChange={e => setIndustria(e.target.value)} className={inputCls} placeholder="Ej. Retail / Telco / Banca" />
                </div>
            </div>

            {/* INTERÉS PRINCIPAL */}
            <div className="space-y-2 mb-8 relative">
                <label className={labelCls}>Interés Principal</label>
                <div className="relative">
                    <select required value={interest} onChange={e => setInterest(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                        <option value="" disabled>Selecciona tu principal caso de uso...</option>
                        <option value="Trackeo de Competidores">Trackeo de Competidores</option>
                        <option value="Monitoreo de Crisis">Monitoreo de Crisis y Percepción</option>
                        <option value="Desempeño de Marca">Desempeño de mi Marca</option>
                        <option value="Detección de Tendencias">Detección de Relatos Emergentes</option>
                        <option value="Otro">Explorar Capacidades Generales</option>
                    </select>
                    <span className="material-symbols-outlined text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
            </div>

            <GradientCTA
                type="submit"
                label={loading ? 'Enviando Solicitud...' : 'Agendar Demo de Inteligencia'}
                icon={loading ? undefined : 'arrow_forward'}
                iconPosition="trailing"
                size="md"
                fullWidth
                disabled={loading}
            />
        </form>
    );
};
