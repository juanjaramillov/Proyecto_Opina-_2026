import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface AIPhraseCardProps {
    score: number; // 0 (outlier left) to 50 (exact avg) to 100 (outlier right)
    topicContext: string; // e.g., "en Política"
}

// Phrases catalog based on "distance from center" logic
// Core Logic: 50 is center. 
const PHRASES = {
    match: [ // 40-60 range
        "Diagnóstico: Totalmente sincronizado. Tu opinión es el estándar hoy.",
        "Estás navegando la ola principal. Cero fricción con la mayoría.",
        "Eres el 'Usuario Promedio' en este tema (y eso es un dato valioso).",
        "Alta Coincidencia: Piensas exactamente lo que el mercado espera.",
        "Tu señal refuerza la tendencia dominante. Estás validado."
    ],
    moderate: [ // 20-40 or 60-80
        "Diagnóstico: Levemente desviado. Estás en la periferia de lo común.",
        "No eres el centro, pero tampoco un extraño. Tienes matices propios.",
        "Coincidencia Parcial: Compartes el fondo, pero no la forma.",
        "Estás en una sub-tendencia interesante. Ni muy muy, ni tan tan.",
        "Te sales del molde lo suficiente para ser interesante."
    ],
    outlier: [ // 0-20 or 80-100
        "Diagnóstico: Desconectado. Tu realidad es muy distinta al resto.",
        "Alerta de Outlier: Estás viendo algo que la mayoría no ve (o viceversa).",
        "Tu opinión es una isla. ¿Visionario o incomprendido?",
        "Estás aislado estadísticamente en este punto. Un verdadero contreras.",
        "Diferencia Crítica: Tu experiencia no representa al promedio hoy."
    ]
};

export default function AIPhraseCard({ score, topicContext }: AIPhraseCardProps) {
    const [phrase, setPhrase] = useState("");

    // Effect to select a random phrase when score/topic changes
    useEffect(() => {
        let category: keyof typeof PHRASES = "match";
        const dist = Math.abs(50 - score); // distance from center (0 to 50)

        if (dist > 30) category = "outlier";
        else if (dist > 10) category = "moderate";
        else category = "match";

        const available = PHRASES[category];
        const randomPhrase = available[Math.floor(Math.random() * available.length)];
        setPhrase(randomPhrase);
    }, [score, topicContext]);

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <AnimatePresence mode="wait">
                <motion.div
                    key={phrase}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="relative bg-white rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/40 p-6 flex items-start gap-4"
                >
                    {/* Icon */}
                    <div className="shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-xl">
                        ✨
                    </div>

                    {/* Content */}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                                Lectura Automática
                            </span>
                            <span className="h-px w-8 bg-indigo-50" />
                        </div>
                        <p className="text-lg md:text-xl font-medium text-ink leading-snug">
                            Possible Context: {topicContext}. <br className="hidden md:block" />
                            <span className="text-indigo-900 font-semibold">"{phrase}"</span>
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
