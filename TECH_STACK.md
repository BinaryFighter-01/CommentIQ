
# CommentIQ 

## Chosen primary stack (recommended for fastest development & maintainability)
- Language: TypeScript (Node.js 18+)
- Web framework: Fastify (lightweight, fast, great TypeScript support)
- ORM: Prisma (Type-safe, DX-friendly)
- Database: PostgreSQL
- Cache / queue: Redis (BullMQ for background jobs)
- ML / NLP: External model API (OpenAI / Anthropic) for MVP; optional Python microservice (FastAPI + spaCy/transformers) for heavier on-prem models
- Testing: Jest + ts-jest
- Linting / formatting: ESLint + Prettier
- Container: Docker + docker-compose for local development (postgres + redis + app)
- CI/CD: GitHub Actions
- Observability: Sentry (errors) + Prometheus or hosted metrics (optional)
- Auth: Clerk/Auth0/NextAuth (if you add a frontend)

## Why this stack
- TypeScript + Fastify gives very fast iteration, strong types, and a large ecosystem.
- Prisma + Postgres provides reliable persistence and easy migrations while keeping type-safety.
- Redis + BullMQ is a lightweight way to offload heavy analysis and retries (comment analysis is often async).
- Using an external ML API is the quickest way to get useful NLP features without ML ops overhead.

## Minimal project layout to adopt
- /src
  - /api - Fastify route handlers
  - /workers - background job processors (BullMQ)
  - /lib - small utility modules (db, logger, metrics)
  - /services - wrappers for ML APIs and business logic
  - index.ts - Fastify app bootstrap
- /prisma - Prisma schema + migrations
- /tests - Jest tests
- Dockerfile
- docker-compose.yml (postgres, redis, app)
- .github/workflows/ci.yml (lint, build, test)

## Quick dev commands (examples to add in package.json)
- dev: tsc -w (or use ts-node-dev / nodemon)
- start: node dist/index.js
- build: tsc -p tsconfig.json
- test: jest --coverage
- migrate: prisma migrate dev
- docker: docker-compose up --build

## Example Prisma schema (very short)
- Comment table: id, user_id, text, status, analysis jsonb, created_at
- User table: id, display_name, email (optional)
- Job table (optional): id, type, payload jsonb, status, attempts, last_error

## Security & infra notes
- Store DB and API keys in environment variables / secrets manager — DO NOT put secrets in this public file.
- Rate-limit comment submission (Fastify plugin + Redis)
- Use content-scan + model-based analysis to reduce false positives
- Ensure uploads or attachments are scanned and sanitized

## Getting started checklist (PR-friendly)
- [ ] Create a branch: setup/stack-doc
- [ ] Add this TECH_STACK.md to the repo root (this file is public)
- [ ] Scaffold project files: package.json, tsconfig.json, src/index.ts
- [ ] Add Dockerfile and docker-compose.yml with Postgres + Redis
- [ ] Add Prisma schema and run initial migration
- [ ] Create a basic Fastify route: POST /comments that enqueues jobs
- [ ] Add a worker that calls the ML API and writes analysis to DB
- [ ] Add Jest tests for analysis logic
- [ ] Add GitHub Actions: lint, build, test

## Short-term roadmap (first 2 weeks)
1. Scaffold repository with packages, TypeScript config, and Fastify bootstrap.
2. Add Prisma schema for comments and run migration locally.
3. Implement POST /comments to insert and enqueue a worker job.
4. Implement a worker using BullMQ that calls a simple model API and stores analysis.
5. Add unit tests for analysis code and integration test for the API.
6. Add GitHub Actions pipeline to run tests on PR.

## Long-term ideas
- Add admin UI to review flagged comments (Next.js / React)
- Add model fine-tuning or on-premise model inference if needed
- Implement multi-tenant support and rate-limiting policies
- Add real-time updates (WebSockets) for moderation dashboard

---

