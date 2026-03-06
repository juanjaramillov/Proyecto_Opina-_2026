type CacheEntry<T> = {
    expiresAt: number;
    promise?: Promise<T>;
    value?: T;
    hasValue?: boolean;
};

const MAX_ENTRIES = 200;
const cache = new Map<string, CacheEntry<any>>();

function prune() {
    while (cache.size > MAX_ENTRIES) {
        const oldestKey = cache.keys().next().value as string | undefined;
        if (!oldestKey) break;
        cache.delete(oldestKey);
    }
}

export async function cached<T>(
    key: string,
    ttlMs: number,
    fn: () => Promise<T>
): Promise<T> {
    const now = Date.now();
    const existing = cache.get(key) as CacheEntry<T> | undefined;

    if (existing) {
        if (existing.hasValue && existing.expiresAt > now) {
            return existing.value as T;
        }
        if (existing.promise) {
            return existing.promise;
        }
    }

    const p = (async () => fn())()
        .then((val) => {
            cache.set(key, { expiresAt: now + ttlMs, value: val, hasValue: true });
            prune();
            return val;
        })
        .catch((err) => {
            cache.delete(key);
            throw err;
        });

    cache.set(key, { expiresAt: now + ttlMs, promise: p, hasValue: false });
    prune();
    return p;
}

export function invalidate(prefix?: string) {
    if (!prefix) {
        cache.clear();
        return;
    }
    for (const k of Array.from(cache.keys())) {
        if (k.startsWith(prefix)) cache.delete(k);
    }
}
