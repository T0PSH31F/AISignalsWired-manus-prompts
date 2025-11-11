# AI Signals Wired - Repository Structure
## Optimized for Cloudflare Workers + Supabase (Zero Infrastructure Cost)

---

## Repository Architecture: Monorepo

**Single Repository**: `AISignalsWired`

```
AISignalsWired/
├── apps/
│   ├── frontend/              # React app (Cloudflare Pages)
│   ├── api/                   # Cloudflare Workers (Edge API)
│   └── signal-engine/         # Cloudflare Workers (Cron)
├── packages/
│   ├── shared/                # Shared TypeScript types & utilities
│   ├── database/              # Supabase schemas & migrations
│   └── strategies/            # Trading strategy logic
├── docs/                      # Documentation
├── scripts/                   # Deployment & setup scripts
├── .github/                   # CI/CD workflows
└── config files               # Root config (prettier, eslint, etc.)
```

---

## Complete Directory Structure

```
AISignalsWired/
│
├── apps/
│   │
│   ├── frontend/                          # React 18 + Vite + TailwindCSS
│   │   ├── public/
│   │   │   ├── favicon.ico
│   │   │   └── images/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/                    # shadcn/ui components
│   │   │   │   ├── SignalCard.tsx
│   │   │   │   ├── PricingTable.tsx
│   │   │   │   ├── PerformanceChart.tsx
│   │   │   │   └── Header.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Landing.tsx
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Signals.tsx
│   │   │   │   ├── Performance.tsx
│   │   │   │   ├── Pricing.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Admin.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useSignals.ts
│   │   │   │   └── useWebSocket.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts                 # API client
│   │   │   │   ├── supabase.ts            # Supabase client
│   │   │   │   └── utils.ts
│   │   │   ├── styles/
│   │   │   │   ├── globals.css
│   │   │   │   └── neon-effects.css       # Custom neon glow CSS
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── router.tsx
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── api/                               # Cloudflare Workers (Edge API)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts                # POST /auth/register, /login
│   │   │   │   ├── signals.ts             # GET /signals/latest, /:id
│   │   │   │   ├── users.ts               # GET /users/me, PUT /users/me
│   │   │   │   ├── subscriptions.ts       # POST /checkout, /webhook
│   │   │   │   └── admin.ts               # Admin endpoints
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts                # JWT validation
│   │   │   │   ├── rateLimit.ts           # Rate limiting with KV
│   │   │   │   └── cors.ts                # CORS headers
│   │   │   ├── services/
│   │   │   │   ├── supabase.ts            # Database queries
│   │   │   │   ├── stripe.ts              # Payment processing
│   │   │   │   └── notifications.ts       # Discord/Email
│   │   │   ├── utils/
│   │   │   │   ├── jwt.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── errors.ts
│   │   │   └── index.ts                   # Main Worker entry
│   │   ├── wrangler.toml                  # Cloudflare config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── signal-engine/                     # Cloudflare Workers (Cron Triggers)
│       ├── src/
│       │   ├── index.ts                   # Cron handler (every 15 min)
│       │   ├── marketData.ts              # Fetch prices from APIs
│       │   ├── indicators.ts              # RSI, MACD, TEMA, ATR calculations
│       │   ├── signalGenerator.ts         # Main orchestrator
│       │   ├── riskManager.ts             # Risk management rules
│       │   ├── notifier.ts                # Send Discord/Email alerts
│       │   └── performance.ts             # Update strategy stats
│       ├── wrangler.toml
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   │
│   ├── shared/                            # Shared code across apps
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── signal.ts              # Signal interface
│   │   │   │   ├── user.ts                # User interface
│   │   │   │   ├── strategy.ts            # Strategy types
│   │   │   │   └── api.ts                 # API request/response types
│   │   │   ├── constants/
│   │   │   │   ├── tiers.ts               # Subscription tier config
│   │   │   │   ├── strategies.ts          # Strategy names & settings
│   │   │   │   └── assets.ts              # Supported assets list
│   │   │   ├── utils/
│   │   │   │   ├── formatting.ts          # Price formatting, etc.
│   │   │   │   ├── validation.ts          # Input validators
│   │   │   │   └── date.ts                # Date utilities
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── database/                          # Supabase schemas & migrations
│   │   ├── migrations/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_indexes.sql
│   │   │   └── 003_add_subscriptions.sql
│   │   ├── seed/
│   │   │   └── dev_data.sql               # Test data for development
│   │   ├── types/
│   │   │   └── supabase.ts                # Generated types (supabase gen types)
│   │   └── README.md
│   │
│   └── strategies/                        # Trading strategy implementations
│       ├── src/
│       │   ├── rsiBET.ts                  # Strategy 1
│       │   ├── macdCrossover.ts           # Strategy 2
│       │   ├── tema.ts                    # Strategy 3
│       │   ├── halvingCycle.ts            # Strategy 4
│       │   ├── atrBreakout.ts             # Strategy 5
│       │   ├── types.ts                   # Strategy interfaces
│       │   └── index.ts
│       ├── __tests__/                     # Unit tests for strategies
│       │   ├── rsiBET.test.ts
│       │   └── macdCrossover.test.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docs/
│   ├── README.md                          # Main documentation
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── MANUS_PROMPT.md
│   ├── STRATEGY_DOCS.md
│   ├── API_DOCS.md
│   ├── BUSINESS_PLAN.md
│   ├── ARCHITECTURE.md                    # System architecture diagram
│   └── CLOUDFLARE_SETUP.md                # Cloudflare-specific setup
│
├── scripts/
│   ├── setup.sh                           # Initial setup script
│   ├── deploy-frontend.sh                 # Deploy to Cloudflare Pages
│   ├── deploy-api.sh                      # Deploy API Worker
│   ├── deploy-engine.sh                   # Deploy signal engine
│   ├── db-migrate.sh                      # Run Supabase migrations
│   └── generate-types.sh                  # Generate TypeScript types from DB
│
├── .github/
│   └── workflows/
│       ├── deploy-frontend.yml            # Auto-deploy frontend on push
│       ├── deploy-api.yml                 # Auto-deploy API on push
│       ├── deploy-engine.yml              # Auto-deploy engine on push
│       └── test.yml                       # Run tests on PR
│
├── .gitignore
├── .prettierrc
├── .eslintrc.js
├── package.json                           # Root package.json (workspace)
├── pnpm-workspace.yaml                    # pnpm workspace config (or use npm/yarn)
├── turbo.json                             # Turborepo config (optional, for faster builds)
├── README.md
└── LICENSE

```

