import { Lock, Zap } from "lucide-react";
import { ReactNode } from "react";

interface PremiumGateProps {
    children: ReactNode;
    featureName?: string;
    isLocked?: boolean; 
}

export function PremiumGate({ children, featureName = "Funcionalidad", isLocked = true }: PremiumGateProps) {
    if (!isLocked) return <>{children}</>;

    return (
        <div className="relative group rounded-xl overflow-hidden">
            {/* Contenido subyacente difuminado */}
            <div className="blur-[6px] opacity-40 select-none pointer-events-none transition-all duration-300 group-hover:blur-[8px]">
                {children}
            </div>

            {/* Overlay de Bloqueo */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white/40 to-white/90">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-brand-100 flex items-center justify-center mb-4 text-brand-500">
                    <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
                    Vista Restringida
                </h4>
                <p className="text-xs font-semibold text-slate-500 mb-4 max-w-[200px]">
                    {featureName} está reservado para perfiles Plus y cuentas corporativas B2B.
                </p>
                <button className="flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-md">
                    <Zap className="w-3 h-3 text-accent-400" />
                    <span>Hacer Upgrade</span>
                </button>
            </div>
        </div>
    );
}
