# AI TRADING SIGNALS PLATFORM - PRODUCTION BUILD SPECIFICATION
## Project: aisignalswired.com | Autonomous Full-Stack Deployment

---

## I. EXECUTIVE BRIEF

**Objective**: Build and deploy a production-ready AI-powered trading signal platform generating 20+ daily signals with 65%+ accuracy.

**Constraints**:
- Budget: $10 (domain only)
- Token allocation: 1 trillion (Manus pool)
- Timeline: Deploy within 48 hours, revenue-ready by Friday
- Market opportunity: $69.95B trading signals sector

**Success Metrics**:
- System operational 24/7 with 99.5%+ uptime
- 65%+ win rate across all strategies within 30 days
- 20+ signals generated daily across multiple assets
- Full subscription payment flow functional
- All 5 trading strategies operational with circuit breakers active

---

## II. TECHNICAL ARCHITECTURE

### Stack Specification
```
Frontend:  React 18 + Vite + TailwindCSS + shadcn/ui (dark mode, neon glow effects)
Backend:   Node.js + Express + PostgreSQL (Supabase)
Engine:    Autonomous cron agent (15-minute cycles)
APIs:      CoinGecko, Alpha Vantage, CCXT, Financial Datasets MCP
Cache:     Upstash Redis
Payments:  Stripe (subscription webhooks)
Notify:    Discord webhooks + SendGrid email
Deploy:    Docker Compose (4 services)
```

### System Flow
```
Market Data APIs → Technical Indicators Engine → 5 Strategy Evaluators → 
Risk Management Filter → Signal Generation → Database Storage → 
Multi-channel Delivery (Discord/Email/API) → Performance Tracking
```

---

## III. DATABASE SCHEMA

```sql
-- Core Tables (PostgreSQL via Supabase)

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium', 'elite')),
  stripe_customer_id TEXT,
  api_key UUID UNIQUE,
  discord_webhook TEXT,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_tier);

CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  actual_return_percent DECIMAL(10,2)
);
CREATE INDEX idx_signals_created ON signals(created_at DESC);
CREATE INDEX idx_signals_strategy ON signals(strategy_type);
CREATE INDEX idx_signals_outcome ON signals(outcome);

CREATE TABLE strategy_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_name TEXT UNIQUE NOT NULL,
  win_rate_7d DECIMAL(5,2),
  win_rate_30d DECIMAL(5,2),
  total_signals INTEGER DEFAULT 0,
  avg_return_percent DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT CHECK (status IN ('active', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## IV. TRADING STRATEGIES (Implement Exactly)

### Strategy 1: RSI Breadth Entry Trigger (rsiBET)
```javascript
// Entry Conditions (ALL must be true):
- RSI(14) < 30 (oversold threshold)
- Current volume > 20-day avg volume × 2.0
- Price > EMA(20)
- Price showing upward momentum

// Risk Parameters:
- Position size: 2% of capital
- Stop loss: Entry - (3 × ATR(14))
- Take profit: Entry + (3.75 × ATR(14))  // 1.5:1 R:R
- Timeframes: 15m, 1h, 4h
- Confidence boost: +5% if RSI < 20
```

### Strategy 2: MACD Crossover Optimization
```javascript
// Bullish Entry:
- MACD line crosses above signal line
- MACD histogram > 0 (positive)
- Price > EMA(50)
- Previous candle: MACD line ≤ signal line

// Bearish Entry:
- MACD line crosses below signal line
- MACD histogram < 0 (negative)
- Price < EMA(50)

// Risk Parameters:
- Position size: 2%
- Stop loss: 3% from entry
- Take profit: 6% from entry (2:1 R:R)
- MACD settings: (12, 26, 9)
```

### Strategy 3: Triple EMA (TEMA) Momentum
```javascript
// Bullish Alignment (LONG):
- TEMA(4) > TEMA(9) > TEMA(18) (perfect alignment)
- All three TEMAs trending upward
- Price > TEMA(4)
- TEMA(4) > TEMA(4) from 5 candles ago

// Exit Signal:
- TEMA(4) crosses below TEMA(9)

