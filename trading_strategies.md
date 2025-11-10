# TRADING STRATEGY SPECIFICATIONS FOR SIGNALFORGE AI

## Strategy 1: RSI Breadth Entry Trigger (rsiBET)
- **Entry Signal:** When RSI(14) drops below 30 AND shows 2 standard deviation spike in volume
- **Exit Signal:** RSI returns above 50 OR stop-loss hit
- **Stop Loss:** 2.5 × ATR(14) below entry price
- **Take Profit:** 1.5:1 risk-reward ratio (3.75 × ATR above entry)
- **Position Size:** 2% of capital per trade
- **Timeframe:** 15-minute and 1-hour charts
- **Assets:** Bitcoin, Ethereum, top 30 altcoins by market cap
- **Backtest Performance:** 54% win rate, 1.55x avg winner vs avg loser
- **Source:** AI-Powered Bitcoin Trading book, Chapter 6

## Strategy 2: MACD Crossover Optimization
- **Entry Signal:** MACD line crosses above signal line AND histogram turns positive AND price above 50-day EMA
- **Parameters:** MACD(12, 26, 9) - fast period, slow period, signal period
- **Exit Signal:** MACD crosses below signal line OR stop-loss hit
- **Stop Loss:** 3% below entry OR below recent swing low
- **Take Profit:** 2:1 risk-reward ratio (6% above entry)
- **Timeframe:** Daily charts for stocks, 4-hour for crypto
- **Backtest Performance:** 1,151% return over 10-year period with S&P 500 stocks
- **Source:** Algorithmic Trading Systems book, Chapter 9

## Strategy 3: Triple Exponential Moving Average (TEMA)
- **Configuration:** TEMA(4), TEMA(9), TEMA(18)
- **Entry Signal:** TEMA(4) crosses above TEMA(9) AND TEMA(9) above TEMA(18)
- **Exit Signal:** TEMA(4) crosses below TEMA(9)
- **Stop Loss:** Below TEMA(18) or 2.5% below entry
- **Best for:** Trending markets, reduces lag vs traditional EMAs
- **Timeframe:** 1-hour and 4-hour charts
- **Backtest Performance:** 65.7% long-side profitability
- **Source:** AI-Powered Bitcoin Trading book, Chapter 8

## Strategy 4: Bitcoin Halving Seasonality
- **Logic:** Bitcoin follows 4-year cycle patterns around halving events
- **Phases:**
  - Spring (Accumulation): 0-12 months post-halving
  - Summer (Expansion): 12-24 months post-halving - BULLISH
  - Autumn (Distribution): 24-36 months post-halving - PEAK
  - Winter (Contraction): 36-48 months post-halving - BEARISH
- **Entry:** Accumulate during Winter phase (20%+ corrections)
- **Exit:** Distribute during Autumn phase (parabolic moves)
- **Indicators:** Track months since last halving (April 2024 was last)
- **Source:** Bitcoin Supercycle book, Chapter 3

## Strategy 5: ATR Volatility Breakouts (Chandelier Stops)
- **Entry Signal:** Price breaks above 20-day high AND ATR(14) > 1.5× average ATR
- **Chandelier Stop Formula:** Highest High - (3 × ATR(14))
- **Exit Signal:** Price closes below Chandelier stop
- **Logic:** Captures momentum breakouts while using volatility-adjusted stops
- **Best for:** High-volatility assets (small-cap crypto, penny stocks)
- **Timeframe:** Daily and 4-hour charts
- **Source:** AI-Powered Bitcoin Trading book, Chapter 7

## RISK MANAGEMENT RULES (APPLY TO ALL STRATEGIES)
- Maximum position size: 2% of capital per trade
- Maximum concurrent open positions: 5
- Circuit breaker: If platform win rate drops below 55% over 7 days, pause ALL strategies
- Individual strategy shutdown: If 30-day win rate < 60%, disable that strategy
- Always include stop-loss in every signal (NO exceptions)
- Confidence score calculation: (Strategy win rate × 0.4) + (Signal strength × 0.3) + (Market conditions × 0.3)

## SIGNAL OUTPUT FORMAT
Every signal must include these exact fields:
1. Asset (e.g., BTC/USD, AAPL)
2. Action (BUY or SELL)
3. Strategy Name (e.g., rsiBET)
4. Entry Price (current price at signal generation)
5. Stop Loss Price (based on strategy rules)
6. Take Profit Price (based on risk-reward ratio)
7. Position Size (always 2%)
8. Confidence Score (0-100%)
9. Timestamp (ISO 8601 format)
10. Rationale (1-2 sentence explanation of why signal triggered)

## DATA SOURCES & UPDATE FREQUENCY
- Crypto prices: CoinGecko API, update every 5 minutes
- Stock prices: Alpha Vantage API, update every 15 minutes (free tier limit)
- Technical indicators: Calculate from price data, update with each price fetch
- Strategy performance: Recalculate daily at 00:00 UTC
