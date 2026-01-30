import { motion } from "framer-motion";

export type TopicId = "politics" | "consumption" | "services" | "society" | "tech" | "brands" | "wellness" | "work";

interface TopicSelectorProps {
    activeTopic: TopicId;
    onChange: (id: TopicId) => void;
}

const TOPICS: { id: TopicId; label: string; icon: string; color: string }[] = [
    { id: "consumption", label: "Consumo", icon: "🛒", color: "bg-emerald-500" },
    { id: "services", label: "Lugares y Servicios", icon: "⚡", color: "bg-blue-500" },
    { id: "politics", label: "Política", icon: "🗳️", color: "bg-purple-500" },
    { id: "brands", label: "Marcas", icon: "🏷️", color: "bg-pink-500" },
    { id: "society", label: "Sociedad", icon: "🤝", color: "bg-orange-500" },
    { id: "wellness", label: "Bienestar", icon: "🧘", color: "bg-teal-500" },
    { id: "work", label: "Trabajo", icon: "💼", color: "bg-amber-500" },
    { id: "tech", label: "Tech", icon: "📱", color: "bg-indigo-500" },
];

export default function TopicSelector({ activeTopic, onChange }: TopicSelectorProps) {
    return (
        <div className="w-full flex justify-center py-6">
            <div className="flex gap-2 p-1.5 bg-surface rounded-2xl border border-stroke shadow-sm overflow-x-auto max-w-full no-scrollbar">
                {TOPICS.map((topic) => {
                    const isActive = activeTopic === topic.id;
                    return (
                        <button
                            key={topic.id}
                            onClick={() => onChange(topic.id)}
                            className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${isActive
                                ? "text-ink bg-white shadow-sm ring-1 ring-black/5"
                                : "text-text-secondary hover:bg-surface2 hover:text-ink"
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-topic-bg"
                                    className="absolute inset-0 bg-white rounded-xl shadow-sm z-0"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <span className="relative z-10 text-base">{topic.icon}</span>
                            <span className="relative z-10">{topic.label}</span>

                            {isActive && (
                                <span className={`relative z-10 w-1.5 h-1.5 rounded-full ${topic.color} ml-1`} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
