import { analyticsReadService, AdminResultsConfiguration } from "../../../services/analytics/analyticsReadService";

export const adminResultsService = {
  getConfiguration: async () => analyticsReadService.getAdminResultsPublisherSnapshot(),
  publishConfiguration: async (payload: Partial<AdminResultsConfiguration>) => analyticsReadService.publishResultsConfiguration(payload)
};
