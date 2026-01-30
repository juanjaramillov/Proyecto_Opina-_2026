import { useState, useMemo } from "react";
import ComparisonFilter, { FilterState } from "../components/ComparisonFilter";
import TopicSelector, { TopicId } from "../components/TopicSelector";
import MainDistributionChart from "../components/MainDistributionChart";
import AIPhraseCard from "../components/AIPhraseCard";
import AffinityModule from "../components/AffinityModule";

// TOPIC CONFIGURATION (Mock Data)
const TOPIC_CONFIG: Record<TopicId, {
    title: string;
    question: string;
    labelYou: string; // What the user answered
    labelAvg: string; // What the avg is
    color: string;
    baseScore: number; // 0-100 position of user (50 is center)
}> = {
    consumption: {
        title: "Gasto en Supermercado",
        question: "Percepción de alza de precios este mes",
        labelYou: "Alta (Jumbo)",
        labelAvg: "Media (Lider)",
        color: "bg-emerald-500",
        baseScore: 75, // User perceives higher than avg
    },
    services: {
        title: "Calidad Internet Hogar",
        question: "Velocidad real vs contratada",
        labelYou: "Menor",
        labelAvg: "Igual",
        color: "bg-blue-500",
        baseScore: 30, // User is below avg satisfaction
    },
    politics: {
        title: "Intención de Voto",
        question: "Candidato definido para próxima elección",
        labelYou: "Indeciso",
        labelAvg: "Definido",
        color: "bg-purple-500",
        baseScore: 15, // Outlier (most have decided)
    },
    brands: {
        title: "Marcas Favoritas",
        question: "¿Qué marca de ropa deportiva prefieres?",
        labelYou: "Nike",
        labelAvg: "Adidas",
        color: "bg-pink-500",
        baseScore: 45, // Slightly below center
    },
    wellness: {
        title: "Salud Mental",
        question: "Nivel de estrés laboral esta semana",
        labelYou: "Alto",
        labelAvg: "Medio",
        color: "bg-teal-500",
        baseScore: 80, // High stress
    },
    work: {
        title: "Modalidad de Trabajo",
        question: "¿Prefieres presencial, híbrido o remoto?",
        labelYou: "100% Remoto",
        labelAvg: "Híbrido",
        color: "bg-amber-500",
        baseScore: 90, // Strong preference for remote
    },
    society: {
        title: "Seguridad Pública",
        question: "Sensación de seguridad en tu barrio",
        labelYou: "Baja",
        labelAvg: "Baja",
        color: "bg-orange-500",
        baseScore: 52, // Match (everyone feels unsafe)
    },
    tech: {
        title: "Uso de IA en Trabajo",
        question: "Frecuencia de uso de herramientas LLM",
        labelYou: "Diario",
        labelAvg: "Semanal",
        color: "bg-indigo-500",
        baseScore: 85, // Early adopter
    }
};

