import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DepthOption {
    id: string;
    label: string;
    image_url?: string | null;
    category?: string;
    type?: "icon" | "image" | "brand" | "text" | undefined;
}

interface DepthSelectorProps {
    options: DepthOption[];
    onSelect: (option: DepthOption) => void;
}

export const DepthSelector: React.FC<DepthSelectorProps> = ({ options, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    // Group options by their category, defaulting to "General" if not provided
    // Also filter based on search query
    const groupedOptions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        const groups: Record<string, DepthOption[]> = {};

        options.forEach(opt => {
            if (query && !opt.label.toLowerCase().includes(query) && !(opt.category || 'General').toLowerCase().includes(query)) {
                return;
            }

            const category = opt.category || 'General';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(opt);
        });

        // Sort categories alphabetically
        return Object.keys(groups).sort((a, b) => a.localeCompare(b)).reduce((acc, key) => {
            acc[key] = groups[key];
            return acc;
        }, {} as Record<string, DepthOption[]>);
    }, [options, searchQuery]);

    const handleToggleCategory = (category: string) => {
        setExpandedCategory(prev => prev === category ? null : category);
    };

    const handleSelectOption = (opt: DepthOption) => {
        setSelectedOptionId(opt.id);
        // Small delay to show active state before calling onSelect
        setTimeout(() => {
            onSelect(opt);
            setSelectedOptionId(null);
        }, 150);
    };

    const totalResults = Object.values(groupedOptions).reduce((acc, group) => acc + group.length, 0);
    const selectedOption = options.find(o => o.id === selectedOptionId);

    return (
        <div className="w-full flex flex-col space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Search Bar & Summary Header */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm sticky top-0 z-10 flex flex-col gap-4">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        placeholder="Buscar empresa, situación o contexto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    )}
                </div>

                {/* Selected Chip Summary */}
                <div className="flex items-center gap-2 min-h-[32px]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selección:</span>
                    {selectedOption ? (
                        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full animate-in zoom-in duration-200">
                            {selectedOption.image_url ? (
                                <img src={selectedOption.image_url} alt="" className="w-4 h-4 object-contain" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-indigo-200 flex flex-shrink-0" />
                            )}
                            <span className="text-xs font-bold text-indigo-700">{selectedOption.label}</span>
                        </div>
                    ) : (
                        <span className="text-xs font-medium text-slate-400 italic">Ninguna seleccionada</span>
                    )}
                </div>
            </div>

            {/* Empty State */}
            {totalResults === 0 && (
                <div className="bg-white p-10 rounded-xl border border-dashed border-slate-200 text-center flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-2">
                        <span className="material-symbols-outlined text-2xl">search_off</span>
                    </div>
                    <h4 className="text-slate-700 font-bold">No encontramos resultados</h4>
                    <p className="text-slate-400 text-sm max-w-[250px]">Intenta buscar con otros términos o limpia el filtro de búsqueda.</p>
                </div>
            )}

            {/* Accordion List */}
            <div className="space-y-3 pb-8">
                {Object.entries(groupedOptions).map(([category, opts]) => {
                    const isExpanded = expandedCategory === category || (searchQuery.length > 0 && opts.length > 0);

                    return (
                        <div key={category} className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm transition-all">
                            {/* Accordion Header */}
                            <button
                                onClick={() => handleToggleCategory(category)}
                                className={`w-full flex items-center justify-between p-4 transition-colors ${isExpanded ? 'bg-slate-50/50 border-b border-slate-100' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <h3 className="font-black text-slate-800 capitalize tracking-tight">{category}</h3>
                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold">
                                        {opts.length}
                                    </span>
                                </div>
                                <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>

                            {/* Accordion Content */}
                            <AnimatePresence initial={false}>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    >
                                        <div className="p-2 flex flex-col gap-1">
                                            {opts.map(opt => {
                                                const isSelected = selectedOptionId === opt.id;
                                                return (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleSelectOption(opt)}
                                                        className={`w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-all ${isSelected
                                                            ? 'bg-indigo-50 border-indigo-200 shadow-inner'
                                                            : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        {/* Radio Indicator */}
                                                        <div className={`w-4 h-4 rounded-full border flex flex-shrink-0 items-center justify-center transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'}`}>
                                                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full scale-100 animate-in zoom-in" />}
                                                        </div>

                                                        {/* Thumbnail */}
                                                        <div className={`w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center ${isSelected ? 'bg-white' : 'bg-slate-100'}`}>
                                                            {opt.image_url ? (
                                                                <img src={opt.image_url} alt={opt.label} className="w-full h-full object-contain p-1.5" />
                                                            ) : (
                                                                <span className="material-symbols-outlined text-[18px] text-slate-400">image</span>
                                                            )}
                                                        </div>

                                                        {/* Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className={`font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{opt.label}</h4>
                                                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Profundizar</p>
                                                        </div>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
