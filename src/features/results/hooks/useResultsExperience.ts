import { useEffect, useState, useCallback } from "react";
import { getCuratedMasterHubSnapshot } from "../data/getCuratedMasterHubSnapshot";
import { MasterHubSnapshot, HubFilters } from "../../../read-models/b2c/hub-types";
import { useAuth } from "../../auth";
import { logger } from '../../../lib/logger';
import { trackPage } from "../../telemetry/track";

export type HubTab = 'versus' | 'torneo' | 'actualidad' | 'profundidad';

export function useResultsExperience() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<MasterHubSnapshot | null>(null);
  const [filters, setFilters] = useState<HubFilters>({});
  const [activeTab, setActiveTab] = useState<HubTab>('versus');

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
    activeTab,
    setActiveTab
  };
}
