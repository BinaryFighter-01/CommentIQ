// src/lib/utils/validation.ts
import { z } from 'zod';

/**
 * User registration validation schema
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
});

/**
 * User login validation schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * URL validation schemas
 */
export const youtubeUrlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => {
      return (
        url.includes('youtube.com/watch?v=') ||
        url.includes('youtu.be/') ||
        /^[a-zA-Z0-9_-]{11}$/.test(url)
      );
    },
    { message: 'Invalid YouTube URL or video ID' }
  );

export const redditUrlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => {
      return url.includes('reddit.com/r/') && url.includes('/comments/');
    },
    { message: 'Invalid Reddit post URL' }
  );

/**
 * Generic URL schema (accepts both YouTube and Reddit)
 */
export const socialMediaUrlSchema = z
  .string()
  .url('Invalid URL')
  .refine(
    (url) => {
      const isYoutube =
        url.includes('youtube.com') || url.includes('youtu.be');
      const isReddit = url.includes('reddit.com/r/');
      return isYoutube || isReddit;
    },
    { message: 'URL must be from YouTube or Reddit' }
  );

/**
 * Environment variables validation schema
 */
export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key required'),
  YOUTUBE_API_KEY: z.string().min(1, 'YouTube API key required'),
  REDDIT_CLIENT_ID: z.string().min(1, 'Reddit client ID required'),
  REDDIT_CLIENT_SECRET: z.string().min(1, 'Reddit client secret required'),
  REDDIT_REFRESH_TOKEN: z.string().min(1, 'Reddit refresh token required'),
  REDDIT_USER_AGENT: z.string().min(1, 'Reddit user agent required'),
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ANALYSIS_MAX_PER_HOUR: z.string().transform(Number).default('1000'),
  ANALYSIS_MAX_PER_USER_PER_DAY: z.string().transform(Number).default('100'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validate environment variables at startup
 */
export function validateEnv() {
  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err, idx) => {
        console.error(`  ${idx + 1}) ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Validate pagination parameters
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Validate analysis request
 */
export const analyzeRequestSchema = z.object({
  url: socialMediaUrlSchema,
  maxComments: z.number().int().positive().max(10000).optional().default(1000),
  skipCache: z.boolean().optional().default(false),
});

/**
 * Type exports
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
