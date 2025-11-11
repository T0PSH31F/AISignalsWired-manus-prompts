# AI Signals Wired - Project TODO

## Phase 1: Database Schema & Core Setup
- [x] Update database schema with signals, strategy_performance, subscriptions tables
- [x] Add subscription_tier and stripe fields to users table
- [x] Create database indexes for performance optimization
- [x] Push schema changes to database

## Phase 2: Backend API Development
- [x] Implement user subscription management endpoints
- [x] Create signal CRUD operations and queries
- [x] Build strategy performance tracking system
- [x] Add admin endpoints for system management
- [x] Implement tier-based access control middleware
- [ ] Add rate limiting based on subscription tiers (deferred to production)

## Phase 3: Trading Strategies Implementation (MVP: 3 strategies)
- [x] Strategy 1: RSI Breadth Entry Trigger (rsiBET)
- [x] Strategy 2: MACD Crossover Optimization
- [x] Strategy 3: Triple EMA (TEMA) Momentum
- [ ] Strategy 4: Bitcoin Halving Seasonality (deferred to v2)
- [ ] Strategy 5: ATR Volatility Breakout (deferred to v2)
- [x] Technical indicators library (RSI, MACD, EMA, ATR, volume)
- [x] Strategy evaluation and confidence scoring

## Phase 4: Signal Generation Engine
- [x] Market data fetching (CoinGecko API for crypto)
- [x] Risk management engine with circuit breakers
- [x] Signal generation workflow (orchestration ready)
- [x] Portfolio tracking and correlation analysis
- [x] Strategy performance calculation and monitoring
- [x] Signal validation and filtering

## Phase 5: Frontend Development
- [x] Landing page with live signal ticker
- [x] User authentication flow
- [x] Dashboard with signal feed and filters
- [ ] Performance charts and analytics (deferred to v2)
- [x] Subscription management UI (basic version)
- [ ] Admin panel for system monitoring (deferred to v2)
- [x] Neon cyberpunk theme with glow effects (Aura-inspired)
- [x] Responsive design for mobile/tablet

## Phase 6: Notifications & Automation
- [ ] Discord webhook integration
- [ ] SendGrid email notifications
- [ ] WebSocket real-time signal delivery
- [ ] Cron job setup for 15-minute signal generation
- [ ] Alert system for circuit breakers
- [ ] Owner notification for system issues

## Phase 7: Testing & Documentation
- [ ] Test all 5 trading strategies
- [ ] Validate risk management rules
- [ ] Test subscription payment flow
- [ ] Verify notification delivery (Discord, email)
- [ ] API endpoint testing
- [ ] Performance and load testing
- [ ] Create API documentation
- [ ] Write deployment guide
- [ ] Update README with setup instructions

## Phase 8: Deployment & Launch
- [ ] Configure environment variables
- [ ] Set up Docker Compose configuration
- [ ] Deploy to production environment
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging
- [ ] Create backup and recovery procedures
- [ ] Commit all changes to GitHub repository

## New Request: Scheduled Signal Generation
- [x] Set up Manus scheduled task to run signal generation every 15 minutes

## New Request: GitHub Commit
- [ ] Copy documentation files to GitHub repository
- [ ] Commit all project code with descriptive messages
- [ ] Push to T0PSH31F/AISignalsWired-manus-prompts repository
