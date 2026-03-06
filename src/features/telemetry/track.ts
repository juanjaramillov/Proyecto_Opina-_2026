import { telemetryService } from "./telemetryService";

type Sev = 'info' | 'warn' | 'error';

function baseCtx(extra?: Record<string, any>) {
    return {
        path: typeof window !== "undefined" ? window.location.pathname : "unknown",
        search: typeof window !== "undefined" ? window.location.search : "",
        ...((extra || {}) as any)
    };
}

export function track(eventName: string, severity: Sev = 'info', context?: Record<string, any>, clientEventId?: string) {
    telemetryService.logEvent(eventName, severity, baseCtx(context), clientEventId);
}

export function trackPage(page: string, extra?: Record<string, any>) {
    track("page_view", "info", { page, ...(extra || {}) });
}
