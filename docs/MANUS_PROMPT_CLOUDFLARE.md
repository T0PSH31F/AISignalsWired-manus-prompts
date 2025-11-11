# AI TRADING SIGNALS PLATFORM - CLOUDFLARE WORKERS DEPLOYMENT
## Project: aisignalswired.com | Serverless Edge Architecture

---

## I. EXECUTIVE BRIEF

**Objective**: Build and deploy a production-ready AI-powered trading signal platform generating 20+ daily signals with 65%+ accuracy using **Cloudflare Workers + Supabase** (zero infrastructure cost).

**Constraints**:
- Budget: $10 (domain only)
- Infrastructure: $0/month (Cloudflare + Supabase free tiers)
- Timeline: Deploy within 48 hours, revenue-ready by Friday
- Market opportunity: $69.95B trading signals sector

**Technology Stack**:
- Frontend: React 18 + Vite + TailwindCSS → **Cloudflare Pages**
- API: TypeScript → **Cloudflare Workers** (edge compute)
- Signal Engine: TypeScript → **Cloudflare Workers** (cron triggers)
- Database: **Supabase PostgreSQL** (free tier: 500MB)
- Auth: **Supabase Auth**
- Cache: **Cloudflare KV** (rate limiting)
- Payments: **Stripe**
- Notifications: **Discord webhooks + SendGrid**

**Success Metrics**:
- System operational 24/7 with 99.9%+ uptime (Cloudflare edge)
- 65%+ win rate across all strategies within 30 days
- 20+ signals generated daily across multiple assets
- API response time < 50ms (edge compute)
- Full subscription payment flow functional
- All 5 trading strategies operational with circuit breakers active

---

## II. REPOSITORY STRUCTURE (MONOREPO)

```
AISignalsWired/
├── apps/
│   ├── frontend/              # React app → Cloudflare Pages
│   ├── api/                   # Edge API → Cloudflare Worker
│   └── signal-engine/         # Cron jobs → Cloudflare Worker
├── packages/
│   ├── shared/                # Shared TypeScript types
│   ├── database/              # Supabase schemas & migrations
│   └── strategies/            # Trading strategy implementations
├── docs/
├── scripts/
└── .github/workflows/         # CI/CD pipelines
```

---

## III. DATABASE SCHEMA (SUPABASE POSTGRESQL)

### Create in Supabase Dashboard → SQL Editor

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'elite')),
  stripe_customer_id TEXT,
  api_key UUID UNIQUE,
  discord_webhook TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);
CREATE INDEX idx_users_api_key ON users(api_key) WHERE api_key IS NOT NULL;

-- Signals table
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('BUY', 'SELL')),
  strategy_type TEXT NOT NULL,
  entry_price DECIMAL(20,8) NOT NULL,
  stop_loss DECIMAL(20,8) NOT NULL,
  take_profit DECIMAL(20,8) NOT NULL,
  position_size_percent DECIMAL(5,2) DEFAULT 2.00,
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  rationale TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  outcome TEXT CHECK (outcome IN ('open', 'win', 'loss', 'neutral')),
  closed_at TIMESTAMPTZ,
  actual_return_percent DECIMAL(10,2),
  timeframe TEXT DEFAULT '1h'
);

CREATE INDEX idx_signals_created ON signals(created_at DESC);
CREATE INDEX idx_signals_asset ON signals(asset);
CREATE INDEX idx_signals_strategy ON signals(strategy_type);
CREATE INDEX idx_signals_outcome ON signals(outcome) WHERE outcome IS NOT NULL;

-- Strategy performance table
CREATE TABLE strategy_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy_name TEXT UNIQUE NOT NULL,
  win_rate_7d DECIMAL(5,2),
  win_rate_30d DECIMAL(5,2),
  total_signals INTEGER DEFAULT 0,
  winning_signals INTEGER DEFAULT 0,
  losing_signals INTEGER DEFAULT 0,
  avg_return_percent DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategy_performance_name ON strategy_performance(strategy_name);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- Insert initial strategy performance records
INSERT INTO strategy_performance (strategy_name, status) VALUES
  ('rsiBET', 'active'),
  ('macdCrossover', 'active'),
  ('tema', 'active'),
  ('halvingCycle', 'active'),
  ('atrBreakout', 'active');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Signals: Public read (for transparency), admin write
CREATE POLICY "Signals are publicly readable" ON signals
  FOR SELECT USING (true);

-- Subscriptions: Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (user_id = auth.uid());
```

---

## IV. CLOUDFLARE WORKERS SETUP

### `apps/api/wrangler.toml`
```toml
name = "aisignals-api"
main = "src/index.ts"
compatibility_date = "2024-11-01"
workers_dev = true

