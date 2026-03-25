import https from 'https';
import { AssetCandidate, AssetProvider, AssetType, EntityCatalogItem, ProviderTier } from '../types';

function searchLogoDev(query: string, secretKey: string): Promise<string | null> {
  return new Promise((resolve) => {
    const url = `https://api.logo.dev/search?q=${encodeURIComponent(query)}`;
    const options = {
      headers: {
        'Authorization': `Bearer ${secretKey}`
      }
    };

    const req = https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const results = JSON.parse(data);
            if (Array.isArray(results) && results.length > 0 && results[0].domain) {
              resolve(results[0].domain);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

export class LogoDevProvider implements AssetProvider {
  name = 'logodev';
  tier: ProviderTier = 'primary'; // We treat it as primary, similar to brandfetch

  async getCandidates(entity: EntityCatalogItem, assetType: AssetType): Promise<AssetCandidate[]> {
    if (assetType !== 'brand_logo') {
      return [];
    }

    const publishableKey = process.env.LOGO_DEV_PUBLISHABLE_KEY;
    const secretKey = process.env.LOGO_DEV_SECRET_KEY;

    if (!publishableKey || !secretKey) {
      console.warn(`[LogoDevProvider] Missing API keys for Logo.dev (skipping ${entity.slug})`);
      return [];
    }

    const candidates: AssetCandidate[] = [];

    // 1. By Domain (If reliable domain exists)
    if (entity.domain) {
      const domain = entity.domain.trim();
      candidates.push({
        sourceProvider: this.name,
        providerTier: this.tier,
        sourceUrl: `https://img.logo.dev/${domain}?token=${publishableKey}&retina=true`,
        format: 'unknown',
        isRemote: true,
        expectedDomain: domain
      });
    }

    // 2. By Search (Fallback if no domain, or to provide an alternative candidate)
    // We attempt search to find a domain. If found and different, we add it.
    try {
      const searchDomain = await searchLogoDev(entity.name, secretKey);
      if (searchDomain && searchDomain !== entity.domain) {
        candidates.push({
          sourceProvider: this.name,
          providerTier: 'backup', // Give search-based results slightly lower priority in scoring
          sourceUrl: `https://img.logo.dev/${searchDomain}?token=${publishableKey}&retina=true`,
          format: 'unknown',
          isRemote: true,
          expectedDomain: searchDomain
        });
      }
    } catch (err) {
      console.error(`[LogoDevProvider] Search error for ${entity.name}:`, err);
    }

    return candidates;
  }
}
