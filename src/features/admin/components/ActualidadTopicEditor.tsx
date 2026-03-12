import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Plus, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../supabase/client';

export interface AdminTopic {
  id: string;
  title: string;
  short_summary: string;
  category: string;
  status: string;
  tags: string[] | null;
  actors: string[] | null;
  intensity: number | null;
  confidence_score: number | null;
  relevance_chile: number | null;
  event_stage: string | null;
  topic_duration: string | null;
  opinion_maturity: string | null;
  created_at: string;
  published_at?: string;
  admin_edited?: boolean;
  metadata?: any;
  questions?: TopicQuestion[];
}

export interface TopicQuestion {
  id: string;
  question_text: string;
  answer_type: string;
  options_json: string[];
  question_order?: number;
}

interface ActualidadTopicEditorProps {
  topic: AdminTopic;
  onSave: () => void;
  onCancel: () => void;
}

export default function ActualidadTopicEditor({ topic, onSave, onCancel }: ActualidadTopicEditorProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminTopic>>({
    title: topic.title || '',
    short_summary: topic.short_summary || '',
    category: topic.category || 'País',
    tags: topic.tags || [],
    actors: topic.actors || [],
    intensity: topic.intensity || 1,
    relevance_chile: topic.relevance_chile || 3,
    event_stage: topic.event_stage || 'discussion',
    topic_duration: topic.topic_duration || 'short',
    opinion_maturity: topic.opinion_maturity || 'low',
  });

  const [questions, setQuestions] = useState<TopicQuestion[]>(
    topic.questions?.sort((a,b) => (a.question_order || 0) - (b.question_order || 0)) || []
  );

  const [tagsInput, setTagsInput] = useState(formData.tags?.join(', ') || '');
  const [actorsInput, setActorsInput] = useState(formData.actors?.join(', ') || '');

  const handleTagsChange = (val: string) => {
    setTagsInput(val);
    setFormData(prev => ({ ...prev, tags: val.split(',').map(t => t.trim()).filter(Boolean) }));
  };

  const handleActorsChange = (val: string) => {
    setActorsInput(val);
    setFormData(prev => ({ ...prev, actors: val.split(',').map(a => a.trim()).filter(Boolean) }));
  };

  const handleQuestionChange = (id: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleQuestionOptionAdd = (id: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        return { ...q, options_json: [...(q.options_json || []), 'Nueva Opción'] };
      }
      return q;
    }));
  };

  const handleQuestionOptionChange = (qId: string, idx: number, val: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const newOpts = [...(q.options_json || [])];
        newOpts[idx] = val;
        return { ...q, options_json: newOpts };
      }
      return q;
    }));
  };

  const handleQuestionOptionRemove = (qId: string, idx: number) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        const newOpts = [...(q.options_json || [])];
        newOpts.splice(idx, 1);
        return { ...q, options_json: newOpts };
      }
      return q;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update Topic via Supabase
      const { error: topicError } = await supabase
        .from('current_topics')
        .update({
          title: formData.title,
          short_summary: formData.short_summary,
          category: formData.category,
          tags: formData.tags,
          actors: formData.actors,
          intensity: formData.intensity,
          relevance_chile: formData.relevance_chile,
          event_stage: formData.event_stage,
          topic_duration: formData.topic_duration,
          opinion_maturity: formData.opinion_maturity,
          admin_edited: true // Flag as edited
        })
        .eq('id', topic.id);

      if (topicError) throw topicError;

      // 2. Update Questions
      for (const q of questions) {
        const { error: qError } = await supabase
          .from('topic_questions')
          .update({
            question_text: q.question_text,
            answer_type: q.answer_type,
            options_json: q.options_json
          })
          .eq('id', q.id);
        
        if (qError) throw qError;
      }

      onSave(); // Trigger parent refresh
    } catch (err) {
      console.error('Error saving topic:', err);
      alert('Hubo un error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const sourceUrl = topic.metadata?.source_url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-auto relative"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Editor Editorial</h2>
            <p className="text-sm text-slate-500">ID: <span className="font-mono text-xs">{topic.id}</span></p>
          </div>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {topic.confidence_score && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${topic.confidence_score >= 80 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Confianza de IA: {topic.confidence_score}%</p>
                <p className="text-xs opacity-80">Revisa bien los campos antes de aprobar y publicar.</p>
              </div>
            </div>
          )}

          {sourceUrl && (
            <div className="mb-6">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Fuente Base</span>
              <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline bg-white px-3 py-2 border border-slate-200 rounded-lg inline-block break-all max-w-full">
                {sourceUrl}
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título Corto (Max 5 palabras ideal)</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-bold text-lg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resumen Neutral (Contexto)</label>
              <textarea 
                value={formData.short_summary} 
                onChange={e => setFormData(prev => ({ ...prev, short_summary: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-medium"
              >
                <option value="País">País</option>
                <option value="Economía">Economía</option>
                <option value="Ciudad / Vida diaria">Ciudad / Vida diaria</option>
                <option value="Marcas y Consumo">Marcas y Consumo</option>
                <option value="Deportes y Cultura">Deportes y Cultura</option>
                <option value="Tendencias y Sociedad">Tendencias y Sociedad</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags (comas)</label>
              <input 
                type="text" 
                value={tagsInput} 
                onChange={e => handleTagsChange(e.target.value)}
                placeholder="ej: IPC, Inflación, Marcel"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Actores (comas)</label>
              <input 
                type="text" 
                value={actorsInput} 
                onChange={e => handleActorsChange(e.target.value)}
                placeholder="ej: Gobierno, BC"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
              />
            </div>

             <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Intensidad (1-3) / Relevancia Chile (1-5)</label>
              <div className="flex gap-4">
                <input 
                  type="number" min="1" max="3"
                  value={formData.intensity || 1} 
                  onChange={e => setFormData(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                  className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
                 <input 
                  type="number" min="1" max="5"
                  value={formData.relevance_chile || 3} 
                  onChange={e => setFormData(prev => ({ ...prev, relevance_chile: parseInt(e.target.value) }))}
                  className="w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fase del Evento</label>
              <select 
                value={formData.event_stage || 'discussion'} 
                onChange={e => setFormData(prev => ({ ...prev, event_stage: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
              >
                <option value="announcement">Anuncio / Noticia de Último Minuto</option>
                <option value="discussion">En Discusión / Debate</option>
                <option value="implementation">Implementación / Consecuencias</option>
                <option value="crisis">Crisis / Polémica</option>
                <option value="result">Resultado Final</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Madurez de la Opinión</label>
              <select 
                value={formData.opinion_maturity || 'low'} 
                onChange={e => setFormData(prev => ({ ...prev, opinion_maturity: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
              >
                <option value="low">Baja (Reacción inicial / Emocional)</option>
                <option value="medium">Media (Debate informado)</option>
                <option value="high">Alta (Posiciones consolidadas)</option>
              </select>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-4 px-2 tracking-tight">Estructura de Preguntas (Requerido: 3)</h3>
          
          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
                <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center border-4 border-slate-50 shadow-sm">
                  {idx + 1}
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                       {idx === 0 ? 'Pregunta 1 (Reacción)' : idx === 1 ? 'Pregunta 2 (Interpretación)' : 'Pregunta 3 (Posición)'}
                    </label>
                    <input 
                      type="text" 
                      value={q.question_text} 
                      onChange={e => handleQuestionChange(q.id, 'question_text', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all font-semibold"
                    />
                  </div>
                  <div className="w-full md:w-64">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                    <select 
                      value={q.answer_type} 
                      onChange={e => handleQuestionChange(q.id, 'answer_type', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                    >
                      <option value="scale_0_10">Escala 0 al 10</option>
                      <option value="scale_5">Escala 1 al 5</option>
                      <option value="single_choice">Alternativas Múltiples</option>
                      <option value="single_choice_polar">Alternativas (Polarizado)</option>
                      <option value="yes_no">Sí / No</option>
                    </select>
                  </div>
                </div>

                {q.answer_type !== 'scale_0_10' && q.answer_type !== 'scale_5' && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opciones</label>
                      {(q.answer_type === 'single_choice' || q.answer_type === 'single_choice_polar') && (
                        <button onClick={() => handleQuestionOptionAdd(q.id)} className="text-xs font-bold text-primary-600 flex items-center bg-white px-2 py-1 rounded-md border border-slate-200">
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar
                        </button>
                      )}
                    </div>
                    {q.answer_type === 'yes_no' ? (
                      <div className="flex gap-2">
                        <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">Sí</span>
                        <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700">No</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {(q.options_json || []).map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-2">
                            <input 
                              type="text" 
                              value={opt} 
                              onChange={e => handleQuestionOptionChange(q.id, oIdx, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                            />
                            <button onClick={() => handleQuestionOptionRemove(q.id, oIdx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 rounded-b-2xl shrink-0">
          <button 
            onClick={onCancel}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn-primary px-8 py-2.5 flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </button>
        </div>
      </motion.div>
    </div>
  );
}
