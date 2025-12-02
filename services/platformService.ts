import { Comment } from "../types";

const getEnvVar = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`];
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[`REACT_APP_${key}`]) return process.env[`REACT_APP_${key}`];
    if (process.env[key]) return process.env[key];
  }
  return '';
};

const getYouTubeID = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Main Fetcher
export const fetchComments = async (url: string, onProgress: (count: number, stage: string) => void): Promise<Comment[]> => {
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  if (isYouTube) return fetchYouTubeComments(url, onProgress);
  throw new Error("Unsupported platform. Please enter a valid YouTube URL.");
};

// YouTube Fetcher with Pagination Loop
const fetchYouTubeComments = async (url: string, onProgress: (count: number, stage: string) => void): Promise<Comment[]> => {
  const apiKey = getEnvVar('YOUTUBE_API_KEY');
  if (!apiKey) throw new Error("YouTube API Key missing. Set VITE_YOUTUBE_API_KEY.");
  
  const videoId = getYouTubeID(url);
  if (!videoId) throw new Error("Could not extract Video ID.");

  let allComments: Comment[] = [];
  let nextPageToken = '';
  // Optimized for speed/relevance. We grab top 600 comments which is usually enough for statistical significance.
  const SAFETY_CAP = 600; 

  onProgress(0, 'Initializing YouTube Connection...');

  do {
    const apiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${apiKey}&pageToken=${nextPageToken}`;
    
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
         const err = await response.json();
         if (err.error?.errors?.[0]?.reason === 'commentsDisabled') throw new Error("Comments are disabled.");
         console.warn("API Limit or Error:", err);
         break; // Graceful degradation
      }
      
      const data = await response.json();
      if (!data.items) break;

      const newComments = data.items.map((item: any) => ({
        id: item.id,
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        likes: item.snippet.topLevelComment.snippet.likeCount,
        replyCount: item.snippet.totalReplyCount,
        publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
        platform: 'youtube'
      }));

      allComments = [...allComments, ...newComments];
      nextPageToken = data.nextPageToken;
      
      onProgress(allComments.length, `Fetching comments... (${allComments.length} loaded)`);

    } catch (e) {
      console.error(e);
      break;
    }

  } while (nextPageToken && allComments.length < SAFETY_CAP);

  return allComments;
};