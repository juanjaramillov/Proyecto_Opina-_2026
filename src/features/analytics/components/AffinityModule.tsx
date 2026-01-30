import { motion } from "framer-motion";

export default function AffinityModule() {
    const affinities = [
        { label: "Te pareces más a", value: "Gen Z", icon: "🎂", color: "bg-pink-100 text-pink-700" },
        { label: "Tu región afín", value: "Metropolitana", icon: "📍", color: "bg-emerald-100 text-emerald-700" },
        { label: "Tu mayor diferencia", value: "Boomers", icon: "⚡", color: "bg-amber-100 text-amber-700" },
        { label: "Tu tribu digital", value: "Techies", icon: "💻", color: "bg-indigo-100 text-indigo-700" },
        { label: "Consumo Ético", value: "Muy Alto", icon: "🌿", color: "bg-green-100 text-green-700" },
        { label: "Perfil Político", value: "Liberal", icon: "⚖️", color: "bg-purple-100 text-purple-700" },
        { label: "Estilo de Vida", value: "Urbano", icon: "🏙️", color: "bg-blue-100 text-blue-700" },
        { label: "Nivel Optimismo", value: "Moderado", icon: "🌤️", color: "bg-orange-100 text-orange-700" },
        { label: "Influencia Social", value: "Conector", icon: "📢", color: "bg-red-100 text-red-700" },
    ];

    return (
        <section className="mt-16 border-t border-stroke pt-12 w-full max-w-5xl mx-auto px-4">
            <h3 className="text-center text-sm font-bold uppercase tracking-widest text-text-muted mb-8">
                Patrones de Afinidad
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {affinities.map((item, idx) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-surface rounded-2xl p-6 border border-stroke flex items-center gap-4 hover:shadow-card transition-shadow"
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${item.color}`}>
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-muted uppercase mb-1">
                                {item.label}
                            </p>
                            <p className="text-lg font-bold text-ink leading-tight">
                                {item.value}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
