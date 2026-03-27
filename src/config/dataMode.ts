export type AppDataMode = "launch_synthetic" | "real";

// Global data mode configuration
export const APP_DATA_MODE: AppDataMode = "launch_synthetic" as AppDataMode;

// Boolean helpers for easy conditional rendering or data fetching
export const isLaunchSyntheticMode = (APP_DATA_MODE as AppDataMode) === "launch_synthetic";
export const isRealDataMode = (APP_DATA_MODE as AppDataMode) === "real";
