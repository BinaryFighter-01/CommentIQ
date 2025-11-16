// src/lib/scrapers/youtube.ts
import axios from 'axios';
import { logger } from '../logging';

interface YouTubeVideoMetadata {
  videoId: string;
  title: string;
  url: string;
  views: number;
  likes: number;
  commentCount: number;
  authorName: string;
  authorId: string;
}

interface YouTubeComment {
  commentId: string;
  authorName: string;
  authorId: string;
  content: string;
  likes: number;
  replies: number;
  createdAt: Date;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const patterns = [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  } catch (error) {
    logger.error('Error extracting YouTube video ID', { url, error });
    return null;
  }
}

/**
 * Fetch YouTube video metadata using YouTube Data API v3
 * @param videoId - YouTube video ID
 * @returns Video metadata or null if not found
 */
export async function fetchYouTubeVideoMetadata(
  videoId: string
): Promise<YouTubeVideoMetadata | null> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY not configured');
    }

    const response = await axios.get(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        params: {
          part: 'snippet,statistics',
          id: videoId,
          key: apiKey,
        },
        timeout: 10000,
      }
    );

    if (!response.data.items || response.data.items.length === 0) {
      logger.warn('YouTube video not found', { videoId });
      return null;
    }

    const item = response.data.items[0];
    const snippet = item.snippet;
    const statistics = item.statistics;

    return {
      videoId,
      title: snippet.title,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      views: parseInt(statistics.viewCount || '0', 10),
      likes: parseInt(statistics.likeCount || '0', 10),
      commentCount: parseInt(statistics.commentCount || '0', 10),
      authorName: snippet.channelTitle,
      authorId: snippet.channelId,
    };
  } catch (error) {
    logger.error('Error fetching YouTube video metadata', { videoId, error });
    throw error;
  }
}

/**
 * Fetch all comments from a YouTube video (with pagination)
 * Handles both top-level comments and replies
 */
export async function fetchYouTubeComments(
  videoId: string,
  maxResults: number = 10000
): Promise<YouTubeComment[]> {
  const comments: YouTubeComment[] = [];
  let pageToken: string | undefined;
  let totalFetched = 0;

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY not configured');
    }

    // Fetch top-level comments with pagination
    while (totalFetched < maxResults) {
      const response = await axios.get(
        'https://www.googleapis.com/youtube/v3/commentThreads',
        {
          params: {
            part: 'snippet,replies',
            videoId,
            textFormat: 'plainText',
            maxResults: Math.min(100, maxResults - totalFetched),
            pageToken,
            key: apiKey,
          },
          timeout: 10000,
        }
      );

      if (!response.data.items) break;

      for (const item of response.data.items) {
        // Top-level comment
        const topComment = item.snippet.topLevelComment;
        comments.push(parseYouTubeComment(topComment));
        totalFetched++;

        // Replies
        if (item.replies && item.snippet.canReply && item.snippet.totalReplyCount > 0) {
          for (const reply of item.replies.comments || []) {
            if (totalFetched < maxResults) {
              comments.push(parseYouTubeComment(reply));
              totalFetched++;
            }
          }
        }
      }

      pageToken = response.data.nextPageToken;
      if (!pageToken) break;
    }

    logger.info('Fetched YouTube comments', { videoId, count: comments.length });
    return comments;
  } catch (error) {
    logger.error('Error fetching YouTube comments', { videoId, error });
    throw error;
  }
}

/**
 * Parse a YouTube comment from API response
 */
function parseYouTubeComment(commentItem: any): YouTubeComment {
  const snippet = commentItem.snippet;
  return {
    commentId: commentItem.id,
    authorName: snippet.authorDisplayName,
    authorId: snippet.authorChannelId?.value || 'unknown',
    content: snippet.textDisplay,
    likes: snippet.likeCount,
    replies: snippet.replyCount || 0,
    createdAt: new Date(snippet.publishedAt),
  };
}