---

## Key Configuration Files

### Root `package.json` (Workspace Manager)
```json
{
  "name": "aisignalswired",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "deploy:frontend": "cd apps/frontend && pnpm run deploy",
    "deploy:api": "cd apps/api && wrangler publish",
    "deploy:engine": "cd apps/signal-engine && wrangler publish",
    "deploy:all": "pnpm run deploy:frontend && pnpm run deploy:api && pnpm run deploy:engine",
    "db:migrate": "cd packages/database && supabase db push",
    "db:types": "cd packages/database && supabase gen types typescript --local > types/supabase.ts"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "turbo": "^1.11.0",
    "typescript": "^5.3.0"
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### `turbo.json` (Build Optimization)
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

---

## App-Specific Configurations

### `apps/frontend/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

### `apps/api/wrangler.toml`
```toml
name = "aisignals-api"
main = "src/index.ts"
compatibility_date = "2024-11-01"

# Cloudflare Workers KV (for rate limiting)
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your_kv_namespace_id"

# Environment variables (secrets set via: wrangler secret put)
[vars]
ENVIRONMENT = "production"
API_VERSION = "v1"

# R2 bucket for storing charts/images (optional)
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "aisignals-assets"

# Routes
routes = [
  { pattern = "api.aisignalswired.com/*", zone_name = "aisignalswired.com" }
]
```

### `apps/signal-engine/wrangler.toml`
```toml
name = "aisignals-engine"
main = "src/index.ts"
compatibility_date = "2024-11-01"

# Cron Triggers (every 15 minutes)
[triggers]
crons = ["*/15 * * * *"]

# Durable Objects (for state management, if needed)
[[durable_objects.bindings]]
name = "SIGNAL_STATE"
class_name = "SignalState"
script_name = "aisignals-engine"

# Environment variables
[vars]
ENVIRONMENT = "production"
```

---

## Deployment Architecture

### Cloudflare Services Used (All Free Tier)

| Service | Purpose | Free Tier Limit | Cost if Exceeded |
|---------|---------|-----------------|------------------|
| **Cloudflare Pages** | Frontend hosting | Unlimited bandwidth | Always free |
| **Cloudflare Workers** | API + Signal Engine | 100K requests/day | $5/mo for 10M requests |
| **Cloudflare KV** | Rate limiting cache | 100K reads/day | $0.50 per million |
| **Cloudflare R2** | Asset storage | 10GB storage | $0.015/GB/month |
| **Cloudflare Cron Triggers** | Scheduled jobs | Unlimited | Free |

### Supabase Services (Free Tier)

| Service | Purpose | Free Tier Limit |
|---------|---------|-----------------|
| **PostgreSQL** | Database | 500MB, 2GB bandwidth |
| **Auth** | User authentication | Unlimited users |
| **Realtime** | WebSocket subscriptions | 2 concurrent |
| **Storage** | File uploads | 1GB |

### External APIs (Free Tier)

