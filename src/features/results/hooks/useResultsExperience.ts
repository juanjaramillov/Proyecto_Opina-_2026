import { useEffect, useState } from "react";
import { useQuery } from '@tanstack/react-query';
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
  const [filters, setFilters] = useState<HubFilters>({});

  // New Exploration State
  const [activeModule, setActiveModule] = useState<ResultsModule>("ALL");
  const [activePeriod, setActivePeriod] = useState<ResultsPeriod>("30D");
  const [activeView, setActiveView] = useState<ResultsView>("GENERAL");
  const [activeGeneration, setActiveGeneration] = useState<ResultsGeneration>("ALL");

  // Modo Real: requerimos perfil para datos reales.
  const queryEnabled = !(isResultsRealMode && !profile?.id);

  // FASE 3A React Query — los filtros van en el queryKey, así cambiar
  // module/period/generation refetchea automáticamente sin re-armar useEffect.
  const { data: snapshot, isLoading, error } = useQuery<ResultsCommunitySnapshot | null, Error>({
    queryKey: ['results', 'community', activePeriod, activeModule, activeGeneration],
    queryFn: async () => {
      const query: ResultsCommunityQuery = {
        period: activePeriod,
        module: activeModule,
        generation: activeGeneration,
      };
      // Reservado para conexión a BDD Real usando el mismo servicio en el futuro (mode='real')
      const snap = await resultsCommunityService.getResultsCommunitySnapshot({ ...query, period: "30D" });
      logger.info("Real data mode using facade", { domain: 'network_api', origin: 'Results_Hub_B2C' });
      return snap;
    },
    enabled: queryEnabled,
  });

  useEffect(() => {
    if (error) {
      logger.error("Error loading community hub data", { domain: 'network_api', origin: 'Results_Hub_B2C', action: 'load_data', state: 'failed' }, error);
    }
  }, [error]);

  // Mantengo el track del page view en cada cambio de filtros (mismo
  // comportamiento que antes, cuando vivía dentro del useEffect que cambiaba
  // con [loadData, activePeriod, activeModule, activeGeneration]).
  useEffect(() => {
    analyticsService.trackSystem("results_hub_b2c_page_view", "info");
  }, [activePeriod, activeModule, activeGeneration]);

  return {
    loading: isLoading,
    snapshot: snapshot ?? null,
    filters,
    setFilters,
    // State Exports
    activeModule, setActiveModule,
    activePeriod, setActivePeriod,
    activeView, setActiveView,
    activeGeneration, setActiveGeneration
  };
}
