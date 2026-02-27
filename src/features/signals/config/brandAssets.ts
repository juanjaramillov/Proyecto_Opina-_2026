/**
 * Configuration for brand assets to decouple mapping logic from signalService.
 */

interface BrandAssetConfig {
    cleanName: string;
    extension: 'png' | 'svg' | 'webp';
    imageFit: 'contain' | 'cover';
}

const BRAND_ASSETS_MAP: Record<string, Partial<BrandAssetConfig>> = {
    // Agregar aquí los mapeos de las nuevas empresas/marcas a subir
};

/**
 * Normalizes an option label to a clean asset name.
 */
export function getAssetPathForOption(label: string, dbImageUrl: string | null): string {
    const lowerLabel = label.toLowerCase();

    // Check for explicit mapping
    let config: Partial<BrandAssetConfig> = {};
    for (const [key, mapping] of Object.entries(BRAND_ASSETS_MAP)) {
        if (lowerLabel.includes(key)) {
            config = mapping;
            break;
        }
    }

    const cleanName = config.cleanName || lowerLabel.replace(/[^a-z0-9]/g, '');
    const extension = config.extension || 'png';

    // Business Logic: Ignore legacy DB paths
    const isLegacyPath = !dbImageUrl ||
        dbImageUrl.startsWith('/brands/') ||
        dbImageUrl.startsWith('/logos/');

    return isLegacyPath
        ? `/images/options/${cleanName}.${extension}`
        : dbImageUrl;
}
