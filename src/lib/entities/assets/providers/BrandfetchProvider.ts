import { AssetCandidate, AssetProvider, AssetType, EntityCatalogItem, ProviderTier } from '../types';

export class BrandfetchProvider implements AssetProvider {
  name = 'brandfetch';
  tier: ProviderTier = 'primary';

  async getCandidates(entity: EntityCatalogItem, assetType: AssetType): Promise<AssetCandidate[]> {
    if (assetType !== 'brand_logo' || !entity.domain) {
      return [];
    }

    const domain = entity.domain.trim();
    if (!domain) return [];

    const candidates: AssetCandidate[] = [];

    // Prioritize the logo
      candidates.push({
        sourceProvider: this.name,
        providerTier: this.tier,
        sourceUrl: `https://asset.brandfetch.io/${domain}/id/logo`,
        format: 'svg',
        isRemote: true,
        expectedDomain: domain
      });

      // Icon/symbol fallback
      candidates.push({
        sourceProvider: this.name,
        providerTier: this.tier,
        sourceUrl: `https://asset.brandfetch.io/${domain}/id/icon`,
        format: 'svg', // Actually it can be anything, scoring will infer
        isRemote: true,
        expectedDomain: domain
      });

    return candidates;
  }
}
