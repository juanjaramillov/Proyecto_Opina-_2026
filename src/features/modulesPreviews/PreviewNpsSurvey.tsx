import React from 'react';

interface PreviewNpsSurveyProps {
    question: string;
    followUps: Array<{ question: string; placeholder?: string; options?: string[] }>;
}

const PreviewNpsSurvey: React.FC<PreviewNpsSurveyProps> = ({ question, followUps }) => {
    return (
        <div className="max-w-2xl mx-auto space-y-12">
            <div>
                <h3 className="text-2xl font-black text-slate-900 text-center mb-8 leading-tight">
                    {question}
                </h3>
                <div className="flex justify-between items-center gap-1 md:gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <button
                            key={n}
                            disabled
                            className={`flex-1 h-12 md:h-16 rounded-xl md:rounded-2xl border font-black text-xs md:text-lg transition-all opacity-40 cursor-not-allowed
                                ${n <= 6 ? 'bg-rose-50 border-rose-100 text-rose-500' :
                                    n <= 8 ? 'bg-amber-50 border-amber-100 text-amber-500' :
                                        'bg-emerald-50 border-emerald-100 text-emerald-500'}`}
                        >
                            {n}
                        </button>
                    ))}
                </div>
                <div className="flex justify-between mt-4 px-2">
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Poco Probable</span>
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Muy Probable</span>
                </div>
            </div>

            <div className="space-y-8 pt-8 border-t border-slate-100">
                {followUps.map((f, i) => (
                    <div key={i} className="opacity-30 pointer-events-none">
                        <label className="block text-sm font-black text-slate-800 mb-4">{f.question}</label>
                        {f.options ? (
                            <div className="flex flex-wrap gap-2">
                                {f.options.map(opt => (
                                    <div key={opt} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                placeholder={f.placeholder}
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 italic text-sm"
                            />
                        )}
                    </div>
                ))}
            </div>

            <button disabled className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest opacity-20 cursor-not-allowed">
                Siguiente
            </button>
        </div>
    );
};

export default PreviewNpsSurvey;
