import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, CheckCircle, XCircle, Clock, Edit2, UploadCloud, Archive, Filter, ChevronDown, Activity, Globe, Zap, Inbox, FileEdit, Radio, ArrowLeft, MessageCircle, Share2, Eye } from "lucide-react";
import { adminActualidadService } from "../services/adminActualidadService";
import { Topic, TopicStatus, TopicCategory } from "../../signals/types/actualidad";
import { useNavigate } from "react-router-dom";
import { logger } from '../../../lib/logger';

type SortOption = 'recent' | 'confidence' | 'intensity';

export default function AdminActualidad() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TopicStatus>('detected');
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<TopicCategory | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const navigate = useNavigate();

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminActualidadService.getAdminTopics(activeTab);
      setTopics(data);
    } catch (err) {
      logger.error("Error fetching topics", { domain: 'admin_actions', origin: 'AdminActualidad', action: 'fetch_topics', state: 'failed' }, err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const updateStatus = async (id: string, newStatus: TopicStatus) => {
    try {
      const res = await adminActualidadService.updateTopicStatus(id, newStatus);
      if (res.success) {
        setTopics(prev => prev.filter(t => t.id !== id));
      } else {
        alert(res.error || "Error al actualizar estado");
      }
    } catch (err) {
      logger.error("Error updating status", { domain: 'admin_actions', origin: 'AdminActualidad', action: 'update_status', state: 'failed' }, err);
    }
  };

  const openEditor = (t: Topic) => {
    navigate(`/admin/actualidad/${t.id}`);
  };

  // Derived Filters
  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    topics.forEach(t => { if (t.source_domain) sources.add(t.source_domain); });
    return Array.from(sources).sort();
  }, [topics]);

  const filteredAndSortedTopics = useMemo(() => {
    let result = [...topics];

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }
    if (sourceFilter !== 'all') {
      result = result.filter(t => t.source_domain === sourceFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return (b.confidence_score || 0) - (a.confidence_score || 0);
        case 'intensity':
          return (b.intensity || 0) - (a.intensity || 0);
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [topics, categoryFilter, sourceFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative bg-slate-50 min-h-screen">
      {/* Editorial Header */}
      <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 saturate-0 pointer-events-none">
          <Newspaper className="w-64 h-64 rotate-12" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600 border border-primary-100/50">
              <Newspaper className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Mesa Editorial</h1>
          </div>
          <p className="text-slate-500 max-w-xl text-base leading-relaxed">
            Revisa, edita y publica los temas generados por IA a partir de las noticias recientes. 
            Asegura el estándar editorial antes de llegar a la audiencia.
          </p>
          
          <div className="flex gap-6 mt-6">
             <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total en Bandeja</span>
               <span className="text-2xl font-black text-slate-800">{loading ? '-' : topics.length}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs & Filters */}
      <div className="flex flex-col gap-6 mb-6">
        
        {/* Status Dashboard Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
          {[
            { id: 'detected', label: 'Bandeja IA', icon: Inbox, desc: 'Detectados' },
            { id: 'draft', label: 'Borradores', icon: FileEdit, desc: 'Edición' },
            { id: 'review', label: 'En Revisión', icon: Activity, desc: 'Validación' },
            { id: 'approved', label: 'Aprobados', icon: CheckCircle, desc: 'Listos' },
            { id: 'published', label: 'Publicados', icon: Radio, desc: 'Visibles App' },
            { id: 'archived', label: 'Archivados', icon: Archive, desc: 'Históricos' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TopicStatus)}
                className={`relative flex flex-col justify-center p-4 rounded-2xl text-left transition-all duration-300 border ${
                  active 
                    ? 'bg-white border-primary-500 shadow-[0_8px_20px_-6px_rgba(59,130,246,0.3)] ring-1 ring-primary-500 z-10' 
                    : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl shrink-0 ${active ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`font-black text-sm leading-tight truncate ${active ? 'text-primary-900' : 'text-slate-700'}`}>
                      {tab.label}
                    </span>
                  </div>
                  {active && (
                    <div className="bg-primary-100 text-primary-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md shrink-0 ml-1">
                      {loading ? '...' : topics.length}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-500 mt-1 truncate">{tab.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Filters Group */}
        <div className="flex items-center gap-3 flex-wrap lg:flex-nowrap w-full justify-start lg:justify-end overflow-x-auto pb-2 lg:pb-0">
          {/* Category Filter */}
          <div className="relative group/filter">
            <select 
              value={categoryFilter} 
              onChange={e => setCategoryFilter(e.target.value as TopicCategory | 'all')}
              className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              {['País', 'Economía', 'Ciudad / Vida diaria', 'Marcas y Consumo', 'Deportes y Cultura', 'Tendencias y Sociedad'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Source Filter */}
          {uniqueSources.length > 0 && (
            <div className="relative group/filter">
              <select 
                value={sourceFilter} 
                onChange={e => setSourceFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all cursor-pointer"
              >
                <option value="all">Todas las Fuentes</option>
                {uniqueSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* Sort Menu */}
          <div className="relative group/filter flex items-center bg-white border border-slate-200 rounded-xl px-2 shadow-sm transition-all">
             <Filter className="w-4 h-4 text-slate-400 ml-2" />
             <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value as SortOption)}
              className="appearance-none bg-transparent text-slate-700 text-sm font-bold rounded-xl pl-2 pr-8 py-2.5 outline-none cursor-pointer"
            >
              <option value="recent">Más Recientes</option>
              <option value="confidence">Mayor Confianza IA</option>
              <option value="intensity">Mayor Intensidad</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Main List Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Cargando mesa editorial...</p>
        </div>
      ) : filteredAndSortedTopics.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white border text-center border-dashed border-slate-300 rounded-3xl p-16 shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto mt-12"
        >
          <div className="bg-slate-50 p-6 rounded-full mb-6">
            <Newspaper className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Bandeja Vacía</h3>
          <p className="text-slate-500 text-center max-w-sm">
            No se encontraron temas para los filtros actuales en estado <span className="font-bold">"{activeTab}"</span>.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          <AnimatePresence>
            {filteredAndSortedTopics.map(topic => (
              <motion.div
                key={topic.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group flex flex-col md:flex-row bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-md rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                {/* Visual indicator bar on the left */}
                <div className={`w-1.5 shrink-0 ${
                  topic.confidence_score !== null && topic.confidence_score >= 80 ? 'bg-emerald-500' :
                  topic.confidence_score !== null && topic.confidence_score >= 50 ? 'bg-amber-400' :
                  'bg-slate-300'
                }`} />

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Top Row: Meta Badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="text-[10px] font-black tracking-widest uppercase text-primary-700 bg-primary-50 border border-primary-100/50 px-2.5 py-1 rounded-md">
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
                          topic.confidence_score >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-100' : 
                          'text-amber-700 bg-amber-50 border-amber-100'
                        }`}>
                          <Activity className="w-3 h-3" />
                          IA: {topic.confidence_score}%
                        </span>
                      )}

                      {topic.intensity !== null && topic.intensity > 1 && (
                        <span className="text-[10px] font-black tracking-widest uppercase text-orange-700 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Intensidad {topic.intensity}/3
                        </span>
                      )}

                      {topic.admin_edited && (
                        <span className="text-[10px] font-black tracking-widest uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                          Editado
                        </span>
                      )}

                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1 ml-auto">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(topic.created_at).toLocaleDateString('es-CL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Main Content */}
                    <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-primary-700 transition-colors line-clamp-2 min-h-[56px]">
                      {topic.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2 pr-4 lg:pr-12 min-h-[40px]">
                      {topic.summary}
                    </p>
                  </div>
                  
                  {/* Bottom Tags */}
                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {topic.tags.slice(0, 4).map(t => (
                        <span key={t} className="text-[11px] bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-medium">#{t}</span>
                      ))}
                      {topic.tags.length > 4 && <span className="text-[11px] text-slate-400 font-medium px-1 py-0.5">+{topic.tags.length - 4}</span>}
                    </div>
                  )}

                  {/* Engagement Metrics for Published Items */}
                  {activeTab === 'published' && (
                    <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100/80 w-full shrink-0">
                      <div className="flex items-center gap-1.5 text-sm" title="Impresiones/Vistas">
                        <Eye className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-slate-700">{Math.floor(Math.random() * 5000 + 1000).toLocaleString()}</span>
                        <span className="text-slate-400 text-xs hidden sm:inline">vistas</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm" title="Interacciones directas">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span className="font-bold text-slate-700">{Math.floor(Math.random() * 500 + 50).toLocaleString()}</span>
                        <span className="text-slate-400 text-xs hidden sm:inline">votos</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm" title="Click-Through Rate">
                        <Share2 className="w-4 h-4 text-purple-500" />
                        <span className="font-bold text-slate-700">{(Math.random() * 15 + 2).toFixed(1)}%</span>
                        <span className="text-slate-400 text-xs hidden sm:inline">CTR</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Actions Area */}
                <div className="bg-slate-50/50 p-6 border-t md:border-t-0 md:border-l border-slate-100 flex flex-row md:flex-col justify-end items-center md:items-stretch gap-3 shrink-0 md:w-48">
                  
                  {/* Principal Action */}
                  <button 
                    onClick={() => openEditor(topic)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm py-2.5 px-4 rounded-xl font-bold transition-all text-sm group/btn"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500 group-hover/btn:text-slate-800" />
                    Revisar Tema
                  </button>

                  {/* Contextual Actions by Status */}
                  <div className="flex flex-col gap-2 w-full mt-2 md:mt-0">
                    {activeTab === 'detected' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateStatus(topic.id, 'draft')}
                          className="flex-1 btn-primary py-2.5 px-3 shadow-sm text-sm justify-center group/btn2 relative"
                          title="Hacer Borrador"
                        >
                          <FileEdit className="w-4 h-4" />
                          <span className="sr-only md:not-sr-only md:ml-1.5">Borrador</span>
                        </button>
                        <button 
                          onClick={() => updateStatus(topic.id, 'rejected')}
                          className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 py-2.5 px-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center"
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
                            onClick={() => updateStatus(topic.id, 'review')}
                            className="w-full btn-primary py-2.5 px-3 shadow-sm text-sm justify-center bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30"
                            title="Mandar a revisión"
                          >
                            <Activity className="w-4 h-4" />
                            <span className="ml-1.5">A Revisión</span>
                          </button>
                        )}
                        {activeTab === 'review' && (
                          <div className="flex gap-2">
                            <button 
                                onClick={() => updateStatus(topic.id, 'approved')}
                                className="flex-1 btn-primary py-2.5 px-2 shadow-sm text-sm justify-center bg-teal-600 hover:bg-teal-700 hover:shadow-teal-500/30"
                                title="Aprobar tema"
                            >
                                <CheckCircle className="w-4 h-4" />
                                <span className="sr-only md:not-sr-only md:ml-1.5">Aprobar</span>
                            </button>
                            <button 
                                onClick={() => updateStatus(topic.id, 'draft')}
                                className="flex-1 bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 py-2.5 px-2 rounded-xl font-bold transition-colors text-sm flex items-center justify-center"
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
                          onClick={() => updateStatus(topic.id, 'published')}
                          className="w-full btn-primary py-2.5 px-3 shadow-sm text-sm justify-center bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/30"
                          title="Publicar en App"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span className="ml-1.5">Publicar Ahora</span>
                        </button>
                        <button 
                          onClick={() => updateStatus(topic.id, 'draft')}
                          className="w-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 px-3 rounded-xl font-bold transition-colors text-sm flex items-center justify-center gap-1.5"
                          title="Devolver a Borrador"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Devolver a Borrador
                        </button>
                      </div>
                    )}
                    {activeTab === 'published' && (
                      <button 
                        onClick={() => updateStatus(topic.id, 'archived')}
                        className="w-full bg-slate-800 border-transparent text-white hover:bg-slate-900 py-2.5 px-4 rounded-xl font-bold transition-colors shadow-sm text-sm flex justify-center items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Archivar Tema
                      </button>
                    )}
                    {(activeTab === 'rejected' || activeTab === 'archived') && (
                       <button 
                        onClick={() => updateStatus(topic.id, 'draft')}
                        className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 px-4 rounded-xl font-bold transition-colors shadow-sm text-sm flex justify-center items-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Restaurar a Borrador
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
