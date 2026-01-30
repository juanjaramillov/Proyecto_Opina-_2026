import { useState } from "react";
import SignalToast from "../../../components/ui/SignalToast";

export default function Places() {
    const [showToast, setShowToast] = useState(false);

    const handleRate = () => {
        setShowToast(true);
    };

    return (
        <div className="max-w-4xl mx-auto pb-12 px-4 space-y-8 min-h-screen">
            {/* Premium Header Hero */}
            <style>{`
        .op-hero-bg {
          background:
            radial-gradient(800px circle at 50% 10%, rgba(99,102,241,.18), transparent 45%),
            radial-gradient(700px circle at 10% 40%, rgba(251,191,36,.15), transparent 45%), /* Amber for Places */
            radial-gradient(700px circle at 90% 40%, rgba(236,72,153,.10), transparent 45%),
            linear-gradient(180deg, rgba(15,23,42,.02), rgba(15,23,42,.00));
        }
        .op-grid {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
        }
        .op-grid:before {
          content: "";
          position: absolute;
          inset: -2px;
          background: linear-gradient(90deg, rgba(99,102,241,.25), rgba(251,191,36,.25), rgba(236,72,153,.18));
          filter: blur(18px);
          opacity: .45;
          transform: translate3d(0,0,0);
          animation: opGlow 10s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes opGlow {
          0% { transform: translateX(-6%); opacity: .35; }
          50% { transform: translateX(6%); opacity: .55; }
          100% { transform: translateX(-6%); opacity: .35; }
        }
            `}</style>

            <div className="mt-6 op-grid border border-stroke bg-surface shadow-premium">
                <div className="absolute inset-0 op-hero-bg pointer-events-none" />
                <div className="relative z-10 p-8 md:p-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 border border-stroke shadow-sm mb-5 backdrop-blur-sm">
                        <span className="text-xl">🗺️</span>
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">Modo Exploración</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-ink mb-4 leading-tight">
                        El mapa no es el territorio.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-500">Es la opinión de todos.</span>
                    </h1>
                    <p className="text-lg text-text-secondary max-w-xl mx-auto font-medium">
                        Encuentra la verdad sobre los lugares que visitas o deja tu señal para guiar a otros.
                    </p>
                </div>
            </div>

            {/* Main Action Area */}
            <div className="grid md:grid-cols-2 gap-6">

                {/* Search Card */}
                <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-card border border-stroke hover:shadow-premium transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                        🔍
                    </div>
                    <h2 className="text-xl font-bold text-ink mb-2">Explorar Lugares y Servicios</h2>
                    <p className="text-sm text-text-secondary mb-6">
                        Verifica la calidad de servicio, tiempos de espera y experiencias reales.
                    </p>

                    <div className="relative group/input">
                        <input
                            type="text"
                            placeholder="Buscar restaurante, tienda..."
                            className="w-full bg-surface2 border-2 border-transparent focus:border-primary/20 rounded-xl px-4 py-4 text-base outline-none transition-all placeholder:text-text-muted"
                        />
                        <div className="absolute right-3 top-3 p-1.5 bg-white rounded-lg shadow-sm text-text-muted">
                            ⌘K
                        </div>
                    </div>
                </div>

                {/* Contribute Card */}
                <div className="bg-surface rounded-3xl p-6 md:p-8 shadow-card border border-stroke hover:shadow-premium transition-all duration-300 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl select-none group-hover:scale-110 transition-transform duration-700">⭐</div>

                    <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform relative z-10">
                        ✨
                    </div>
                    <h2 className="text-xl font-bold text-ink mb-2 relative z-10">Dejar una Señal</h2>
                    <p className="text-sm text-text-secondary mb-6 relative z-10">
                        Tu experiencia es un dato valioso. Califícalo ahora.
                    </p>

                    <div className="flex justify-center gap-1 relative z-10 bg-surface2/50 p-4 rounded-xl border border-stroke/50 backdrop-blur-sm">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={handleRate}
                                className="text-3xl text-stroke hover:text-warning hover:scale-125 transition-all active:scale-95 transform cursor-pointer"
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-[10px] text-text-muted uppercase font-bold mt-3 tracking-widest relative z-10">
                        Toca para calificar
                    </p>
                </div>
            </div>

            {/* Quick Access Pills */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-1">Filtros Rápidos</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { icon: "🛒", label: "Supermercados" },
                        { icon: "🍽️", label: "Restaurantes" },
                        { icon: "☕", label: "Cafés" },
                        { icon: "🏥", label: "Salud" },
                        { icon: "🏦", label: "Bancos" },
                        { icon: "🏋️", label: "Gimnasios" },
                    ].map((cat) => (
                        <button
                            key={cat.label}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface border border-stroke text-sm font-medium text-ink hover:bg-surface2 hover:border-text-secondary/20 transition-all whitespace-nowrap shadow-sm"
                        >
                            <span>{cat.icon}</span>
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Live Activity Feed */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider ml-1">Señales Recientes en tu Zona</h3>
                <div className="grid gap-4">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-surface border border-stroke shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-full bg-surface2 flex items-center justify-center text-lg shrink-0">
                                {i === 0 ? "🛒" : i === 1 ? "🍔" : "⛽"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-ink truncate">
                                        {i === 0 ? "Lider Express" : i === 1 ? "McDonald's" : "Copec"}
                                    </h4>
                                    <span className="text-xs text-text-muted whitespace-nowrap">Hace {i * 12 + 5}m</span>
                                </div>
                                <div className="text-xs text-text-secondary mb-2">Av. Providencia 1234</div>
                                <div className="flex items-center gap-2">
                                    <div className="flex text-warning text-sm">
                                        {"★".repeat(i === 1 ? 3 : 5)}{"☆".repeat(i === 1 ? 2 : 0)}
                                    </div>
                                    <span className="text-xs font-medium text-text-muted px-2 py-0.5 bg-surface2 rounded-full">
                                        {i === 1 ? "Lento" : "Rápido"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showToast && (
                <SignalToast
                    message="Señal geográfica registrada."
                    points={15}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
}
