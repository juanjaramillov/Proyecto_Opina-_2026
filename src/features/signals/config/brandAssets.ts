/**
 * Configuration for brand assets to decouple mapping logic from signalService.
 */

export function getAssetPathForOption(_label: string, dbImageUrl: string | null): string | null {

    if (!dbImageUrl) {
        return null;
    }

    // Business Logic: Ignore legacy DB paths (only /brands/ is truly legacy now)
    const isLegacyPath = dbImageUrl.startsWith('/brands/');

    if (isLegacyPath) {
        return null; // Force fallback to EntityLogo internal logic
    }

    // New format (e.g. from Supabase Storage: https://.../entities-media/...)
    return dbImageUrl;
}
