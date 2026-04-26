
import { Plus, Trash2 } from "lucide-react";
import { TopicQuestion, QuestionType } from "../../signals/types/actualidad";

interface EditorPreguntasProps {
    questions: TopicQuestion[];
    handleQuestionChange: (orderIdx: number, field: string, value: string | string[] | number) => void;
    handleQuestionOptionAdd: (orderIdx: number) => void;
    handleQuestionOptionChange: (orderIdx: number, optIdx: number, value: string) => void;
    handleQuestionOptionRemove: (orderIdx: number, optIdx: number) => void;
}

export function EditorPreguntas({
    questions,
    handleQuestionChange,
    handleQuestionOptionAdd,
    handleQuestionOptionChange,
    handleQuestionOptionRemove
}: EditorPreguntasProps) {
    const titles = [
        "1. Postura de Entrada",
        "2. Diagnóstico / Interpretación",
        "3. Sentencia Final / Política"
    ];

    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                    <h2 className="text-lg font-black text-slate-900">3. Embudo Evaluativo Estricto</h2>
                    <p className="text-xs text-slate-500">Diseña las 3 preguntas consecutivas necesarias para capturar la señal completa.</p>
                </div>
                <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                    Regla de 3 Estricta Activa
                </div>
            </div>

            <div className="space-y-6">
                {questions.map((q, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
                        <div className="flex flex-col md:flex-row gap-5">
                            <div className="absolute -left-3 -top-3 w-8 h-8 bg-slate-800 text-white rounded-full flex justify-center items-center shadow-sm font-black text-sm border-2 border-white">
                                {idx + 1}
                            </div>

                            <div className="flex-1 pl-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    {titles[idx]}
                                </label>
                                <input
                                    type="text"
                                    value={q.text || ""}
                                    onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 outline-none font-bold text-slate-800 text-base shadow-sm"
                                    placeholder="Ej: ¿Qué tan de acuerdo estás con..."
                                />
                            </div>

                            <div className="w-full md:w-56">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                    Formato de Captura
                                </label>
                                <select
                                    value={q.type || 'single_choice'}
                                    onChange={e => handleQuestionChange(idx, 'type', e.target.value as QuestionType)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 outline-none font-bold text-sm text-slate-700 shadow-sm"
                                >
                                    <option value="scale_0_10">Escala 0-10</option>
                                    <option value="scale_5">Escala de 5 (Likert)</option>
                                    <option value="single_choice">Múltiple Opción</option>
                                    <option value="single_choice_polar">Opciones Polarizadas</option>
                                    <option value="yes_no">Botonera Sí / No</option>
                                </select>
                            </div>
                        </div>

                        {(q.type === 'single_choice' || q.type === 'single_choice_polar') && (
                            <div className="mt-4 pt-4 border-t border-slate-200 pl-2">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                                        Opciones de Respuesta
                                    </label>
                                    <button
                                        onClick={() => handleQuestionOptionAdd(idx)}
                                        className="text-xs font-bold text-brand bg-brand/10 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-brand/20"
                                    >
                                        <Plus className="w-3 h-3" /> Añadir
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {q.options?.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex gap-2 items-center">
                                            <div className="w-6 text-center text-xs font-bold text-slate-300">
                                                {String.fromCharCode(65 + oIdx)}
                                            </div>
                                            <input
                                                type="text"
                                                value={opt || ""}
                                                onChange={e => handleQuestionOptionChange(idx, oIdx, e.target.value)}
                                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand/50 outline-none text-sm font-medium"
                                                placeholder="Valor de la alternativa..."
                                            />
                                            <button
                                                onClick={() => handleQuestionOptionRemove(idx, oIdx)}
                                                className="p-2 text-slate-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {q.type === 'yes_no' && (
                            <div className="mt-4 pt-4 border-t border-slate-200 pl-2">
                                <div className="flex gap-3">
                                    <div className="px-4 py-2 bg-accent/10 text-accent border border-accent-200 rounded-xl text-sm font-bold shadow-sm">Sí / A Favor</div>
                                    <div className="px-4 py-2 bg-danger-50 text-danger-700 border border-danger-200 rounded-xl text-sm font-bold shadow-sm">No / En Contra</div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
