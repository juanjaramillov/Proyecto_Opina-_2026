// Removed dependency on deleted file
export interface FeedItem {
    id: string;
    user: string;
    action: string; // e.g., "votó en"
    target: string; // e.g., "Supermercados"
    timestamp: string;
    avatar?: string;
}

const INITIAL_FEED: FeedItem[] = [];

const STORAGE_KEY = "opina_feed_state_v1";

export function loadFeed(): FeedItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return INITIAL_FEED;
        }
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
            return INITIAL_FEED;
        }
        return parsed;
    } catch {
        return INITIAL_FEED;
    }
}

export function saveFeed(feed: FeedItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(feed));
        window.dispatchEvent(new Event("opina:feed_update"));
    } catch {
        // ignore
    }
}

export function addFeedItem(item: Omit<FeedItem, 'id' | 'timestamp'>) {
    const current = loadFeed();
    const newItem: FeedItem = {
        ...item,
        id: `f-new-${Date.now()}`,
        timestamp: 'Hace un momento'
    };

    // Add to top, keep max 50
    const next = [newItem, ...current].slice(0, 50);
    saveFeed(next);
}

// Hook logic can be inline in components or a separate file. 
// For simplicity, we can do a simple custom hook here or in /hooks.
