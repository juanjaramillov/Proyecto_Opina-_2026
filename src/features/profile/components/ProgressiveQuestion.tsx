import { useMemo } from 'react';
import { DemographicData, authService as profileService } from '../../auth';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '../../../lib/logger';

type QuestionConfig = {
    key: keyof DemographicData;
    label: string;
    description: string;
    options: string[];
    priority: 'A' | 'B' | 'C';
};

const QUESTIONS: QuestionConfig[] = [
    // BLOCK A: Demografía (Paso 2)
    { key: 'birthYear', label: 'Año de Nacimiento', description: 'Para segmentar patrones generacionales.', priority: 'A', options: [] },
    { key: 'gender', label: 'Género', description: 'Para identificar brechas de opinión.', priority: 'A', options: ['Hombre', 'Mujer', 'Otro', 'Prefiero no decir'] },
    { key: 'region', label: 'Región', description: 'Para entender el contexto territorial.', priority: 'A', options: ['Metropolitana', 'Valparaíso', 'Biobío', 'Norte', 'Sur', 'Extranjero'] },

    // BLOCK B: Socioeconómico (Paso 3)
    { key: 'educationLevel', label: 'Nivel Educacional', description: 'Para correlacionar formación con visión.', priority: 'B', options: ['Básica incompleta o menos', 'Básica completa', 'Media incompleta', 'Media completa', 'Técnica incompleta', 'Técnica completa', 'Universitaria incompleta', 'Universitaria completa', 'Postgrado'] },
    { key: 'employmentStatus', label: 'Situación Laboral', description: 'Para medir el contexto económico real.', priority: 'B', options: ['Trabajador dependiente', 'Trabajador independiente', 'Cesante', 'Estudiante', 'Dueño/a de casa', 'Jubilado/a'] },
    { key: 'incomeRange', label: 'Ingreso Hogar', description: 'Dato anónimo para cruces socioeconómicos.', priority: 'B', options: ['Menos de $400.000', '$400.000 - $800.000', '$800.000 - $1.500.000', '$1.500.000 - $3.000.000', 'Más de $3.000.000'] },

    // BLOCK C: Contexto Hogar (Paso 4)
    { key: 'householdSize', label: 'Personas en el hogar', description: '¿Cuántos viven contigo?', priority: 'C', options: ['Vivo solo/a', '2 personas', '3 personas', '4 personas', '5 o más personas'] },
    { key: 'childrenCount', label: 'Hijos', description: '¿Tienes hijos?', priority: 'C', options: ['No tengo hijos', '1 hijo', '2 hijos', '3 o más hijos'] },
    { key: 'carCount', label: 'Autos en el hogar', description: '¿Cuántos autos tienen?', priority: 'C', options: ['No tenemos auto', '1 auto', '2 autos', '3 o más autos'] },
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

    const handleAnswer = async (key: keyof DemographicData, value: string) => {
        try {
            await profileService.saveDemographic(key, value);
        } catch (error: any) {
            if (error?.message?.includes('Demographics can only be updated every 30 days') || error?.code === 'P0001') {
                import('react-hot-toast').then(({ toast }) => {
                    toast.error("Solo puedes cambiar tu perfil cada 30 días.", { id: 'cooldown-error', duration: 4000 });
                });
            } else {
                logger.error("Error al guardar demográfica", { domain: 'signal_write', origin: 'ProgressiveQuestion', action: 'save_demographic', state: 'failed' }, error);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4 px-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">
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
                            className={`p-4 rounded-xl border transition-all group relative ${isAnswered ? 'bg-secondary/5 border-secondary/20' : 'bg-white border-stroke border-dotted hover:border-primary/30 hover:bg-surface2'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className={`text-xs font-black tracking-wide transition-colors ${isAnswered ? 'text-secondary' : 'text-ink group-hover:text-primary'}`}>
                                        {question.label}
                                    </h3>
                                    {!isAnswered && (
                                        <p className="text-[10px] text-text-secondary leading-tight mt-1">{question.description}</p>
                                    )}
                                </div>
                                {isAnswered && (
                                    <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
                                )}
                            </div>

                            <div className="relative">
                                {question.key === 'birthYear' ? (
                                    <input
                                        type="number"
                                        min="1920"
                                        max={new Date().getFullYear() - 12}
                                        value={String(currentData[question.key] || "")}
                                        className={`w-full text-xs font-bold rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 transition-colors outline-none shadow-sm ${isAnswered
                                            ? 'bg-white border border-secondary/20 text-secondary focus:border-secondary focus:ring-secondary/20'
                                            : 'bg-white border border-stroke text-ink focus:border-primary focus:ring-primary/20 hover:bg-surface2'
                                            }`}
                                        onChange={(e) => handleAnswer(question.key, e.target.value)}
                                        placeholder="Ej: 1990"
                                    />
                                ) : (
                                    <>
                                        <select
                                            onChange={(e) => handleAnswer(question.key, e.target.value)}
                                            className={`w-full appearance-none text-xs font-bold rounded-lg px-3 py-2.5 pr-8 focus:outline-none focus:ring-1 cursor-pointer transition-colors shadow-sm outline-none ${isAnswered
                                                ? 'bg-white border border-secondary/20 text-secondary focus:border-secondary focus:ring-secondary/20'
                                                : 'bg-white border border-stroke text-ink focus:border-primary focus:ring-primary/20 hover:bg-surface2'
                                                }`}
                                            value={String(currentData[question.key] || "")}
                                        >
                                            <option value="" disabled>Seleccionar...</option>
                                            {question.options.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted flex items-center">
                                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
