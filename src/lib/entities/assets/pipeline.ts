import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { AssetFormat, AssetManifestRecord, AssetType, EntityCatalogItem } from './types';
import { ProviderRegistry } from './providers/ProviderRegistry';
import { evaluateCandidates, getBestCandidate } from './scoring';

function downloadRemoteFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    const request = client.get(url, (response) => {
      if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed with status code: ${response.statusCode}`));
      }
    });

    request.on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
    
    request.setTimeout(3000, () => {
      request.destroy();
      fs.unlink(destPath, () => {});
      reject(new Error('Download timeout'));
    });
  });
}

function ensureDirSync(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export interface OverrideRecord {
  entitySlug: string;
  manualOverridePath?: string;
  manualOverrideDomain?: string;
  approvedForNextMigration?: boolean | string;
  currentStatus?: string;
}

export class AssetPipeline {
  constructor(
    private registry: ProviderRegistry,
    private outputDir: string,
    private overrides: Map<string, OverrideRecord> = new Map()
  ) {
    ensureDirSync(this.outputDir);
  }

  async runForEntity(entity: EntityCatalogItem, initialAssetType: AssetType = 'brand_logo'): Promise<AssetManifestRecord> {
    
    let entityKind: 'brand' | 'product' | 'other' = 'brand';
    let assetType = initialAssetType;

    // Infer entity kind
    if (entity.type === 'product' || entity.category?.toLowerCase().includes('producto')) {
      entityKind = 'product';
      assetType = 'product_image';
    } else if (entity.type === 'other') {
      entityKind = 'other';
    }

    // Check for overrides
    const override = this.overrides.get(entity.slug);
    const isOverrideApproved = override?.approvedForNextMigration === true || override?.approvedForNextMigration === 'true' || override?.currentStatus === 'approved';
    let isManualOverride = false;
    
    if (override && isOverrideApproved && override.manualOverrideDomain) {
      entity.domain = override.manualOverrideDomain;
      isManualOverride = true;
    }

    const candidates = await this.registry.getAllCandidates(entity, assetType);

    // If there is an override path, prepend it as the best candidate
    if (override && isOverrideApproved && override.manualOverridePath) {
       const ext = path.extname(override.manualOverridePath).replace('.', '').toLowerCase();
       candidates.unshift({
         sourceProvider: 'manual_override_path',
         providerTier: 'primary',
         sourceUrl: override.manualOverridePath,
         format: (['svg', 'png', 'jpg', 'jpeg', 'webp'].includes(ext) ? ext : 'unknown') as AssetFormat,
         localPath: override.manualOverridePath,
         isRemote: false
       });
       isManualOverride = true;
    }

    const evaluations = await evaluateCandidates(candidates);
    let bestEvaluation = getBestCandidate(evaluations);
    let usedBrandFallback = false;

    // Fallback logic for products
    if (entityKind === 'product' && (!bestEvaluation || bestEvaluation.status !== 'approved')) {
      usedBrandFallback = true;
      const brandCandidates = await this.registry.getAllCandidates(entity, 'brand_logo');
      const brandEvaluations = await evaluateCandidates(brandCandidates);
      const bestBrandEval = getBestCandidate(brandEvaluations);

      // If brand provides a better evaluation, use it
      if (bestBrandEval && (!bestEvaluation || bestBrandEval.score > bestEvaluation.score)) {
        bestEvaluation = bestBrandEval;
        assetType = 'brand_logo';
      }
    }

    const manifestRecord: AssetManifestRecord = {
      entityId: entity.id,
      entitySlug: entity.slug,
      entityName: entity.name,
      domain: entity.domain || null,
      assetType,
      entityKind,
      usedBrandFallback,
      status: 'missing',
      providerType: null,
      sourceProvider: null,
      sourceUrl: null,
      localPath: null,
      format: null,
      contentType: null,
      width: null,
      height: null,
      score: null,
      reason: 'No valid candidates found.',
      isManualOverride,
      updatedAt: new Date().toISOString(),
    };

    if (bestEvaluation) {
      const best = bestEvaluation.candidate;
      const fileExt = best.format !== 'unknown' ? best.format : 'png'; // Fallback extension
      const filename = `${entity.slug}.${fileExt}`;
      const finalLocalPath = path.join(this.outputDir, filename);

      try {
        if (best.isRemote) {
          await downloadRemoteFile(best.sourceUrl, finalLocalPath);
        } else if (best.localPath && best.localPath !== finalLocalPath) {
          fs.copyFileSync(best.localPath, finalLocalPath);
        }

        manifestRecord.status = bestEvaluation.status;
        manifestRecord.providerType = best.providerTier;
        manifestRecord.sourceProvider = best.sourceProvider;
        manifestRecord.sourceUrl = best.sourceUrl;
        manifestRecord.localPath = `/logos/entities_next/${filename}`;
        manifestRecord.format = best.format;
        manifestRecord.contentType = bestEvaluation.contentType || null;
        manifestRecord.score = bestEvaluation.score;
        manifestRecord.reason = bestEvaluation.reason;
      } catch (error) {
        manifestRecord.status = 'rejected';
        manifestRecord.reason = `Error writing/downloading file to disk: ${(error instanceof Error) ? error.message : String(error)}`;
      }
    }

    return manifestRecord;
  }
}
