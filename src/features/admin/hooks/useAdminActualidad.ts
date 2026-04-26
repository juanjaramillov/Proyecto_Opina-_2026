import { useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminActualidadService } from "../services/adminActualidadService";
import { Topic, TopicStatus, TopicCategory } from "../../signals/types/actualidad";
import { useNavigate } from "react-router-dom";
import { logger } from "../../../lib/logger";
import { supabase } from "../../../supabase/client";
import { useToast } from "../../../components/ui/useToast";

export type SortOption = 'recent' | 'confidence' | 'intensity';

/**
 * FASE 3B React Query (2026-04-26): el listado de topics por status (activeTab)
 * se cachea por queryKey, así cambiar de tab "detected → published → review" no
 * dispara fetch si el dato es fresco (<5min). Mutations invalidan el namespace
 * `['admin','actualidad','topics']` (todas las pestañas) porque mover/borrar un
 * topic puede aparecer en otra pestaña.
 *
 * Firma pública del hook intacta.
 */
export function useAdminActualidad() {
  const qc = useQueryClient();

  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<TopicStatus>('detected');

  // Selection
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<TopicCategory | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Loading auxiliar para mass-delete (no es fetch del server, no toca el query).
  const [mutationLoading, setMutationLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();

  const topicsQuery = useQuery<Topic[], Error>({
    queryKey: ['admin', 'actualidad', 'topics', activeTab],
    queryFn: async () => {
      try {
        return await adminActualidadService.getAdminTopics(activeTab);
      } catch (err) {
        logger.error("Error fetching topics", { domain: 'admin_actions', origin: 'AdminActualidad', action: 'fetch_topics', state: 'failed' }, err);
        throw err;
      }
    },
  });

  const topics = topicsQuery.data ?? [];
  const loading = topicsQuery.isLoading || mutationLoading;

  // Reset selection cuando cambia el tab — dispara también el refetch automático
  // por queryKey, así no necesitamos useEffect sobre fetchTopics.
  const handleSetActiveTab = useCallback((tab: TopicStatus) => {
    setActiveTab(tab);
    setSelectedTopicIds([]);
  }, []);

  const updateStatus = async (id: string, newStatus: TopicStatus) => {
    try {
      const res = await adminActualidadService.updateTopicStatus(id, newStatus);
      if (res.success) {
        // Invalida todas las pestañas porque el topic se movió de tab.
        await qc.invalidateQueries({ queryKey: ['admin', 'actualidad', 'topics'] });
      } else {
        toast.error(res.error || "No se pudo actualizar el estado");
      }
    } catch (err) {
      logger.error("Error updating status", { domain: 'admin_actions', origin: 'AdminActualidad', action: 'update_status', state: 'failed' }, err);
    }
  };

  const openEditor = (t: Topic) => {
    navigate(`/admin/actualidad/${t.id}`);
  };

  const triggerExtraction = async () => {
    try {
      setExtracting(true);
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/actualidad-bot`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session?.access_token}`
        }
      });

      if (!res.ok) {
         throw new Error("HTTP " + res.status);
      }

      // Activa pestaña 'detected' (donde caen los nuevos) y refresca.
      setActiveTab('detected');
      await qc.invalidateQueries({ queryKey: ['admin', 'actualidad', 'topics'] });
    } catch(e) {
      logger.error("Error triggering bot", { domain: 'admin_actions', origin: 'AdminActualidad' }, e);
      toast.error("No se pudieron extraer las noticias");
    } finally {
      setExtracting(false);
    }
  };

  // Mass Actions
  const toggleSelection = useCallback((id: string) => {
    setSelectedTopicIds(prev =>
      prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedTopicIds(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTopicIds([]);
  }, []);

  const deleteSelectedTopics = async () => {
    if (!selectedTopicIds.length) return;

    setMutationLoading(true);
    try {
      const success = await adminActualidadService.deleteTopics(selectedTopicIds);
      if (success) {
        await qc.invalidateQueries({ queryKey: ['admin', 'actualidad', 'topics'] });
        setSelectedTopicIds([]);
        showToast("Los temas seleccionados se han borrado exitosamente.", 'success');
      } else {
        showToast("Ocurrió un error al intentar borrar los temas seleccionados.", 'error');
      }
    } catch(err) {
      logger.error("Error deleting selected topics", { domain: 'admin_actions', origin: 'AdminActualidad' }, err);
      showToast("Ocurrió un error excepcional al intentar borrar.", 'error');
    } finally {
      setMutationLoading(false);
    }
  };

  // Derived Filters
  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    topics.forEach((t: Topic) => { if (t.source_domain) sources.add(t.source_domain); });
    return Array.from(sources).sort();
  }, [topics]);

  const filteredAndSortedTopics = useMemo(() => {
    let result = [...topics];

    if (categoryFilter !== 'all') {
      result = result.filter((t: Topic) => t.category === categoryFilter);
    }
    if (sourceFilter !== 'all') {
      result = result.filter((t: Topic) => t.source_domain === sourceFilter);
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

  return {
    topics,
    loading,
    activeTab,
    setActiveTab: handleSetActiveTab,
    categoryFilter,
    setCategoryFilter,
    sourceFilter,
    setSourceFilter,
    sortBy,
    setSortBy,
    uniqueSources,
    filteredAndSortedTopics,
    updateStatus,
    openEditor,
    triggerExtraction,
    extracting,
    selectedTopicIds,
    toggleSelection,
    selectAll,
    clearSelection,
    deleteSelectedTopics
  };
}
