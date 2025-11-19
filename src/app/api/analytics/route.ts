// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db';
import { getSentimentTimeline } from '@/lib/analytics/aggregator';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const videoIdParam = req.nextUrl.searchParams.get('videoId');

    if (!videoIdParam) {
      return NextResponse.json(
        { error: 'videoId parameter required' },
        { status: 400 }
      );
    }

    const metadata = await prisma.analysisAggregation.findUnique({
      where: { videoMetadataId: videoIdParam },
    });

    if (!metadata) {
      return NextResponse.json(
        { error: 'No analytics found' },
        { status: 404 }
      );
    }

    const timeline = await getSentimentTimeline(videoIdParam);

    return NextResponse.json({
      sentiment: {
        positive: metadata.positiveCount,
        negative: metadata.negativeCount,
        neutral: metadata.neutralCount,
        mixed: metadata.mixedCount,
      },
      engagement: {
        high: metadata.highEngagementCount,
        medium: metadata.mediumEngagementCount,
        low: metadata.lowEngagementCount,
      },
      topics: metadata.topTopics,
      phrases: metadata.topPhrases,
      averageToxicity: metadata.averageToxicity,
      averageSentiment: metadata.averageSentiment,
      totalAnalyzed: metadata.totalAnalyzed,
      timeline,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