// Risk Parameters:
- Position size: 2%
- Stop loss: Below TEMA(18) OR 2.5% from entry (whichever is closer)
- Take profit: 5% from entry (2:1 R:R)
- Confidence boost: +5% if strong 5-period uptrend
```

### Strategy 4: Bitcoin Halving Seasonality
```javascript
// Cycle Phase Calculation:
const lastHalving = new Date('2024-04-19');
const monthsSince = Math.floor((currentDate - lastHalving) / (30 * 24 * 60 * 60 * 1000));

// Phase Rules:
- Spring (0-12 months): HOLD - No new trades, consolidation phase
- Summer (12-24 months): AGGRESSIVE_BUY - Add +30% confidence to all BTC signals
- Autumn (24-36 months): REDUCE - Take profits on 50% of positions
- Winter (36-48 months): ACCUMULATE - DCA strategy, small positions

// Apply as confidence multiplier to other strategies on BTC pairs
```

### Strategy 5: ATR Volatility Breakout
```javascript
// Entry Conditions:
- Current ATR(14) > 20-day avg ATR × 1.5 (elevated volatility)
- Price breaks above 20-day high
- Volume > 20-day avg volume × 1.2
- Price = highest of last 5 candles

// Risk Parameters:
- Position size: 2%
- Stop loss: 20-day high - (3 × ATR)  // Chandelier stop
- Take profit: Entry + (2.5 × ATR)
- Dynamic trailing stop: Adjust chandelier as ATR updates
```

---

## V. RISK MANAGEMENT ENGINE (Apply to ALL signals)

```javascript
const RISK_RULES = {
  maxPositionSize: 2,           // % of capital per trade
  maxConcurrentTrades: 5,       // Total open positions
  maxCorrelation: 0.80,         // If 3+ trades, correlation limit
  minRiskReward: 1.5,           // Minimum R:R ratio
  strategyPauseThreshold: 0.60, // Pause if 30-day win rate < 60%
  platformPauseThreshold: 0.55  // Pause ALL if 7-day win rate < 55%
};