# KV namespace for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your_kv_namespace_id_here"  # Create via: wrangler kv:namespace create RATE_LIMIT

# Environment variables (non-sensitive)
[vars]
ENVIRONMENT = "production"
API_VERSION = "v1"
CORS_ORIGIN = "https://aisignalswired.com"

# Routes (custom domain)
routes = [
  { pattern = "api.aisignalswired.com/*", zone_name = "aisignalswired.com" }
]

# Secrets (set via: wrangler secret put SECRET_NAME)
# Required secrets:
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - JWT_SECRET
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - SENDGRID_API_KEY
# - DISCORD_WEBHOOK_URL
```

### `apps/signal-engine/wrangler.toml`
```toml
name = "aisignals-engine"
main = "src/index.ts"
compatibility_date = "2024-11-01"

# Cron trigger: Every 15 minutes
[triggers]
crons = ["*/15 * * * *"]

# Environment variables
[vars]
ENVIRONMENT = "production"

# Secrets (set via: wrangler secret put)
# - SUPABASE_URL
# - SUPABASE_SERVICE_KEY
# - COINGECKO_API_KEY
# - ALPHAVANTAGE_API_KEY
# - DISCORD_WEBHOOK_URL
# - SENDGRID_API_KEY
```

---

## V. TRADING STRATEGIES (EXACT IMPLEMENTATION)

### Strategy Implementation Structure

Each strategy in `packages/strategies/src/` follows this interface:

```typescript
// packages/strategies/src/types.ts
export interface TechnicalIndicators {
  rsi14: number;
  macd: { line: number; signal: number; histogram: number };
  tema4: number;
  tema9: number;
  tema18: number;
  atr14: number;
  ema20: number;
  ema50: number;
  high20: number;
  avgVolume20: number;
}

export interface Signal {
  asset: string;
  action: 'BUY' | 'SELL';
  strategy_type: string;
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  position_size_percent: number;
  confidence_score: number;
  rationale: string;
  timeframe: string;
}

export interface StrategyEvaluator {
  evaluate(
    asset: string,
    prices: number[],
    volume: number[],
    indicators: TechnicalIndicators
  ): Signal | null;
}
```

### Strategy 1: RSI Breadth Entry Trigger
```typescript
// packages/strategies/src/rsiBET.ts
export function evaluateRsiBET(
  asset: string,
  prices: number[],
  volume: number[],
  indicators: TechnicalIndicators
): Signal | null {
  const { rsi14, ema20, atr14, avgVolume20 } = indicators;
  const currentPrice = prices[prices.length - 1];
  const currentVolume = volume[volume.length - 1];

  // Entry conditions
  const isOversold = rsi14 < 30;
  const volumeSpike = currentVolume > avgVolume20 * 2.0;
  const aboveEMA = currentPrice > ema20;
  const hasUpwardMomentum = prices[prices.length - 1] > prices[prices.length - 2];

  if (isOversold && volumeSpike && aboveEMA && hasUpwardMomentum) {
    const stopLoss = currentPrice - (3 * atr14);
    const takeProfit = currentPrice + (3.75 * atr14);

    let confidenceScore = 85;
    if (rsi14 < 20) confidenceScore += 5; // Extreme oversold boost

    return {
      asset,
      action: 'BUY',
      strategy_type: 'rsiBET',
      entry_price: currentPrice,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      position_size_percent: 2.0,
      confidence_score: confidenceScore,
      rationale: `RSI at ${rsi14.toFixed(1)}, volume spike ${(currentVolume / avgVolume20).toFixed(1)}x above EMA20`,
      timeframe: '1h'
    };
  }

  return null;
}
```

### Strategy 2: MACD Crossover
```typescript
// packages/strategies/src/macdCrossover.ts
export function evaluateMACDCrossover(
  asset: string,
  prices: number[],
  indicators: TechnicalIndicators
): Signal | null {
  const { macd, ema50 } = indicators;
  const currentPrice = prices[prices.length - 1];

  // Bullish crossover
  if (macd.line > macd.signal && macd.histogram > 0 && currentPrice > ema50) {
    const stopLoss = currentPrice * 0.97; // 3% stop
    const takeProfit = currentPrice * 1.06; // 6% target (2:1 R:R)

    return {
      asset,
      action: 'BUY',
      strategy_type: 'macdCrossover',
      entry_price: currentPrice,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      position_size_percent: 2.0,
      confidence_score: 88,
      rationale: `MACD bullish crossover, histogram +${macd.histogram.toFixed(2)}, price above 50-EMA`,
      timeframe: '1h'
    };
  }

  // Bearish crossover
  if (macd.line < macd.signal && macd.histogram < 0 && currentPrice < ema50) {
    const stopLoss = currentPrice * 1.03;
    const takeProfit = currentPrice * 0.94;

    return {
      asset,
      action: 'SELL',
      strategy_type: 'macdCrossover',
      entry_price: currentPrice,
      stop_loss: stopLoss,
      take_profit: takeProfit,
      position_size_percent: 2.0,
      confidence_score: 82,
      rationale: `MACD bearish crossover, histogram ${macd.histogram.toFixed(2)}, price below 50-EMA`,
      timeframe: '1h'
    };
  }

  return null;
}
```

### Strategy 3-5: [Similar implementation pattern]
*(Full code for TEMA, Halving Cycle, ATR Breakout follows same structure)*

---

## VI. SIGNAL ENGINE (CLOUDFLARE WORKER WITH CRON)

### `apps/signal-engine/src/index.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
import { evaluateRsiBET, evaluateMACDCrossover, evaluateTEMA, evaluateHalvingCycle, evaluateATRBreakout } from '@strategies';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  COINGECKO_API_KEY: string;
  ALPHAVANTAGE_API_KEY: string;
  DISCORD_WEBHOOK_URL: string;
  SENDGRID_API_KEY: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(generateSignals(env));
  },
};

