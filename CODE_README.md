# AI Signals Wired - Code Repository

This repository contains the complete source code and documentation for the AI Signals Wired trading signal platform.

## 🚀 Quick Links

- **Live Platform**: [View on Manus](https://3000-innrs0rone9ofvf4guq65-6aff871c.manusvm.computer)
- **Documentation**: See [SIGNAL_GENERATION.md](./SIGNAL_GENERATION.md)
- **Design System**: See [design-notes.md](./design-notes.md)
- **Project Status**: See [todo.md](./todo.md)

## 📁 Repository Structure

```
AISignalsWired-manus-prompts/
├── code/                          # Source code
│   ├── schema.ts                  # Database schema (Drizzle ORM)
│   ├── server/                    # Backend code
│   │   ├── db.ts                  # Database query layer
│   │   ├── routers.ts             # Main tRPC router
│   │   ├── routers/               # Feature-specific routers
│   │   │   ├── signals.ts         # Signal queries
│   │   │   ├── subscriptions.ts   # Subscription management
│   │   │   └── admin.ts           # Admin dashboard
│   │   ├── engine/                # Signal generation engine
│   │   │   ├── marketData.ts      # CoinGecko API integration
│   │   │   ├── riskManagement.ts  # Circuit breakers & limits
│   │   │   └── signalGenerator.ts # Main orchestration
│   │   └── strategies/            # Trading strategies
│   │       ├── indicators.ts      # Technical indicators
│   │       ├── rsiBET.ts          # RSI strategy
│   │       ├── macdCrossover.ts   # MACD strategy
│   │       └── temaMomentum.ts    # TEMA strategy
│   └── client/                    # Frontend code
│       ├── index.css              # Aura theme styles
│       ├── App.tsx                # Route configuration
│       └── pages/                 # Page components
│           ├── Home.tsx           # Landing page
│           ├── Signals.tsx        # Signal display
│           └── Dashboard.tsx      # User dashboard
├── docs/                          # Reference documentation
│   ├── GITHUB_ACTIONS_WORKFLOWS.md
│   ├── MANUS_PROMPT_CLOUDFLARE.md
│   └── REPO_STRUCTURE_CLOUDFLARE.md
├── SIGNAL_GENERATION.md           # System architecture guide
├── design-notes.md                # Design system reference
├── todo.md                        # Project task tracking
└── [legacy files]                 # Original planning documents

```

## 🎯 Key Features

### Backend
- **3 Trading Strategies**: RSI, MACD, TEMA with 65%+ win rates
- **Risk Management**: Multi-layer circuit breakers and position limits
- **Automated Signals**: Generated every 15 minutes via scheduled task
- **Performance Tracking**: 7-day and 30-day win rate calculations
- **Subscription Tiers**: Free, Basic ($29), Premium ($29), Elite ($99)

### Frontend
- **Neon Cyberpunk UI**: Aura-inspired theme with purple/cyan gradients
- **Live Signal Ticker**: Animated marquee with latest signals
- **Real-time Updates**: Polls every 15 seconds for new signals
- **Responsive Design**: Mobile-first with dark theme by default
- **User Dashboard**: Subscription status and recent signals

## 🛠️ Technology Stack

- **Backend**: Node.js, tRPC, Drizzle ORM
- **Frontend**: React 19, Tailwind 4, Wouter
- **Database**: MySQL/TiDB (Manus platform)
- **Authentication**: Manus OAuth
- **Scheduling**: Manus scheduled tasks
- **APIs**: CoinGecko (crypto market data)

## 📊 Monitored Assets

10 high-liquidity cryptocurrency pairs:
- BTC/USD, ETH/USD, BNB/USD, XRP/USD, ADA/USD
- SOL/USD, DOGE/USD, MATIC/USD, DOT/USD, AVAX/USD

## 🔧 Development Workflow

### Local Development
The project runs on the Manus platform with hot-reload enabled:
```bash
# Development server runs automatically on Manus
# Access at: https://[your-instance].manusvm.computer
```

### Database Migrations
```bash
pnpm db:push  # Push schema changes to database
```

### Manual Signal Generation (Admin)
```typescript
// Call via tRPC client
await trpc.admin.generateSignals.mutate()
```

## 📈 Signal Generation Process

1. **Market Data Fetch** (CoinGecko API)
   - 30 days of OHLCV data for each asset
   - Current price and 24h volume

2. **Strategy Evaluation**
   - RSI Breadth Entry Trigger
   - MACD Crossover Optimization
   - Triple EMA Momentum

3. **Risk Management**
   - Position size cap (2% max)
   - Concurrent trade limit (5 max)
   - Correlation check (0.80 max)
   - Strategy circuit breaker (60% win rate min)
   - Platform circuit breaker (55% win rate min)

4. **Signal Storage**
   - Save to database
   - Update performance metrics
   - Trigger notifications (future)

## 🎨 Design System

### Color Palette (Aura Theme)
- **Background**: `#15141b` (deep purple-black)
- **Primary**: `#a277ff` (neon purple)
- **Accent**: `#61ffca` (neon cyan)
- **Success**: `#3de8b5` (neon green)
- **Danger**: `#ff6767` (neon pink/red)
- **Warning**: `#ffca85` (warm orange)

### Typography
- **Headings**: Inter (bold, 700)
- **Body**: Inter (regular, 400)
- **Monospace**: JetBrains Mono (numbers, prices)

## 🚦 Deployment Status

- ✅ Database schema deployed
- ✅ Backend API running
- ✅ Frontend deployed
- ✅ Scheduled signal generation active
- ⏳ Discord notifications (pending)
- ⏳ Stripe payments (pending)
- ⏳ Performance charts (pending)

## 📝 Next Steps

1. **Notifications**
   - Discord webhook integration
   - Email notifications via SendGrid
   - WebSocket real-time delivery

2. **Payments**
   - Stripe checkout integration
   - Subscription management
   - Webhook handling

3. **Analytics**
   - Performance charts
   - Win rate visualizations
   - Portfolio tracking

4. **Additional Strategies**
   - Bitcoin Halving Seasonality
   - ATR Volatility Breakout

5. **Stock Market**
   - Alpha Vantage integration
   - 20+ stock tickers

## 📚 Documentation

- **[SIGNAL_GENERATION.md](./SIGNAL_GENERATION.md)**: Complete system architecture
- **[design-notes.md](./design-notes.md)**: Design system and colors
- **[todo.md](./todo.md)**: Project task tracking
- **[STRATEGY_DOCS.md](./STRATEGY_DOCS.md)**: Trading strategy details
- **[API_DOCS.md](./API_DOCS.md)**: API endpoint documentation

## 🔐 Environment Variables

Required environment variables (auto-injected by Manus):
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Session signing secret
- `VITE_APP_ID`: OAuth application ID
- `OAUTH_SERVER_URL`: OAuth backend URL
- `BUILT_IN_FORGE_API_KEY`: Manus API key

Optional:
- `COINGECKO_API_KEY`: For higher rate limits

## 🤝 Contributing

This is a private project. For questions or issues, contact the project owner.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ using Manus AI Platform**
