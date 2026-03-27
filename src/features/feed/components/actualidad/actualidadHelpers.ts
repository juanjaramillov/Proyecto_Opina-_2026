import { ActualidadTopic } from "../../../signals/services/actualidadService";

export const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop', // Data stream
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop', // Abstract gradient
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop', // Cyberpunk
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2000&auto=format&fit=crop', // 3D Render
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?q=80&w=2000&auto=format&fit=crop'  // Abstract glass
];

export const getDeterministicImage = (topic: ActualidadTopic) => {
    const meta = topic.metadata as Record<string, unknown> | undefined;
    const realImg = topic.image_url || meta?.image_url || meta?.image || (meta?.image && typeof meta.image === 'object' ? (meta.image as Record<string, unknown>).url : null) || (topic as unknown as Record<string, unknown>).image || (topic as unknown as Record<string, unknown>).cover_image;
    if (realImg && typeof realImg === 'string' && realImg.trim() !== '' && realImg !== 'null') return realImg;
    
    let hash = 0;
    for (let i = 0; i < topic.id.length; i++) {
        hash = topic.id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return FALLBACK_IMAGES[Math.abs(hash) % FALLBACK_IMAGES.length];
};

export const getSourceName = (topic: ActualidadTopic) => {
    return topic.source_domain || topic.source_title || 'Medio Independiente';
};
