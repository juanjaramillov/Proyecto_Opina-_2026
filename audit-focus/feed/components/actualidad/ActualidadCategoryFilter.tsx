import { Layers, MapPin, TrendingUp, Building, ShoppingBag, Activity, Sparkles } from 'lucide-react';

const CATEGORIAS = [
    { id: "Todos", icon: Layers },
    { id: "País", icon: MapPin },
    { id: "Economía", icon: TrendingUp },
    { id: "Ciudad / Vida diaria", icon: Building },
    { id: "Marcas y Consumo", icon: ShoppingBag },
    { id: "Deportes y Cultura", icon: Activity },
    { id: "Tendencias y Sociedad", icon: Sparkles }
];

interface ActualidadCategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

export function ActualidadCategoryFilter({ selectedCategory, setSelectedCategory }: ActualidadCategoryFilterProps) {
  return (
    <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto no-scrollbar pb-2 pt-2">
      <div className="flex gap-3">
          {CATEGORIAS.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                  <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`whitespace-nowrap flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all transform hover:-translate-y-1 ${
                          isSelected
                              ? 'bg-gradient-brand text-white shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)]'
                              : 'bg-white border-2 border-slate-100 text-slate-500 hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-primary)] hover:shadow-sm'
                      }`}
                  >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      {cat.id}
                  </button>
              );
          })}
      </div>
    </div>
  );
}
