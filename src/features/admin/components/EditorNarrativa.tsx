import React from "react";
import { Topic } from "../../signals/types/actualidad";

interface EditorNarrativaProps {
    formData: Partial<Topic>;
    setFormData: React.Dispatch<React.SetStateAction<Partial<Topic>>>;
}

export function EditorNarrativa({ formData, setFormData }: EditorNarrativaProps) {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 lg:p-8">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-black text-slate-900">1. Narrativa Editorial</h2>
                <p className="text-xs text-slate-500">Define cómo los usuarios leerán este contexto.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Título Corto del Tema (Máx 5 Palabras)</label>
                    <input
                        type="text"
                        value={formData.title || ""}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:bg-white focus:border-brand outline-none transition-all font-bold text-xl text-slate-900"
                        placeholder="Ej: Aprobación de la Ley Corta"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cuerpo Neutral (News Summary)</label>
                    <textarea
                        value={formData.summary || ""}
                        onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:bg-white focus:border-brand outline-none transition-all resize-none text-slate-700 leading-relaxed"
                        placeholder="Redacta los hechos de forma objetiva..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cita / Frase de Impacto Corta</label>
                    <input
                        type="text"
                        value={formData.impact_phrase || ""}
                        onChange={e => setFormData(prev => ({ ...prev, impact_phrase: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:bg-white focus:border-brand outline-none transition-all text-sm italic text-slate-600"
                        placeholder="Ej: «Aún queda mucho camino que recorrer» - M. Marcel"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">URL de Imagen (Opcional - Prioridad Alta)</label>
                    <input
                        type="url"
                        value={(formData.metadata?.image_url as string) || ""}
                        onChange={e => 
                            setFormData(prev => ({ 
                                ...prev, 
                                metadata: { 
                                    ...(prev.metadata || {}), 
                                    image_url: e.target.value 
                                } 
                            }))
                        }
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand/50 focus:bg-white focus:border-brand outline-none transition-all text-sm text-slate-700 font-mono"
                        placeholder="Ej: https://ejemplo.com/imagen.jpg"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                        Si la IA no detectó una imagen o es incorrecta, pega aquí la URL directa de la foto. Esta imagen tendrá prioridad sobre las demás.
                    </p>
                </div>
            </div>
        </section>
    );
}
