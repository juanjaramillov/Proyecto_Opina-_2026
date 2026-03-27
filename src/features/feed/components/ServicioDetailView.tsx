import { useEffect, useState } from "react";
import { MockService } from "./mockServicios";

interface ServicioDetailViewProps {
    service: MockService;
    onClose: () => void;
}

export default function ServicioDetailView({ service, onClose }: ServicioDetailViewProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Animación in-out casera
    useEffect(() => {
        setIsVisible(true);
        // Prevenir scroll de body cuando el modal está abierto
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Dar tiempo a la animación de slide-down
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
            {/* Backdrop Dimmer */}
            <div 
                className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
                onClick={handleClose} 
            />

            {/* Bottom Sheet / Modal View */}
            <div 
                className={`relative w-full max-w-xl h-[90vh] sm:h-[85vh] bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden transition-transform duration-300 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
            >
                {/* Drag Handle (Mobile) */}
                <div className="w-full flex justify-center pt-3 pb-1 absolute top-0 z-20 sm:hidden" onClick={handleClose}>
                    <div className="w-12 h-1.5 bg-white/50 backdrop-blur-md rounded-full" />
                </div>

                {/* Botón flotante Volver */}
                <button 
                    onClick={handleClose}
                    className="absolute top-4 sm:top-6 left-4 sm:left-6 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/40 transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>

                <button className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-rose-500 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-xl leading-none block">favorite</span>
                </button>

                {/* Hero Image */}
                <div className="relative w-full h-72 sm:h-80 shrink-0 bg-slate-800">
                    <img 
                        src={service.image} 
                        alt={service.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"; }}
                    />
                    {/* Gradiente oscuro mucho más intenso para garantizar la lectura de textos blancos */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                    
                    {/* Header flotando sobre la imagen */}
                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col items-start text-white">
                        <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border border-white/10 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            {service.entityType || 'Servicio Activo'}
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight drop-shadow-xl text-white z-20 relative">{service.name}</h2>
                        <div className="flex flex-wrap items-center gap-2 mt-3 text-sm font-semibold text-white/90">
                            <span className="capitalize">{service.category.replace('_', ' ')}</span>
                            <span className="text-white/40">•</span>
                            <span className="capitalize">{service.subcategory?.replace('_', ' ')}</span>
                            <span className="text-white/40">•</span>
                            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">sell</span> {service.tags.split(" • ")[0]}</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Body */}
                <div className="flex-1 overflow-y-auto w-full hide-scrollbar overscroll-contain pb-24">
                    
                    <div className="p-6 sm:p-8 space-y-8">
                        
                        {/* Highlights & Reputation */}
                        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-stretch">
                            <div className="flex-1 flex flex-col items-center justify-center py-2 border-r border-slate-200/60">
                                <div className="text-3xl font-black text-ink flex items-end gap-1 leading-none">
                                    {service.rating.toFixed(1)} 
                                    <span className="material-symbols-outlined text-amber-400 text-2xl fill-current -mb-0.5">star</span>
                                </div>
                                <span className="text-xs font-bold text-slate-500 mt-2">Satisfacción</span>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-2 border-r border-slate-200/60">
                                <div className="text-2xl font-black text-slate-700 leading-none">
                                    {service.reviews >= 1000 ? (service.reviews/1000).toFixed(1)+'k' : service.reviews}
                                </div>
                                <span className="text-xs font-bold text-slate-500 mt-3">Experiencias</span>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-2">
                                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-lg font-black border ${service.trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' : service.trendDirection === 'down' ? 'bg-rose-50 text-rose-600 border-rose-100/50' : 'bg-slate-50 text-slate-500 border-slate-100/50'}`}>
                                    <span className="material-symbols-outlined text-lg stroke-2">
                                        {service.trendDirection === 'up' ? 'trending_up' : service.trendDirection === 'down' ? 'trending_down' : 'trending_flat'}
                                    </span>
                                    <span>{service.trendValue}</span>
                                </div>
                                <span className="text-xs font-bold text-slate-500 mt-2">Tendencia</span>
                            </div>
                        </div>

                        {/* Acciones Rápidas */}
                        <div className="grid grid-cols-4 gap-3">
                            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
                                <span className="material-symbols-outlined fill-current">support_agent</span>
                                <span className="text-[11px] font-bold text-center leading-tight">Contacto</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined">receipt_long</span>
                                <span className="text-[11px] font-bold text-center leading-tight">Sucursales</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined">public</span>
                                <span className="text-[11px] font-bold text-center leading-tight">Sitio Web</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined">share</span>
                                <span className="text-[11px] font-bold text-center leading-tight">Compartir</span>
                            </button>
                        </div>

                        {/* Recent Community Activity */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-lg font-black text-ink">Evaluación de la Comunidad</h3>
                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700">Explorar</button>
                            </div>
                            
                            <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-col gap-4">
                                {/* Header del Resumen Anónimo */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 shrink-0">
                                            <span className="material-symbols-outlined text-[28px]">group</span>
                                        </div>
                                        <div>
                                            <div className="font-bold text-base text-ink leading-tight">Últimos 10 Usuarios</div>
                                            <div className="text-[11px] text-emerald-600 font-bold tracking-wide uppercase mt-0.5 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                Tendencia Estable
                                            </div>
                                        </div>
                                    </div>
                                    {/* Nota Global Promedio */}
                                    <div className="flex flex-col items-center justify-center bg-indigo-50 text-indigo-700 w-12 h-12 rounded-xl border border-indigo-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wide opacity-80 mb-0.5 leading-none">Prom</span>
                                        <span className="text-base font-black leading-none">{service.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                
                                {/* Señales (Atributos evaluados) */}
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div className="flex flex-col items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100/50">
                                        <span className="material-symbols-outlined text-[24px]">verified_user</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold uppercase opacity-80">Confiabilidad</span>
                                            <span className="text-lg font-black leading-none mt-0.5">{(service.rating > 4 ? 4.8 : 3.8).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-1.5 bg-blue-50 text-blue-700 p-3 rounded-xl border border-blue-100/50">
                                        <span className="material-symbols-outlined text-[24px]">support_agent</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold uppercase opacity-80">Resolución</span>
                                            <span className="text-lg font-black leading-none mt-0.5">{(service.rating > 4 ? 4.5 : 3.2).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center justify-center gap-1.5 bg-slate-50 text-slate-600 p-3 rounded-xl border border-slate-200/50">
                                        <span className="material-symbols-outlined text-[24px]">payments</span>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] font-bold uppercase opacity-80">Cobros</span>
                                            <span className="text-lg font-black leading-none mt-0.5">{(service.rating > 4 ? 4.2 : 2.5).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-8" /> {/* Extra spacing for scrolling past CTA */}
                    </div>
                </div>

                {/* CTA Flotante Anclado Abajo */}
                <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-white via-white to-transparent border-t border-slate-100 z-10 flex">
                    <button 
                        onClick={() => {}}
                        className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-[0_10px_40px_-10px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                        <span className="material-symbols-outlined text-xl">reviews</span>
                         Evaluar este Servicio
                    </button>
                </div>
            </div>
        </div>
    );
}
