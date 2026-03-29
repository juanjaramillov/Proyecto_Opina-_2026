import { MetricOverride } from "../../../read-models/analytics/analyticsTypes";
import { analyticsReadService } from "../../../services/analytics/analyticsReadService";

export const adminAnalyticsService = {
  getSnapshot: async () => analyticsReadService.getAdminAnalyticsSnapshot(),
  refreshRollups: async () => analyticsReadService.refreshAnalyticsRollups(),
  getOverrides: async () => analyticsReadService.getAllMetricOverrides(),
  saveOverride: async (override: MetricOverride) => analyticsReadService.saveMetricOverride(override)
};
