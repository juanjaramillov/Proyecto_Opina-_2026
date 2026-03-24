import * as cheerio from 'cheerio';
import { AssetCandidate, AssetProvider, AssetType, EntityCatalogItem, ProviderTier } from '../types';

export class HtmlMetadataProvider implements AssetProvider {
  name = 'html_metadata';
  tier: ProviderTier = 'backup';

  async getCandidates(entity: EntityCatalogItem, _assetType: AssetType): Promise<AssetCandidate[]> {
    if (!entity.domain) {
      return [];
    }

    const domain = entity.domain.replace(/^https?:\/\//, '');
    const protocol = 'https://';
    const baseUrl = `${protocol}${domain}`;
    
    const candidates: AssetCandidate[] = [];

    // Fallback standard paths
    candidates.push({
      sourceProvider: this.name,
      providerTier: this.tier,
      sourceUrl: `${baseUrl}/favicon.ico`,
      format: 'unknown',
      isRemote: true,
      expectedDomain: domain
    });

    candidates.push({
      sourceProvider: this.name,
      providerTier: this.tier,
      sourceUrl: `${baseUrl}/apple-touch-icon.png`,
      format: 'png',
      isRemote: true,
      expectedDomain: domain
    });

    try {
      // Scrape HTML for meta tags
      const response = await fetch(baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; OpinaBot/1.0)',
          'Accept': 'text/html'
        },
        signal: AbortSignal.timeout(1500), // 1.5 seconds timeout
      });

      if (!response.ok) {
        return candidates;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Check OpenGraph image
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) {
        candidates.push({
          sourceProvider: `${this.name}:og_image`,
          providerTier: this.tier,
          sourceUrl: this.resolveUrl(baseUrl, ogImage),
          format: 'unknown',
          isRemote: true,
          expectedDomain: domain
        });
      }

      // Check various icon links
      const iconSelectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]'
      ];

      for (const selector of iconSelectors) {
        const href = $(selector).attr('href');
        if (href) {
          candidates.push({
            sourceProvider: `${this.name}:link_icon`,
            providerTier: this.tier,
            sourceUrl: this.resolveUrl(baseUrl, href),
            format: 'unknown',
            isRemote: true,
            expectedDomain: domain
          });
        }
      }

    } catch (err) {
      console.warn(`[HtmlMetadataProvider] Error scraping ${baseUrl}:`, err instanceof Error ? err.message : err);
    }

    // Deduplicate by URL
    const uniqueCandidates = Array.from(
      new Map(candidates.map((c) => [c.sourceUrl, c])).values()
    );

    return uniqueCandidates;
  }

  private resolveUrl(base: string, pathOrUrl: string): string {
    if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
      return pathOrUrl;
    }
    if (pathOrUrl.startsWith('//')) {
      return `https:${pathOrUrl}`;
    }
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${cleanBase}${cleanPath}`;
  }
}
