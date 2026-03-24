import { AssetCandidate, AssetProvider, AssetType, EntityCatalogItem } from '../types';

export class DummyProvider implements AssetProvider {
  name = 'dummy_fallback';

  async getCandidates(entity: EntityCatalogItem, assetType: AssetType): Promise<AssetCandidate[]> {
    // This provider doesn't actually provide anything yet, 
    // it's a structural placeholder for future custom asset APIs (e.g., Clearbit, custom scraper, etc)
    return [];
  }
}
