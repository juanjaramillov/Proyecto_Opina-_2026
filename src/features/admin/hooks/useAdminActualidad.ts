import { useState, useEffect, useCallback, useMemo } from "react";
import { adminActualidadService } from "../services/adminActualidadService";
import { Topic, TopicStatus, TopicCategory } from "../../signals/types/actualidad";
import { useNavigate } from "react-router-dom";
import { logger } from "../../../lib/logger";
import { supabase } from "../../../supabase/client";
import { useToast } from "../../../components/ui/useToast";

export type SortOption = 'recent' | 'confidence' | 'intensity';

export function useAdminActualidad() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<TopicStatus>('detected');
  
  // Selection
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  
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
    setSelectedTopicIds([]); // Reset selection on tab change
  }, [fetchTopics]);

  const updateStatus = async (id: string, newStatus: TopicStatus) => {
    try {
      const res = await adminActualidadService.updateTopicStatus(id, newStatus);
      if (res.success) {
        setTopics(prev => prev.filter((t: Topic) => t.id !== id));
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
      
      setActiveTab('detected');
      await fetchTopics();
    } catch(e) {
      logger.error("Error triggering bot", { domain: 'admin_actions', origin: 'AdminActualidad' }, e);
      alert("Ocurrió un error al extraer noticias.");
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

  const { showToast } = useToast();

  const deleteSelectedTopics = async () => {
    if (!selectedTopicIds.length) return;
    
    // Optimistic UI approach or show a loading state 
    // Here we will just perform it and block standard UI slightly
    setLoading(true);
    try {
      const success = await adminActualidadService.deleteTopics(selectedTopicIds);
      if (success) {
        setTopics(prev => prev.filter(t => !selectedTopicIds.includes(t.id)));
        setSelectedTopicIds([]);
        showToast("Los temas seleccionados se han borrado exitosamente.", 'success');
      } else {
        showToast("Ocurrió un error al intentar borrar los temas seleccionados.", 'error');
      }
    } catch(err) {
      logger.error("Error deleting selected topics", { domain: 'admin_actions', origin: 'AdminActualidad' }, err);
      showToast("Ocurrió un error excepcional al intentar borrar.", 'error');
    } finally {
      setLoading(false);
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
    setActiveTab,
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