export default function Radiografias() {
    const [activeTopic, setActiveTopic] = useState<TopicId>("consumption");
    const [filters, setFilters] = useState<FilterState>({ age: "Todos", gender: "Todos", region: "Todas" });

    const currentConfig = TOPIC_CONFIG[activeTopic];

    // Simulate score shift based on filters (Mock Logic)
    // shifting the user's relative position when comparing to a subgroup
    const simulatedScore = useMemo(() => {
        let score = currentConfig.baseScore;
        if (filters.age === "18-24") score += 10;
        if (filters.gender === "Mujeres") score -= 5;
        // Clamp 10-90
        return Math.max(10, Math.min(90, score));
    }, [currentConfig.baseScore, filters.age, filters.gender]);

    // Determine color class for text based on bg color config
    const textColor = currentConfig.color.replace('bg-', 'text-');

    // CALCULATE GLOBAL ARCHETYPE (Score Logic)
    // We average how far the user is from the center (50) across all topics
    const { archetypeLabel, archetypeDesc, divergenceScore } = useMemo(() => {
        const scores = Object.values(TOPIC_CONFIG).map(t => t.baseScore);
        const avgDivergence = scores.reduce((acc, score) => acc + Math.abs(score - 50), 0) / scores.length;

        // avgDivergence is between 0 (perfect center) and 50 (extreme edge)
        let label = "Ciudadano Modelo";
        let desc = "Tus opiniones suelen coincidir con la mayoría.";

        if (avgDivergence > 30) {
            label = "Mente Disruptiva"; // "Out of the box"
            desc = "Piensas 'Out of the Box'. Tu visión es única.";
        } else if (avgDivergence > 15) {
            label = "Pensador Independiente";
            desc = "Cuestionas el status quo, pero con sentido común.";
        }

        return { archetypeLabel: label, archetypeDesc: desc, divergenceScore: Math.round(avgDivergence * 2) }; // Scale to 0-100 visual
    }, []);

    return (
        <div className="min-h-screen bg-bg pb-24">

            {/* 1. HEADER & USER SUMMARY */}
            <header className="pt-10 pb-8 px-4">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tracking-widest uppercase mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Tu Radiografía
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-ink mb-2 tracking-tight">
                        Tu opinión <span className="text-text-muted font-bold ml-1">vs</span> <span className="text-gradient-brand">el resto.</span>
                    </h1>
                    <p className="text-text-secondary font-medium">
                        Sin humo. Solo datos puros y duros.
                    </p>
                </div>

                {/* NEW: USER PROFILE SUMMARY */}
                <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-card border border-stroke flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
                    {/* Decor elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-3xl -z-10" />

                    {/* Avatar & ID */}
                    <div className="flex flex-col items-center shrink-0">
                        <div className="w-24 h-24 rounded-full bg-slate-100 p-1 shadow-inner border border-white relative">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg text-white">
                                😶‍🌫️
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                                <div className="bg-ink text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {divergenceScore}%
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-bold text-ink leading-none mb-1">{archetypeLabel}</h3>
                            <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider block max-w-[140px] leading-tight">
                                {archetypeDesc}
                            </span>
                        </div>
                    </div>

                    {/* The Summary Grid */}
                    <div className="flex-1 w-full grid grid-cols-2 gap-y-6 gap-x-4">
                        {/* Item 1 */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Consumo</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-sm font-bold text-ink">Estás en la Mayoría</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[75%]" />
                            </div>
                        </div>
                        {/* Item 2 */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Política</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                <span className="text-sm font-bold text-ink">Eres Minoría (Outlier)</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-purple-500 w-[15%]" />
                            </div>
                        </div>
                        {/* Item 3 */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Tech</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className="text-sm font-bold text-ink">Early Adopter</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-indigo-500 w-[90%]" />
                            </div>
                        </div>
                        {/* Item 4 */}
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase text-text-muted tracking-widest mb-1">Socidad</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500" />
                                <span className="text-sm font-bold text-ink">Alineado al 50%</span>
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-orange-500 w-[50%]" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4">

                {/* 2. TOPIC SELECTOR */}
                <TopicSelector activeTopic={activeTopic} onChange={setActiveTopic} />

                {/* 3. MAIN PANEL (The Heart) */}
                <section className="bg-white rounded-[2.5rem] shadow-card border border-stroke p-6 md:p-10 mt-6 relative overflow-hidden transition-all duration-500">

                    {/* Panel Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-ink mb-1">
                            {currentConfig.question}
                        </h2>
                        <p className="text-sm text-text-muted font-bold uppercase tracking-widest">
                            Distribución de respuestas
                        </p>
                    </div>

                    {/* MAIN VISUALIZATION */}
                    <MainDistributionChart
                        userValue={simulatedScore}
                        labelYou={currentConfig.labelYou}
                        labelAvg={currentConfig.labelAvg}
                        topicColor={textColor}
                    />

                    {/* 4. AI PHRASE (Immediately below chart) */}
                    <AIPhraseCard
                        score={simulatedScore}
                        topicContext={currentConfig.title}
                    />

                    {/* 5. FILTERS (Contextual) */}
                    <div className="mt-12 pt-8 border-t border-dashed border-slate-200">
                        <ComparisonFilter onChange={setFilters} />
                    </div>

                </section>

                {/* 6. AFFINITY MODULE */}
                <AffinityModule />

            </main>
        </div>
    );
}
