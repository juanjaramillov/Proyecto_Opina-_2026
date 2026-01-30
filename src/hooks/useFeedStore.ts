import { useState, useEffect } from 'react';
import { loadFeed, FeedItem } from '../state/feedStore';

export function useFeedStore() {
    const [feed, setFeed] = useState<FeedItem[]>(loadFeed());

    useEffect(() => {
        const handleUpdate = () => {
            setFeed(loadFeed());
        };

        window.addEventListener('opina:feed_update', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('opina:feed_update', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    return feed;
}
