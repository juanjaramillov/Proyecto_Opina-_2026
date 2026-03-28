export type AppDataMode = "real";

// Global data mode configuration
export const APP_DATA_MODE: AppDataMode = "real";

// Boolean helpers for easy conditional rendering or data fetching
export const isRealDataMode = APP_DATA_MODE === "real";
