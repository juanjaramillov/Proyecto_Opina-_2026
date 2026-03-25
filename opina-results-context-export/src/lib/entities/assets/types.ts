export type AssetType = 'brand_logo' | 'product_image' | 'generic_icon';

export type AssetFormat = 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'unknown';

export type AssetStatus = 'approved' | 'missing' | 'rejected' | 'manual_review';

export type ProviderTier = 'primary' | 'backup' | 'local_carry_over';

export interface EntityCatalogItem {
  id: string; // From Supabase entities table or CSV
  name: string;
  slug: string;
  domain?: string | null;
  category?: string | null;
  sub_category?: string | null;
  type?: string | null;
}

export interface AssetCandidate {
  sourceProvider: string;
  providerTier: ProviderTier;
  sourceUrl: string; // Could be a local path or remote URL
  format: AssetFormat;
  localPath?: string; // If it's already a local file
  isRemote: boolean;
  expectedDomain?: string | null;
}

export interface AssetEvaluation {
  candidate: AssetCandidate;
  score: number;
  reason: string;
  status: AssetStatus;
  contentType?: string;
  contentLength?: number;
}

export interface AssetManifestRecord {
  entityId: string;
  entitySlug: string;
  entityName: string;
  domain: string | null;
  assetType: AssetType;
  entityKind: 'brand' | 'product' | 'other';
  usedBrandFallback: boolean;
  status: AssetStatus;
  providerType: ProviderTier | null;
  sourceProvider: string | null;
  sourceUrl: string | null;
  localPath: string | null;
  format: AssetFormat | null;
  contentType: string | null;
  width: number | null;
  height: number | null;
  score: number | null;
  reason: string | null;
  isManualOverride?: boolean;
  updatedAt: string;
}

export interface AssetProvider {
  name: string;
  tier: ProviderTier;
  getCandidates(entity: EntityCatalogItem, assetType: AssetType): Promise<AssetCandidate[]>;
}
