// @ts-nocheck
import { useState } from "react";
import PulseCheckIn, { PulseQuestion } from "./PulseCheckIn";
import { PulseCategory, pulseService } from "../../signals/services/pulseService";
import { useToast } from "../../../components/ui/useToast";
import { recordPulseSignalsFromLegacy } from "../../../lib/signals/recordPulseSignalsFromLegacy";

const PULSE_QUESTIONS_SOBRE_MI: PulseQuestion[] = [
    {
        id: "q_mood_week",
        text: "Esta semana estuve mejor, igual o peor que la anterior",
        type: "ternary",
        options: [
            { value: "mejor", label: "Mejor", icon: "sentiment_very_satisfied", colorClass: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700" },
            { value: "igual", label: "Igual", icon: "sentiment_neutral", colorClass: "border-slate-200 hover:border-slate-500 hover:bg-slate-50 text-slate-700" },
            { value: "peor", label: "Peor", icon: "sentiment_dissatisfied", colorClass: "border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-700" }
        ]
    },
    { id: "q_sleep", text: "Dormí bien esta semana", type: "binary", options: [{ value: "si", label: "Sí", icon: "check" }, { value: "no", label: "No", icon: "close" }] },
    { id: "q_happy", text: "Tuve al menos un momento de felicidad cada día", type: "binary", options: [{ value: "si", label: "Sí", icon: "check" }, { value: "no", label: "No", icon: "close" }] },
    { id: "q_energy", text: "Me sentí con energía", type: "scale" },
    { id: "q_overwhelmed", text: "Me sentí sobrepasado", type: "scale" },
];

const PULSE_QUESTIONS_MI_SEMANA: PulseQuestion[] = [
    { id: "q_heavy", text: "Mi semana fue más pesada de lo normal", type: "binary", options: [{ value: "si", label: "Sí", icon: "check" }, { value: "no", label: "No", icon: "close" }] },
    { id: "q_progress", text: "Logré avanzar en lo que me propuse", type: "scale" },
    { id: "q_disconnect", text: "Pude desconectarme en algún momento", type: "binary", options: [{ value: "si", label: "Sí", icon: "check" }, { value: "no", label: "No", icon: "close" }] },
    {
        id: "q_stress", text: "Sentí más estrés que la semana pasada", type: "ternary", options: [
            { value: "mas", label: "Más", icon: "trending_up", colorClass: "border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-700" },
            { value: "igual", label: "Igual", icon: "trending_flat", colorClass: "border-slate-200 hover:border-slate-500 hover:bg-slate-50 text-slate-700" },
            { value: "menos", label: "Menos", icon: "trending_down", colorClass: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700" }
        ]
    },
];

const PULSE_QUESTIONS_MI_ENTORNO: PulseQuestion[] = [
    { id: "q_insecurity", text: "Siento más inseguridad que hace un mes", type: "binary", options: [{ value: "si", label: "Sí", icon: "check" }, { value: "no", label: "No", icon: "close" }] },
    {
        id: "q_economy",
        text: "Mi situación económica está mejor, igual o peor",
        type: "ternary",
        options: [
            { value: "mejor", label: "Mejor", icon: "trending_up", colorClass: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700" },
            { value: "igual", label: "Igual", icon: "trending_flat", colorClass: "border-slate-200 hover:border-slate-500 hover:bg-slate-50 text-slate-700" },
            { value: "peor", label: "Peor", icon: "trending_down", colorClass: "border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-700" }
        ]
    },
    {
        id: "q_optimism", text: "Veo a la gente más optimista o más pesimista", type: "ternary", options: [
            { value: "optimista", label: "Optimista", icon: "sentiment_satisfied", colorClass: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700" },
            { value: "igual", label: "Igual", icon: "sentiment_neutral", colorClass: "border-slate-200 hover:border-slate-500 hover:bg-slate-50 text-slate-700" },
            { value: "pesimista", label: "Pesimista", icon: "sentiment_dissatisfied", colorClass: "border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-700" }
        ]
    },
    {
        id: "q_country", text: "Siento que el país va...", type: "ternary", options: [
            { value: "mejor", label: "Mejor", icon: "arrow_upward", colorClass: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-700" },
            { value: "igual", label: "Igual", icon: "horizontal_rule", colorClass: "border-slate-200 hover:border-slate-500 hover:bg-slate-50 text-slate-700" },
            { value: "peor", label: "Peor", icon: "arrow_downward", colorClass: "border-rose-200 hover:border-rose-500 hover:bg-rose-50 text-rose-700" }
        ]
    },
];

export default function PulseHubManager({
    onClose
}: {
    onClose: () => void;
}) {
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState<PulseCategory | null>(null);

    const questionsMap: Record<PulseCategory, { title: string, qs: PulseQuestion[] }> = {
        'sobre_mi': { title: 'Sobre mí', qs: PULSE_QUESTIONS_SOBRE_MI },
        'mi_semana': { title: 'Mi semana', qs: PULSE_QUESTIONS_MI_SEMANA },
        'mi_entorno': { title: 'Mi entorno', qs: PULSE_QUESTIONS_MI_ENTORNO },
    };

    const handleSelectCategory = async (cat: PulseCategory) => {
        const canSubmit = await pulseService.checkCategoryAvailability(cat);
        if (!canSubmit) {
            showToast("Ya respondiste este pulso en los últimos 7 días. ¡Vuelve la próxima semana!", "info");
            return;
        }
        setSelectedCategory(cat);
    };

    const handleComplete = async (answers: Record<string, string>) => {
        if (!selectedCategory) return;
        try {
            const formattedPulses = Object.entries(answers).map(([key, val]) => ({
                sub_category: selectedCategory,
                question_identifier: key,
                response_value: val
            }));

            await pulseService.savePulseBatch(formattedPulses);
            showToast("¡Pulso registrado exitosamente!", "award", 1);
            
            // --- INICIO DOBLE ESCRITURA (Double Write) a signal_events (1 resp = 1 PERSONAL_PULSE_SIGNAL) ---
            try {
                 recordPulseSignalsFromLegacy(answers, selectedCategory)
                     .catch(e => console.warn('[PulseHubManager] Double write failed silently', e));
            } catch (dwErr) {
                 console.warn('[PulseHubManager] Double write init error', dwErr);
            }
            // --- FIN DOBLE ESCRITURA ---

            onClose(); // In a future iteration we would show the summary screen here
        } catch (error) {
            console.error(error);
            showToast("Hubo un error al guardar tu pulso.", "error");
        } finally {
            setSelectedCategory(null);
        }
    };

    if (selectedCategory) {
        return (
            <PulseCheckIn
                blockTitle={questionsMap[selectedCategory].title}
                questions={questionsMap[selectedCategory].qs}
                onComplete={handleComplete}
                onCancel={() => setSelectedCategory(null)}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto text-center mb-8">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <span className="material-symbols-outlined text-3xl text-rose-500">monitor_heart</span>
                </div>
                <h2 className="text-3xl font-black text-ink">Tu Pulso</h2>
                <p className="text-slate-500 text-lg mt-2 font-medium">Señales rápidas sobre cómo estás y cómo percibes tu entorno. (Renueva cada 7 días)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Sobre Mi */}
                <div
                    onClick={() => handleSelectCategory('sobre_mi')}
                    className="card-interactive p-8 flex flex-col items-center text-center cursor-pointer group"
                >
                    <span className="material-symbols-outlined text-4xl text-emerald-500 mb-4 group-hover:scale-110 transition-transform">person</span>
                    <h3 className="font-black text-xl text-ink mb-2">Sobre mí</h3>
                    <p className="text-slate-500 text-sm">Estado personal y de ánimo</p>
                </div>
                {/* Mi Semana */}
                <div
                    onClick={() => handleSelectCategory('mi_semana')}
                    className="card-interactive p-8 flex flex-col items-center text-center cursor-pointer group"
                >
                    <span className="material-symbols-outlined text-4xl text-blue-500 mb-4 group-hover:scale-110 transition-transform">calendar_month</span>
                    <h3 className="font-black text-xl text-ink mb-2">Mi semana</h3>
                    <p className="text-slate-500 text-sm">Carga y experiencia semanal</p>
                </div>
                {/* Mi entorno */}
                <div
                    onClick={() => handleSelectCategory('mi_entorno')}
                    className="card-interactive p-8 flex flex-col items-center text-center cursor-pointer group"
                >
                    <span className="material-symbols-outlined text-4xl text-purple-500 mb-4 group-hover:scale-110 transition-transform">public</span>
                    <h3 className="font-black text-xl text-ink mb-2">Mi entorno</h3>
                    <p className="text-slate-500 text-sm">Percepción del contexto social</p>
                </div>
            </div>
        </div>
    );
}
