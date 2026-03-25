import fs from 'fs';
import https from 'https';
import http from 'http';
import { AssetCandidate, AssetEvaluation, AssetFormat, AssetStatus } from './types';

// Helper to do a request to determine existence, content-type and content-length
function checkRemoteAsset(url: string): Promise<{ exists: boolean; contentType?: string; contentLength?: number }> {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      res.resume();
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
        const cType = res.headers['content-type'];
        const cLen = res.headers['content-length'];
        resolve({
          exists: true,
          contentType: cType,
          contentLength: cLen ? parseInt(cLen, 10) : undefined,
        });
      } else {
        resolve({ exists: false });
      }
    });

    req.on('error', () => {
      resolve({ exists: false });
    });
    
    // Set a timeout to not hang forever
    req.setTimeout(1500, () => {
      req.destroy();
      resolve({ exists: false });
    });
    req.end();
  });
}

function inferFormatFromContentType(contentType: string): AssetFormat {
  if (contentType.includes('svg')) return 'svg';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpg';
  // Check typical ico or other formats
  return 'unknown';
}

function getBaseScoreForFormat(format: AssetFormat): number {
  switch (format) {
    case 'svg': return 100; // SVGs are highly preferred
    case 'png': return 70;
    case 'webp': return 50;
    case 'jpg':
    case 'jpeg': return 30;
    default: return 10;
  }
}

export async function evaluateCandidates(candidates: AssetCandidate[]): Promise<AssetEvaluation[]> {
  const evaluations: AssetEvaluation[] = [];

  for (const candidate of candidates) {
    let exists = false;
    let finalFormat = candidate.format;
    let reason = '';
    let status: AssetStatus = 'missing';
    let cLength: number | undefined;
    let cType: string | undefined;

    if (!candidate.isRemote && candidate.localPath) {
      exists = fs.existsSync(candidate.localPath);
      if (exists) {
        const stats = fs.statSync(candidate.localPath);
        cLength = stats.size;
        reason = 'Local file exists';
        status = 'approved';
      } else {
        reason = 'Local file missing';
      }
    } else if (candidate.isRemote) {
      const result = await checkRemoteAsset(candidate.sourceUrl);
      exists = result.exists;
      if (exists) {
        cType = result.contentType;
        cLength = result.contentLength;
        const remoteFormat = cType ? inferFormatFromContentType(cType) : 'unknown';
        if (remoteFormat !== 'unknown') {
          finalFormat = remoteFormat;
        }
        reason = `Remote accessible (${cType || 'unknown format'})`;
        status = 'approved';
      } else {
        reason = 'Remote file not accessible or 404';
      }
    }

    let score = 0;
    if (exists) {
      score = getBaseScoreForFormat(finalFormat);

      // Rule: Tier bonuses
      if (candidate.providerTier === 'primary') score += 20;
      if (candidate.providerTier === 'local_carry_over') score += 15; // Local is good but prefer high-res API if avail
      if (candidate.providerTier === 'backup') score -= 10;

      // Rule: Expected domain match check
      if (candidate.expectedDomain && candidate.sourceUrl.includes(candidate.expectedDomain)) {
        score += 15; // Strongly matches domain
      }

      // Rule: Reject HTML or non-images silently
      if (cType && cType.includes('text/html')) {
        exists = false;
        status = 'rejected';
        reason = 'URL is an HTML page, not an image.';
        score = 0;
      }

      // Rule: Too small check (Size less than 2KB might be too small for raster images)
      // SVG can be tiny so we only penalize raster images.
      if (finalFormat !== 'svg' && cLength && cLength < 2500) {
        score -= 40;
        status = 'manual_review';
        reason += ' | File size too small (<2.5KB), likely low quality.';
      } else if (finalFormat === 'unknown' && (!cLength || cLength < 1000)) {
        score -= 50;
        status = 'manual_review';
        reason += ' | Unknown format and missing/small length.';
      }
    }

    evaluations.push({
      candidate: {
        ...candidate,
        format: finalFormat,
      },
      score,
      reason,
      status: exists ? status : 'missing',
      contentType: cType,
      contentLength: cLength,
    });
  }

  return evaluations;
}

export function getBestCandidate(evaluations: AssetEvaluation[]): AssetEvaluation | null {
  const validEvaluations = evaluations.filter((e) => e.status !== 'missing' && e.status !== 'rejected');
  if (validEvaluations.length === 0) return null;

  // Sort descending by score
  validEvaluations.sort((a, b) => b.score - a.score);
  return validEvaluations[0];
}
