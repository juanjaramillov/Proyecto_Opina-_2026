import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Save, CheckCircle, UploadCloud, Archive, XCircle, 
  AlertCircle, Plus, Trash2, Globe, Clock, Edit2
} from "lucide-react";
import { adminActualidadService } from "../services/adminActualidadService";
import { Topic, TopicQuestion, TopicStatus, QuestionType } from "../../signals/types/actualidad";

export default function AdminActualidadEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topic, setTopic] = useState<Topic | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Topic>>({});
  const [questions, setQuestions] = useState<TopicQuestion[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [actorsInput, setActorsInput] = useState("");

  const fetchTopic = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await adminActualidadService.getAdminTopicById(id);
      if (data) {
        setTopic(data);
        setFormData({
          title: data.title,
          summary: data.summary,
          impact_phrase: data.impact_phrase || (window as any).impact_quote, // Backward mapping
          category: data.category,
          intensity: data.intensity,
          relevance_chile: data.relevance_chile,
          event_stage: data.event_stage,
          topic_duration: data.topic_duration,
          opinion_maturity: data.opinion_maturity,
          status: data.status,
          tags: data.tags,
          actors: data.actors,
        });

        const sortedQ = [...(data.questions || [])].sort((a, b) => a.order - b.order);
        // Ensure strictly 3 questions exist
        while (sortedQ.length < 3) {
          const defaultTypes: QuestionType[] = ['scale_0_10', 'single_choice', 'single_choice_polar'];
          sortedQ.push({
            order: sortedQ.length + 1,
            text: "",
            type: defaultTypes[sortedQ.length] || 'single_choice',
            options: []
          });
        }
        setQuestions(sortedQ.slice(0, 3));
        setTagsInput(data.tags?.join(", ") || "");
        setActorsInput(data.actors?.join(", ") || "");
      }
    } catch (err) {
      console.error("Error fetching topic", err);
      // alert("Error al cargar el tema.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTopic();
  }, [fetchTopic]);

  const handleTagsChange = (val: string) => {
    setTagsInput(val);
    setFormData(prev => ({ ...prev, tags: val.split(',').map(t => t.trim()).filter(Boolean) }));
  };

  const handleActorsChange = (val: string) => {
    setActorsInput(val);
    setFormData(prev => ({ ...prev, actors: val.split(',').map(a => a.trim()).filter(Boolean) }));
  };

  const handleQuestionChange = (orderIdx: number, field: string, value: any) => {
    setQuestions(prev => {
      const newQ = [...prev];
      newQ[orderIdx] = { ...newQ[orderIdx], [field]: value };
      return newQ;
    });
  };

  const handleQuestionOptionAdd = (orderIdx: number) => {
    setQuestions(prev => {
      const newQ = [...prev];
      newQ[orderIdx].options = [...(newQ[orderIdx].options || []), "Nueva Opción"];
      return newQ;
    });
  };

  const handleQuestionOptionChange = (orderIdx: number, optIdx: number, value: string) => {
    setQuestions(prev => {
      const newQ = [...prev];
      const newOpts = [...(newQ[orderIdx].options || [])];
      newOpts[optIdx] = value;
      newQ[orderIdx].options = newOpts;
      return newQ;
    });
  };

  const handleQuestionOptionRemove = (orderIdx: number, optIdx: number) => {
    setQuestions(prev => {
      const newQ = [...prev];
      const newOpts = [...(newQ[orderIdx].options || [])];
      newOpts.splice(optIdx, 1);
      newQ[orderIdx].options = newOpts;
      return newQ;
    });
  };

  // Validators
  const validateForm = () => {
    if (!formData.title?.trim()) return "El título es obligatorio.";
    if (!formData.summary?.trim()) return "El resumen neutral es obligatorio.";
    if (!formData.category) return "Debe tener una categoría.";
    
    // Check questions
    for (let i = 0; i < 3; i++) {
        const q = questions[i];
        if (!q.text.trim()) return `La Pregunta ${i+1} debe tener texto.`;
        if (q.type === 'single_choice' || q.type === 'single_choice_polar') {
            if (!q.options || q.options.length < 2) return `La Pregunta ${i+1} (${q.type}) requiere al menos 2 opciones.`;
            if (q.options.some(opt => !opt.trim())) return `La Pregunta ${i+1} tiene opciones vacías.`;
        }
    }
    return null;
  };

  const handleSave = async (silent = false) => {
    if (!topic || !id) return false;
    
    const err = validateForm();
    if (err) {
      if (!silent) alert(err);
      return false;
    }

    setSaving(true);
    try {
      const updates = { ...formData };
      await adminActualidadService.updateTopicEditorialData(id, updates, true);
      await adminActualidadService.updateTopicQuestions(id, questions);
      
      // Refresh local copy
      setTopic(prev => prev ? { ...prev, ...formData, admin_edited: true } as Topic : null);
      
      if (!silent) alert("Cambios guardados exitosamente.");
      return true;
    } catch (e) {
      console.error(e);
      if (!silent) alert("Error al guardar cambios.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: TopicStatus) => {
    if (!id || !topic) return;
    
    // Required to save cleanly before publishing or approving
    if (newStatus === 'published' || newStatus === 'approved') {
        const saved = await handleSave(true);
        if (!saved) {
            alert("Corrige los errores del formulario antes de transicionar estado.");
            return;
        }
    }

    setSaving(true);
    try {
      const success = await adminActualidadService.updateTopicStatus(id, newStatus);
      if (success) {
        setTopic(prev => prev ? { ...prev, status: newStatus } : null);
        setFormData(prev => ({ ...prev, status: newStatus }));
        if (newStatus === 'published') {
           navigate('/admin/actualidad');
        }
      } else {
        alert("No se pudo cambiar el estado.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-slate-400 font-medium animate-pulse">Cargando Mesa Editorial...</p>
    </div>
  );

  if (!topic) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">Tema no encontrado</h2>
      <button onClick={() => navigate('/admin/actualidad')} className="mt-4 btn-primary px-6 py-2">Volver al Directorio</button>
    </div>
  );

  const getStatusColor = (status: TopicStatus) => {
    switch(status) {
      case 'detected': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'published': return 'bg-primary-50 text-primary-700 border-primary-200';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'archived': return 'bg-slate-800 text-slate-300 border-slate-700';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: TopicStatus) => {
    switch(status) {
      case 'detected': return 'IA Detectado';
      case 'approved': return 'Aprobado';
      case 'published': return 'Publicado';
      case 'rejected': return 'Rechazado';
      case 'archived': return 'Archivado';
      default: return status;
    }
  };

  const getSourceURL = () => {
    if (topic.metadata?.source_url) return topic.metadata.source_url;
    if (topic.metadata?.raw_ai_payload?.source_url) return topic.metadata.raw_ai_payload.source_url;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/actualidad')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-slate-900 leading-none">Editor de Tema</h1>
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${getStatusColor(topic.status)}`}>
                {getStatusLabel(topic.status)}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">ID: {topic.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
            <button 
              onClick={() => handleSave(false)} disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Guardar Borrador
            </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* INFO ALERTS */}
        <div className="flex flex-col gap-3">
            {topic.confidence_score !== null && topic.confidence_score < 70 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold">Confianza de IA Basa ({topic.confidence_score}%)</p>
                        <p className="text-xs opacity-80">Este tema requiere revisión narrativa estricta. La IA reportó baja confianza en los datos estructurados.</p>
                    </div>
                </div>
            )}
            {topic.admin_edited && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-3 rounded-xl flex items-center gap-3">
                    <Edit2 className="w-4 h-4 shrink-0" />
                    <p className="text-sm font-bold">Este tema ya fue intervenido manualmente por un editor de Opina+.</p>
                </div>
            )}
        </div>

        {/* Bloque 1: Titulo y Resumen */}
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
                        value={formData.title} 
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500 outline-none transition-all font-bold text-xl text-slate-900"
                        placeholder="Ej: Aprobación de la Ley Corta"
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cuerpo Neutral (News Summary)</label>
                    <textarea 
                        value={formData.summary} 
                        onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500 outline-none transition-all resize-none text-slate-700 leading-relaxed"
                        placeholder="Redacta los hechos de forma objetiva..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cita / Frase de Impacto Corta</label>
                    <input 
                        type="text" 
                        value={formData.impact_phrase || ''} 
                        onChange={e => setFormData(prev => ({ ...prev, impact_phrase: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:border-primary-500 outline-none transition-all text-sm italic text-slate-600"
                        placeholder="Ej: «Aún queda mucho camino que recorrer» - M. Marcel"
                    />
                </div>
            </div>
        </section>

        {/* Bloque 2: Clasificación */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 lg:p-8">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900">2. Clasificación y Contexto Algorítmico</h2>
              <p className="text-xs text-slate-500">Parámetros que organizan este tema en los dashboards y feeds.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Categoría Principal</label>
                    <select 
                        value={formData.category} 
                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm text-slate-700"
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
                        onChange={e => setFormData(prev => ({ ...prev, event_stage: e.target.value as any }))}
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
                        onChange={e => setFormData(prev => ({ ...prev, opinion_maturity: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm text-slate-700"
                    >
                        <option value="low">1. Emocional / Reacción Temprana</option>
                        <option value="medium">2. Debate Informado</option>
                        <option value="high">3. Posición Cristalizada</option>
                    </select>
                </div>

            </div>
        </section>


        {/* Bloque 3: Setup de Preguntas Estrictas */}
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
                {questions.map((q, idx) => {
                    const titles = [
                        "1. Postura de Entrada", 
                        "2. Diagnóstico / Interpretación", 
                        "3. Sentencia Final / Política"
                    ];
                    
                    return (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 relative">
                            <div className="flex flex-col md:flex-row gap-5">
                                {/* Order indicator */}
                                <div className="absolute -left-3 -top-3 w-8 h-8 bg-slate-800 text-white rounded-full flex justify-center items-center shadow-sm font-black text-sm border-2 border-white">
                                    {idx + 1}
                                </div>
                                
                                <div className="flex-1 pl-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                        {titles[idx]}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={q.text} 
                                        onChange={e => handleQuestionChange(idx, 'text', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-slate-800 text-base shadow-sm"
                                        placeholder="Ej: ¿Qué tan de acuerdo estás con..."
                                    />
                                </div>

                                <div className="w-full md:w-56">
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                                        Formato de Captura
                                    </label>
                                    <select 
                                        value={q.type} 
                                        onChange={e => handleQuestionChange(idx, 'type', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-sm text-slate-700 shadow-sm"
                                    >
                                        <option value="scale_0_10">Escala 0-10</option>
                                        <option value="scale_5">Escala de 5 (Likert)</option>
                                        <option value="single_choice">Múltiple Opción</option>
                                        <option value="single_choice_polar">Opciones Polarizadas</option>
                                        <option value="yes_no">Botonera Sí / No</option>
                                    </select>
                                </div>
                            </div>

                            {/* Options Editor */}
                            {(q.type === 'single_choice' || q.type === 'single_choice_polar') && (
                                <div className="mt-4 pt-4 border-t border-slate-200 pl-2">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            Opciones de Respuesta
                                        </label>
                                        <button 
                                            onClick={() => handleQuestionOptionAdd(idx)}
                                            className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-primary-100"
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
                                                    value={opt} 
                                                    onChange={e => handleQuestionOptionChange(idx, oIdx, e.target.value)}
                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm font-medium"
                                                    placeholder="Valor de la alternativa..."
                                                />
                                                <button 
                                                    onClick={() => handleQuestionOptionRemove(idx, oIdx)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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
                                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-bold shadow-sm">Sí / A Favor</div>
                                        <div className="px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold shadow-sm">No / En Contra</div>
                                   </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Bloque 4: Meta info Fuente */}
        <section className="bg-slate-100 rounded-2xl p-6 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                Auditoría de Fuente Noticiosa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                   <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dominio Scraping</span>
                   <span className="font-mono text-xs text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">{topic.source_domain || 'Desconocido'}</span>
                </div>
                <div>
                   <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha Publicación Reporte</span>
                   <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {topic.source_published_at ? new Date(topic.source_published_at).toLocaleString('es-CL') : 'No capturada'}
                   </span>
                </div>
            </div>
            {getSourceURL() && (
                <div className="mt-4">
                    <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">URL Original</span>
                    <a href={getSourceURL()} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline break-all truncate block">
                        {getSourceURL()}
                    </a>
                </div>
            )}
        </section>

      </div>

      {/* Editor Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-4 py-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            
            <div className="text-sm font-medium text-slate-500 w-full sm:w-auto text-center sm:text-left">
                Estado actual: <strong className="text-slate-800 uppercase tracking-widest text-xs border border-slate-300 px-2 py-1 rounded ml-1 bg-slate-50">{getStatusLabel(formData.status as TopicStatus)}</strong>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
                {formData.status === 'detected' && (
                    <>
                        <button onClick={() => handleStatusChange('rejected')} className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                            <XCircle className="w-4 h-4" /> Rechazar
                        </button>
                        <button onClick={() => handleStatusChange('approved')} className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-800 text-white hover:bg-slate-900 shadow-sm rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" /> Aprobar y Cerrar Edición
                        </button>
                    </>
                )}

                {formData.status === 'approved' && (
                    <>
                        <button onClick={() => handleStatusChange('rejected')} className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                            <ArrowLeft className="w-4 h-4" /> Revertir a Detectado
                        </button>
                        <button onClick={() => handleStatusChange('published')} className="flex-1 sm:flex-none px-8 py-2.5 btn-primary shadow-md rounded-xl font-black flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50">
                            <UploadCloud className="w-5 h-5 text-white/90" /> PUBLICAR A USUARIOS
                        </button>
                    </>
                )}

                {(formData.status === 'published' || formData.status === 'rejected') && (
                    <button onClick={() => handleStatusChange('archived')} className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                        <Archive className="w-4 h-4" /> Enviar a Archivo Muerto
                    </button>
                )}
            </div>

        </div>
      </div>

    </div>
  );
}
