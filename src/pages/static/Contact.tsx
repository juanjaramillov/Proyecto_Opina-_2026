import React, { useState } from 'react';
import PageShell from '../../components/layout/PageShell';

interface ContactForm {
    name: string;
    company: string;
    email: string;
    role: string;
    msg: string;
}

const Contact: React.FC = () => {
    const [form, setForm] = useState<ContactForm>({
        name: '',
        company: '',
        email: '',
        role: 'Marketing',
        msg: ''
    });

    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3200);
    };

    const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setForm(prev => ({ ...prev, [id]: value }));
    };

    const resetForm = () => {
        setForm({
            name: '',
            company: '',
            email: '',
            role: 'Marketing',
            msg: ''
        });
        showToast("Formulario reiniciado.");
    };

    const send = async () => {
        const payload = {
            name: form.name.trim(),
            company: form.company.trim(),
            email: form.email.trim(),
            role: form.role,
            msg: form.msg.trim()
        };

        if (!payload.name || !payload.company || !payload.email || !payload.msg) {
            showToast("Falta completar campos.");
            return;
        }
        if (!isEmail(payload.email)) {
            showToast("Email inválido.");
            return;
        }

        // Mock send
        try {
            // Simulate fetch
            await new Promise(r => setTimeout(r, 500));
            showToast("Enviado. Te contactaremos pronto.");
            resetForm();
        } catch {
            showToast("Error al enviar (demo).");
        }
    };

    return (
        <PageShell>
            <div className="min-h-screen">
                <main className="py-8 pb-16">
                    <div className="max-w-ws mx-auto px-5">
                        <h1 className="m-0 text-2xl tracking-tight text-ink">Solicitar demo</h1>
                        <p className="mt-2.5 text-sm leading-relaxed max-w-[90ch] text-muted">
                            Si eres empresa, institución o agencia: te mostramos señales agregadas por segmento, series históricas y alertas de quiebre.
                            Sin acceso a datos personales.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-4 mt-6 items-stretch">
                            {/* Form */}
                            <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-5 relative overflow-hidden">
                                <div className="font-black text-base tracking-tight text-ink">Cuéntanos tu necesidad</div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-ok/25 bg-white/5 font-extrabold text-xs text-ok/95 mt-2.5">● Respuesta típica: 24–48 horas</div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-3">
                                    <div>
                                        <label className="block text-muted2 text-xs font-bold mb-1.5">Nombre</label>
                                        <input
                                            className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none placeholder:text-white/10"
                                            id="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Nombre y apellido"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-muted2 text-xs font-bold mb-1.5">Empresa</label>
                                        <input
                                            className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none placeholder:text-white/10"
                                            id="company"
                                            value={form.company}
                                            onChange={handleChange}
                                            placeholder="Nombre empresa"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-muted2 text-xs font-bold mb-1.5">Email</label>
                                        <input
                                            className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none placeholder:text-white/10"
                                            id="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="correo@empresa.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-muted2 text-xs font-bold mb-1.5">Rol</label>
                                        <select
                                            className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none appearance-none"
                                            id="role"
                                            value={form.role}
                                            onChange={handleChange}
                                        >
                                            <option>Marketing</option>
                                            <option>Research</option>
                                            <option>Strategy</option>
                                            <option>Public Affairs</option>
                                            <option>Otro</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-2.5">
                                    <label className="block text-muted2 text-xs font-bold mb-1.5">Qué quieres medir / decidir</label>
                                    <textarea
                                        className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none placeholder:text-white/10 min-h-[120px] resize-none"
                                        id="msg"
                                        value={form.msg}
                                        onChange={handleChange}
                                        placeholder="Ej: reputación de marca, sensibilidad a precios, clima social, evaluación de campaña..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-2.5 flex-wrap justify-end mt-2.5">
                                    <button
                                        className="border border-white/14 bg-white/5 text-ink rounded-xl px-3 py-2.5 font-extrabold text-[13px] cursor-pointer transition hover:-translate-y-px hover:bg-white/8"
                                        type="button"
                                        onClick={resetForm}
                                    >
                                        Reset
                                    </button>
                                    <button
                                        className="border border-primary/35 bg-gradient-to-b from-primary/20 to-primary/10 shadow-home text-ink rounded-xl px-3 py-2.5 font-extrabold text-[13px] cursor-pointer transition hover:-translate-y-px hover:bg-white/8"
                                        type="button"
                                        onClick={send}
                                    >
                                        Enviar
                                    </button>
                                </div>

                                {/* Toast */}
                                {toast && (
                                    <div className="mt-2.5 p-3 rounded-xl border border-white/14 bg-white/5 text-muted text-xs block animate-fade-in">
                                        {toast}
                                    </div>
                                )}
                            </div>

                            {/* Credibility */}
                            <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-5 relative overflow-hidden">
                                <div className="font-black text-base tracking-tight text-ink">Qué recibirás</div>
                                <div className="mt-2.5 flex flex-col gap-2.5">
                                    <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                                        <b className="block text-[13px] text-ink">Dashboard por segmento</b>
                                        <p className="mt-1.5 text-muted text-xs leading-relaxed">Edad, región, intereses, ventanas de tiempo y comparaciones históricas.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                                        <b className="block text-[13px] text-ink">Alertas y quiebres</b>
                                        <p className="mt-1.5 text-muted text-xs leading-relaxed">Detección temprana de cambios relevantes para anticipar decisiones.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                                        <b className="block text-[13px] text-ink">Exportaciones / API (según plan)</b>
                                        <p className="mt-1.5 text-muted text-xs leading-relaxed">Integración con BI interno o reportes recurrentes.</p>
                                    </div>
                                    <div className="rounded-2xl border border-white/12 bg-white/5 p-3">
                                        <b className="block text-[13px] text-ink">Privacidad</b>
                                        <p className="mt-1.5 text-muted text-xs leading-relaxed">Solo señales agregadas. Sin datos personales ni respuestas individuales.</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    <span className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-ok/25 bg-white/5 font-extrabold text-xs text-ok/95">● Datos agregados</span>
                                    <span className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-ok/25 bg-white/5 font-extrabold text-xs text-ok/95">● Trazabilidad por ventana</span>
                                    <span className="inline-flex items-center gap-2 px-2.5 py-2 rounded-full border border-warn/25 bg-white/5 font-extrabold text-xs text-warn/95">● Acceso por contrato</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </PageShell>
    );
};

export default Contact;
