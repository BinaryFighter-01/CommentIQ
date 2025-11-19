// src/app/api/analyze/youtube/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { extractYouTubeVideoId, fetchYouTubeVideoMetadata, fetchYouTubeComments } from '@/lib/scrapers/youtube';
import { prisma } from '@/lib/db';
import { analyzeCommentWithGPT5, analyzeCommentWithMock } from '@/lib/ai/providers/gpt5';
import { getCachedAnalysis, cacheAnalysis } from '@/lib/cache/system';
import { aggregateVideoAnalytics } from '@/lib/analytics/aggregator';
import { logger } from '@/lib/logging';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Check rate limits
    const usageMetrics = await prisma.usageMetrics.findUnique({
      where: { userId: req.userId },
    });

    if (
      usageMetrics &&
      usageMetrics.analysesThisDay >=
        parseInt(process.env.ANALYSIS_MAX_PER_USER_PER_DAY || '100', 10)
    ) {
      return NextResponse.json(
        { error: 'Daily analysis limit reached' },
        { status: 429 }
      );
    }

    // Fetch video metadata
    const videoMetadata = await fetchYouTubeVideoMetadata(videoId);
    if (!videoMetadata) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    // Store metadata
    const storedMetadata = await prisma.videoMetadata.upsert({
      where: { videoId },
      create: {
        videoId,
        platform: 'youtube',
        title: videoMetadata.title,
        url: videoMetadata.url,
        views: videoMetadata.views,
        likes: videoMetadata.likes,
        commentCount: videoMetadata.commentCount,
        authorName: videoMetadata.authorName,
        authorId: videoMetadata.authorId,
      },
      update: {
        views: videoMetadata.views,
        likes: videoMetadata.likes,
        commentCount: videoMetadata.commentCount,
      },
    });

    // Fetch comments
    const comments = await fetchYouTubeComments(videoId);
    logger.info('Fetched YouTube comments', {
      videoId,
      commentCount: comments.length,
    });

    // Store comments and analyze
    let analyzedCount = 0;
    const useMock = process.env.MOCK_AI_PROVIDER === 'true';

    for (const comment of comments) {
      // Store comment
      const storedComment = await prisma.comment.upsert({
        where: { commentId: comment.commentId },
        create: {
          commentId: comment.commentId,
          videoMetadataId: storedMetadata.id,
          authorName: comment.authorName,
          authorId: comment.authorId,
          content: comment.content,
          likes: comment.likes,
          replies: comment.replies,
          createdAt: comment.createdAt,
          platform: 'youtube',
        },
        update: {
          likes: comment.likes,
          replies: comment.replies,
        },
      });

      // Check cache
      let analysis = await getCachedAnalysis(comment.content);

      if (!analysis) {
        // Analyze with AI
        analysis = useMock
          ? await (await import('@/lib/ai/providers/mock')).analyzeCommentWithMock(comment.content)
          : await analyzeCommentWithGPT5(comment.content, {
              videoTitle: videoMetadata.title,
              platform: 'youtube',
            });

        // Cache result
        await cacheAnalysis(comment.content, analysis, 'youtube');
      }

      // Store analysis
      await prisma.analysis.create({
        data: {
          userId: req.userId,
          videoMetadataId: storedMetadata.id,
          commentId: storedComment.id,
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          toxicity: analysis.toxicity,
          topics: analysis.topics,
          summary: analysis.summary,
          keyPhrases: analysis.keyPhrases,
          engagement: analysis.engagement,
          processingTime: 100, // Mock value
          costEstimate: 0.01, // Rough estimate per comment
        },
      });

      analyzedCount++;
    }

    // Aggregate analytics
    await aggregateVideoAnalytics(storedMetadata.id);

    // Update usage metrics
    await prisma.usageMetrics.update({
      where: { userId: req.userId },
      data: {
        totalAnalyses: { increment: analyzedCount },
        totalCommentsFetched: { increment: comments.length },
        analysesThisDay: { increment: analyzedCount },
        totalCostUSD: { increment: analyzedCount * 0.01 },
      },
    });

    logger.info('YouTube analysis completed', {
      videoId,
      userId: req.userId,
      analyzedCount,
    });

    return NextResponse.json({
      success: true,
      videoId,
      commentsAnalyzed: analyzedCount,
      metadata: videoMetadata,
    });
  } catch (error) {
    logger.error('YouTube analysis error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
