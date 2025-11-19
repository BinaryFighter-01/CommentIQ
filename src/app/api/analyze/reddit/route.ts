// src/app/api/analyze/reddit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { extractRedditPostId, fetchRedditPostMetadata, fetchRedditComments } from '@/lib/scrapers/reddit';
import { prisma } from '@/lib/db';
import { analyzeCommentWithGPT5 } from '@/lib/ai/providers/gpt5';
import { getCachedAnalysis, cacheAnalysis } from '@/lib/cache/system';
import { aggregateVideoAnalytics } from '@/lib/analytics/aggregator';
import { logger } from '@/lib/logging';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    const postId = extractRedditPostId(url);
    if (!postId) {
      return NextResponse.json(
        { error: 'Invalid Reddit URL' },
        { status: 400 }
      );
    }

    // Fetch post metadata
    const postMetadata = await fetchRedditPostMetadata(postId);
    if (!postMetadata) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Store metadata
    const storedMetadata = await prisma.videoMetadata.upsert({
      where: { videoId: postId },
      create: {
        videoId: postId,
        platform: 'reddit',
        title: postMetadata.title,
        url: postMetadata.url,
        views: postMetadata.upvotes,
        likes: postMetadata.awards,
        commentCount: postMetadata.commentCount,
        authorName: postMetadata.authorName,
        authorId: postMetadata.authorId,
      },
      update: {
        views: postMetadata.upvotes,
        likes: postMetadata.awards,
        commentCount: postMetadata.commentCount,
      },
    });

    // Fetch comments
    const comments = await fetchRedditComments(postId);

    // Store and analyze comments
    let analyzedCount = 0;
    const useMock = process.env.MOCK_AI_PROVIDER === 'true';

    for (const comment of comments) {
      const storedComment = await prisma.comment.upsert({
        where: { commentId: comment.commentId },
        create: {
          commentId: comment.commentId,
          videoMetadataId: storedMetadata.id,
          authorName: comment.authorName,
          authorId: comment.authorId,
          content: comment.content,
          likes: comment.upvotes,
          replies: 0,
          createdAt: comment.createdAt,
          platform: 'reddit',
        },
        update: {
          likes: comment.upvotes,
        },
      });

      let analysis = await getCachedAnalysis(comment.content);
      if (!analysis) {
        analysis = useMock
          ? await (await import('@/lib/ai/providers/mock')).analyzeCommentWithMock(comment.content)
          : await analyzeCommentWithGPT5(comment.content, {
              videoTitle: postMetadata.title,
              platform: 'reddit',
            });

        await cacheAnalysis(comment.content, analysis, 'reddit');
      }

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
          processingTime: 100,
          costEstimate: 0.01,
        },
      });

      analyzedCount++;
    }

    // Aggregate analytics
    await aggregateVideoAnalytics(storedMetadata.id);

    // Update usage
    await prisma.usageMetrics.update({
      where: { userId: req.userId },
      data: {
        totalAnalyses: { increment: analyzedCount },
        totalCommentsFetched: { increment: comments.length },
        analysesThisDay: { increment: analyzedCount },
      },
    });

    logger.info('Reddit analysis completed', {
      postId,
      userId: req.userId,
      analyzedCount,
    });

    return NextResponse.json({
      success: true,
      postId,
      commentsAnalyzed: analyzedCount,
      metadata: postMetadata,
    });
  } catch (error) {
    logger.error('Reddit analysis error', { error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
