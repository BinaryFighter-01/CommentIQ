# CommentIQ Setup Guide

## Prerequisites
- Node.js 18.17+ and npm 9+
- Supabase account (free tier)
- YouTube Data API key
- Reddit OAuth credentials
- OpenAI API key (ChatGPT Go subscription)

## Step 1: Get YouTube Data API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials (API Key)
5. Copy the key

## Step 2: Get OpenAI API Key

1. Sign up for [ChatGPT Go](https://chatgpt.com) in India (FREE for 12 months)
2. Go to [OpenAI API Keys](https://platform.openai.com/account/api-keys)
3. Create new API key
4. Copy and save securely

## Step 3: Setup Reddit OAuth

1. Go to [Reddit App Preferences](https://reddit.com/prefs/apps)
2. Click "Create an app"
3. Name: CommentIQ, Type: "script"
4. Set redirect URI to: `http://localhost:3000/api/reddit/callback`
5. Copy: Client ID, Client Secret
6. Use [this tool](https://github.com/not-an-aardvark/reddit-oauth-helper) to get refresh token

## Step 4: Setup Supabase PostgreSQL

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Copy PostgreSQL connection string
4. Format: `postgresql://user:password@host:5432/postgres?schema=public`

## Step 5: Setup Project
Clone and install
git clone https://github.com/yourusername/comment-iq
cd comment-iq
npm install

Setup environment
cp .env.example .env.local

Fill in .env.local with your keys
Setup database
npx prisma db push
npx prisma generate

Start development
npm run dev

text

## Step 6: Testing

Visit http://localhost:3000 and:
1. Register an account
2. Paste a YouTube or Reddit URL
3. View analytics dashboard

## Deployment (Vercel)

Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

On Vercel:
Connect GitHub repo

Add environment variables

Deploy

text

## Cost Estimation (Year 1 - India)

- ChatGPT Go: ₹0 (free for 12 months)
- Supabase: ₹0 (free tier)
- YouTube API: ₹0 (free, 10,000 quota/day)
- Reddit API: ₹0 (free)
- Vercel: ₹0-₹300 (free tier sufficient)
- **Total Year 1: ₹0 with ChatGPT Go subscription**

## Troubleshooting

### "YOUTUBE_API_KEY not configured"
- Check .env.local has YOUTUBE_API_KEY
- Restart dev server after env changes

### Prisma database errors
npx prisma db push --force-reset
npx prisma migrate dev --name init

text

### JWT token errors
- Ensure JWT_SECRET is at least 32 characters
- Check token expiry with `echo $JWT_EXPIRES_IN`

### Reddit API 401 errors
- Verify REDDIT_REFRESH_TOKEN is valid
- Get new token using the helper tool

## Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Enable rate limiting
- [ ] Configure CORS
- [ ] Setup error logging (Sentry)
- [ ] Monitor API quotas
- [ ] Backup database regularly
- [ ] Setup uptime monitoring

