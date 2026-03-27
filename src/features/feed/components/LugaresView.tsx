import { useState, useEffect } from "react";
import { Battle } from "../../signals/types";

// Simulación de los badges para fitrar tipos de lugares
const PLACE_CATEGORIES = [
    { id: "all", label: "Todos", icon: "public", subcategories: [] },
    { 
        id: "restaurants", 
        label: "Restaurantes", 
        icon: "restaurant",
        subcategories: [
            { id: "all_rest", label: "Todo" },
            { id: "sushi", label: "Sushi" },
            { id: "pizza", label: "Pizza" },
            { id: "burger", label: "Hamburguesas" },
            { id: "sandwich", label: "Sánguches" },
            { id: "chilean", label: "Chilena" },
            { id: "mexican", label: "Mexicana" },
            { id: "peruvian", label: "Peruana" },
            { id: "grill", label: "Carnes" }
        ]
    },
    { 
        id: "parks", 
        label: "Parques", 
        icon: "park",
        subcategories: [
            { id: "all_parks", label: "Todo" },
            { id: "dog_park", label: "Para Perros" },
            { id: "hiking", label: "Senderismo" },
            { id: "kids", label: "Juegos Infantiles" }
        ]
    },
    { 
        id: "shopping", 
        label: "Malls y Tiendas", 
        icon: "shopping_bag",
        subcategories: [] 
    },
    { 
        id: "cafes", 
        label: "Cafeterías", 
        icon: "local_cafe",
        subcategories: [
            { id: "all_cafes", label: "Todo" },
            { id: "specialty", label: "Especialidad" },
            { id: "bakery", label: "Pastelería" },
            { id: "work", label: "Para Trabajar" }
        ]
    },
];

import { signalService } from "../../signals/services/signalService";
import LugarDetailView, { Place } from "./LugarDetailView";

interface LugaresViewProps {
    battles: Battle[];
    onClose: () => void;
}

