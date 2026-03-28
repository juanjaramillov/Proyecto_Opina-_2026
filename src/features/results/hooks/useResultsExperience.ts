import { useEffect, useState, useCallback } from "react";
import { isResultsRealMode } from "../config/resultsRuntime";
import { HubFilters } from "../../../read-models/b2c/hub-types"; // @deprecated
import { useAuth } from "../../auth";
import { logger } from '../../../lib/logger';
import { analyticsService } from "../../analytics/services/analyticsService";
import { ResultsCommunitySnapshot, ResultsCommunityQuery } from "../../../read-models/b2c/resultsCommunityTypes";
import { resultsCommunityService } from "../services/resultsCommunityService";

export type ResultsModule = "ALL" | "VERSUS" | "TOURNAMENT" | "PROFUNDIDAD" | "ACTUALIDAD" | "LUGARES";
export type ResultsPeriod = "7D" | "30D" | "90D";
export type ResultsView = "GENERAL" | "CONSENSO" | "POLARIZACION" | "TENDENCIA";
export type ResultsGeneration = "ALL" | "BOOMERS" | "GEN_X" | "MILLENNIALS" | "GEN_Z";

export function useResultsExperience() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<ResultsCommunitySnapshot | null>(null);
  const [filters, setFilters] = useState<HubFilters>({});
  
  // New Exploration State
  const [activeModule, setActiveModule] = useState<ResultsModule>("ALL");
  const [activePeriod, setActivePeriod] = useState<ResultsPeriod>("30D");
  const [activeView, setActiveView] = useState<ResultsView>("GENERAL");
  const [activeGeneration, setActiveGeneration] = useState<ResultsGeneration>("ALL");

  const loadData = useCallback(async () => {
    // Modo Real: requerimos perfil para datos reales.
    if (isResultsRealMode && !profile?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const query: ResultsCommunityQuery = {
        period: activePeriod,
        module: activeModule,
        generation: activeGeneration,
      };

      let snap: ResultsCommunitySnapshot | null = null;
      // Reservado para conexión a BDD Real usando el mismo servicio en el futuro (mode='real')
      snap = await resultsCommunityService.getResultsCommunitySnapshot({ ...query, period: "30D" });
      logger.info("Real data mode using facade", { domain: 'network_api', origin: 'Results_Hub_B2C' });
      setSnapshot(snap);
    } catch (e) {
      logger.error("Error loading community hub data", { domain: 'network_api', origin: 'Results_Hub_B2C', action: 'load_data', state: 'failed' }, e);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, activePeriod, activeModule, activeGeneration]); 

  useEffect(() => {
    loadData();
    analyticsService.trackSystem("results_hub_b2c_page_view", "info");
  }, [loadData, activePeriod, activeModule, activeGeneration]);
  
  return {
    loading,
    snapshot,
    filters,
    setFilters,
    // State Exports
    activeModule, setActiveModule,
    activePeriod, setActivePeriod,
    activeView, setActiveView,
    activeGeneration, setActiveGeneration
  };
}
