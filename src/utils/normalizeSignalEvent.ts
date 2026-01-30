import { SignalEvent } from "../types/signalEvent";

export function normalizeSignalEvent(e: SignalEvent): SignalEvent {
    if (e.sourceType === "battle") {
        return { ...e, sourceType: "versus" };
    }
    return e;
}

export function normalizeSignalEvents(list: SignalEvent[]): SignalEvent[] {
    return list.map(normalizeSignalEvent);
}