function applyRiskManagement(signal, portfolio, strategyStats) {
  // Rule 1: Position size cap
  if (signal.position_size_percent > RISK_RULES.maxPositionSize) return null;

  // Rule 2: Concurrent trade limit
  if (portfolio.openTrades >= RISK_RULES.maxConcurrentTrades) return null;

  // Rule 3: Correlation check
  if (portfolio.openTrades >= 3) {
    const correlation = calculateCorrelation(signal.asset, portfolio.assets);
    if (correlation > RISK_RULES.maxCorrelation) return null;
  }

  // Rule 4: Strategy-level circuit breaker
  if (strategyStats[signal.strategy_type].winRate30d < RISK_RULES.strategyPauseThreshold) {
    logWarning(`Strategy ${signal.strategy_type} paused: Win rate below threshold`);
    return null;
  }

  // Rule 5: Platform-level circuit breaker
  const platformWinRate7d = calculatePlatformWinRate(7);
  if (platformWinRate7d < RISK_RULES.platformPauseThreshold) {
    pauseAllStrategies();
    alertAdmin('CRITICAL: Platform win rate below 55% - all strategies paused');
    return null;
  }

  // Rule 6: Risk:Reward validation
  const risk = signal.entry - signal.stop_loss;
  const reward = signal.take_profit - signal.entry;
  if (reward / risk < RISK_RULES.minRiskReward) return null;

  return signal;  // Passed all checks
}
```

---

## VI. SIGNAL GENERATION ENGINE

### Autonomous Agent Workflow (Runs every 15 minutes)

```javascript
// CRON: */15 * * * * (every 15 minutes)
async function generateSignals() {
  try {
    // 1. Fetch market data
    const assets = ['BTC/USD', 'ETH/USD', 'BNB/USD', 'XRP/USD', 'ADA/USD', 
                    'DOGE/USD', 'SOL/USD', 'MATIC/USD', 'DOT/USD', 'AVAX/USD',
                    'LINK/USD', 'UNI/USD', 'ATOM/USD', 'XLM/USD', 'ALGO/USD',
                    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META'];

    const marketData = await fetchMarketData(assets);

    // 2. Calculate technical indicators for each asset
    for (const asset of assets) {
      const prices = marketData[asset].prices;
      const volume = marketData[asset].volume;

      const indicators = {
        rsi14: calculateRSI(prices, 14),
        macd: calculateMACD(prices, 12, 26, 9),
        tema4: calculateTEMA(prices, 4),
        tema9: calculateTEMA(prices, 9),
        tema18: calculateTEMA(prices, 18),
        atr14: calculateATR(prices, 14),
        ema20: calculateEMA(prices, 20),
        ema50: calculateEMA(prices, 50),
        high20: Math.max(...prices.slice(-20)),
        avgVolume20: calculateAverage(volume, 20)
      };

      // 3. Evaluate all 5 strategies
      const signals = [];
      signals.push(await evaluateRsiBET(asset, prices, volume, indicators));
      signals.push(await evaluateMACDCrossover(asset, prices, indicators));
      signals.push(await evaluateTEMA(asset, prices, indicators));
      signals.push(await evaluateHalvingCycle(asset, prices));
      signals.push(await evaluateATRBreakout(asset, prices, volume, indicators));

      // 4. Filter and apply risk management
      for (const signal of signals.filter(s => s !== null)) {
        const portfolio = await getPortfolio();
        const strategyStats = await getStrategyStats();

        const validatedSignal = applyRiskManagement(signal, portfolio, strategyStats);

        if (validatedSignal) {
          await saveSignal(validatedSignal);
          await notifyUsers(validatedSignal);
        }
      }
    }

    await updateStrategyPerformance();

  } catch (error) {
    logError('Signal generation failed:', error);
    alertAdmin(`Signal engine error: ${error.message}`);
  }
}
```

---

## VII. API ENDPOINTS

```typescript
// Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-email
POST   /api/auth/forgot-password

// Signals
GET    /api/signals/latest?limit=10&tier={user_tier}
GET    /api/signals/:id
GET    /api/signals/performance?days=30
WS     /ws/signals/live

// User Management
GET    /api/users/me
PUT    /api/users/me
POST   /api/users/api-key
DELETE /api/users/api-key

// Subscriptions (Stripe)
POST   /api/subscriptions/checkout
POST   /api/subscriptions/webhook
POST   /api/subscriptions/cancel
GET    /api/subscriptions/status

// Admin (Protected)
GET    /api/admin/users
GET    /api/admin/strategy-performance
POST   /api/admin/strategy/:name/toggle
GET    /api/admin/system-health
POST   /api/admin/signals/generate

// Rate Limits:
// Free tier:     100 requests / 15 min
// Basic tier:    300 requests / 15 min
// Premium tier:  1000 requests / 15 min
// Elite tier:    5000 requests / 15 min
```

---

## VIII. NOTIFICATION SYSTEM

### Discord Webhooks (Premium & Elite tiers)
```javascript
async function sendDiscordSignal(signal) {
  const embed = {
    title: `${signal.action === 'BUY' ? '🚀' : '📉'} ${signal.action} SIGNAL: ${signal.asset}`,
    color: signal.action === 'BUY' ? 0x00FF00 : 0xFF0000,
    fields: [
      { name: '💰 Entry Price', value: `$${signal.entry_price}`, inline: true },
      { name: '🛑 Stop Loss', value: `$${signal.stop_loss}`, inline: true },
      { name: '🎯 Take Profit', value: `$${signal.take_profit}`, inline: true },
      { name: '📊 Confidence', value: `${signal.confidence_score}%`, inline: true },
      { name: '🔧 Strategy', value: signal.strategy_type, inline: true },
      { name: '💡 Rationale', value: signal.rationale, inline: false }
    ],
    footer: { text: 'AI Signals Wired | aisignalswired.com' },
    timestamp: new Date().toISOString()
  };

  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] })
  });
}
```

---

## IX. FRONTEND SPECIFICATIONS

### Design System (Neon Cyberpunk Theme)
```css
/* Core Design Tokens */
:root {
  --neon-cyan: #0ff;
  --neon-magenta: #f0f;
  --neon-green: #0f0;
  --neon-red: #f00;
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a2e;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
}

