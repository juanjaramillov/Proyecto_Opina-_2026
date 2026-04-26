import { useParams } from "react-router-dom";
import { 
  ArrowLeft, Save, CheckCircle, UploadCloud, Archive, XCircle, 
  AlertCircle, Globe, Clock, Edit2, Activity, FileEdit
} from "lucide-react";
import { TopicStatus } from "../../signals/types/actualidad";

import { useActualidadEditor } from "../hooks/useActualidadEditor";
import { EditorNarrativa } from "../components/EditorNarrativa";
import { EditorClasificacion } from "../components/EditorClasificacion";
import { EditorPreguntas } from "../components/EditorPreguntas";
import { ActualidadPreview } from "../components/ActualidadPreview";
import { GradientCTA } from "../../../components/ui/foundation";

export default function AdminActualidadEditor() {
  const { id } = useParams<{ id: string }>();
  
  const {
      topic,
      formData,
      setFormData,
      questions,
      tagsInput,
      actorsInput,
      loading,
      saving,
      handleTagsChange,
      handleActorsChange,
      handleQuestionChange,
      handleQuestionOptionAdd,
      handleQuestionOptionChange,
      handleQuestionOptionRemove,
      handleSave,
      handleStatusChange,
      navigate
  } = useActualidadEditor(id);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
      <p className="text-slate-400 font-medium animate-pulse">Cargando Mesa Editorial...</p>
    </div>
  );

  if (!topic) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
      <h2 className="text-xl font-bold text-slate-800">Tema no encontrado</h2>
      <GradientCTA
        label="Volver al Directorio"
        icon="arrow_back"
        iconPosition="leading"
        size="sm"
        className="mt-4"
        onClick={() => navigate('/admin/actualidad')}
      />
    </div>
  );

  const getStatusColor = (status: TopicStatus) => {
    switch(status) {
      case 'detected': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'approved': return 'bg-accent/10 text-accent border-accent-200';
      case 'published': return 'bg-brand/10 text-brand border-brand/30';
      case 'rejected': return 'bg-danger-50 text-danger-700 border-danger-200';
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
    if (topic.metadata?.source_url) return topic.metadata.source_url as string;
    const aiPayload = topic.metadata?.raw_ai_payload as { source_url?: string } | undefined;
    if (aiPayload?.source_url) return aiPayload.source_url;
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
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

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col xl:flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: Editor Flow */}
            <div className="w-full xl:w-2/3 space-y-8 pb-32">
                <div className="flex flex-col gap-3">
                    {topic.confidence_score !== null && topic.confidence_score < 70 && (
                        <div className="bg-warning/10 border border-warning/30 text-warning p-4 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold">Confianza de IA Basa ({topic.confidence_score}%)</p>
                                <p className="text-xs opacity-80">Este tema requiere revisión narrativa estricta. La IA reportó baja confianza en los datos estructurados.</p>
                            </div>
                        </div>
                    )}
                    {topic.admin_edited && (
                        <div className="bg-brand-50 border border-brand-200 text-brand-800 p-3 rounded-xl flex items-center gap-3">
                            <Edit2 className="w-4 h-4 shrink-0" />
                            <p className="text-sm font-bold">Este tema ya fue intervenido manualmente por un editor de Opina+.</p>
                        </div>
                    )}
                </div>

                <EditorNarrativa formData={formData} setFormData={setFormData} />

                <EditorClasificacion 
                    formData={formData} 
                    setFormData={setFormData}
                    tagsInput={tagsInput}
                    handleTagsChange={handleTagsChange}
                    actorsInput={actorsInput}
                    handleActorsChange={handleActorsChange}
                />

                <EditorPreguntas 
                    questions={questions}
                    handleQuestionChange={handleQuestionChange}
                    handleQuestionOptionAdd={handleQuestionOptionAdd}
                    handleQuestionOptionChange={handleQuestionOptionChange}
                    handleQuestionOptionRemove={handleQuestionOptionRemove}
                />
            </div>

            {/* RIGHT COLUMN: Preview & Metadata */}
            <div className="w-full xl:w-1/3 xl:sticky xl:top-24 space-y-6 pb-32">
                <ActualidadPreview data={formData} />
                
                <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-500" />
                        Auditoría de Fuente Noticiosa
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dominio Scraping</span>
                        <span className="font-mono text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 block">{topic.source_domain || 'Desconocido'}</span>
                        </div>
                        <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha Publicación Reporte</span>
                        <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <Clock className="w-3.5 h-3.5" />
                            {topic.source_published_at ? new Date(topic.source_published_at).toLocaleString('es-CL') : 'No capturada'}
                        </span>
                        </div>
                    </div>
                    {getSourceURL() && (
                        <div className="mt-5 pt-4 border-t border-slate-100">
                            <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1">URL Original</span>
                            <a href={getSourceURL()!} target="_blank" rel="noreferrer" className="text-sm text-brand hover:text-brand hover:underline break-all block">
                                Abrir fuente original &rarr;
                            </a>
                        </div>
                    )}
                </section>
            </div>
            
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] px-4 py-4 z-50 transition-all">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-slate-500 w-full sm:w-auto text-center sm:text-left flex items-center justify-center sm:justify-start gap-2">
                Flujo actual: 
                <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getStatusColor(formData.status as TopicStatus)}`}>
                   {getStatusLabel(formData.status as TopicStatus)}
                </span>
            </div>

            <div className="flex gap-3 w-full sm:w-auto justify-end">
                {formData.status === 'detected' && (
                    <>
                        <button onClick={() => handleStatusChange('rejected')} className="w-full sm:w-auto px-5 py-3 bg-white border border-danger-200 text-danger-600 hover:bg-danger-50 hover:border-danger-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <XCircle className="w-4 h-4" /> Rechazar IA
                        </button>
                        <button onClick={() => handleStatusChange('draft')} className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-0.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <FileEdit className="w-4 h-4" /> Convertir a Borrador
                        </button>
                    </>
                )}

                {formData.status === 'draft' && (
                    <>
                        <button onClick={() => handleStatusChange('review')} className="w-full sm:w-auto px-8 py-3 bg-brand text-white hover:bg-brand-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <Activity className="w-4 h-4" /> Enviar a Revisión
                        </button>
                    </>
                )}

                {formData.status === 'review' && (
                    <>
                        <button onClick={() => handleStatusChange('draft')} className="w-full sm:w-auto px-5 py-3 bg-white border border-warning-200 text-warning-600 hover:bg-warning-50 hover:border-warning-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <XCircle className="w-4 h-4" /> Rechazar (Borrador)
                        </button>
                        <button onClick={() => handleStatusChange('approved')} className="w-full sm:w-auto px-8 py-3 bg-accent text-white hover:bg-accent-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" /> Aprobar Tema
                        </button>
                    </>
                )}

                {formData.status === 'approved' && (
                    <>
                        <button onClick={() => handleStatusChange('draft')} className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <ArrowLeft className="w-4 h-4" /> Volver a Borrador
                        </button>
                        <button onClick={() => handleStatusChange('published')} className="w-full sm:w-auto px-10 py-3 bg-accent text-white hover:bg-accent shadow-md hover:shadow-accent-500/30 hover:-translate-y-0.5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                            <UploadCloud className="w-5 h-5" /> PUBLICAR A USUARIOS
                        </button>
                    </>
                )}

                {(formData.status === 'published') && (
                    <button onClick={() => handleStatusChange('archived')} className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-slate-100 hover:bg-slate-900 hover:shadow-lg rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                        <Archive className="w-4 h-4" /> Mover al Archivo
                    </button>
                )}
                
                {(formData.status === 'rejected' || formData.status === 'archived') && (
                    <button onClick={() => handleStatusChange('draft')} className="w-full sm:w-auto px-8 py-3 bg-brand text-white hover:bg-brand shadow-md rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                        <Edit2 className="w-4 h-4" /> Restaurar a Borrador
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
