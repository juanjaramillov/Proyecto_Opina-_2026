export const MODULE_EVENT_TYPES = {
    MODULE_PREVIEW_VIEWED: "module_preview_viewed",
    MODULE_INTEREST_CLICKED: "module_interest_clicked",
    MODULE_PREVIEW_FILTER_USED: "module_preview_filter_used",
} as const;

export type ModuleEventType = typeof MODULE_EVENT_TYPES[keyof typeof MODULE_EVENT_TYPES];

export interface ModuleSignalMetadata {
    module_key: string;
    module_slug: string;
    previewType: string;
    source: "coming_soon";
    entry?: "hub_card" | "deep_link";
    cta?: "launch_this";
    filter?: string;
    value?: string;
}
