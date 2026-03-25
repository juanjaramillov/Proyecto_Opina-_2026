import { useState, useMemo, useEffect } from 'react';
import { ActualidadTopic } from "../../signals/services/actualidadService";

export function getRelativeTime(dateString: string | null) {
    if (!dateString) return "Reciente";
    const then = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - then.getTime()) / 3600000;
    
    if (diffInHours < 1) return "Hace un momento";
    if (diffInHours < 24) return `Hace ${Math.floor(diffInHours)} hs`;
    if (diffInHours < 48) return "Ayer";
    return `Hace ${Math.floor(diffInHours / 24)} días`;
}

export function useActualidadHome(topics: ActualidadTopic[]) {
    const [selectedCategory, setSelectedCategory] = useState("Todos");
    const [heroIndex, setHeroIndex] = useState(0);

    const normalizeCategory = (cat: string) => 
        cat.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    const topHeroTopics = useMemo(() => {
        if (!topics) return [];
        return [...topics]
            .sort((a, b) => (b.stats?.total_participants || 0) - (a.stats?.total_participants || 0))
            .slice(0, 4);
    }, [topics]);

    const gridTopics = useMemo(() => {
        if (selectedCategory === "Todos") return topics;
        const normalizedSelected = normalizeCategory(selectedCategory);
        return topics.filter(t => normalizeCategory(t.category) === normalizedSelected);
    }, [topics, selectedCategory]);

    useEffect(() => {
        if (topHeroTopics.length <= 1) return;
        const interval = setInterval(() => {
            setHeroIndex((prev) => (prev + 1) % topHeroTopics.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [topHeroTopics.length]);

    const currentHeroTopic = topHeroTopics.length > 0 ? topHeroTopics[heroIndex] : null;

    return {
        selectedCategory,
        setSelectedCategory,
        heroIndex,
        setHeroIndex,
        topHeroTopics,
        gridTopics,
        currentHeroTopic
    };
}
