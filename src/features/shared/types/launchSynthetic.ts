// Tipos para metadata oficial de lanzamiento sintético

export interface LaunchSyntheticMeta {
  origin: "launch_synthetic";
  scenarioId: string;
  removable: true;
  seededBy: "frontend_launch_layer";
  notes?: string;
}

/**
 * Utility type to mark a dataset as containing launch synthetic metadata.
 */
export type WithLaunchSyntheticMeta<T> = T & {
  _meta?: LaunchSyntheticMeta;
};

export const SYNTHETIC_USER_ID = "launch-anonymous-user";
export type SyntheticUserId = typeof SYNTHETIC_USER_ID;

export function isSyntheticUser(id: string): id is SyntheticUserId {
  return id === SYNTHETIC_USER_ID;
}
