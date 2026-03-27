import { LaunchSyntheticMeta } from "../../../shared/types/launchSynthetic";

export interface HomeLaunchSyntheticData {
  _meta: LaunchSyntheticMeta;
  pulseBaseline: number;
  topConsensus: Array<{
    rank: number;
    name: string;
    detail: string;
    percent: number;
    isHot: boolean;
  }>;
  topPolarized: Array<{
    rank: number;
    name: string;
    detail: string;
    percentA: number;
    percentB: number;
    isHot: boolean;
  }>;
  categories: Array<{
    name: string;
    percent: number;
    color: string;
  }>;
  networkPulseInfo: {
    totalUsers: string;
    totalUsersGrowth: string;
    active24h: string;
    newToday: string;
    monthlyGoal: {
      current: string;
      target: string;
      percentage: number;
    };
    signals7Days: string;
    signalsStatus: string;
  };
}

export const homeLaunchSyntheticData: HomeLaunchSyntheticData = {
  _meta: {
    origin: "launch_synthetic",
    scenarioId: "home_launch_v1",
    removable: true,
    seededBy: "frontend_launch_layer",
    notes: "Datos creíbles para un despliegue inicial completo en Home."
  },
  pulseBaseline: 342,
  topConsensus: [
    { rank: 1, name: "Inteligencia Artificial", detail: "94% de acuerdo", percent: 94, isHot: true },
    { rank: 2, name: "Sostenibilidad", detail: "88% de acuerdo", percent: 88, isHot: false },
    { rank: 3, name: "Salud Mental", detail: "85% de acuerdo", percent: 85, isHot: true },
  ],
  topPolarized: [
    { rank: 1, name: "Economía de Creadores", detail: "51% vs 49%", percentA: 51, percentB: 49, isHot: true },
    { rank: 2, name: "Trabajo 100% Remoto", detail: "53% vs 47%", percentA: 53, percentB: 47, isHot: false },
    { rank: 3, name: "Criptomonedas", detail: "55% vs 45%", percentA: 55, percentB: 45, isHot: false },
  ],
  categories: [
    { name: "Consumo & Marcas", percent: 38, color: "bg-primary" },
    { name: "Trabajo & Economía", percent: 27, color: "bg-emerald-500" },
    { name: "Tecnología e IA", percent: 19, color: "bg-sky-500" },
    { name: "Entretenimiento & Cultura", percent: 16, color: "bg-blue-300" },
  ],
  networkPulseInfo: {
    totalUsers: "142.5K",
    totalUsersGrowth: "+2.4% mes",
    active24h: "18.2K",
    newToday: "1,240",
    monthlyGoal: {
      current: "1.2M",
      target: "de 1.5M",
      percentage: 80,
    },
    signals7Days: "345,000",
    signalsStatus: "Volumen alto"
  }
};
