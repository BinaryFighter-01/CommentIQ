// src/lib/scrapers/reddit.ts
import Snoowrap from 'snoowrap';
import { logger } from '../logging';

interface RedditPostMetadata {
  postId: string;
  title: string;
  url: string;
  upvotes: number;
  awards: number;
  commentCount: number;
  authorName: string;
  authorId: string;
  subreddit: string;
}

interface RedditComment {
  commentId: string;
  authorName: string;
  authorId: string;
  content: string;
  upvotes: number;
  depth: number; // nesting level
  createdAt: Date;
}

/**
 * Extract Reddit post ID from URL
 */
export function extractRedditPostId(url: string): string | null {
  try {
    const patterns = [
      /reddit\.com\/r\/\w+\/comments\/([a-z0-9]+)/i,
      /(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/\w+\/comments\/([a-z0-9]+)/i,
      /^([a-z0-9]+)$/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch (error) {
    logger.error('Error extracting Reddit post ID', { url, error });
    return null;
  }
}

/**
 * Initialize Reddit OAuth client using snoowrap
 */
function initializeRedditClient(): Snoowrap {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  const refreshToken = process.env.REDDIT_REFRESH_TOKEN;
  const userAgent = process.env.REDDIT_USER_AGENT;

  if (!clientId || !clientSecret || !refreshToken || !userAgent) {
    throw new Error('Reddit API credentials not configured');
  }

  return new Snoowrap({
    clientId,
    clientSecret,
    refreshToken,
    userAgent,
  });
}

/**
 * Fetch Reddit post metadata
 */
export async function fetchRedditPostMetadata(
  postId: string
): Promise<RedditPostMetadata | null> {
  try {
    const r = initializeRedditClient();
    const submission = await r.getSubmission(postId).fetch();

    return {
      postId,
      title: submission.title,
      url: submission.url,
      upvotes: submission.ups,
      awards: submission.total_awards_received,
      commentCount: submission.num_comments,
      authorName: submission.author?.name || '[deleted]',
      authorId: submission.author?.id || 'unknown',
      subreddit: submission.subreddit_name_prefixed,
    };
  } catch (error) {
    logger.error('Error fetching Reddit post metadata', { postId, error });
    throw error;
  }
}

/**
 * Fetch all comments from a Reddit post (recursive, handles threading)
 */
export async function fetchRedditComments(
  postId: string,
  maxResults: number = 10000
): Promise<RedditComment[]> {
  const comments: RedditComment[] = [];

  async function traverseComments(
    submission: any,
    maxDepth: number = 50
  ): Promise<void> {
    try {
      // Expand all comment threads to maximum depth
      await submission.comments.expandAll({ limit: maxDepth });

      const flattenedComments = submission.comments.map((comment: any) => {
        if (comment instanceof Snoowrap.Comment) {
          return parseRedditComment(comment);
        }
        return null;
      });

      comments.push(...flattenedComments.filter((c: any) => c !== null));
    } catch (error) {
      logger.error('Error traversing Reddit comments', { postId, error });
    }
  }

  try {
    const r = initializeRedditClient();
    const submission = await r.getSubmission(postId).fetch();

    await traverseComments(submission);

    logger.info('Fetched Reddit comments', {
      postId,
      count: comments.length.slice(0, maxResults),
    });

    return comments.slice(0, maxResults);
  } catch (error) {
    logger.error('Error fetching Reddit comments', { postId, error });
    throw error;
  }
}

/**
 * Parse a Reddit comment from Snoowrap Comment object
 */
function parseRedditComment(comment: any): RedditComment {
  return {
    commentId: comment.id,
    authorName: comment.author?.name || '[deleted]',
    authorId: comment.author?.id || 'unknown',
    content: comment.body,
    upvotes: comment.ups,
    depth: comment.depth,
    createdAt: new Date(comment.created_utc * 1000),
  };
}
