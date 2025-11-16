// src/lib/ai/providers/mock.ts
import { AnalysisResult } from './gpt5';
import { logger } from '../../logging';

/**
 * Mock AI provider for development (no API calls)
 */
export async function analyzeCommentWithMock(
  commentText: string
): Promise<AnalysisResult> {
  logger.info('Using mock AI provider', { commentLength: commentText.length });

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 100));

  const sentiment = getRandomSentiment();
  const topics = extractMockTopics(commentText);

  return {
    sentiment,
    sentimentScore: getSentimentScore(sentiment),
    toxicity: Math.random() * 0.3, // Low toxicity for mock
    topics,
    summary: `Mock analysis: ${commentText.substring(0, 50)}...`,
    keyPhrases: extractMockPhrases(commentText),
    engagement: getRandomEngagement(),
  };
}

/**
 * Batch analyze using mock provider
 */
export async function analyzeCommentsWithMock(
  comments: string[]
): Promise<AnalysisResult[]> {
  return Promise.all(comments.map((c) => analyzeCommentWithMock(c)));
}

/**
 * Generate mock insights
 */
export async function generateInsightsWithMock(
  analyses: AnalysisResult[]
): Promise<string> {
  return `Mock insights: Analyzed ${analyses.length} comments. Average sentiment: neutral. Recommend engaging with community.`;
}

function getRandomSentiment(): 'positive' | 'negative' | 'neutral' | 'mixed' {
  const options: Array<'positive' | 'negative' | 'neutral' | 'mixed'> = [
    'positive',
    'negative',
    'neutral',
    'mixed',
  ];
  return options[Math.floor(Math.random() * options.length)];
}

function getSentimentScore(sentiment: string): number {
  switch (sentiment) {
    case 'positive':
      return Math.random() * 0.5 + 0.5; // 0.5 to 1
    case 'negative':
      return Math.random() * -0.5 - 0.5; // -1 to -0.5
    case 'mixed':
      return Math.random() * 0.2 - 0.1; // -0.1 to 0.1
    default:
      return 0;
  }
}

function getRandomEngagement(): 'high' | 'medium' | 'low' {
  const rand = Math.random();
  if (rand < 0.33) return 'high';
  if (rand < 0.66) return 'medium';
  return 'low';
}

function extractMockTopics(text: string): string[] {
  const keywords = ['great', 'love', 'bad', 'worst', 'good', 'amazing'];
  return keywords.filter((k) => text.toLowerCase().includes(k)).slice(0, 3);
}

function extractMockPhrases(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 4)
    .slice(0, 5);
}