async function generateSignals(env: Env) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  const assets = [
    'BTC/USD', 'ETH/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD',
    'DOGE/USD', 'SOL/USD', 'MATIC/USD', 'DOT/USD', 'AVAX/USD',
    'LINK/USD', 'UNI/USD', 'ATOM/USD', 'XLM/USD', 'ALGO/USD',
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META'
  ];

  for (const asset of assets) {
    try {
      // 1. Fetch market data
      const marketData = await fetchMarketData(asset, env);

      // 2. Calculate technical indicators
      const indicators = calculateIndicators(marketData.prices, marketData.volume);

      // 3. Evaluate all 5 strategies
      const signals = [
        evaluateRsiBET(asset, marketData.prices, marketData.volume, indicators),
        evaluateMACDCrossover(asset, marketData.prices, indicators),
        evaluateTEMA(asset, marketData.prices, indicators),
        evaluateHalvingCycle(asset, marketData.prices),
        evaluateATRBreakout(asset, marketData.prices, marketData.volume, indicators)
      ].filter(s => s !== null);

      // 4. Apply risk management
      for (const signal of signals) {
        const isValid = await applyRiskManagement(signal, supabase);

        if (isValid) {
          // 5. Save to database
          await supabase.from('signals').insert(signal);

          // 6. Send notifications
          await notifyUsers(signal, env);
        }
      }
    } catch (error) {
      console.error(`Error processing ${asset}:`, error);
      await sendAdminAlert(env, `Signal generation failed for ${asset}: ${error.message}`);
    }
  }

  // 7. Update strategy performance stats
  await updatePerformanceMetrics(supabase);
}

async function fetchMarketData(asset: string, env: Env) {
  // Implement CoinGecko/AlphaVantage API calls
  // Return { prices: number[], volume: number[] }
}

async function applyRiskManagement(signal: any, supabase: any): Promise<boolean> {
  // Check max concurrent trades
  const { count } = await supabase
    .from('signals')
    .select('*', { count: 'exact', head: true })
    .eq('outcome', 'open');

  if (count >= 5) return false; // Max 5 concurrent trades

  // Check strategy win rate
  const { data: strategyPerf } = await supabase
    .from('strategy_performance')
    .select('win_rate_30d, status')
    .eq('strategy_name', signal.strategy_type)
    .single();

  if (strategyPerf.status === 'paused') return false;
  if (strategyPerf.win_rate_30d < 60) return false; // Pause if < 60%

  // Check risk:reward ratio
  const risk = signal.entry_price - signal.stop_loss;
  const reward = signal.take_profit - signal.entry_price;
  if (reward / risk < 1.5) return false; // Min 1.5:1 R:R

  return true;
}

async function notifyUsers(signal: any, env: Env) {
  // Discord webhook
  await fetch(env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        title: `${signal.action} ${signal.asset}`,
        color: signal.action === 'BUY' ? 0x00FF00 : 0xFF0000,
        fields: [
          { name: 'Entry', value: `$${signal.entry_price}`, inline: true },
          { name: 'Stop Loss', value: `$${signal.stop_loss}`, inline: true },
          { name: 'Take Profit', value: `$${signal.take_profit}`, inline: true },
          { name: 'Confidence', value: `${signal.confidence_score}%`, inline: true },
          { name: 'Strategy', value: signal.strategy_type, inline: true },
          { name: 'Rationale', value: signal.rationale }
        ],
        timestamp: new Date().toISOString()
      }]
    })
  });

  // SendGrid email (to Premium+ users)
  // Implementation...
}
```

---

## VII. API WORKER

### `apps/api/src/index.ts`
```typescript
import { Router } from 'itty-router';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import { corsMiddleware } from './middleware/cors';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  RATE_LIMIT: KVNamespace;
}

