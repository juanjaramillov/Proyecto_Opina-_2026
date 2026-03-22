import { Layers, MapPin, TrendingUp, Building, ShoppingBag, Activity, Sparkles, Globe } from 'lucide-react';

const CATEGORIAS = [
    { id: "Todos", icon: Layers },
    { id: "País", icon: MapPin },
    { id: "Internacional", icon: Globe },
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
    <div className="mb-4 pb-2 pt-2">
      <div className="flex flex-wrap gap-2 sm:gap-3">
          {CATEGORIAS.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                  <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold transition-all transform hover:-translate-y-0.5 sm:hover:-translate-y-1 ${
                          isSelected
                              ? 'bg-gradient-brand text-white shadow-md'
                              : 'bg-white border-2 border-slate-100/80 text-slate-500 hover:border-slate-200 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                      <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      {cat.id}
                  </button>
              );
          })}
      </div>
    </div>
  );
}
