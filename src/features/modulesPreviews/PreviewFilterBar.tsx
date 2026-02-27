import React from 'react';

import { moduleInterestService } from './moduleInterestService';
import { MODULE_EVENT_TYPES } from '../signals/eventTypes';
import { useParams } from 'react-router-dom';

interface PreviewFilterBarProps {
    categories?: string[];
    communes?: string[];
    placeholder?: string;
}

const PreviewFilterBar: React.FC<PreviewFilterBarProps> = ({
    categories = [],
    communes = [],
    placeholder = "Buscar..."
}) => {
    const { slug } = useParams();

    const trackFilter = (name: string, value: string) => {
        if (!slug) return;

        // Simple session count limit for filters to avoid spam
        const sessionKey = `opina_filter_count:${slug}`;
        const currentCount = parseInt(sessionStorage.getItem(sessionKey) || '0');

        if (currentCount < 10) { // Limiting to 10 events per module per session for now
            moduleInterestService.trackModuleInterestEvent(MODULE_EVENT_TYPES.MODULE_PREVIEW_FILTER_USED, {
                module_key: slug,
                module_slug: slug,
                previewType: "filter_bar",
                source: "coming_soon",
                filter: name,
                value: value
            });
            sessionStorage.setItem(sessionKey, (currentCount + 1).toString());
        }
    };

    return (
        <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder={placeholder}
                        disabled
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 font-medium italic cursor-not-allowed"
                    />
                </div>
                <button
                    onClick={() => trackFilter('search', 'click')}
                    className="px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs cursor-not-allowed border border-slate-200"
                >
                    Filtrar
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {categories.map((cat, i) => (
                    <div key={i} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition cursor-default ${i === 0 ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-400 opacity-60'}`}>
                        {cat}
                    </div>
                ))}
            </div>

            {communes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest self-center mr-2">Cerca de:</span>
                    {communes.slice(0, 4).map((com, i) => (
                        <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[10px] font-bold">
                            {com}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PreviewFilterBar;
