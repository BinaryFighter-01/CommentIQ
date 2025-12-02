# CommentIQ – YouTube Comment Analytics Dashboard

## Overview

CommentIQ is a modern, AI-assisted dashboard that analyzes YouTube video comments and converts them into actionable insights. It helps creators and marketing teams understand audience sentiment, trending topics, common questions, pain points, and engagement patterns through interactive visualizations.

The system fetches thousands of comments from YouTube, processes them through an AI model, and displays insights through advanced charts and tables. Everything runs client-side and requires only two API keys.

## Key Features

### YouTube Comment Fetching
- Fetches up to 10,000 comments using automatic pagination
- Handles rate limits and network failures gracefully
- Extracts author, text, likes, and publishing date

### AI Analysis
- Sentiment breakdown
- Topic clustering
- Trending audience questions
- Pain point identification
- Audience persona
- Competitor mentions
- Sarcasm and toxicity detection
- Commercial intent estimation
- Emerging trends
- Comment impact scoring

### Visual Dashboard
- Sentiment distribution chart
- Topic treemap
- Impact matrix (sentiment vs virality)
- Engagement timeline with zoom and pan
- Emoji/keyword analysis
- Top questions chart
- Brand health radar
- Filterable data explorer table

### Additional Tools
- PDF export for offline reports
- CSV export for raw comments
- Responsive layout for mobile and desktop
- "New Analysis" button to start over

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Recharts
- YouTube Data API v3
- Gemini API

## Project Structure

```
/src
 ├── App.tsx
 ├── types.ts
 ├── services/
 │     ├── platformService.ts
 │     └── geminiService.ts
 ├── components/
 │     └── Dashboard.tsx
 ├── assets/
 └── index.html
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_KEY=your_gemini_api_key
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

In Vercel, add the same variables under **Project Settings → Environment Variables**.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open your browser:
   ```
   http://localhost:5173
   ```

## Deployment

1. Push the project to GitHub
2. Import the repository into Vercel
3. Add the two environment variables
4. Deploy

Vercel automatically optimizes and builds the project.

## Summary

CommentIQ converts large volumes of YouTube comments into clear insights using AI and interactive visualizations. The tool is designed to help creators and analysts quickly understand their audience and make better content decisions.