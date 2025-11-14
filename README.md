#  CommentIQ

**AI-Powered Social Media Analytics Platform**

Analyze YouTube and Reddit comments using OpenAI GPT-5 to gain deep insights into your audience sentiment, engagement patterns, and content performance.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

---

##  Features

- **🎥 YouTube Integration** - Fetch and analyze video comments with full pagination support
- **🤖 Reddit Integration** - Analyze post comments with nested thread support
- **🧠 AI-Powered Analysis** - GPT-5 sentiment, toxicity, topics, and engagement scoring
- **📊 Rich Analytics Dashboard** - Interactive charts and visualizations
- **⚡ Smart Caching** - 24-hour SHA256-based cache to reduce API costs
- **🔒 Secure Authentication** - JWT-based user authentication with bcrypt
- **📈 Real-Time Insights** - Sentiment timelines, top topics, and audience psychology
- **💰 Cost-Effective** - Zero cost for first year with ChatGPT Go subscription (India)
- **🔄 Background Processing** - Database-backed job queue with GitHub Actions
- **🎯 Rate Limiting** - Per-user and system-wide quotas

---

##  Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Chart.js with React wrapper
- **State Management:** React Hooks

### Backend
- **Runtime:** Node.js 18+
- **API:** Next.js API Routes (Serverless)
- **Database:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Authentication:** JWT + bcryptjs
- **Logging:** Winston

### AI & External APIs
- **AI Model:** OpenAI GPT-5
- **Social Media:** YouTube Data API v3, Reddit API (snoowrap)

### DevOps
- **Hosting:** Vercel
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics

---

##  Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.17.0 or higher
- **npm** 9.0.0 or higher
- **Git** installed
- **Accounts:**
  - [Supabase](https://supabase.com) (free tier)
  - [OpenAI Platform](https://platform.openai.com) (ChatGPT Go subscription)
  - [Google Cloud Console](https://console.cloud.google.com) (YouTube API)
  - [Reddit](https://reddit.com/prefs/apps) (App credentials)

---


