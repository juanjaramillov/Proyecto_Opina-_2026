import React from "react";
import { Topic } from "../../signals/types/actualidad";

interface EditorClasificacionProps {
    formData: Partial<Topic>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Topic>>>;
    tagsInput: string;
    handleTagsChange: (val: string) => void;
    actorsInput: string;
    handleActorsChange: (val: string) => void;
}

export function EditorClasificacion({
    formData,
    setFormData,
    tagsInput,
    handleTagsChange,
    actorsInput,
    handleActorsChange
}: EditorClasificacionProps) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 lg:p-8">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">2. Clasificación y Contexto Algorítmico</h2>
                <p className="text-xs text-slate-500">Parámetros que organizan este tema en los dashboards y feeds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Categoría Principal</label>
                    <select
                        value={formData.category || ""}
                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as Topic['category'] }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm text-slate-700"
                    >
                        <option value="País">País</option>
                        <option value="Internacional">Internacional</option>
                        <option value="Economía">Economía</option>
                        <option value="Ciudad / Vida diaria">Ciudad / Vida diaria</option>
                        <option value="Marcas y Consumo">Marcas y Consumo</option>
                        <option value="Deportes y Cultura">Deportes y Cultura</option>
                        <option value="Tendencias y Sociedad">Tendencias y Sociedad</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Intensidad IA (1-3)</label>
                    <input
                        type="number" min="1" max="3"
                        value={formData.intensity || 1}
                        onChange={e => setFormData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Fase de Discusión</label>
                    <select
                        value={formData.event_stage || 'discussion'}
                        onChange={e => setFormData(prev => ({ ...prev, event_stage: e.target.value as Topic['event_stage'] }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm text-slate-700"
                    >
                        <option value="announcement">Anuncio / Urgente</option>
                        <option value="discussion">En Debate Creciente</option>
                        <option value="implementation">Implementación / Efectos</option>
                        <option value="crisis">Crisis / Polémica</option>
                        <option value="result">Resolución</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tags (Separados por coma)</label>
                    <input
                        type="text"
                        value={tagsInput}
                        onChange={e => handleTagsChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        placeholder="IPC, Marcel, Banco Central"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Actores (Separados por coma)</label>
                    <input
                        type="text"
                        value={actorsInput}
                        onChange={e => handleActorsChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                        placeholder="Gobierno, Central Unitaria"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Madurez de Opinión</label>
                    <select
                        value={formData.opinion_maturity || 'low'}
                        onChange={e => setFormData(prev => ({ ...prev, opinion_maturity: e.target.value as Topic['opinion_maturity'] }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm text-slate-700"
                    >
                        <option value="low">1. Emocional / Reacción Temprana</option>
                        <option value="medium">2. Debate Informado</option>
                        <option value="high">3. Posición Cristalizada</option>
                    </select>
                </div>

            </div>
        </section>
    );
}
