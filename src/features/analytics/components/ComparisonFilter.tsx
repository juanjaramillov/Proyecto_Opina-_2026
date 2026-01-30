import { useState } from "react";


export type FilterState = {
    age: string;
    gender: string;
    region: string;
};

interface ComparisonFilterProps {
    onChange: (filters: FilterState) => void;
}

const AGES = ["Todos", "18-24", "25-34", "35-50", "50+"];
const GENDERS = ["Todos", "Mujeres", "Hombres", "NB"];
const REGIONS = ["Todas", "RM", "Norte", "Sur", "Centro"];

export default function ComparisonFilter({ onChange }: ComparisonFilterProps) {
    const [filters, setFilters] = useState<FilterState>({
        age: "Todos",
        gender: "Todos",
        region: "Todas"
    });


    const handleSelect = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onChange(newFilters);
    };

    // Calculate active filter count text
    const activeCount = Object.values(filters).filter(v => !["Todos", "Todas"].includes(v)).length;

    return (
        <div className="relative z-20 w-full max-w-4xl mx-auto">
            <div className="relative bg-surface rounded-2xl border border-stroke shadow-card p-6 md:p-8">

                {/* Header Section */}
                <div className="flex items-center justify-between mb-8 border-b border-stroke pb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full bg-slate-100 text-ink`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-ink leading-tight">
                                Configurar Comparativa
                            </h3>
                            <p className="text-sm text-text-secondary font-medium">
                                Filtra para comparar tu opinión con un grupo específico.
                            </p>
                        </div>
                    </div>
                    {activeCount > 0 && (
                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                            {activeCount} Filtros Activos
                        </div>
                    )}
                </div>

                {/* Filter Controls Grid */}
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Age Filter */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-ink flex items-center gap-2">
                            🎂 Rango Etario
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AGES.map(age => (
                                <button
                                    key={age}
                                    onClick={() => handleSelect('age', age)}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${filters.age === age
                                        ? 'bg-primary text-white shadow-md transform scale-105'
                                        : 'bg-white border border-stroke text-text-secondary hover:border-primary/30 hover:bg-slate-50'
                                        }`}
                                >
                                    {age}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gender Filter */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-ink flex items-center gap-2">
                            ⚧ Género
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {GENDERS.map(g => (
                                <button
                                    key={g}
                                    onClick={() => handleSelect('gender', g)}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${filters.gender === g
                                        ? 'bg-accent text-white shadow-md transform scale-105'
                                        : 'bg-white border border-stroke text-text-secondary hover:border-accent/30 hover:bg-slate-50'
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Region Filter */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-ink flex items-center gap-2">
                            📍 Zona Geográfica
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {REGIONS.map(r => (
                                <button
                                    key={r}
                                    onClick={() => handleSelect('region', r)}
                                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${filters.region === r
                                        ? 'bg-indigo-600 text-white shadow-md transform scale-105'
                                        : 'bg-white border border-stroke text-text-secondary hover:border-indigo-400/30 hover:bg-slate-50'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-stroke flex justify-between items-center">
                    <button
                        onClick={() => {
                            setFilters({ age: "Todos", gender: "Todos", region: "Todas" });
                            onChange({ age: "Todos", gender: "Todos", region: "Todas" });
                        }}
                        className="text-sm text-text-muted hover:text-danger font-bold uppercase tracking-wider px-2"
                    >
                        Resetear Todo
                    </button>
                </div>
            </div>
        </div>
    );
}