| Service | Purpose | Free Tier Limit |
|---------|---------|-----------------|
| **CoinGecko** | Crypto prices | 10-50 calls/min |
| **Alpha Vantage** | Stock prices | 25 calls/day |
| **SendGrid** | Email | 100 emails/day |
| **Stripe** | Payments | Free (2.9% + 30¢ per transaction) |

---

## Development Workflow

### Local Development
```bash
# 1. Clone repo
git clone https://github.com/T0PSH31F/AISignalsWired.git
cd AISignalsWired

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp apps/frontend/.env.example apps/frontend/.env
cp apps/api/.env.example apps/api/.env
cp apps/signal-engine/.env.example apps/signal-engine/.env

# 4. Run Supabase locally
supabase start

# 5. Run all apps in dev mode
pnpm run dev

# Apps now running:
# - Frontend: http://localhost:5173
# - API: http://localhost:8787
# - Supabase Studio: http://localhost:54323
```

### Deploying to Production
```bash
# Deploy everything at once
pnpm run deploy:all

# Or deploy individually:
pnpm run deploy:frontend  # Cloudflare Pages
pnpm run deploy:api       # API Worker
pnpm run deploy:engine    # Signal Engine Worker
```

---

## CI/CD Pipeline (GitHub Actions)

### `.github/workflows/deploy-api.yml`
```yaml
name: Deploy API to Cloudflare Workers

on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'
      - 'packages/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm run build

      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          workingDirectory: apps/api
          command: publish
```

---

## Environment Variables Structure

### `apps/frontend/.env`
```bash
VITE_API_URL=https://api.aisignalswired.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_ENVIRONMENT=production
```

### `apps/api/.env` (Cloudflare Secrets)
```bash
# Set via: wrangler secret put SUPABASE_SERVICE_KEY
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
JWT_SECRET=your-256-bit-secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
SENDGRID_API_KEY=SG.xxx
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### `apps/signal-engine/.env`
```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
COINGECKO_API_KEY=CG-xxx
ALPHAVANTAGE_API_KEY=XXX
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
SENDGRID_API_KEY=SG.xxx
```

---

## Cost Breakdown (Monthly)

### Zero-Cost Deployment (Free Tier)
```
Cloudflare Pages:     $0 (unlimited)
Cloudflare Workers:   $0 (up to 100K requests/day)
Cloudflare KV:        $0 (up to 100K reads/day)
Supabase Database:    $0 (up to 500MB)
SendGrid:             $0 (up to 100 emails/day)
Stripe:               $0 (pay per transaction only)
Domain:               $10/year
─────────────────────────────
TOTAL:                $0.83/month (domain only)
```

### At Scale (1,000 paid users)
```
Cloudflare Workers:   $5/mo (10M requests)
Supabase Pro:         $25/mo (8GB database, more bandwidth)
SendGrid Essentials:  $20/mo (50K emails/month)
Domain + SSL:         $10/year
─────────────────────────────
TOTAL:                ~$51/month
Revenue at 1K users:  $108K/month
Infrastructure cost:  0.05% of revenue
```

---

## Advantages of This Architecture

### ✅ Cost Efficiency
- **Free tier covers first 100+ users** (no infrastructure costs)
- **Cloudflare Workers = $0** for up to 100K requests/day
- **Supabase free tier** sufficient for MVP testing

### ✅ Performance
- **Edge compute** = sub-50ms API responses globally
- **Cloudflare CDN** = instant frontend loads
- **Cron triggers** = reliable 15-minute signal generation

### ✅ Scalability
- **Auto-scales** to millions of requests
- **No server management** required
- **Global distribution** out of the box

### ✅ Developer Experience
- **TypeScript end-to-end** (type safety across stack)
- **Shared code** between frontend/backend
- **Fast builds** with Turbo
- **One-command deployment**

---

## Migration from Docker

If you already have Docker setup, here's how to migrate:

### What Changes:
1. **Docker Compose** → Cloudflare Workers (no containers needed)
2. **Node.js Express** → Cloudflare Workers (serverless functions)
3. **Nginx** → Cloudflare Pages (built-in CDN)
4. **Redis** → Cloudflare KV (key-value store)
5. **Cron jobs** → Cloudflare Cron Triggers

### What Stays the Same:
1. **Supabase PostgreSQL** (still your database)
2. **React frontend** (same code, different hosting)
3. **Trading strategies** (exact same logic)
4. **Stripe integration** (no changes)
5. **Discord/Email** (same notification system)

---

## Next Steps

1. **Create the monorepo structure** above
2. **Update MANUS_PROMPT.md** to target Cloudflare Workers instead of Docker
3. **Set up Cloudflare account** (free tier)
4. **Deploy to production** with zero infrastructure cost

Would you like me to:
1. Generate the updated MANUS_PROMPT.md for Cloudflare Workers?
2. Create starter files for each app (wrangler.toml, etc.)?
3. Write the Cloudflare-specific deployment scripts?

Let me know and I'll create those files for you!
