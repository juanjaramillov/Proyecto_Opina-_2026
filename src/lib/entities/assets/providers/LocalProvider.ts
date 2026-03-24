import fs from 'fs';
import path from 'path';
import { AssetCandidate, AssetProvider, AssetType, EntityCatalogItem, AssetFormat, ProviderTier } from '../types';

export class LocalProvider implements AssetProvider {
  name = 'local';
  tier: ProviderTier = 'local_carry_over';
  private basePath: string;

  constructor(basePath?: string) {
    // Defaults to Next/Vite standard public folder at project root
    this.basePath = basePath || path.resolve(process.cwd(), 'public');
  }

  async getCandidates(entity: EntityCatalogItem, assetType: AssetType): Promise<AssetCandidate[]> {
    if (assetType !== 'brand_logo' || !entity.slug) {
      return [];
    }

    const formats: AssetFormat[] = ['svg', 'png', 'jpg', 'jpeg', 'webp'];
    const candidates: AssetCandidate[] = [];

    for (const format of formats) {
      const localRelativePath = `/logos/entities/${entity.slug}.${format}`;
      const absolutePath = path.join(this.basePath, localRelativePath);

      // We don't check existence here unless we want to, but the scoring pipeline will check if it actually exists.
      // Wait, since we are reading from local and it's fast, we can safely check if the file exists using fs.
      if (fs.existsSync(absolutePath)) {
        candidates.push({
          sourceProvider: this.name,
          providerTier: this.tier,
          sourceUrl: `public/logos/entities/${entity.slug}.${format}`,
          format,
          localPath: absolutePath,
          isRemote: false,
          expectedDomain: entity.domain
        });
      }
    }

    return candidates;
  }
}