export default function LugaresView({ onClose }: LugaresViewProps) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [activeSubfilter, setActiveSubfilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlaces = async () => {
            setIsLoading(true);
            try {
                const data = await signalService.getEntitiesByModule('is_active_lugar');
                const mappedPlaces: Place[] = data.map((entity: any) => {
                    const meta = typeof entity.metadata === 'object' ? entity.metadata || {} : {};
                    return {
                        id: entity.id,
                        name: entity.name,
                        image: entity.image_url || "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800",
                        distance: meta.distance ? String(meta.distance) : "1.2 km",
                        rating: meta.rating ? Number(meta.rating) : 4.8,
                        reviews: meta.reviews ? Number(meta.reviews) : 1245,
                        trendValue: meta.trendValue ? String(meta.trendValue) : "Tendencia Local",
                        trendDirection: (meta.trendDirection as 'up'|'down'|'neutral') || 'up',
                        category: entity.category?.toLowerCase() || "restaurants",
                        subcategory: meta.subcategory ? String(meta.subcategory) : "all_rest",
                        tags: meta.tags ? String(meta.tags) : "Popular"
                    };
                });
                setPlaces(mappedPlaces);
            } catch (err) {
                console.error("Failed to load places", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlaces();
    }, []);

    const activeCategoryDef = PLACE_CATEGORIES.find(c => c.id === activeFilter);
    const hasSubcategories = activeCategoryDef?.subcategories && activeCategoryDef.subcategories.length > 0;

    const handleCategoryClick = (catId: string) => {
        setActiveFilter(catId);
        // Si la categoría tiene subcategorías, preseleccionar 'all_...' o limpiarla, 
        // aquí usamos null para indicar "todos dentro de la categoría" o seleccionamos la opción 0 si es un 'All' explicito.
        const catDef = PLACE_CATEGORIES.find(c => c.id === catId);
        if (catDef?.subcategories && catDef.subcategories.length > 0) {
            setActiveSubfilter(catDef.subcategories[0].id);
        } else {
            setActiveSubfilter(null);
        }
    };

    const filteredPlaces = places.filter(place => {
        // Filtrar por categoría principal
        const matchesCat = activeFilter === "all" || place.category === activeFilter;
        // Filtrar por subcategoría si hay una activa (y que no empiece con "all_" para no excluir el "Todo")
        const matchesSubcat = !activeSubfilter || activeSubfilter.startsWith("all_") || place.subcategory === activeSubfilter;
        
        const matchesSearch = place.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSubcat && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-black text-slate-800">Cargando lugares...</h3>
            </div>
        );
    }

    return (
        <div className="space-y-8 flex flex-col animate-in fade-in duration-500 w-full mb-24">
            
            {/* Header del Componente */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 relative overflow-hidden">
                {/* Background Decorativo */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 from-blue-100 to-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
                    <div className="absolute top-0 left-0">
                        <button onClick={onClose} className="p-2 sm:hidden bg-white/50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                             <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 shadow-inner">
                        <span className="material-symbols-outlined text-4xl">location_on</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tight">
                        Explora <span className="text-blue-600">Lugares</span>
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                        Descubre los espacios mejor valorados por la comunidad a tu alrededor.
                    </p>

                    {/* Barra de Búsqueda */}
                    <div className="mt-8 relative max-w-xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50/50 border border-slate-200 text-ink rounded-full py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400 shadow-sm"
                            placeholder="Buscar un parque, restaurante, mall..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Listado Principal */}
            <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4">
                
                {/* Capa Principal: Filtros de Categorías */}
                <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar px-2">
                    {PLACE_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all shadow-sm
                                ${activeFilter === cat.id 
                                    ? 'bg-ink text-white shadow-md scale-105' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Capa Intermedia: Subcategorías (Ej. Tipos de Comida) */}
                {hasSubcategories && (
                    <div className="flex overflow-x-auto pb-4 gap-2 hide-scrollbar px-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        {activeCategoryDef.subcategories.map(subcat => (
                            <button
                                key={subcat.id}
                                onClick={() => setActiveSubfilter(subcat.id)}
                                className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm
                                    ${activeSubfilter === subcat.id 
                                        ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/50' 
                                        : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                {subcat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid de Resultados estilo UberEats / Delivery App */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2 md:px-0">
                    {filteredPlaces.length > 0 ? (
                        filteredPlaces.map(place => (
                            <div 
                                key={place.id} 
                                onClick={() => setSelectedPlaceId(place.id)}
                                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col"
                            >
                                {/* Imagen Superior */}
                                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-800">
                                    <img 
                                        src={place.image} 
                                        alt={place.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800"; }}
                                    />
                                    
                                    {/* Gradiente para resaltar insignias en la parte superior e inferior */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

                                    {/* Action Header on Image */}
                                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                                        <button className="p-2.5 bg-white/90 hover:bg-white backdrop-blur-md rounded-full text-slate-700 hover:text-rose-500 transition-colors shadow-sm">
                                            <span className="material-symbols-outlined text-[20px] leading-none block">favorite</span>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-10">
                                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-ink px-2.5 py-1.5 rounded-xl font-bold text-sm shadow-md ring-1 ring-black/10">
                                            {place.distance}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Contenido Inferior */}
                                <div className="p-5 flex flex-col flex-grow relative">
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <h3 className="text-[1.35rem] leading-tight font-black text-ink group-hover:text-blue-600 transition-colors line-clamp-1">{place.name}</h3>
                                        <div className="flex flex-col items-end gap-1 shrink-0 relative">
                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100/50 w-full justify-center">
                                                <span className="material-symbols-outlined text-[16px] text-amber-500 fill-current">star</span>
                                                <span className="text-sm font-bold">{place.rating}</span>
                                                <span className="text-[10px] text-amber-600/70 font-semibold absolute -top-2.5 -right-2 bg-white rounded-full px-1.5 shadow-sm border border-slate-100">
                                                    +{place.reviews >= 1000 ? (place.reviews/1000).toFixed(1)+'k' : place.reviews}
                                                </span>
                                            </div>
                                            {place.trendDirection && (
                                                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${place.trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : place.trendDirection === 'down' ? 'bg-rose-50 text-rose-600 border-rose-100/50' : 'bg-slate-50 text-slate-500 border-slate-100/50'}`}>
                                                    <span className="material-symbols-outlined text-[12px] stroke-2">
                                                        {place.trendDirection === 'up' ? 'trending_up' : place.trendDirection === 'down' ? 'trending_down' : 'trending_flat'}
                                                    </span>
                                                    <span>{place.trendValue}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 mb-5">
                                        <span>{PLACE_CATEGORIES.find(c => c.id === place.category)?.label || place.category}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-400">{place.tags}</span>
                                    </div>
                    
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Abierto ahora
                                        </span>
                                        
                                        <div className="flex -space-x-2 mr-2">
                                            <img className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-slate-100" src="https://i.pravatar.cc/100?img=1" alt="avatar" />
                                            <img className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-slate-100" src="https://i.pravatar.cc/100?img=2" alt="avatar" />
                                            <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                                                +8
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">sentiment_dissatisfied</span>
                            <h3 className="text-xl font-black text-slate-600">No encontramos lugares</h3>
                            <p className="text-sm font-medium text-slate-400 mt-2 max-w-sm mx-auto">Intenta con otra búsqueda o prueba seleccionando otra categoría arriba.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal / Ficha de Detalles del Lugar */}
            {selectedPlaceId && (
                <LugarDetailView 
                    place={places.find(p => p.id === selectedPlaceId) as Place} 
                    onClose={() => setSelectedPlaceId(null)} 
                />
            )}

        </div>
    );
}
