import { AssetCandidate, AssetProvider, AssetType, EntityCatalogItem } from '../types';
import { HtmlMetadataProvider } from './HtmlMetadataProvider';

export class ProviderRegistry {
  private providers: AssetProvider[] = [];

  register(provider: AssetProvider) {
    this.providers.push(provider);
  }

  async getAllCandidates(entity: EntityCatalogItem, assetType: AssetType): Promise<AssetCandidate[]> {
    const allCandidates: AssetCandidate[] = [];

    for (const provider of this.providers) {
      try {
        const candidates = await provider.getCandidates(entity, assetType);
        allCandidates.push(...candidates);
      } catch (error) {
        console.error(`[ProviderRegistry] Error fetching candidates from ${provider.name} for ${entity.slug}:`, error);
      }
    }

    return allCandidates;
  }
}
