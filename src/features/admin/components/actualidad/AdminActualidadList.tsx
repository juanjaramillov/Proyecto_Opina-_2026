import { motion, AnimatePresence } from "framer-motion";
import { Newspaper } from "lucide-react";
import { Topic, TopicStatus } from "../../../signals/types/actualidad";
import { AdminActualidadItemCard } from "./AdminActualidadItemCard";

interface AdminActualidadListProps {
  loading: boolean;
  filteredAndSortedTopics: Topic[];
  activeTab: TopicStatus;
  onUpdateStatus: (id: string, status: TopicStatus) => void;
  onOpenEditor: (topic: Topic) => void;
}

export function AdminActualidadList({
  loading,
  filteredAndSortedTopics,
  activeTab,
  onUpdateStatus,
  onOpenEditor
}: AdminActualidadListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-slate-400 font-medium animate-pulse">Cargando mesa editorial...</p>
      </div>
    );
  }

  if (filteredAndSortedTopics.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5">
      <AnimatePresence>
        {filteredAndSortedTopics.map(topic => (
          <AdminActualidadItemCard 
            key={topic.id}
            topic={topic}
            activeTab={activeTab}
            onUpdateStatus={onUpdateStatus}
            onOpenEditor={onOpenEditor}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
