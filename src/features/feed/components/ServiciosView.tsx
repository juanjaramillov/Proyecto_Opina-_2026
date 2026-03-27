import { useState, useEffect } from "react";
import { Battle } from "../../signals/types";

// Taxonomía de Servicios provista
const SERVICE_CATEGORIES = [
    { id: "all", label: "Todos", icon: "widgets", subcategories: [] },
    { 
        id: "telecomunicaciones", 
        label: "Telecomunicaciones", 
        icon: "cell_wifi",
        subcategories: [
            { id: "all_telecom", label: "Todo" },
            { id: "internet_movil", label: "Internet móvil" },
            { id: "internet_hogar", label: "Internet hogar" },
            { id: "plan_movil", label: "Plan móvil" },
            { id: "prepago_movil", label: "Prepago móvil" },
            { id: "telefonia_fija", label: "Telefonía fija" },
            { id: "tv_paga", label: "TV paga" },
            { id: "pack_hogar", label: "Pack hogar" },
            { id: "fibra_optica", label: "Fibra óptica" },
            { id: "soluciones_empresa", label: "Soluciones Empresas" },
            { id: "telefonia_ip", label: "Telefonía IP" },
            { id: "internet_satelital", label: "Internet satelital" }
        ]
    },
    { 
        id: "financieros", 
        label: "Financieros", 
        icon: "account_balance",
        subcategories: [
            { id: "all_fin", label: "Todo" },
            { id: "banco", label: "Banco" },
            { id: "cuenta_corriente", label: "Cuenta corriente" },
            { id: "tarjeta_credito", label: "Tarjeta de crédito" },
            { id: "credito_consumo", label: "Crédito de consumo" },
            { id: "credito_hipotecario", label: "Crédito hipotecario" },
            { id: "credito_automotriz", label: "Crédito automotriz" },
            { id: "inversion", label: "Inversión y Mutuos" },
            { id: "fintech", label: "Fintech" },
            { id: "billetera_digital", label: "Billetera digital" },
            { id: "casas_cambio", label: "Casas de cambio" },
            { id: "factoring", label: "Factoring" },
            { id: "criptomonedas", label: "Criptomonedas" }
        ]
    },
    { 
        id: "salud_prevision", 
        label: "Salud y Previsión", 
        icon: "medical_services",
        subcategories: [
            { id: "all_salud", label: "Todo" },
            { id: "isapre", label: "Isapre" },
            { id: "fonasa", label: "Fonasa" },
            { id: "afp", label: "AFP" },
            { id: "clinica", label: "Clínica" },
            { id: "centro_medico", label: "Centro médico" },
            { id: "laboratorio", label: "Laboratorio" },
            { id: "telemedicina", label: "Telemedicina" },
            { id: "farmacia", label: "Farmacia" },
            { id: "dental", label: "Clínica Dental" },
            { id: "optica", label: "Óptica" },
            { id: "rehabilitacion", label: "Centros de Rehabilitación" },
            { id: "salud_mental", label: "Salud Mental" }
        ]
    },
    { 
        id: "seguros", 
        label: "Seguros", 
        icon: "health_and_safety",
        subcategories: [
            { id: "all_seguros", label: "Todo" },
            { id: "seguro_automotriz", label: "Seguro automotriz" },
            { id: "seguro_salud", label: "Seguro de salud" },
            { id: "seguro_complementario", label: "Seguro complementario" },
            { id: "seguro_vida", label: "Seguro de vida" },
            { id: "seguro_hogar", label: "Seguro de hogar" },
            { id: "seguro_viajes", label: "Seguro de viajes" },
            { id: "seguro_mascotas", label: "Seguro para mascotas" },
            { id: "seguro_fraude", label: "Seguro contra fraudes" },
            { id: "soap", label: "SOAP" }
        ]
    },
    { 
        id: "basicos", 
        label: "Servicios Básicos", 
        icon: "home_work",
        subcategories: [
            { id: "all_basicos", label: "Todo" },
            { id: "electricidad", label: "Electricidad" },
            { id: "agua", label: "Agua y saneamiento" },
            { id: "gas", label: "Gas de cañería" },
            { id: "gas_cilindro", label: "Gas licuado / cilindro" },
            { id: "recoleccion_basura", label: "Recolección de basura" },
            { id: "calefaccion", label: "Calefacción central" }
        ]
    },
    { 
        id: "transporte", 
        label: "Transporte", 
        icon: "directions_car",
        subcategories: [
            { id: "all_transporte", label: "Todo" },
            { id: "app_transporte", label: "App de movilidad" },
            { id: "radio_taxi", label: "Taxi / radio taxi" },
            { id: "buses_interurbanos", label: "Buses interurbanos" },
            { id: "pasajes_aereos", label: "Aerolíneas" },
            { id: "trenes", label: "Trenes y ferrocarriles" },
            { id: "rent_a_car", label: "Rent a car" },
            { id: "car_sharing", label: "Car sharing" },
            { id: "scooters", label: "Scooters / Bicis compartidas" }
        ]
    },
    { 
        id: "delivery", 
        label: "Delivery y Envíos", 
        icon: "local_shipping",
        subcategories: [
            { id: "all_delivery", label: "Todo" },
            { id: "delivery_comida", label: "Delivery de comida" },
            { id: "delivery_super", label: "Delivery de supermercado / farmacia" },
            { id: "envios_express", label: "Envíos express urbanos" },
            { id: "courier", label: "Courier y Encomiendas nacionales" },
            { id: "casillas_miami", label: "Casillas / Compras internacionales" },
            { id: "mudanzas", label: "Mudanzas" }
        ]
    },
    { 
        id: "educacion", 
        label: "Educación", 
        icon: "school",
        subcategories: [
            { id: "all_edu", label: "Todo" },
            { id: "universidad", label: "Universidad" },
            { id: "instituto", label: "Instituto profesional / CFT" },
            { id: "colegios", label: "Colegios" },
            { id: "preuniversitarios", label: "Preuniversitarios" },
            { id: "cursos_online", label: "Plataformas de cursos online" },
            { id: "idiomas", label: "Academias de idiomas" },
            { id: "postgrados", label: "Postgrados y Educación Continua" },
            { id: "conduccion", label: "Escuelas de conductores" }
        ]
    },
    { 
        id: "entretenimiento", 
        label: "Entretenimiento", 
        icon: "subscriptions",
        subcategories: [
            { id: "all_ent", label: "Todo" },
            { id: "streaming_video", label: "Streaming video" },
            { id: "streaming_musica", label: "Streaming música" },
            { id: "gaming", label: "Gaming por suscripción" },
            { id: "entradas_eventos", label: "Ticketera / Eventos" },
            { id: "cines", label: "Cines" },
            { id: "gimnasios", label: "Gimnasios y Centros deportivos" },
            { id: "apuestas", label: "Apuestas online / Casinos" }
        ]
    },
    { 
        id: "turismo", 
        label: "Turismo y Hospedaje", 
        icon: "flight_takeoff",
        subcategories: [
            { id: "all_tur", label: "Todo" },
            { id: "agencia_viajes", label: "Agencia de viajes" },
            { id: "reserva_hoteles", label: "Reserva de alojamientos" },
            { id: "asistencia_viajes", label: "Asistencia en viajes" },
            { id: "tours_locales", label: "Tours y actividades" },
            { id: "cruceros", label: "Cruceros" }
        ]
    },
    { 
        id: "profesionales", 
        label: "Profesionales y B2B", 
        icon: "work",
        subcategories: [
            { id: "all_prof", label: "Todo" },
            { id: "consultoria", label: "Consultoría" },
            { id: "agencia_marketing", label: "Agencia de marketing" },
            { id: "cowork", label: "Cowork y Oficinas flexibles" },
            { id: "contabilidad", label: "Asesoría contable" },
            { id: "legal", label: "Estudio jurídico" },
            { id: "hosting", label: "Hosting y Dominios" },
            { id: "software_empresa", label: "Software empresarial (ERP, RRHH)" }
        ]
    },
    { 
        id: "hogar", 
        label: "Para el Hogar", 
        icon: "cleaning_services",
        subcategories: [
            { id: "all_hogar", label: "Todo" },
            { id: "seguridad_alarmas", label: "Seguridad / alarmas" },
            { id: "aseo", label: "Aseo doméstico" },
            { id: "reparaciones", label: "Reparaciones (gasfitería, electricidad)" },
            { id: "lavanderia", label: "Lavandería y Tintorería" },
            { id: "jardineria", label: "Jardinería y Paisajismo" },
            { id: "remodelaciones", label: "Remodelaciones y Construcción" },
            { id: "control_plagas", label: "Control de plagas" }
        ]
    }
];

