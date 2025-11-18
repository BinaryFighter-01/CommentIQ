// src/lib/analytics/aggregator.ts
import { prisma } from '../db';
import { AnalysisResult } from '../ai/providers/gpt5';
import { logger } from '../logging';

/**
 * Aggregate analytics for a video
 */
export async function aggregateVideoAnalytics(
  videoMetadataId: string
): Promise<void> {
  try {
    const analyses = await prisma.analysis.findMany({
      where: { videoMetadataId },
    });

    if (analyses.length === 0) {
      logger.warn('No analyses found for video', { videoMetadataId });
      return;
    }

    const sentimentCounts = {
      positive: 0,
      negative: 0,
      neutral: 0,
      mixed: 0,
    };

    const engagementCounts = {
      high: 0,
      medium: 0,
      low: 0,
    };

    const allTopics: string[] = [];
    const allPhrases: string[] = [];
    let totalToxicity = 0;

    analyses.forEach((analysis) => {
      sentimentCounts[analysis.sentiment as keyof typeof sentimentCounts]++;
      engagementCounts[analysis.engagement as keyof typeof engagementCounts]++;
      allTopics.push(...analysis.topics);
      allPhrases.push(...analysis.keyPhrases);
      totalToxicity += analysis.toxicity;
    });

    const topTopics = getTopItems(allTopics, 10);
    const topPhrases = getTopItems(allPhrases, 10);

    await prisma.analysisAggregation.upsert({
      where: { videoMetadataId },
      create: {
        videoMetadataId,
        positiveCount: sentimentCounts.positive,
        negativeCount: sentimentCounts.negative,
        neutralCount: sentimentCounts.neutral,
        mixedCount: sentimentCounts.mixed,
        averageSentiment:
          (sentimentCounts.positive - sentimentCounts.negative) / analyses.length,
        highEngagementCount: engagementCounts.high,
        mediumEngagementCount: engagementCounts.medium,
        lowEngagementCount: engagementCounts.low,
        averageToxicity: totalToxicity / analyses.length,
        topTopics,
        topPhrases,
        totalAnalyzed: analyses.length,
      },
      update: {
        positiveCount: sentimentCounts.positive,
        negativeCount: sentimentCounts.negative,
        neutralCount: sentimentCounts.neutral,
        mixedCount: sentimentCounts.mixed,
        averageSentiment:
          (sentimentCounts.positive - sentimentCounts.negative) / analyses.length,
        highEngagementCount: engagementCounts.high,
        mediumEngagementCount: engagementCounts.medium,
        lowEngagementCount: engagementCounts.low,
        averageToxicity: totalToxicity / analyses.length,
        topTopics,
        topPhrases,
        totalAnalyzed: analyses.length,
        lastUpdated: new Date(),
      },
    });

    logger.info('Aggregated video analytics', { videoMetadataId });
  } catch (error) {
    logger.error('Error aggregating analytics', { videoMetadataId, error });
    throw error;
  }
}

/**
 * Get top items from array with frequency
 */
function getTopItems(items: string[], limit: number): string[] {
  const frequency = new Map<string, number>();

  items.forEach((item) => {
    frequency.set(item, (frequency.get(item) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
}

/**
 * Get sentiment timeline for last N days
 */
export async function getSentimentTimeline(
  videoMetadataId: string,
  days: number = 7
): Promise<Array<{ date: string; sentiment: number }>> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const analyses = await prisma.analysis.findMany({
    where: {
      videoMetadataId,
      createdAt: { gte: startDate },
    },
    orderBy: { createdAt: 'asc' },
  });

  const timeline = new Map<string, { positive: number; negative: number }>();

  analyses.forEach((analysis) => {
    const dateKey = analysis.createdAt.toISOString().split('T')[0];
    const current = timeline.get(dateKey) || { positive: 0, negative: 0 };

    if (analysis.sentiment === 'positive') current.positive++;
    else if (analysis.sentiment === 'negative') current.negative++;

    timeline.set(dateKey, current);
  });

  return Array.from(timeline.entries()).map(([date, counts]) => ({
    date,
    sentiment: (counts.positive - counts.negative) / (counts.positive + counts.negative),
  }));
}
