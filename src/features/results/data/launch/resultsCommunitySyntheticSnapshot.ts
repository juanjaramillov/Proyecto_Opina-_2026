import { ResultsCommunityQuery, ResultsCommunitySnapshot } from "../../../../read-models/b2c/resultsCommunityTypes";
import { ANALYTICS_MINIMUM_COHORT, RESULTS_MICRODETAIL_LOCKED } from "../../../../read-models/analytics/metricPolicies";

export function getResultsCommunitySyntheticSnapshot(query: ResultsCommunityQuery): ResultsCommunitySnapshot {
  return {
    calculatedAt: new Date().toISOString(),
    mode: "synthetic",
    query: {
      period: query.period || "30D",
      module: query.module || "ALL",
      generation: query.generation || "ALL",
      categorySlug: query.categorySlug
    },
    guardrails: {
      minimumCohortSize: ANALYTICS_MINIMUM_COHORT,
      microdetailLocked: RESULTS_MICRODETAIL_LOCKED
    },
    hero: {
      title: "Radiografía de la Opinión",
      subtitle: "Lo que la gente está diciendo esta semana",
      description: "Explora las preferencias, debates y tendencias que están marcando el pulso en Opina+."
    },
    pulse: {
      activeSignals: 12450,
      trendingTopics: ["Fintech vs Banca Tradicional", "Teletrabajo vs Oficina", "Consumo Sostenible"]
    },
    editorialHighlights: [
      {
        id: "hl-1",
        type: "versus",
        title: "El avance de las Fintech",
        description: "Las startups financieras ganan terreno frente a la banca tradicional en simplicidad.",
        isFeatured: true,
        metricValue: 68,
        metricLabel: "Share de Preferencia (%)"
      },
      {
        id: "hl-2",
        type: "news",
        title: "Debate sobre el teletrabajo",
        description: "El retorno a la oficina divide aguas entre generaciones.",
        isFeatured: false,
        metricValue: 45,
        metricLabel: "Preferencia por Híbrido (%)"
      }
    ],
    blocks: {
      versus: { visible: true, totalBattles: 142 },
      tournament: { visible: true, activeCategories: 8 },
      depth: { visible: true, topInsights: 12 },
      news: { visible: true, activeNews: 5 },
      places: { visible: true, activePlaces: 18 },
      futureModules: { visible: true }
    },
    footerNarrative: {
      title: "La voz de todos cuenta",
      description: "Únete a la conversación aportando tus señales diariamente."
    }
  };
}
