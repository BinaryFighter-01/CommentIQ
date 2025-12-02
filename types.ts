
export interface Comment {
  id: string;
  author: string;
  text: string;
  likes: number;
  publishedAt: string;
  replyCount?: number;
  platform: 'youtube';
  // Enriched fields
  sentimentScore?: number; // -1 (neg) to 1 (pos)
  isToxic?: boolean;
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

export interface Topic {
  name: string;
  count: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Question {
  text: string;
  frequency: number;
  context: string;
}

export interface ContentIdea {
  title: string;
  reasoning: string;
  score: number; // 1-10 viral potential
  thumbnailSuggestion: string;
}

export interface BrandHealth {
  trust: number;
  excitement: number;
  innovation: number;
  value: number;
  community: number;
}

export interface GeoDemographic {
  region: string; // Inferred from language/time
  count: number;
  likelyTimezone: string;
}

export interface AnalysisResult {
  sentiment: SentimentData;
  topics: Topic[];
  topQuestions: Question[];
  summary: string; // High level executive summary
  audiencePersona: string; // "Tech-savvy millennials..."
  marketingAdvice: string; // "Focus on X feature..."
  contentIdeas: ContentIdea[];
  painPoints: string[];
  toxicCount: number;
  sarcasmCount: number; // Estimated
  languages: { language: string; count: number }[];
  emergingTrends: string[];
  brandHealth: BrandHealth;
  commercialIntent: 'High' | 'Medium' | 'Low';
  competitors: string[];
}

export interface AppState {
  isLoading: boolean;
  progress: {
    stage: string;
    current: number;
    total?: number;
  };
  error: string | null;
  comments: Comment[];
  analysis: AnalysisResult | null;
  url: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface HistoryItem {
  id: string;
  userId: string;
  url: string;
  timestamp: { seconds: number; nanoseconds: number };
  title: string;
  summary: string;
  sentiment: SentimentData;
}
