import React, { useState, useMemo } from 'react';
import BrandLogo from '../../../components/ui/BrandLogo';

import { BattleCategory } from '../types';

export interface DepthOption {
    id: string;
    label: string;
    image_url?: string | null;
    category?: string | BattleCategory;
    type?: "icon" | "image" | "brand" | "text" | undefined;
    battleSlug?: string;
    battleTitle?: string;
    imageUrl?: string | null;
    brand_domain?: string | null;
}

interface ProfundidadSelectorProps {
    options: DepthOption[];
    onSelect: (option: DepthOption) => void;
}

export const ProfundidadSelector: React.FC<ProfundidadSelectorProps> = ({ options, onSelect }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    // Format known category slugs to human-readable text
    const formatCategory = (catRaw: string | BattleCategory | undefined) => {
        if (!catRaw) return 'General';
        const cat = typeof catRaw === 'object' ? catRaw.slug : catRaw;
        const known: Record<string, string> = {
            "salud-clinicas-privadas-scl": "Clínicas Privadas",
            "salud-farmacias-scl": "Farmacias",
        };
        if (known[cat]) return known[cat];
        return cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Filter based on search query
    const filteredOptions = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return options;

        return options.filter(opt => {
            const displayCategory = formatCategory(opt.category || '');
            return opt.label.toLowerCase().includes(query) || displayCategory.toLowerCase().includes(query);
        });
    }, [options, searchQuery]);

    const handleSelectOption = (option: DepthOption) => {
        setSelectedOptionId(option.id);
        // Small delay to show active state before calling onSelect
        setTimeout(() => {
            onSelect(option);
            setSelectedOptionId(null);
        }, 150);
    };

    const totalResults = filteredOptions.length;
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
                        <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 px-3 py-1.5 rounded-full animate-in zoom-in duration-200">
                            {selectedOption.image_url ? (
                                <BrandLogo src={selectedOption.image_url} alt="" variant="catalog" className="!w-4 !h-4 !min-h-0 !min-w-0 !rounded-full !bg-transparent" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-primary-200 flex flex-shrink-0" />
                            )}
                            <span className="text-xs font-bold text-primary-700">{selectedOption.label}</span>
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

            {/* Grid of Results */}
            {totalResults > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-8">
                    {filteredOptions.map(opt => {
                        const isSelected = selectedOptionId === opt.id;
                        return (
                            <button
                                key={opt.id}
                                onClick={() => handleSelectOption(opt)}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all text-center
                                    ${isSelected
                                        ? 'bg-primary-50 border-primary-500 shadow-md ring-2 ring-primary-500/20'
                                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className={`w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center transition-transform ${isSelected ? 'scale-110 shadow-sm bg-white' : 'bg-slate-50 group-hover:scale-105'}`}>
                                    {opt.image_url || opt.imageUrl ? (
                                        <BrandLogo
                                            src={opt.image_url || opt.imageUrl || ""}
                                            alt={opt.label}
                                            variant="depth"
                                            className="!min-h-0 !h-full !w-full mix-blend-multiply"
                                        />
                                    ) : (
                                        <span className="text-xl font-bold text-slate-400">{opt.label.substring(0,2).toUpperCase()}</span>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="w-full">
                                    <h4 className={`font-black text-sm line-clamp-2 leading-tight ${isSelected ? 'text-primary-900' : 'text-slate-800'}`}>
                                        {opt.label}
                                    </h4>
                                </div>

                                {/* Action indicator */}
                                <div className={`mt-2 w-full py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase transition-colors ${isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {isSelected ? 'Seleccionado' : 'Profundizar'}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
