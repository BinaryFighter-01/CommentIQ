// src/lib/ai/providers/gpt5.ts
import OpenAI from 'openai';
import { logger } from '../../logging';

export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number; // -1 to 1
  toxicity: number; // 0 to 1
  topics: string[];
  summary: string;
  keyPhrases: string[];
  engagement: 'high' | 'medium' | 'low';
}

/**
 * Initialize OpenAI GPT-5 client with ChatGPT Go subscription
 * https://platform.openai.com/docs/models/gpt-5
 */
function initializeOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  return new OpenAI({
    apiKey,
  });
}

/**
 * Analyze a single comment using GPT-5
 */
export async function analyzeCommentWithGPT5(
  commentText: string,
  context?: { videoTitle?: string; platform?: string }
): Promise<AnalysisResult> {
  const client = initializeOpenAIClient();
  const model = process.env.OPENAI_MODEL || 'gpt-5';

  const systemPrompt = `You are an expert AI analyst specializing in social media comment analysis. 
Analyze the given comment and provide structured JSON output with the following fields:
- sentiment: one of "positive", "negative", "neutral", or "mixed"
- sentimentScore: float from -1 (very negative) to 1 (very positive)
- toxicity: float from 0 (not toxic) to 1 (highly toxic)
- topics: array of main topics discussed (max 5)
- summary: brief one-sentence summary
- keyPhrases: array of important phrases or keywords (max 5)
- engagement: one of "high", "medium", or "low" based on discussion potential

Return ONLY valid JSON, no markdown or explanations.`;

  const userPrompt = `Analyze this ${context?.platform || 'social media'} comment${
    context?.videoTitle ? ` from video "${context.videoTitle}"` : ''
  }:

"${commentText}"`;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from GPT-5');
    }

    const parsed = JSON.parse(content);

    // Validate and normalize response
    return {
      sentiment: normalizeSentiment(parsed.sentiment),
      sentimentScore: Math.max(-1, Math.min(1, parsed.sentimentScore || 0)),
      toxicity: Math.max(0, Math.min(1, parsed.toxicity || 0)),
      topics: Array.isArray(parsed.topics) ? parsed.topics.slice(0, 5) : [],
      summary: typeof parsed.summary === 'string' ? parsed.summary : '',
      keyPhrases: Array.isArray(parsed.keyPhrases)
        ? parsed.keyPhrases.slice(0, 5)
        : [],
      engagement: normalizeEngagement(parsed.engagement),
    };
  } catch (error) {
    logger.error('Error analyzing comment with GPT-5', {
      error,
      commentPreview: commentText.substring(0, 100),
    });
    throw error;
  }
}

/**
 * Batch analyze multiple comments using GPT-5
 */
export async function analyzeCommentsWithGPT5(
  comments: string[],
  batchSize: number = 10
): Promise<AnalysisResult[]> {
  const results: AnalysisResult[] = [];

  for (let i = 0; i < comments.length; i += batchSize) {
    const batch = comments.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((comment) => analyzeCommentWithGPT5(comment))
    );
    results.push(...batchResults);

    // Rate limiting: add small delay between batches
    if (i + batchSize < comments.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}

/**
 * Generate insights for a collection of analyses
 */
export async function generateInsightsWithGPT5(
  analyses: AnalysisResult[],
  videoTitle: string,
  commentCount: number
): Promise<string> {
  const client = initializeOpenAIClient();
  const model = process.env.OPENAI_MODEL || 'gpt-5';

  const sentimentDistribution = {
    positive: analyses.filter((a) => a.sentiment === 'positive').length,
    negative: analyses.filter((a) => a.sentiment === 'negative').length,
    neutral: analyses.filter((a) => a.sentiment === 'neutral').length,
    mixed: analyses.filter((a) => a.sentiment === 'mixed').length,
  };

  const avgToxicity =
    analyses.reduce((sum, a) => sum + a.toxicity, 0) / analyses.length;
  const topTopics = getTopItems(
    analyses.flatMap((a) => a.topics),
    5
  );

  const userPrompt = `Generate actionable insights for a ${videoTitle} based on ${commentCount} comments analyzed.

Sentiment Distribution: ${JSON.stringify(sentimentDistribution)}
Average Toxicity: ${avgToxicity.toFixed(2)}
Top Topics: ${topTopics.join(', ')}

Provide 3-4 short, actionable insights that the content creator should know about their audience.`;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    logger.error('Error generating insights', { error });
    throw error;
  }
}

/**
 * Normalize sentiment value
 */
function normalizeSentiment(
  value: any
): 'positive' | 'negative' | 'neutral' | 'mixed' {
  const normalized = String(value).toLowerCase().trim();
  if (['positive', 'negative', 'neutral', 'mixed'].includes(normalized)) {
    return normalized as any;
  }
  return 'neutral';
}

/**
 * Normalize engagement value
 */
function normalizeEngagement(value: any): 'high' | 'medium' | 'low' {
  const normalized = String(value).toLowerCase().trim();
  if (['high', 'medium', 'low'].includes(normalized)) {
    return normalized as any;
  }
  return 'medium';
}

/**
 * Get top items from an array with frequency counting
 */
function getTopItems(items: string[], limit: number = 5): string[] {
  const frequency = new Map<string, number>();
  items.forEach((item) => {
    frequency.set(item, (frequency.get(item) || 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([item]) => item);
}
