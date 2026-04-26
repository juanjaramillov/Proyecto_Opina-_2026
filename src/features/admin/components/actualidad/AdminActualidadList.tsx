import { motion, AnimatePresence } from "framer-motion";
import { Newspaper, Trash2, CheckSquare, Square } from "lucide-react";
import { Topic, TopicStatus } from "../../../signals/types/actualidad";
import { AdminActualidadItemCard } from "./AdminActualidadItemCard";

interface AdminActualidadListProps {
  loading: boolean;
  filteredAndSortedTopics: Topic[];
  activeTab: TopicStatus;
  onUpdateStatus: (id: string, status: TopicStatus) => void;
  onOpenEditor: (topic: Topic) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  onClearSelection: () => void;
  onDeleteSelected: () => void;
}

export function AdminActualidadList({
  loading,
  filteredAndSortedTopics,
  activeTab,
  onUpdateStatus,
  onOpenEditor,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onDeleteSelected
}: AdminActualidadListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
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

  const allSelected = filteredAndSortedTopics.length > 0 && selectedIds.length === filteredAndSortedTopics.length;
  const hasSelection = selectedIds.length > 0;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      onClearSelection();
    } else {
      onSelectAll(filteredAndSortedTopics.map(t => t.id));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra de acciones masivas */}
      {filteredAndSortedTopics.length > 0 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleSelectAll}
              className="group flex items-center justify-center p-1.5 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {allSelected ? (
                <CheckSquare className="w-5 h-5 text-brand" />
              ) : (
                <Square className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
              )}
            </button>
            <span className="text-sm font-medium text-slate-700">
              {hasSelection ? `${selectedIds.length} seleccionados` : 'Seleccionar todo'}
            </span>
          </div>

          <AnimatePresence>
            {hasSelection && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  onDeleteSelected();
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-danger-50 text-danger-600 hover:bg-danger-100 border border-danger-200 rounded-lg text-sm font-bold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Borrar
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5">
        <AnimatePresence>
          {filteredAndSortedTopics.map(topic => (
            <AdminActualidadItemCard 
              key={topic.id}
              topic={topic}
              activeTab={activeTab}
              onUpdateStatus={onUpdateStatus}
              onOpenEditor={onOpenEditor}
              isSelected={selectedIds.includes(topic.id)}
              onToggleSelect={() => onToggleSelect(topic.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
