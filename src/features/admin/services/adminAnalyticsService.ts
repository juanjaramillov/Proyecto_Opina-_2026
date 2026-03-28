import { analyticsReadService } from "../../../services/analytics/analyticsReadService";

export const adminAnalyticsService = {
  getSnapshot: async () => analyticsReadService.getAdminAnalyticsSnapshot(),
  refreshRollups: async () => analyticsReadService.refreshAnalyticsRollups()
};
