import { motion } from "framer-motion";

export type RadiografiaData = {
    id: string;
    category: "Consumo" | "Servicios" | "Política" | "Sociedad" | "Tech";
    title: string;
    question: string;
    myVote: string; // User's answer
    globalStat: {
        label: string; // e.g., "Coincide contigo"
        percentage: number; // 0-100
    };
    insight: string; // "Estás en la mayoría", "Eres contreras"
    trend: "up" | "down" | "stable";
    totalSignals: number;
    premium: boolean;
};

interface RadiografiaCardProps {
    data: RadiografiaData;
    filterSummary?: string; // e.g. "Mujeres 25-34"
}

// Map categories to colors/icons
const CAT_STYLES = {
    Consumo: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "🛒" },
    Servicios: { color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: "⚡" },
    Política: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: "🗳️" },
    Sociedad: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: "🤝" },
    Tech: { color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: "📱" },
};

export default function RadiografiaCard({ data }: RadiografiaCardProps) {
    const style = CAT_STYLES[data.category];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col bg-white rounded-[2rem] shadow-sm hover:shadow-premium border border-stroke overflow-hidden transition-all duration-300 group hover:-translate-y-1"
        >
            {/* Header Area */}
            <div className="p-6 md:p-8 relative">
                <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${style.bg} ${style.color}`}>
                        <span>{style.icon}</span> {data.category}
                        {data.premium && <span className="ml-1 bg-ink text-white px-1.5 rounded text-[9px] py-0.5">PRO</span>}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <span>{data.totalSignals.toLocaleString()} señales</span>
                    </div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-ink leading-tight mb-2">
                    {data.title}
                </h3>
                <p className="text-sm text-text-secondary font-medium">
                    {data.question}
                </p>
            </div>

            {/* Visual Data Section */}
            <div className="px-6 md:px-8 pb-6 flex-1 flex flex-col justify-end">

                {/* Comparison Chart */}
                <div className="bg-slate-50 rounded-2xl p-5 mb-4 border border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                        <span>Tu opinión</span>
                        <span>{data.globalStat.percentage}% Comunidad</span>
                    </div>

                    {/* The Visual Bar */}
                    <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex relative">
                        {/* Background Stripes for aesthetic */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)', backgroundSize: '8px 8px' }}></div>

                        {/* The Fill */}
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${data.globalStat.percentage}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className={`h-full ${style.bg.replace('bg-', 'bg-')} ${style.color.replace('text-', 'bg-')} relative z-10`} // dynamic color hack
                        />
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-slate-400 font-semibold uppercase">Respuesta</p>
                            <p className="text-ink font-bold">{data.myVote}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400 font-semibold uppercase">Consenso</p>
                            <p className={`font-bold ${style.color}`}>{data.insight}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Interactive Hint */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-slate-100 transition-colors">
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                    {data.premium ? '🔒 Desbloquea más datos' : 'Ver desglose completo'}
                </span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all`}>
                    →
                </span>
            </div>

        </motion.div>
    );
}
