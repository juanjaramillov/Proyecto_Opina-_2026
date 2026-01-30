import React from 'react';
import { FilterState } from './types';

interface ResultsFiltersProps {
    filters: FilterState;
    onFilterChange: (key: keyof FilterState, value: string) => void;
    onReset: () => void;
    onApply: () => void;
}

const ResultsFilters: React.FC<ResultsFiltersProps> = ({
    filters,
    onFilterChange,
    onReset,
    onApply
}) => {
    return (
        <div className="rounded-r2 border border-stroke bg-card-gradient shadow-home-2 p-3.5 relative overflow-hidden mt-3.5">
            <div className="absolute inset-[-1px] pointer-events-none opacity-90 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(560px_260px_at_18%_10%,rgba(20,184,166,.14),transparent_55%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(520px_240px_at_88%_15%,rgba(124,255,234,.10),transparent_58%)]"></div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                    <label className="block text-muted2 text-xs font-bold mb-1.5">Región</label>
                    <select
                        className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none appearance-none"
                        value={filters.region}
                        onChange={(e) => onFilterChange('region', e.target.value)}
                    >
                        <option>RM</option>
                        <option>Valparaíso</option>
                        <option>Biobío</option>
                        <option>La Araucanía</option>
                        <option>Antofagasta</option>
                    </select>
                </div>
                <div>
                    <label className="block text-muted2 text-xs font-bold mb-1.5">Edad</label>
                    <select
                        className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none appearance-none"
                        value={filters.age}
                        onChange={(e) => onFilterChange('age', e.target.value)}
                    >
                        <option>18–24</option>
                        <option>25–34</option>
                        <option>35–44</option>
                        <option>45–54</option>
                        <option>55+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-muted2 text-xs font-bold mb-1.5">Categoría</label>
                    <select
                        className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none appearance-none"
                        value={filters.cat}
                        onChange={(e) => onFilterChange('cat', e.target.value)}
                    >
                        <option>Sociedad</option>
                        <option>Economía</option>
                        <option>Política</option>
                        <option>Ciudad</option>
                    </select>
                </div>
                <div>
                    <label className="block text-muted2 text-xs font-bold mb-1.5">Ventana</label>
                    <select
                        className="w-full py-2.5 px-3 rounded-xl border border-white/14 bg-bg2/45 text-ink font-bold outline-none appearance-none"
                        value={filters.win}
                        onChange={(e) => onFilterChange('win', e.target.value)}
                    >
                        <option>7 días</option>
                        <option>14 días</option>
                        <option>30 días</option>
                        <option>90 días</option>
                    </select>
                </div>
            </div>

            <div className="relative z-10 flex gap-2.5 flex-wrap justify-end mt-2.5">
                <button
                    className="border border-white/14 bg-white/5 text-ink rounded-xl px-3 py-2.5 font-extrabold text-[13px] cursor-pointer transition hover:-translate-y-px hover:bg-white/8"
                    type="button"
                    onClick={onReset}
                >
                    Reset
                </button>
                <button
                    className="border border-primary/35 bg-gradient-to-b from-primary/20 to-primary/10 shadow-home text-ink rounded-xl px-3 py-2.5 font-extrabold text-[13px] cursor-pointer transition hover:-translate-y-px hover:bg-white/8"
                    type="button"
                    onClick={onApply}
                >
                    Aplicar filtros
                </button>
            </div>
        </div>
    );
};

export default ResultsFilters;
