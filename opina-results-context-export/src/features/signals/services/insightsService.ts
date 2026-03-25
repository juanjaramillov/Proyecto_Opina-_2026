import { b2bAnalyticsService } from './b2bAnalyticsService';
import { reportsService } from './reportsService';
import { advancedInsightsService } from './advancedInsightsService';

export * from './insightsTypes';

export const insightsService = {
    ...b2bAnalyticsService,
    ...reportsService,
    ...advancedInsightsService
};
