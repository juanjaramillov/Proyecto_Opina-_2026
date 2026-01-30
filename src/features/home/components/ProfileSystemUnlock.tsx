import { useNavigate } from "react-router-dom";

export default function ProfileSystemUnlock() {
    const navigate = useNavigate();

    return (
        <div className="relative w-full overflow-hidden rounded-3xl bg-surface2 border border-stroke p-8 md:p-12">
            {/* Background Decorative Grid */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, #4F46E5 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">

                {/* Left: Narrative */}
                <div className="flex-1 text-center md:text-left space-y-6">
                    <h2 className="text-3xl font-bold text-ink leading-tight">
                        Tu opinión <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">desbloquea el sistema.</span>
                    </h2>
                    <p className="text-text-secondary text-lg">
                        No eres un dato aislado. Eres parte de una red. <br />
                        Avanza capas para ver lo que otros no ven.
                    </p>

                    <button
                        onClick={() => navigate("/profile")}
                        className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all group"
                    >
                        Completar mi perfil
                        <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>

                {/* Right: Visualization */}
                <div className="flex-1 w-full max-w-sm relative aspect-square flex items-center justify-center">

                    {/* Layer 3: Outer (Locked) */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-text-muted/30 animate-[spin_60s_linear_infinite]" />
                    <div className="absolute top-4 right-10 bg-surface border border-stroke rounded-full px-3 py-1 text-[10px] font-mono text-text-muted opacity-60">
                        CAPA 3: PROYECCIONES
                    </div>

                    {/* Layer 2: Middle (Next) */}
                    <div className="absolute inset-16 rounded-full border border-primary/20 bg-primary/5 animate-pulse" />
                    <div className="absolute bottom-10 left-0 bg-surface border border-primary/30 rounded-full px-3 py-1 text-[10px] font-bold text-primary shadow-sm">
                        CAPA 2: ZONAS (Siguiente)
                    </div>

                    {/* Layer 1: Core (Active) */}
                    <div className="absolute inset-32 rounded-full bg-surface shadow-card flex items-center justify-center border-2 border-primary z-10">
                        <div className="text-center">
                            <div className="text-2xl">👤</div>
                            <div className="text-[10px] font-bold text-ink uppercase mt-1">Tu Nodo</div>
                        </div>
                    </div>

                    {/* Connecting Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                        <line x1="50%" y1="50%" x2="50%" y2="20%" stroke="currentColor" className="text-primary" strokeDasharray="4 4" />
                        <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="currentColor" className="text-text-muted" strokeDasharray="2 2" />
                        <line x1="50%" y1="50%" x2="20%" y2="70%" stroke="currentColor" className="text-text-muted" strokeDasharray="2 2" />

                        {/* Orbital nodes */}
                        <circle cx="50%" cy="20%" r="4" className="fill-primary animate-ping" />
                        <circle cx="80%" cy="80%" r="3" className="fill-text-muted" />
                        <circle cx="20%" cy="70%" r="3" className="fill-text-muted" />
                    </svg>

                </div>

            </div>
        </div>
    );
}