/* Neon Glow Effects */
.neon-button {
  box-shadow: 0 0 10px var(--neon-cyan),
              0 0 20px var(--neon-cyan),
              0 0 30px var(--neon-cyan);
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.fog-overlay {
  background: radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%);
  animation: fog-pulse 5s ease-in-out infinite;
}
```

### Key Pages

**Landing Page** (`/`):
- Hero with live signal ticker
- 30-day performance stats (transparent)
- Pricing comparison table
- CTA: "Start Free Trial"

**Dashboard** (`/dashboard`):
- Signal feed (filterable table)
- Performance charts
- Settings panel
- API key generator (Elite tier only)

**Admin Panel** (`/admin`):
- User management table
- Strategy performance dashboard
- System health metrics
- Manual signal generation button

---

## X. SUBSCRIPTION TIERS & ACCESS CONTROL

```javascript
const TIER_FEATURES = {
  free: {
    price: 0,
    signals_per_day: 5,
    notification: 'email_digest',
    api_access: false,
    historical_days: 7,
    real_time: false
  },
  basic: {
    price: 79,
    signals_per_day: 20,
    notification: 'email_immediate',
    api_access: false,
    historical_days: 30,
    real_time: false
  },
  premium: {
    price: 149,
    signals_per_day: 'unlimited',
    notification: 'discord_webhook',
    api_access: false,
    historical_days: 90,
    real_time: true
  },
  elite: {
    price: 299,
    signals_per_day: 'unlimited',
    notification: 'all',
    api_access: true,
    historical_days: 'unlimited',
    real_time: true,
    custom_alerts: true
  }
};
```

---

## XI. DEPLOYMENT & INFRASTRUCTURE

### Environment Variables (Required)
- DATABASE_URL, SUPABASE_URL, SUPABASE_ANON_KEY
- JWT_SECRET, JWT_EXPIRES_IN
- STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- COINGECKO_API_KEY, ALPHAVANTAGE_API_KEY
- SENDGRID_API_KEY, SENDGRID_FROM_EMAIL
- DISCORD_WEBHOOK_URL
- REDIS_URL

---

## XII. MONITORING & ALERTS

```javascript
async function monitorSystemHealth() {
  const checks = {
    lastSignalTime: Date.now() - (await getLastSignalTimestamp()),
    platformWinRate7d: await calculatePlatformWinRate(7),
    databaseConnectivity: await testDatabaseConnection(),
    apiKeyStatus: await testAPIKeys(['coingecko', 'alphavantage', 'sendgrid'])
  };

  if (checks.lastSignalTime > 30 * 60 * 1000) {
    await alertAdmin('CRITICAL: No signals generated in 30+ minutes');
  }

  if (checks.platformWinRate7d < 0.55) {
    await pauseAllStrategies();
    await alertAdmin('CRITICAL: Platform win rate below 55%');
  }
}
```

---

## XIII. SUCCESS CRITERIA

### Technical Requirements (Must Pass All)
- ✅ System uptime: 99.5%+ over first 7 days
- ✅ Signal generation: Every 15 minutes without failure
- ✅ API response time: < 200ms for 95th percentile
- ✅ Database query performance: < 100ms
- ✅ Email delivery: < 5 minutes from signal generation
- ✅ Discord delivery: < 30 seconds from signal generation
- ✅ No security vulnerabilities

### Business Requirements
- ✅ Win rate: 65%+ across all strategies within 30 days
- ✅ Daily signals: 20+ generated per day
- ✅ Subscription flow: Test payment processed successfully

---

## XIV. EXECUTION INSTRUCTIONS FOR MANUS AI

### Build Order (Sequential)
1. **Initialize project structure** (15 min)
2. **Database setup** (20 min)
3. **Backend API** (60 min)
4. **Signal engine** (90 min)
5. **Frontend** (60 min)
6. **Testing & validation** (30 min)
7. **Documentation** (20 min)
8. **Deployment** (15 min)

**Total Estimated Time**: 5 hours autonomous build

### Critical Implementation Notes
- Use real API calls only - no mock data
- Follow defensive programming: Check all inputs, handle all errors
- Apply modular architecture: Each strategy in separate file
- Prioritize measurability: Every component must have success metrics

---

## FINAL INSTRUCTION

Build this system exactly as specified. Prioritize:
1. **Correctness**: All strategies must match specifications precisely
2. **Reliability**: 99.5%+ uptime is non-negotiable
3. **Transparency**: Every metric publicly visible
4. **Security**: No vulnerabilities, proper authentication
5. **Performance**: Fast API responses, efficient database queries

Deploy to production within 48 hours. First revenue by Friday.

**BEGIN BUILD NOW.**
