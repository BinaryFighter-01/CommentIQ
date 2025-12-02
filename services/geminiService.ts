import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Comment, AnalysisResult } from "../types";

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

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.OBJECT,
      properties: {
        positive: { type: Type.NUMBER },
        neutral: { type: Type.NUMBER },
        negative: { type: Type.NUMBER }
      },
      required: ["positive", "neutral", "negative"]
    },
    topics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          count: { type: Type.NUMBER },
          sentiment: { type: Type.STRING }
        }
      }
    },
    brandHealth: {
      type: Type.OBJECT,
      properties: {
        trust: { type: Type.NUMBER, description: "Score 0-100" },
        excitement: { type: Type.NUMBER, description: "Score 0-100" },
        innovation: { type: Type.NUMBER, description: "Score 0-100" },
        value: { type: Type.NUMBER, description: "Score 0-100" },
        community: { type: Type.NUMBER, description: "Score 0-100" }
      },
      required: ["trust", "excitement", "innovation", "value", "community"]
    },
    commercialIntent: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
    competitors: { type: Type.ARRAY, items: { type: Type.STRING } },
    topQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          frequency: { type: Type.NUMBER },
          context: { type: Type.STRING }
        }
      }
    },
    contentIdeas: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          score: { type: Type.NUMBER },
          thumbnailSuggestion: { type: Type.STRING }
        }
      }
    },
    painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    emergingTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
    languages: {
      type: Type.ARRAY,
      items: { 
          type: Type.OBJECT,
          properties: {
              language: { type: Type.STRING },
              count: { type: Type.NUMBER }
          }
      }
    },
    toxicCount: { type: Type.NUMBER },
    sarcasmCount: { type: Type.NUMBER },
    summary: { type: Type.STRING },
    audiencePersona: { type: Type.STRING },
    marketingAdvice: { type: Type.STRING }
  },
  required: ["sentiment", "topics", "brandHealth", "commercialIntent", "competitors", "topQuestions", "contentIdeas", "painPoints", "summary", "audiencePersona", "marketingAdvice", "toxicCount", "sarcasmCount", "emergingTrends", "languages"]
};

export const analyzeComments = async (comments: Comment[]): Promise<AnalysisResult> => {
  const apiKey = getEnvVar('API_KEY');
  if (!apiKey) throw new Error("API Key missing. System access denied.");
  
  const ai = new GoogleGenAI({ apiKey });

  // Intelligent Sampling for Token Window Optimization
  // We prioritize high engagement (likes) + some random for breadth.
  const sortedByLikes = [...comments].sort((a, b) => b.likes - a.likes);
  const topSlice = sortedByLikes.slice(0, 400); 
  const randomSlice = sortedByLikes.slice(400).sort(() => 0.5 - Math.random()).slice(0, 100);
  
  const sampleText = [...topSlice, ...randomSlice]
    .map(c => `[${c.likes} likes] (${c.publishedAt}) ${c.author}: ${c.text}`)
    .join("\n");

  const prompt = `
    Analyze these ${comments.length} comments from a social media community.
    You are a Strategic Growth Consultant for Tesla/Google.
    
    1. **Sentiment**: Overall positive/neutral/negative %.
    2. **Topics**: Group clusters of discussion.
    3. **Brand Resonance**: Rate the brand on 5 axes (Trust, Excitement, Innovation, Value, Community) 0-100.
    4. **Commercial Intent**: Is the audience looking to buy? (High/Medium/Low).
    5. **Competitors**: List rival brands mentioned.
    6. **Questions**: What are users asking?
    7. **Content Strategy**: Suggest 3 future videos/posts with viral potential titles and visual thumbnail descriptions.
    8. **Psychology**: Identify pain points, sarcasm usage, and build a "Buyer Persona".
    9. **Trends**: What topics are emerging vs old?
    10. **Safety**: Count toxic/spam comments.
    
    Input Data:
    ${sampleText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "You are an expert social media data scientist. Be precise, critical, and data-driven.",
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Analysis engine failed.");
    
    return JSON.parse(resultText) as AnalysisResult;
  } catch (error) {
    console.error("AI Error:", error);
    throw new Error("Analysis failed. Please try again.");
  }
};