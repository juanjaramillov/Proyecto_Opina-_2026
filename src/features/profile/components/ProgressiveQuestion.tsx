import { useMemo } from 'react';
import { DemographicData, authService as profileService } from '../../auth';
import { motion, AnimatePresence } from 'framer-motion';

type QuestionConfig = {
    key: keyof DemographicData;
    label: string;
    description: string;
    options: string[];
    priority: 'A' | 'B' | 'C';
};

const QUESTIONS: QuestionConfig[] = [
    // BLOCK A
    { key: 'ageRange', label: 'Rango de Edad', description: 'Para segmentar patrones generacionales.', priority: 'A', options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] },
    { key: 'gender', label: 'Género', description: 'Para identificar brechas de opinión.', priority: 'A', options: ['Masculino', 'Femenino', 'Otro'] },
    { key: 'region', label: 'Región', description: 'Para entender el contexto territorial.', priority: 'A', options: ['RM', 'Valparaíso', 'Biobío', 'Norte', 'Sur'] },

    // BLOCK B
    { key: 'educationLevel', label: 'Nivel Educacional', description: 'Para correlacionar formación con visión.', priority: 'B', options: ['Media Incompleta', 'Media Completa', 'Técnica', 'Universitaria', 'Postgrado'] },
    { key: 'jobStatus', label: 'Situación Laboral', description: 'Para medir el pulso económico real.', priority: 'B', options: ['Estudiante', 'Trabaja', 'Busca Trabajo', 'Jubilado', 'Dueña/o de Casa'] },
    { key: 'incomeRange', label: 'Tramo de Ingreso', description: 'Dato anónimo para cruces socioeconómicos.', priority: 'B', options: ['-400k', '400k-800k', '800k-1.5M', '1.5M-3M', '+3M'] },

    // BLOCK C
    { key: 'householdSize', label: 'Personas en el hogar', description: 'Para dimensionar núcleos familiares.', priority: 'C', options: ['1', '2', '3', '4', '5+'] },
];

type Props = {
    currentData: DemographicData;
};

export default function ProgressiveQuestion({ currentData }: Props) {
    // Show all questions, but sort by pending first
    const sortedQuestions = useMemo(() => {
        return [...QUESTIONS].sort((a, b) => {
            const aHas = !!currentData[a.key];
            const bHas = !!currentData[b.key];
            if (aHas === bHas) return 0;
            return aHas ? 1 : -1; // Pending first
        });
    }, [currentData]);

    const handleAnswer = (key: keyof DemographicData, value: string) => {
        profileService.saveDemographic(key, value);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <h3 className="text-xs font-black text-muted uppercase tracking-widest">
                    Datos del Perfil
                </h3>
            </div>

            <AnimatePresence mode='popLayout'>
                {sortedQuestions.map((question) => {
                    const isAnswered = !!currentData[question.key];

                    return (
                        <motion.div
                            key={question.key}
                            layout
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded-xl border transition-all group relative ${isAnswered ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-stroke border-dotted hover:border-primary/30 hover:bg-surface2'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className={`text-xs font-black transition-colors ${isAnswered ? 'text-emerald-700' : 'text-ink group-hover:text-primary'}`}>
                                        {question.label}
                                    </h3>
                                    {!isAnswered && (
                                        <p className="text-[10px] text-text-secondary leading-tight">{question.description}</p>
                                    )}
                                </div>
                                {isAnswered && (
                                    <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
                                )}
                            </div>

                            <div className="relative">
                                <select
                                    onChange={(e) => handleAnswer(question.key, e.target.value)}
                                    className={`w-full appearance-none text-xs font-bold rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 cursor-pointer transition-colors ${isAnswered
                                        ? 'bg-white border border-emerald-200 text-emerald-800 focus:border-emerald-500 focus:ring-emerald-200'
                                        : 'bg-surface border border-stroke text-ink focus:border-primary/50 focus:ring-primary/20 hover:bg-gray-50'
                                        }`}
                                    value={String(currentData[question.key] || "")}
                                >
                                    <option value="" disabled>Seleccionar...</option>
                                    {question.options.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-muted flex items-center">
                                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
