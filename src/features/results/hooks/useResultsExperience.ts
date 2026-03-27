import { useEffect, useState, useCallback } from "react";
import { getLaunchSyntheticMasterHubSnapshot } from "../data/launch/resultsLaunchSyntheticData";
import { isResultsLaunchSyntheticMode, isResultsRealMode } from "../config/resultsRuntime";
import { MasterHubSnapshot, HubFilters } from "../../../read-models/b2c/hub-types";
import { SYNTHETIC_USER_ID } from "../../shared/types/launchSynthetic";
import { useAuth } from "../../auth";
import { logger } from '../../../lib/logger';
import { trackPage } from "../../telemetry/track";

export type ResultsModule = "ALL" | "VERSUS" | "TOURNAMENT" | "PROFUNDIDAD" | "ACTUALIDAD" | "LUGARES";
export type ResultsPeriod = "7D" | "30D" | "90D";
export type ResultsView = "GENERAL" | "CONSENSO" | "POLARIZACION" | "TENDENCIA";
export type ResultsGeneration = "ALL" | "BOOMERS" | "GEN_X" | "MILLENNIALS" | "GEN_Z";

export function useResultsExperience() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<MasterHubSnapshot | null>(null);
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
      let snap: MasterHubSnapshot | null = null;
      if (isResultsLaunchSyntheticMode) {
        // En modo sintético, proveemos un fallback explícito si no hay id, evitando dejar al usuario atascado.
        const syntheticUserId = profile?.id || SYNTHETIC_USER_ID;
        snap = getLaunchSyntheticMasterHubSnapshot(syntheticUserId, filters);
      } else {
        // Reservado para conexión a BDD Real
        logger.info("Real data mode not yet implemented for Master Hub", { domain: 'network_api', origin: 'Results_Hub_B2C' });
      }
      setSnapshot(snap);
    } catch (e) {
      logger.error("Error loading master hub data", { domain: 'network_api', origin: 'Results_Hub_B2C', action: 'load_data', state: 'failed' }, e);
    } finally {
      setLoading(false);
    }
  }, [profile?.id, filters]); 

  useEffect(() => {
    loadData();
    trackPage("results_hub_b2c");
  }, [loadData]);
  
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
