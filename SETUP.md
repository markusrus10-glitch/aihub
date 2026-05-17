# AI Hub — Setup Guide

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```
Fill in `.env.local` with your real values (see below).

### 3. Set up the database
```bash
# Start PostgreSQL (via Docker or local)
docker compose up postgres redis -d

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data (plans, system prompts, model configs)
npx prisma db seed
```

### 4. Run the development server
```bash
npm run dev
```
Open http://localhost:3001

---

## Required Environment Variables

### Database
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/aihub
```

### Auth (NextAuth)
```
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
```

**Google OAuth** (https://console.cloud.google.com/apis/credentials):
- Create OAuth 2.0 Client ID
- Add `http://localhost:3001/api/auth/callback/google` as authorized redirect URI
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**GitHub OAuth** (https://github.com/settings/developers):
- New OAuth App, callback: `http://localhost:3001/api/auth/callback/github`
```
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### AI Providers (add only the ones you want)
```
OPENAI_API_KEY=sk-...           # https://platform.openai.com
ANTHROPIC_API_KEY=sk-ant-...   # https://console.anthropic.com
GOOGLE_AI_API_KEY=AIza...      # https://aistudio.google.com
DEEPSEEK_API_KEY=sk-...        # https://platform.deepseek.com
GROK_API_KEY=xai-...           # https://console.x.ai
OPENROUTER_API_KEY=sk-or-...   # https://openrouter.ai
```

### Stripe (https://dashboard.stripe.com)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Create products in Stripe dashboard, then paste price IDs:
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_UNLIMITED_MONTHLY=price_...

# Public keys for frontend:
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_...
NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED_MONTHLY=price_...
```

**Stripe webhook setup:**
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3001/api/billing/webhook
```

### UploadThing (https://uploadthing.com) — for file uploads
```
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...
NEXT_PUBLIC_UPLOADTHING_APP_ID=...
```

### Email (https://resend.com) — for password reset
```
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

### Security
```
ENCRYPTION_KEY=<32-char random string>   # for encrypting stored API keys
```

---

## Production Deployment

### Option A: Docker
```bash
# Copy and fill production env
cp .env.example .env.production

# Build and start everything
docker compose -f docker-compose.yml up -d

# Run migrations
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

### Option B: Vercel
1. Push to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Set up a PostgreSQL database (Neon, Supabase, Railway, etc.)
5. Deploy

### Option C: Railway / Render / Fly.io
These platforms support Dockerfile deployments. Use the included `Dockerfile` with your platform's Docker build feature.

---

## Admin Access

To make a user admin, run in the database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```
Then visit `/admin`.

---

## Available Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Password reset |
| `/chat` | Chat home |
| `/chat/[id]` | Chat conversation |
| `/image-generation` | DALL-E 3 image gen |
| `/code` | AI coding assistant |
| `/files` | Uploaded files |
| `/prompts` | Prompt library |
| `/settings/profile` | Profile settings |
| `/settings/billing` | Subscription management |
| `/settings/preferences` | App preferences |
| `/shared/[token]` | Public shared chat |
| `/admin` | Admin dashboard |
| `/api/health` | Health check |

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Prisma 6
- **Auth**: NextAuth v5
- **AI**: OpenAI, Anthropic, Google, DeepSeek, xAI/Grok, OpenRouter
- **Payments**: Stripe
- **Uploads**: UploadThing
- **Email**: Resend
- **UI**: TailwindCSS v4 + shadcn/ui + Framer Motion
