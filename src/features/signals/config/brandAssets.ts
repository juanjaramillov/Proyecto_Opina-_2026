/**
 * Configuration for brand assets to decouple mapping logic from signalService.
 */

export function getAssetPathForOption(_label: string, dbImageUrl: string | null): string | null {

    if (!dbImageUrl) {
        return null;
    }

    // Business Logic: Ignore legacy DB paths
    const isLegacyPath = dbImageUrl.startsWith('/brands/') || dbImageUrl.startsWith('/logos/');

    if (isLegacyPath) {
        return null;
    }

    return dbImageUrl;
}
