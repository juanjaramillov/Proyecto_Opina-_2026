import { useState } from 'react';
import { supabase } from '../../../supabase/client';
import toast from 'react-hot-toast';
import { logger } from '../../../lib/logger';

export const B2BLeadForm = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [company, setCompany] = useState('');
    const [role, setRole] = useState('');
    const [interest, setInterest] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('b2b_leads').insert([
                { name, email, company, role, interest }
            ]);

            if (error) {
                logger.error("Error saving lead", { domain: 'b2b_intelligence', origin: 'B2BLeadForm', action: 'submit_lead', state: 'failed' }, error);
                // Fail graceful in UI as requested by user.
            }
            toast.success("Solicitud recibida. Te contactaremos pronto.");
            setSubmitted(true);
        } catch (err) {
            logger.error("Error in lead form submission", { domain: 'b2b_intelligence', origin: 'B2BLeadForm', action: 'submit_lead_fatal', state: 'failed' }, err);
            toast.success("Solicitud recibida. Te contactaremos pronto.");
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white border border-stroke rounded-3xl p-10 text-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="w-16 h-16 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="material-symbols-outlined text-[32px]">check_circle</span>
                </div>
                <h3 className="text-2xl font-black text-ink mb-2 relative z-10">Solicitud Recibida</h3>
                <p className="text-text-secondary relative z-10">Nuestro equipo comercial analizará tu perfil y te contactaremos en breve al correo <strong>{email}</strong> para coordinar tu acceso.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-stroke rounded-[2rem] p-8 md:p-10 text-left w-full mx-auto relative overflow-hidden shadow-sm">
            <h3 className="text-2xl font-black text-ink mb-2">Solicitar Acceso B2B</h3>
            <p className="text-text-secondary text-sm mb-8">Déjanos tus datos para coordinar una demostración personalizada del motor de inteligencia Opina+.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nombre Completo</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-surface2 border border-stroke rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-text-muted/50" placeholder="Ej. Ana Pérez" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Correo Corporativo</label>
                    <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-surface2 border border-stroke rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-text-muted/50" placeholder="ana@empresa.com" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Empresa</label>
                    <input required type="text" value={company} onChange={e => setCompany(e.target.value)} className="w-full bg-surface2 border border-stroke rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-text-muted/50" placeholder="Tu Empresa" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Cargo</label>
                    <input required type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full bg-surface2 border border-stroke rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-text-muted/50" placeholder="Ej. Director de Marketing" />
                </div>
            </div>

            <div className="space-y-2 mb-8 relative">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Interés Principal</label>
                <div className="relative">
                    <select required value={interest} onChange={e => setInterest(e.target.value)} className="w-full bg-surface2 border border-stroke rounded-xl px-4 py-3 text-ink focus:outline-none focus:border-primary focus:bg-white transition-colors appearance-none pr-10">
                        <option value="" disabled>Selecciona tu principal caso de uso...</option>
                        <option value="Trackeo de Competidores">Trackeo de Competidores</option>
                        <option value="Monitoreo de Crisis">Monitoreo de Crisis y Percepción</option>
                        <option value="Desempeño de Marca">Desempeño de mi Marca</option>
                        <option value="Detección de Tendencias">Detección de Relatos Emergentes</option>
                        <option value="Otro">Explorar Capacidades Generales</option>
                    </select>
                    <span className="material-symbols-outlined text-text-muted absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
                </div>
            </div>

            <button disabled={loading} type="submit" className="btn-primary w-full py-4 px-6 text-sm flex items-center justify-center gap-2">
                {loading ? 'Enviando Solicitud...' : 'Agendar Demo de Inteligencia'}
                {!loading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </button>
        </form>
    );
};
