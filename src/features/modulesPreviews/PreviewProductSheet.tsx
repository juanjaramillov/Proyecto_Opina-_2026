import React from 'react';

interface PreviewProductSheetProps {
    product: {
        name: string;
        brand: string;
        category: string;
        rating: number;
        pros: string[];
        cons: string[];
        conclusions: string[];
    };
}

const PreviewProductSheet: React.FC<PreviewProductSheetProps> = ({ product }) => {
    return (
        <div className="flex flex-col md:flex-row gap-8">
            {/* Image mock */}
            <div className="md:w-64 h-80 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-center relative overflow-hidden shrink-0">
                <span className="material-symbols-outlined text-6xl text-slate-200">barcode_scanner</span>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/80 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest">
                    Escaneando...
                </div>
            </div>

            <div className="flex-1 space-y-8 text-left">
                <div>
                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">{product.brand} · {product.category}</div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight mb-3">{product.name}</h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                            {[1, 2, 3, 4].map(s => <span key={s} className="material-symbols-outlined text-[14px] text-amber-500 fill-current">star</span>)}
                            <span className="material-symbols-outlined text-[14px] text-amber-200 fill-current">star</span>
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{product.rating} de 5.0</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">thumb_up</span> Pros
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {product.pros.map(p => <span key={p} className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-emerald-700">{p}</span>)}
                        </div>
                    </div>
                    <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                        <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">thumb_down</span> Contras
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {product.cons.map(c => <span key={c} className="px-2 py-1 bg-white rounded-lg text-[10px] font-bold text-rose-700">{c}</span>)}
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
                    <h4 className="text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 opacity-60">
                        <span className="material-symbols-outlined text-lg">auto_awesome</span> Inteligencia Colectiva
                    </h4>
                    <ul className="space-y-3">
                        {product.conclusions.map((c, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm font-bold leading-relaxed">
                                <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${i === 0 ? 'bg-indigo-400' : 'bg-slate-500'}`} />
                                {c}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PreviewProductSheet;
