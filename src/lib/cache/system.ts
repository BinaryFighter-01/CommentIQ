// src/lib/cache/system.ts
import crypto from 'crypto';
import { prisma } from '../db';
import { AnalysisResult } from '../ai/providers/gpt5';
import { logger } from '../logging';

/**
 * Generate SHA256 hash of comment content for cache key
 */
export function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get cached analysis if available and not expired
 */
export async function getCachedAnalysis(
  commentContent: string
): Promise<AnalysisResult | null> {
  if (process.env.ENABLE_AI_CACHE !== 'true') {
    return null;
  }

  try {
    const contentHash = generateContentHash(commentContent);

    const cached = await prisma.analysisCache.findUnique({
      where: { contentHash },
    });

    if (!cached) {
      return null;
    }

    // Check if expired
    if (new Date() > cached.expiresAt) {
      // Delete expired cache
      await prisma.analysisCache.delete({ where: { id: cached.id } });
      return null;
    }

    logger.info('Cache hit', { contentHash: contentHash.substring(0, 8) });
    return JSON.parse(cached.analysisData);
  } catch (error) {
    logger.error('Error reading from cache', { error });
    return null;
  }
}

/**
 * Store analysis in cache
 */
export async function cacheAnalysis(
  commentContent: string,
  analysis: AnalysisResult,
  platform: string
): Promise<void> {
  if (process.env.ENABLE_AI_CACHE !== 'true') {
    return;
  }

  try {
    const contentHash = generateContentHash(commentContent);
    const ttlHours = parseInt(process.env.CACHE_TTL_HOURS || '24', 10);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    await prisma.analysisCache.upsert({
      where: { contentHash },
      update: { expiresAt }, // Refresh expiry if re-cached
      create: {
        contentHash,
        analysisData: JSON.stringify(analysis),
        platform,
        expiresAt,
      },
    });

    logger.info('Cached analysis', { contentHash: contentHash.substring(0, 8) });
  } catch (error) {
    logger.error('Error writing to cache', { error });
  }
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const result = await prisma.analysisCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info('Cleared expired cache', { count: result.count });
    return result.count;
  } catch (error) {
    logger.error('Error clearing expired cache', { error });
    return 0;
  }
}
