// src/lib/queue/processor.ts
import { prisma } from '../db';
import { logger } from '../logging';
import { analyzeCommentWithGPT5, analyzeCommentWithMock } from '../ai/providers/gpt5';
import { getCachedAnalysis, cacheAnalysis } from '../cache/system';

interface QueueJobPayload {
  jobType: string;
  data: Record<string, any>;
}

/**
 * Create a queue job
 */
export async function createQueueJob(
  userId: string,
  jobType: string,
  payload: Record<string, any>
): Promise<string> {
  const job = await prisma.queueJob.create({
    data: {
      userId,
      jobType,
      payload: JSON.stringify(payload),
    },
  });

  logger.info('Created queue job', { jobId: job.id, jobType });
  return job.id;
}

/**
 * Process pending queue jobs
 */
export async function processQueueJobs(): Promise<void> {
  try {
    const pendingJobs = await prisma.queueJob.findMany({
      where: { status: 'pending' },
      take: 10, // Process max 10 at a time
      include: { user: true },
    });

    for (const job of pendingJobs) {
      await processJob(job);
    }

    logger.info('Queue processing completed', { jobsProcessed: pendingJobs.length });
  } catch (error) {
    logger.error('Error processing queue', { error });
  }
}

/**
 * Process individual job
 */
async function processJob(job: any): Promise<void> {
  try {
    const payload = JSON.parse(job.payload);

    await prisma.queueJob.update({
      where: { id: job.id },
      data: { status: 'processing' },
    });

    let result: any;

    switch (job.jobType) {
      case 'analyze_comment':
        result = await handleAnalyzeComment(payload);
        break;
      case 'generate_insights':
        result = await handleGenerateInsights(payload);
        break;
      default:
        throw new Error(`Unknown job type: ${job.jobType}`);
    }

    await prisma.queueJob.update({
      where: { id: job.id },
      data: {
        status: 'completed',
        result: JSON.stringify(result),
        completedAt: new Date(),
      },
    });

    logger.info('Job completed', { jobId: job.id });
  } catch (error) {
    await handleJobError(job, error);
  }
}

/**
 * Handle analyze_comment job
 */
async function handleAnalyzeComment(payload: any): Promise<any> {
  const { commentId, commentContent } = payload;

  // Check cache first
  const cached = await getCachedAnalysis(commentContent);
  if (cached) {
    return cached;
  }

  // Analyze
  const useMock = process.env.MOCK_AI_PROVIDER === 'true';
  const analysis = useMock
    ? await analyzeCommentWithMock(commentContent)
    : await analyzeCommentWithGPT5(commentContent);

  // Cache result
  await cacheAnalysis(commentContent, analysis, 'youtube');

  return analysis;
}

/**
 * Handle generate_insights job
 */
async function handleGenerateInsights(payload: any): Promise<any> {
  // Placeholder for insights generation
  return { insights: 'Generated insights' };
}

/**
 * Handle job errors
 */
async function handleJobError(job: any, error: any): Promise<void> {
  const retryCount = job.retryCount + 1;
  const maxRetries = job.maxRetries;

  if (retryCount < maxRetries) {
    await prisma.queueJob.update({
      where: { id: job.id },
      data: {
        status: 'pending',
        retryCount,
        error: error.message,
      },
    });

    logger.warn('Job retry', { jobId: job.id, attempt: retryCount });
  } else {
    await prisma.queueJob.update({
      where: { id: job.id },
      data: {
        status: 'failed',
        error: error.message,
        completedAt: new Date(),
      },
    });

    logger.error('Job failed', { jobId: job.id, error: error.message });
  }
}
