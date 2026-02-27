import React from 'react';

interface NewsItem {
    title: string;
    source: string;
    date: string;
    question: string;
}

const PreviewNewsCard: React.FC<{ items: NewsItem[] }> = ({ items }) => {
    return (
        <div className="space-y-6">
            {items.map((news, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row gap-6 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-rose-100">
                                    {news.source}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">Hace {news.date}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight mb-4">
                                {news.title}
                            </h3>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-sm font-bold text-slate-600 mb-4 italic">
                                    "{news.question}"
                                </p>
                                <div className="flex gap-3 h-10 opacity-50">
                                    <button disabled className="flex-1 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                                        En Contra
                                    </button>
                                    <button disabled className="flex-1 bg-white border border-slate-200 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">
                                        De Acuerdo
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-32 h-32 bg-slate-100 rounded-2xl shrink-0 relative overflow-hidden flex items-center justify-center text-slate-300">
                            <span className="material-symbols-outlined text-4xl">news</span>
                        </div>
                    </div>

                    <div className="absolute top-2 right-2">
                        <span className="material-symbols-outlined text-slate-200 text-xl">bookmark</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PreviewNewsCard;
