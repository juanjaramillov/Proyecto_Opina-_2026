/**
 * Configuration for brand assets to decouple mapping logic from signalService.
 */

interface BrandAssetConfig {
    cleanName: string;
    extension: 'png' | 'svg' | 'webp';
    imageFit: 'contain' | 'cover';
}

const BRAND_ASSETS_MAP: Record<string, Partial<BrandAssetConfig>> = {
    'disney': { cleanName: 'disneyplus', extension: 'svg' },
    'coca': { cleanName: 'cocacola' },
    'apple music': { cleanName: 'applemusic' },
    'hbo': { cleanName: 'hbomax' },
    'max': { cleanName: 'hbomax' },
    'apple tv': { cleanName: 'appletv' },
    'paramount': { cleanName: 'paramount' },
    'amazon': { cleanName: 'amazonmusic' },
    'bice': { extension: 'svg' },
    'banco de chile': { cleanName: 'bancochile' },
    'banco estado': { cleanName: 'bancoestado' },
    'banco de credito': { cleanName: 'bci' },
    'mercado pago': { cleanName: 'mercadopago' },
    'santa isabel': { cleanName: 'santaisabel' },
    'prime video': { cleanName: 'primevideo' },
    'h&m': { cleanName: 'h&m' },
    'u. de chile': { cleanName: 'udechile' },
    'pedidos ya': { cleanName: 'pedidosya' },
    'clinica alemana': { cleanName: 'clinicaalemana' },
    'clinica las condes': { cleanName: 'clc' },
    'clinica santa maria': { cleanName: 'clinicasantamaria' },
    'clinica davila': { cleanName: 'clinicadavila' },
    'integramedica': { cleanName: 'integramedica' },
    'monster energy': { cleanName: 'monster' },
    'monster': { cleanName: 'monster' },
    'red bull': { cleanName: 'redbull' },
    'samsung galaxy': { cleanName: 'samsung' },
    'apple iphone': { cleanName: 'iphone' },
    'iphone': { cleanName: 'iphone' },
    'google pixel': { cleanName: 'pixel' },
    'pixel': { cleanName: 'pixel' },
    'marriott': { cleanName: 'marriott' },
    'marriot': { cleanName: 'marriott' },
    'hyatt': { cleanName: 'hyatt' },
    'nueva york': { cleanName: 'nuevayork' },
    'rio de janeiro': { cleanName: 'rio' },
    'río de janeiro': { cleanName: 'rio' },
    'tokio': { cleanName: 'tokio' },
    'roma': { cleanName: 'roma' },
    'barcelona': { cleanName: 'barcelona' },
    'paris': { cleanName: 'paris' },
    'parís': { cleanName: 'paris' },
    'compra online': { cleanName: 'compraonline' },
    'tienda fisica': { cleanName: 'tiendafisica' }
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
