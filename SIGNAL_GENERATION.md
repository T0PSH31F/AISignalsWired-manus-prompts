# Signal Generation System

## Overview

The AI Signals Wired platform automatically generates trading signals every 15 minutes using a scheduled Manus task. This document explains how the system works and how to monitor it.

## Architecture

### 1. Scheduled Task
- **Frequency**: Every 15 minutes (900 seconds)
- **Task Name**: "AI Signals Wired - Signal Generation"
- **Trigger**: Manus scheduling system
- **Endpoint**: `trpc.admin.generateSignals.mutate()`

### 2. Signal Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Scheduled Task (Every 15 min)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              1. Fetch Market Data (CoinGecko)               │
│  • BTC, ETH, BNB, XRP, ADA, SOL, DOGE, MATIC, DOT, AVAX    │
│  • 30 days of OHLCV data for technical indicators           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│           2. Evaluate Trading Strategies (Each Asset)       │
│  • RSI Breadth Entry Trigger (rsiBET)                       │
│  • MACD Crossover Optimization                              │
│  • Triple EMA Momentum (TEMA)                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              3. Apply Risk Management Rules                 │
│  • Position size cap (2% max)                               │
│  • Concurrent trade limit (5 max)                           │
│  • Correlation check (0.80 max)                             │
│  • Strategy circuit breaker (60% win rate min)              │
│  • Platform circuit breaker (55% win rate min)              │
│  • Risk:Reward validation (1.5:1 min)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              4. Save Signals to Database                    │
│  • Insert validated signals                                 │
│  • Update strategy performance metrics                      │
└─────────────────────────────────────────────────────────────┘
```

## Monitored Assets

The system monitors 10 high-liquidity cryptocurrency pairs:

1. **BTC/USD** - Bitcoin
2. **ETH/USD** - Ethereum
3. **BNB/USD** - Binance Coin
4. **XRP/USD** - Ripple
5. **ADA/USD** - Cardano
6. **SOL/USD** - Solana
7. **DOGE/USD** - Dogecoin
8. **MATIC/USD** - Polygon
9. **DOT/USD** - Polkadot
10. **AVAX/USD** - Avalanche

## Trading Strategies

### 1. RSI Breadth Entry Trigger (rsiBET)

**Entry Conditions:**
- RSI(14) < 30 (oversold)
- Volume > 2x 20-day average
- Price > EMA(20)
- Upward momentum detected

**Risk Parameters:**
- Position size: 2%
- Stop loss: Entry - (3 × ATR)
- Take profit: Entry + (3.75 × ATR)
- Base confidence: 60%

### 2. MACD Crossover Optimization

**Bullish Entry:**
- MACD line crosses above signal line
- MACD histogram > 0
- Price > EMA(50)

**Bearish Entry:**
- MACD line crosses below signal line
- MACD histogram < 0
- Price < EMA(50)

**Risk Parameters:**
- Position size: 2%
- Stop loss: 3% from entry
- Take profit: 6% from entry (2:1 R:R)
- Base confidence: 65%

### 3. Triple EMA (TEMA) Momentum

**Entry Conditions:**
- TEMA(4) > TEMA(9) > TEMA(18) (perfect alignment)
- All TEMAs trending upward
- Price > TEMA(4)
- TEMA(4) showing 5-period growth

**Risk Parameters:**
- Position size: 2%
- Stop loss: Below TEMA(18) or 2.5% (whichever closer)
- Take profit: 5% from entry
- Base confidence: 65%

## Risk Management

### Circuit Breakers

1. **Strategy-Level Circuit Breaker**
   - Triggers when 30-day win rate < 60%
   - Automatically pauses the specific strategy
   - Requires manual review and re-activation

2. **Platform-Level Circuit Breaker**
   - Triggers when 7-day win rate < 55%
   - Pauses ALL signal generation
   - Critical alert sent to admin
   - Requires investigation before resuming

### Position Limits

- **Maximum position size**: 2% of capital per trade
- **Maximum concurrent trades**: 5 open positions
- **Correlation limit**: Max 0.80 correlation between assets (when 3+ trades open)
- **Minimum Risk:Reward**: 1.5:1 ratio required

## Monitoring

### Admin Dashboard

Access the admin dashboard to monitor:
- Strategy performance (7-day and 30-day win rates)
- Open signals count
- Platform health status
- Last signal generation timestamp

**Endpoint**: `trpc.admin.strategyPerformance.query()`

### System Health Check

**Endpoint**: `trpc.admin.systemHealth.query()`

Returns:
- Platform status (operational/paused)
- Open signals count
- 7-day win rate
- Time since last signal
- Active alerts

### Manual Signal Generation

To manually trigger signal generation (for testing):

**Endpoint**: `trpc.admin.generateSignals.mutate()`

**Note**: Requires admin authentication

## Data Sources

### CoinGecko API

- **Free tier**: 10-30 requests/minute
- **Rate limiting**: 1 second delay between requests
- **Endpoints used**:
  - `/coins/{id}/ohlc` - Historical OHLCV data
  - `/simple/price` - Current price and volume
  - `/coins/{id}/market_chart` - Volume history

**API Key**: Optional (set `COINGECKO_API_KEY` for higher limits)

## Troubleshooting

### No Signals Generated

**Possible causes:**
1. All strategies rejected by risk management (normal)
2. Market conditions don't meet entry criteria (normal)
3. Circuit breaker triggered (check win rates)
4. Market data fetch failed (check CoinGecko API status)

**Action**: Check admin dashboard for alerts and strategy status

### Strategy Paused

**Cause**: 30-day win rate dropped below 60%

**Action**:
1. Review recent signal performance
2. Analyze market conditions
3. Consider strategy parameter adjustments
4. Manually re-activate via `trpc.admin.toggleStrategy.mutate()`

### Platform Circuit Breaker Triggered

**Cause**: 7-day win rate dropped below 55%

**Action**:
1. **CRITICAL**: Investigate immediately
2. Review all strategy performance
3. Check for market anomalies
4. Verify technical indicator calculations
5. Consider pausing until conditions improve

## Performance Metrics

The system tracks:

- **Win Rate (7-day)**: Percentage of closed signals that hit take profit
- **Win Rate (30-day)**: Long-term strategy performance
- **Total Signals**: Count of signals generated by each strategy
- **Average Return**: Mean return percentage of closed signals
- **Strategy Status**: Active or paused

**Update frequency**: After each signal generation cycle

## Future Enhancements

1. **Additional Strategies**: Bitcoin Halving Seasonality, ATR Volatility Breakout
2. **Stock Market Support**: Alpha Vantage integration for equities
3. **Advanced Analytics**: Sharpe ratio, maximum drawdown tracking
4. **Machine Learning**: Adaptive strategy parameter optimization
5. **Multi-timeframe Analysis**: 1H, 4H, 1D signal aggregation

## Support

For issues or questions:
- Check system health: `/dashboard` (admin)
- Review logs: Check Manus scheduled task execution history
- Manual intervention: Use admin endpoints to pause/resume strategies