import { MockService } from "./mockServicios";
import { signalService } from "../../signals/services/signalService";
import ServicioDetailView from "./ServicioDetailView";

interface ServiciosViewProps {
    battles?: Battle[];
    onClose: () => void;
}

export default function ServiciosView({ onClose }: ServiciosViewProps) {
    const [activeFilter, setActiveFilter] = useState("all");
    const [activeSubfilter, setActiveSubfilter] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
    const [services, setServices] = useState<MockService[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            setIsLoading(true);
            try {
                const data = await signalService.getEntitiesByModule('is_active_servicio');
                const mappedServices: MockService[] = data.map((entity: any) => {
                    const meta = typeof entity.metadata === 'object' ? entity.metadata || {} : {};
                    return {
                        id: entity.id,
                        name: entity.name,
                        image: entity.image_url || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800",
                        entityType: meta.entityType ? String(meta.entityType) : "Servicio",
                        rating: meta.rating ? Number(meta.rating) : 4.4,
                        reviews: meta.reviews ? Number(meta.reviews) : 850,
                        trendValue: meta.trendValue ? String(meta.trendValue) : "Estable",
                        trendDirection: (meta.trendDirection as 'up'|'down'|'neutral') || 'neutral',
                        category: entity.category?.toLowerCase() || "telecomunicaciones",
                        subcategory: meta.subcategory ? String(meta.subcategory) : "all_telecom",
                        tags: meta.tags ? String(meta.tags) : "Popular"
                    };
                });
                setServices(mappedServices);
            } catch (err) {
                console.error("Failed to load services", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchServices();
    }, []);

    const activeCategoryDef = SERVICE_CATEGORIES.find(c => c.id === activeFilter);
    const hasSubcategories = activeCategoryDef?.subcategories && activeCategoryDef.subcategories.length > 0;

    const handleCategoryClick = (catId: string) => {
        setActiveFilter(catId);
        // Si la categoría tiene subcategorías, preseleccionar 'all_...'
        const catDef = SERVICE_CATEGORIES.find(c => c.id === catId);
        if (catDef?.subcategories && catDef.subcategories.length > 0) {
            setActiveSubfilter(catDef.subcategories[0].id);
        } else {
            setActiveSubfilter(null);
        }
    };

    const filteredServices = services.filter(service => {
        // Filtrar por categoría principal
        const matchesCat = activeFilter === "all" || service.category === activeFilter;
        // Filtrar por subcategoría si hay una activa (y que no empiece con "all_" para no excluir el "Todo")
        const matchesSubcat = !activeSubfilter || activeSubfilter.startsWith("all_") || service.subcategory === activeSubfilter;
        
        const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSubcat && matchesSearch;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[400px]">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                <h3 className="text-xl font-black text-slate-800">Cargando servicios...</h3>
            </div>
        );
    }

    return (
        <div className="space-y-8 flex flex-col animate-in fade-in duration-500 w-full mb-24">
            
            {/* Header del Componente */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 md:p-10 relative overflow-hidden">
                {/* Background Decorativo */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                    <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br transition-all duration-700 from-indigo-100 to-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2`} />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
                    <div className="absolute top-0 left-0">
                        <button onClick={onClose} className="p-2 sm:hidden bg-white/50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500">
                             <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </button>
                    </div>
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 shadow-inner">
                        <span className="material-symbols-outlined text-4xl">storefront</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tight">
                        Explora <span className="text-indigo-600">Servicios</span>
                    </h2>
                    <p className="text-slate-500 font-medium max-w-2xl mx-auto">
                        Evalúa y compara proveedores, suscripciones y entidades de todas las áreas.
                    </p>

                    {/* Barra de Búsqueda */}
                    <div className="mt-8 relative max-w-xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50/50 border border-slate-200 text-ink rounded-full py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400 shadow-sm"
                            placeholder="Buscar internet, bancos, isapres..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Listado Principal */}
            <div className="max-w-5xl xl:max-w-6xl mx-auto w-full space-y-4">
                
                {/* Capa Principal: Filtros de Categorías */}
                <div className="flex flex-wrap pb-2 gap-3 px-2">
                    {SERVICE_CATEGORIES.map(cat => (
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

                {/* Capa Intermedia: Subcategorías */}
                {hasSubcategories && (
                    <div className="flex flex-wrap pb-4 gap-2 px-2 animate-in slide-in-from-top-2 fade-in duration-300">
                        {activeCategoryDef.subcategories.map(subcat => (
                            <button
                                key={subcat.id}
                                onClick={() => setActiveSubfilter(subcat.id)}
                                className={`px-4 py-1.5 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-sm
                                    ${activeSubfilter === subcat.id 
                                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-500/50' 
                                        : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                    }`}
                            >
                                {subcat.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid de Resultados */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-2 md:px-0">
                    {filteredServices.length > 0 ? (
                        filteredServices.map(service => (
                            <div 
                                key={service.id} 
                                onClick={() => setSelectedServiceId(service.id)}
                                className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col"
                            >
                                {/* Imagen Superior */}
                                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-slate-800">
                                    <img 
                                        src={service.image} 
                                        alt={service.name} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"; }}
                                    />
                                    
                                    {/* Gradiente para resaltar insignias en la parte superior e inferior */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

                                    {/* Action Header on Image */}
                                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                                        <button className="p-2.5 bg-white/90 hover:bg-white backdrop-blur-md rounded-full text-slate-700 hover:text-rose-500 transition-colors shadow-sm">
                                            <span className="material-symbols-outlined text-[20px] leading-none block">bookmark</span>
                                        </button>
                                    </div>
                                    <div className="absolute bottom-4 left-4 z-10">
                                        <div className="flex items-center gap-1 bg-white/95 backdrop-blur-sm text-ink px-2.5 py-1.5 rounded-xl font-bold text-xs shadow-md ring-1 ring-black/10 tracking-widest uppercase">
                                            {service.entityType || 'Servicio'}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Contenido Inferior */}
                                <div className="p-5 flex flex-col flex-grow relative">
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <h3 className="text-[1.35rem] leading-tight font-black text-ink group-hover:text-indigo-600 transition-colors line-clamp-1">{service.name}</h3>
                                        <div className="flex flex-col items-end gap-1 shrink-0 relative">
                                            <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg border border-amber-100/50 w-full justify-center">
                                                <span className="material-symbols-outlined text-[16px] text-amber-500 fill-current">star</span>
                                                <span className="text-sm font-bold">{service.rating.toFixed(1)}</span>
                                                <span className="text-[10px] text-amber-600/70 font-semibold absolute -top-2.5 -right-2 bg-white rounded-full px-1.5 shadow-sm border border-slate-100">
                                                    +{service.reviews >= 1000 ? (service.reviews/1000).toFixed(1)+'k' : service.reviews}
                                                </span>
                                            </div>
                                            {service.trendDirection && (
                                                <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${service.trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : service.trendDirection === 'down' ? 'bg-rose-50 text-rose-600 border-rose-100/50' : 'bg-slate-50 text-slate-500 border-slate-100/50'}`}>
                                                    <span className="material-symbols-outlined text-[12px] stroke-2">
                                                        {service.trendDirection === 'up' ? 'trending_up' : service.trendDirection === 'down' ? 'trending_down' : 'trending_flat'}
                                                    </span>
                                                    <span>{service.trendValue}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-500 mb-5">
                                        <span className="capitalize">{service.category.replace('_', ' ')}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-400 truncate">{service.tags}</span>
                                    </div>
                    
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full">
                                            Ver análisis
                                            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                                        </span>
                                        
                                        <div className="flex -space-x-2 mr-2">
                                            <img className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-slate-100" src="https://i.pravatar.cc/100?img=11" alt="avatar" />
                                            <img className="w-7 h-7 rounded-full border-2 border-white ring-1 ring-slate-100" src="https://i.pravatar.cc/100?img=12" alt="avatar" />
                                            <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                                                +{Math.floor(service.reviews / 100)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-16 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3 block">search_off</span>
                            <h3 className="text-xl font-black text-slate-600">No encontramos servicios</h3>
                            <p className="text-sm font-medium text-slate-400 mt-2 max-w-sm mx-auto">Intenta con otra búsqueda o prueba seleccionando otra categoría arriba.</p>
                        </div>
                    )}
                </div>

            </div>

            {/* Modal / Ficha de Detalles */}
            {selectedServiceId && (
                <ServicioDetailView 
                    service={services.find(p => p.id === selectedServiceId) as MockService} 
                    onClose={() => setSelectedServiceId(null)} 
                />
            )}

        </div>
    );
}
