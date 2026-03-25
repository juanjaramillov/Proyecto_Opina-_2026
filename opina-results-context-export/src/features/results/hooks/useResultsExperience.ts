import { useEffect, useState, useCallback } from "react";
import { getCuratedMasterHubSnapshot } from "../data/getCuratedMasterHubSnapshot";
import { MasterHubSnapshot, HubFilters } from "../../../read-models/b2c/hub-types";
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
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const snap = getCuratedMasterHubSnapshot(profile.id, filters);
      setSnapshot(snap);
    } catch (e) {
      logger.error("Error loading master hub data", { domain: 'network_api', origin: 'Results_Hub_B2C', action: 'load_data', state: 'failed' }, e);
    } finally {
      setLoading(false);
    }
  }, [profile, filters]); 

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
