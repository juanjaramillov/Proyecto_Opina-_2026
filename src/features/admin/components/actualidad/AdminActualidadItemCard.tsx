import { motion } from "framer-motion";
import { Clock, Globe, Activity, Zap, Eye, MessageCircle, Share2, Edit2, FileEdit, XCircle, CheckCircle, UploadCloud, ArrowLeft, Archive, CheckSquare, Square } from "lucide-react";
import { Topic, TopicStatus } from "../../../signals/types/actualidad";
import { MetricAvailabilityCard } from "../../../../components/ui/MetricAvailabilityCard";
import { GradientCTA } from "../../../../components/ui/foundation";

interface AdminActualidadItemCardProps {
  topic: Topic;
  activeTab: TopicStatus;
  onUpdateStatus: (id: string, status: TopicStatus) => void;
  onOpenEditor: (topic: Topic) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function AdminActualidadItemCard({ topic, activeTab, onUpdateStatus, onOpenEditor, isSelected = false, onToggleSelect }: AdminActualidadItemCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative group flex flex-col md:flex-row border rounded-2xl overflow-hidden shadow-sm transition-all ${
        isSelected 
          ? 'bg-brand-50/50 border-brand-300 shadow-md ring-1 ring-brand-300'
          : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Checkbox Overlay de Selección */}
      {onToggleSelect && (
        <button 
          onClick={onToggleSelect}
          className={`absolute top-4 right-4 md:left-4 md:right-auto z-10 p-1.5 rounded-lg transition-colors bg-white/80 backdrop-blur-sm border shadow-sm flex items-center justify-center ${
            isSelected ? 'border-brand-300 text-brand' : 'border-slate-200 text-slate-400 hover:text-slate-600'
          }`}
        >
          {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
        </button>
      )}

      <div className={`w-1.5 shrink-0 ${
        topic.confidence_score !== null && topic.confidence_score >= 80 ? 'bg-accent' :
        topic.confidence_score !== null && topic.confidence_score >= 50 ? 'bg-warning' :
        'bg-slate-300'
      }`} />

      {Boolean(topic.metadata?.image_url) && (
        <div className="hidden md:block w-48 shrink-0 bg-slate-100 border-r border-slate-100 relative overflow-hidden">
          <img 
            src={topic.metadata?.image_url as string} 
            alt={topic.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border ${
              isSelected ? 'text-brand-900 bg-brand-100 border-brand-200' : 'text-brand bg-brand/10 border-brand-100/50'
            } md:ml-8`}>
              {topic.category}
            </span>
            
            {topic.source_domain && (
              <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md flex items-center gap-1 border border-slate-200/50">
                <Globe className="w-3 h-3" />
                {topic.source_domain}
              </span>
            )}

            {topic.confidence_score !== null && (
              <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                topic.confidence_score >= 80 ? 'text-accent bg-accent/10 border-accent-100' : 
                'text-warning bg-warning/10 border-warning/30'
              }`}>
                <Activity className="w-3 h-3" />
                IA: {topic.confidence_score}%
              </span>
            )}

            {topic.intensity !== null && topic.intensity > 1 && (
              <span className="text-[10px] font-black tracking-widest uppercase text-warning-700 bg-warning-50 border border-warning-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Intensidad {topic.intensity}/3
              </span>
            )}

            {topic.admin_edited && (
              <span className="text-[10px] font-black tracking-widest uppercase text-brand-700 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-md">
                Editado
              </span>
            )}

            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 ml-auto">
              <Clock className="w-3.5 h-3.5" />
              {new Date(topic.created_at).toLocaleDateString('es-CL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-brand transition-colors line-clamp-2 min-h-[56px]">
            {topic.title}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 pr-4 lg:pr-12 min-h-[40px]">
            {topic.summary}
          </p>
        </div>
        
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {topic.tags.slice(0, 4).map((t: string) => (
              <span key={t} className="text-[11px] bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-medium">#{t}</span>
            ))}
            {topic.tags.length > 4 && <span className="text-[11px] text-slate-400 font-medium px-1 py-0.5">+{topic.tags.length - 4}</span>}
          </div>
        )}

        {activeTab === 'published' && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100/80 w-full shrink-0">
            <MetricAvailabilityCard 
                label="Vistas" 
                status="insufficient_data" 
                compact 
                icon={Eye}
            />
            <MetricAvailabilityCard 
                label="Señales" 
                status="pending" 
                compact
                icon={MessageCircle} 
            />
            <MetricAvailabilityCard 
                label="CTR" 
                status="pending" 
                compact 
                icon={Share2}
            />
          </div>
        )}
      </div>

      <div className="bg-slate-50/50 p-6 border-t md:border-t-0 md:border-l border-slate-100 flex flex-row md:flex-col justify-end items-center md:items-stretch gap-3 shrink-0 md:w-48">
        <button 
          onClick={() => onOpenEditor(topic)}
          className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm py-2.5 px-4 rounded-xl font-bold transition-all text-sm group/btn"
        >
          <Edit2 className="w-4 h-4 text-slate-500 group-hover/btn:text-slate-800" />
          Revisar Tema
        </button>

        <div className="flex flex-col gap-2 w-full mt-2 md:mt-0">
          {activeTab === 'detected' && (
            <div className="flex gap-2">
              <GradientCTA
                label="Borrador"
                icon={<FileEdit className="w-4 h-4" />}
                iconPosition="leading"
                size="sm"
                className="flex-1 shadow-sm"
                onClick={() => onUpdateStatus(topic.id, 'draft')}
              />
              <button 
                onClick={() => onUpdateStatus(topic.id, 'rejected')}
                className="flex-1 bg-white border border-danger-200 text-danger-600 hover:bg-danger-50 hover:border-danger-300 py-2.5 px-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center"
                title="Rechazar"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}
          {(activeTab === 'draft' || activeTab === 'review') && (
            <div className="flex flex-col gap-2">
              {activeTab === 'draft' && (
                <button 
                  onClick={() => onUpdateStatus(topic.id, 'review')}
                  className="w-full btn-primary py-2.5 px-3 shadow-sm text-sm justify-center bg-brand hover:bg-brand-700 hover:shadow-brand/30"
                  title="Mandar a revisión"
                >
                  <Activity className="w-4 h-4" />
                  <span className="ml-1.5">A Revisión</span>
                </button>
              )}
              {activeTab === 'review' && (
                <div className="flex gap-2">
                  <button 
                      onClick={() => onUpdateStatus(topic.id, 'approved')}
                      className="flex-1 btn-primary py-2.5 px-2 shadow-sm text-sm justify-center bg-accent hover:bg-accent-700 hover:shadow-accent/30"
                      title="Aprobar tema"
                  >
                      <CheckCircle className="w-4 h-4" />
                      <span className="sr-only md:not-sr-only md:ml-1.5">Aprobar</span>
                  </button>
                  <button 
                      onClick={() => onUpdateStatus(topic.id, 'draft')}
                      className="flex-1 bg-white border border-warning-200 text-warning-600 hover:bg-warning-50 hover:border-warning-300 py-2.5 px-2 rounded-xl font-bold transition-colors text-sm flex items-center justify-center"
                      title="Rechazar (Volver borrador)"
                  >
                      <XCircle className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'approved' && (
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => onUpdateStatus(topic.id, 'published')}
                className="w-full btn-primary py-2.5 px-3 shadow-sm text-sm justify-center bg-accent hover:bg-accent-700 hover:shadow-accent-500/30"
                title="Publicar en App"
              >
                <UploadCloud className="w-4 h-4" />
                <span className="ml-1.5">Publicar Ahora</span>
              </button>
              <button 
                onClick={() => onUpdateStatus(topic.id, 'draft')}
                className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 px-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-1.5"
                title="Devolver a Borrador"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Devolver a Borrador
              </button>
            </div>
          )}
          {activeTab === 'published' && (
            <button 
              onClick={() => onUpdateStatus(topic.id, 'archived')}
              className="w-full bg-slate-800 border-transparent text-white hover:bg-slate-900 py-2.5 px-4 rounded-xl font-bold transition-colors shadow-sm text-sm flex justify-center items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Archivar Tema
            </button>
          )}
          {(activeTab === 'rejected' || activeTab === 'archived') && (
             <button 
              onClick={() => onUpdateStatus(topic.id, 'draft')}
              className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 px-4 rounded-xl font-bold transition-colors shadow-sm text-sm flex justify-center items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Restaurar a Borrador
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
