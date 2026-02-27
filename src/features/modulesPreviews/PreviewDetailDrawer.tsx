import React from 'react';
import { motion } from 'framer-motion';

interface PreviewDetailDrawerProps {
    isOpen: boolean;
    title: string;
    category: string;
    rating: number;
    description?: string;
}

const PreviewDetailDrawer: React.FC<PreviewDetailDrawerProps> = ({
    isOpen,
    title,
    category,
    rating,
    description
}) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:flex flex-col w-80 shrink-0 bg-slate-50 border border-slate-100 rounded-[2rem] p-6 shadow-inner"
        >
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">Ficha de Detalle</div>

            <div className="w-full h-40 bg-slate-200 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl">image</span>
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">{title}</h3>
            <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-md text-[9px] font-black uppercase tracking-widest">{category}</span>
                <span className="flex items-center gap-1 text-[10px] font-black text-amber-500">
                    <span className="material-symbols-outlined text-[14px] fill-current">star</span>
                    {rating}
                </span>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                {description || "Este es un ejemplo de cómo se vería la información detallada del item seleccionado una vez que el módulo esté activo."}
            </p>

            <div className="space-y-3 mt-auto">
                <div className="w-full py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-50">
                    <span className="material-symbols-outlined text-[16px]">map</span> Ver Mapa
                </div>
                <div className="w-full py-3 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50">
                    <span className="material-symbols-outlined text-[16px]">chat</span> Opinar
                </div>
            </div>
        </motion.div>
    );
};

export default PreviewDetailDrawer;