const router = Router();

// Middleware
router.all('*', corsMiddleware);
router.all('/api/*', rateLimitMiddleware);

// Public routes
router.get('/api/signals/latest', async (request, env: Env) => {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');

  const { data: signals } = await supabase
    .from('signals')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  return new Response(JSON.stringify({ success: true, data: { signals } }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Protected routes (require auth)
router.get('/api/users/me', authMiddleware, async (request, env: Env) => {
  const user = (request as any).user;
  return new Response(JSON.stringify({ success: true, data: { user } }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Stripe webhook
router.post('/api/subscriptions/webhook', async (request, env: Env) => {
  // Verify Stripe signature
  // Update user subscription tier in Supabase
  // Implementation...
});

// 404
router.all('*', () => new Response('Not Found', { status: 404 }));

export default {
  fetch: (request: Request, env: Env) => router.handle(request, env)
};
```

---

## VIII. FRONTEND DEPLOYMENT (CLOUDFLARE PAGES)

### Build Configuration
- **Build command**: `pnpm run build`
- **Build output directory**: `dist`
- **Root directory**: `apps/frontend`

### Environment Variables (Cloudflare Pages Dashboard)
```
VITE_API_URL=https://api.aisignalswired.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## IX. DEPLOYMENT COMMANDS

### Initial Setup
```bash
# 1. Install Wrangler CLI
npm install -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Create KV namespace for rate limiting
wrangler kv:namespace create RATE_LIMIT
# Copy the ID into wrangler.toml

# 4. Set secrets
wrangler secret put SUPABASE_URL --env production
wrangler secret put SUPABASE_SERVICE_KEY --env production
wrangler secret put JWT_SECRET --env production
wrangler secret put STRIPE_SECRET_KEY --env production
wrangler secret put STRIPE_WEBHOOK_SECRET --env production
wrangler secret put COINGECKO_API_KEY --env production
wrangler secret put ALPHAVANTAGE_API_KEY --env production
wrangler secret put DISCORD_WEBHOOK_URL --env production
wrangler secret put SENDGRID_API_KEY --env production
```

### Deploy
```bash
# Deploy API Worker
cd apps/api
wrangler publish

# Deploy Signal Engine Worker
cd apps/signal-engine
wrangler publish

# Deploy Frontend to Cloudflare Pages
cd apps/frontend
pnpm run build
wrangler pages publish dist
```

---

## X. SUCCESS CRITERIA

### Technical Requirements
- ✅ All 3 Cloudflare Workers deployed and running
- ✅ Cron trigger firing every 15 minutes
- ✅ Supabase database with all tables created
- ✅ Frontend accessible via Cloudflare Pages
- ✅ API responding < 50ms (edge compute)
- ✅ Signals generating successfully

### Business Requirements
- ✅ User registration/login working (Supabase Auth)
- ✅ Stripe checkout flow functional
- ✅ Discord/Email notifications delivering
- ✅ Win rate tracking accurately
- ✅ Admin dashboard accessible

### Cost Verification
- ✅ Monthly infrastructure cost: $0 (free tiers)
- ✅ Domain cost only: $10/year

---

## XI. MONITORING & DEBUGGING

### Cloudflare Workers Logs
```bash
# View API Worker logs
wrangler tail aisignals-api

# View Signal Engine logs
wrangler tail aisignals-engine
```

### Supabase Dashboard
- Monitor database queries
- View table data
- Check RLS policies
- Review auth users

---

## FINAL INSTRUCTION FOR MANUS AI

Build this system using the monorepo structure defined above. Prioritize:

1. **Cloudflare Workers** for all compute (API + Signal Engine)
2. **Supabase** for database + authentication
3. **TypeScript** end-to-end with shared packages
4. **Edge-first architecture** for sub-50ms response times
5. **Zero infrastructure cost** using free tiers

Deploy to production within 48 hours. First revenue by Friday.

**Key Differences from Docker Version**:
- ❌ No Docker containers
- ❌ No Express.js server
- ❌ No Redis (use Cloudflare KV)
- ✅ Cloudflare Workers (serverless functions)
- ✅ Cloudflare Cron Triggers (scheduled jobs)
- ✅ Cloudflare Pages (frontend hosting)
- ✅ Edge compute globally distributed

**BEGIN BUILD NOW.**
