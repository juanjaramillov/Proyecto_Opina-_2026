export interface ServiceEntity {
    id: string;
    name: string;
    image: string;
    entityType: string;
    rating: number;
    reviews: number;
    trendValue: string;
    trendDirection: 'up' | 'down' | 'neutral';
    category: string;
    subcategory: string;
    tags: string;
}
