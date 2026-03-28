import { GranularAnalyticsQuery } from "../../../read-models/analytics/analyticsTypes";
import { IntelligenceAnalyticsSnapshot } from "../../../read-models/b2b/intelligenceAnalyticsTypes";
import { getIntelligenceAnalyticsReadModel } from "../../../read-models/b2b/intelligenceAnalyticsReadModel";

export const intelligenceAnalyticsService = {
  getIntelligenceAnalyticsSnapshot: async (query: GranularAnalyticsQuery): Promise<IntelligenceAnalyticsSnapshot> => {
    return getIntelligenceAnalyticsReadModel(query);
  }
};
