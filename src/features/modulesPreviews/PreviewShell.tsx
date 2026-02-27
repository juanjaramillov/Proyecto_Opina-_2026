import React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { rateLimit } from '../../shared/utils/rateLimit';
import { moduleInterestService } from './moduleInterestService';
import { MODULE_EVENT_TYPES } from '../signals/eventTypes';
import { useParams } from 'react-router-dom';

interface PreviewShellProps {
    title: string;
    description: string;
    icon: string;
    tone: string;
    bullets: string[];
    children: React.ReactNode;
    onBack: () => void;
    onRequestLaunch: () => void;
}

const PreviewShell: React.FC<PreviewShellProps> = ({
    title,
    description,
    icon,
    tone,
    bullets,
    children,
    onBack,
    onRequestLaunch,
}) => {
    const { slug } = useParams();
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        if (slug) {
            const limitKey = `opina_module_interest:${slug}`;
            if (rateLimit.hasSent(limitKey)) {
                setIsRegistered(true);
            }
        }
    }, [slug]);

    const handleRequestLaunch = () => {
        if (!slug || isRegistered) return;

        onRequestLaunch();
        setIsRegistered(true);

        const limitKey = `opina_module_interest:${slug}`;
        rateLimit.markSent(limitKey);

        moduleInterestService.trackModuleInterestEvent(MODULE_EVENT_TYPES.MODULE_INTEREST_CLICKED, {
            module_key: slug, // We don't have the key here easily, using slug for now or passing it
            module_slug: slug,
            previewType: "shell",
            source: "coming_soon",
            cta: "launch_this"
        });
    };
    const toneColors: Record<string, string> = {
        indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-50/50',
        rose: 'bg-rose-50 text-rose-600 ring-rose-50/50',
        amber: 'bg-amber-50 text-amber-600 ring-amber-50/50',
        emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-50/50',
        slate: 'bg-slate-50 text-slate-600 ring-slate-50/50',
    };

    const toneButton: Record<string, string> = {
        indigo: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200',
        rose: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
        amber: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
        emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
        slate: 'bg-slate-900 hover:bg-slate-800 shadow-slate-200',
    };

    return (
        <div className="relative w-full max-w-5xl mx-auto px-4 py-8">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-slate-50 rounded-full blur-3xl -z-10 opacity-60" />

            {/* Header / Info Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden mb-8"
            >
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 ring-8 ${toneColors[tone] || toneColors.slate}`}>
                        <span className="material-symbols-outlined text-4xl">{icon}</span>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                Modo Preview
                            </span>
                            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Próximamente
                            </span>
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-4">
                            {title}
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-2xl">
                            {description}
                        </p>
                    </div>

                    <div className="hidden lg:block w-px h-32 bg-slate-100 self-center" />

                    <div className="lg:w-64 text-left">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                            Qué podrás hacer:
                        </h3>
                        <ul className="space-y-2">
                            {bullets.slice(0, 3).map((bullet, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs font-bold text-slate-600">
                                    <span className="material-symbols-outlined text-sm text-emerald-500 mt-0.5">check_circle</span>
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Content Mockup Area */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="relative bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-xl overflow-hidden min-h-[400px]"
            >
                <div className="absolute inset-0 bg-slate-50/30 backdrop-blur-[2px] pointer-events-none" />

                {/* Simulated Interface Grid */}
                <div className="relative z-10">
                    {children}
                </div>

                {/* Overlay Indicator */}
                <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 shadow-sm">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Vista Conceptual</span>
                    </div>
                </div>
            </motion.div>

            {/* Bottom Actions */}
            <div className="mt-12 flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 px-8 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition active:scale-[0.98] shadow-sm"
                >
                    Volver
                </button>
                <button
                    onClick={handleRequestLaunch}
                    disabled={isRegistered}
                    className={`flex-[2] py-4 px-8 text-white rounded-2xl font-black transition active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${toneButton[tone] || toneButton.slate}`}
                >
                    {isRegistered ? '¡INTERÉS REGISTRADO!' : '¡QUIERO QUE LANCEN ESTO!'}
                </button>
            </div>

            <p className="text-center mt-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Nota: Esta es una representación visual de la experiencia. No se guardarán datos reales.
            </p>
        </div>
    );
};

export default PreviewShell;
