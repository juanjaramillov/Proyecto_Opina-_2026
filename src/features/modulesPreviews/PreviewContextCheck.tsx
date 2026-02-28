import React from 'react';

interface PreviewContextCheckProps {
    checkins: Array<{ label: string; value: number; type?: string; icon: string }>;
}

const PreviewContextCheck: React.FC<PreviewContextCheckProps> = ({ checkins }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {checkins.map((item, i) => (
                <div
                    key={i}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative group overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                            <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                            {item.type || 'vínculo'}
                        </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-800 leading-tight mb-4">
                        {item.label}
                    </h4>

                    <div className="space-y-3">
                        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${item.value > 80 ? 'bg-rose-500' :
                                        item.value > 50 ? 'bg-primary-500' :
                                            'bg-emerald-500'
                                    }`}
                                style={{ width: `${item.value}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-400">
                            <span>0</span>
                            <span>{item.value}%</span>
                            <span>100</span>
                        </div>
                    </div>

                    {/* Fake Interaction Tooltip */}
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black rounded-lg shadow-xl">
                            DESHABILITADO EN PREVIEW
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PreviewContextCheck;
