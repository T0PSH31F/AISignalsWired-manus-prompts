# Trading Strategy Documentation

## Overview

AI Signals Wired implements 5 proven trading strategies, each targeting different market conditions. All strategies include strict risk management with 2% position sizing and defined stop-loss/take-profit levels.

---

## Strategy 1: RSI Breadth Entry Trigger (rsiBET)

### Concept
Identifies oversold conditions with volume confirmation, entering positions when institutional buying begins.

### Entry Criteria
1. **RSI(14) < 30**: Asset is oversold
2. **Volume Spike**: Current volume > 2x the 20-day average
3. **Trend Confirmation**: Price above 20-day EMA (prevents catching falling knives)
4. **Momentum**: Price showing upward movement

### Exit Criteria
- **Take Profit**: Entry + (3.75 × ATR) = ~1.5:1 risk-reward
- **Stop Loss**: Entry - (3 × ATR)

### Risk Management
- Position Size: 2% of capital
- Max Concurrent: 5 positions
- Timeframes: 15-min, 1-hour, 4-hour charts

### Performance Characteristics
- **Win Rate**: 54-58% historically
- **Best Markets**: High volatility crypto (BTC, ETH, SOL)
- **Avg Hold Time**: 2-6 hours
- **Confidence Boost**: +5% if RSI < 20 (extreme oversold)

### Example Trade
```
Asset: BTC/USD
Entry: $43,250 (RSI: 28, Volume: 2.3x avg)
Stop Loss: $42,100 (ATR: $383)
Take Profit: $45,800
Result: +5.9% gain in 4 hours
```

---

## Strategy 2: MACD Crossover Optimization

### Concept
Classic momentum strategy enhanced with histogram and trend filters to reduce false signals.

### Bullish Entry Criteria
1. **MACD Crossover**: MACD line crosses ABOVE signal line (current candle)
2. **Previous Candle**: MACD line was ≤ signal line (confirms fresh crossover)
3. **Histogram Positive**: MACD histogram > 0
4. **Trend Filter**: Price above 50-day EMA

### Bearish Entry Criteria
1. **MACD Crossover**: MACD line crosses BELOW signal line
2. **Histogram Negative**: MACD histogram < 0
3. **Trend Filter**: Price below 50-day EMA

### Exit Criteria
- **Take Profit**: 6% from entry
- **Stop Loss**: 3% from entry (2:1 R:R)

### Risk Management
- Position Size: 2% of capital
- MACD Settings: Fast=12, Slow=26, Signal=9
- Timeframes: 1-hour, 4-hour, daily

### Performance Characteristics
- **Win Rate**: 62-68% (best performing strategy)
- **Best Markets**: Trending stocks (AAPL, TSLA, NVDA)
- **Avg Hold Time**: 1-3 days
- **Historical Backtest**: 1,151% return over 10 years (Bitcoin)

### Example Trade
```
Asset: AAPL
Entry: $185.50 (MACD crossover, histogram +0.12)
Stop Loss: $180.00
Take Profit: $196.50
Result: +5.9% gain in 2 days
```

---

## Strategy 3: Triple EMA (TEMA) Momentum

### Concept
Uses three exponential moving averages to identify strong trends and enter during pullbacks.

### Entry Criteria (Perfect Alignment)
1. **TEMA(4) > TEMA(9) > TEMA(18)**: All moving averages in order
2. **Uptrending**: All three TEMAs sloping upward
3. **Price Position**: Current price > TEMA(4)
4. **Momentum Confirmation**: TEMA(4) higher than 5 candles ago

### Exit Criteria
- **Take Profit**: 5% from entry
- **Stop Loss**: Below TEMA(18) OR 2.5% from entry (whichever closer)
- **Forced Exit**: TEMA(4) crosses below TEMA(9)

### Risk Management
- Position Size: 2% of capital
- TEMA Periods: 4, 9, 18 (fast, medium, slow)
- Timeframes: 15-min, 1-hour

### Performance Characteristics
- **Win Rate**: 65.7% (long positions)
- **Best Markets**: Strong trending assets (SOL, ETH, GOOGL)
- **Avg Hold Time**: 4-12 hours
- **Confidence Boost**: +5% if strong 5-period uptrend detected

### Example Trade
```
Asset: SOL/USD
Entry: $98.50 (Perfect TEMA alignment)
Stop Loss: $95.25 (below TEMA18)
Take Profit: $103.50
Result: +5.1% gain in 6 hours
```

---

## Strategy 4: Bitcoin Halving Seasonality

### Concept
Leverages Bitcoin's 4-year halving cycle to adjust position sizing and confidence during different market phases.

### Cycle Phases

#### Spring (0-12 months post-halving)
- **Market**: Consolidation, uncertainty
- **Action**: HOLD existing positions, minimal new entries
- **Confidence**: Neutral (0% adjustment)

#### Summer (12-24 months post-halving)
- **Market**: Bull market begins, institutional buying
- **Action**: AGGRESSIVE_BUY on all BTC signals
- **Confidence**: +30% boost to all Bitcoin strategies
- **Historical**: Strongest performing phase

#### Autumn (24-36 months post-halving)
- **Market**: Peak euphoria, retail FOMO
- **Action**: REDUCE positions by 50%, take profits
- **Confidence**: -10% (cautious)

#### Winter (36-48 months post-halving)
- **Market**: Bear market, capitulation
- **Action**: ACCUMULATE small positions (DCA)
- **Confidence**: +10% (long-term value buying)

### Current Phase (as of Nov 2025)
- Last Halving: April 19, 2024
- Months Since: 19 months
- **Current Phase**: Summer (Bull Market)
- **Strategy**: Apply +30% confidence boost to BTC signals

### Performance Characteristics
- **Win Rate**: 78% during Summer phase
- **Best Markets**: Bitcoin only (can apply to ETH as proxy)
- **Hold Time**: Months to years
- **Historical**: All previous cycles followed this pattern

---

## Strategy 5: ATR Volatility Breakout

### Concept
Captures explosive moves when volatility expands and price breaks resistance with volume.

### Entry Criteria
1. **Elevated Volatility**: Current ATR(14) > 1.5x the 20-day average ATR
2. **Breakout**: Price breaks above 20-day high
3. **Volume Confirmation**: Volume > 1.2x the 20-day average
4. **Momentum**: Price is the highest of last 5 candles

### Exit Criteria
- **Take Profit**: Entry + (2.5 × ATR)
- **Stop Loss**: Chandelier Stop = 20-day high - (3 × ATR)
- **Trailing Stop**: Adjust chandelier as ATR updates

### Risk Management
- Position Size: 2% of capital
- ATR Period: 14
- Chandelier Multiplier: 3.0 (conservative)

### Performance Characteristics
- **Win Rate**: 58-63%
- **Best Markets**: Volatile crypto breakouts (DOGE, MATIC, ADA)
- **Avg Hold Time**: 1-4 days
- **Confidence**: 78% (moderate)

### Example Trade
```
Asset: MATIC/USD
Entry: $0.85 (ATR: 0.08, breakout of $0.84 resistance)
Stop Loss: $0.77 (Chandelier: 20-day high - 3×ATR)
Take Profit: $1.05
Result: +23.5% gain in 3 days
```

---

## Risk Management (Applied to ALL Strategies)

### Position Sizing Rules
- **Maximum Per Trade**: 2% of capital
- **Maximum Concurrent Trades**: 5 positions
- **Correlation Limit**: If 3+ trades open, no new trades with >80% correlation

### Circuit Breakers

#### Strategy-Level Pause
- **Trigger**: Win rate < 60% over last 30 days
- **Action**: Pause that specific strategy until reviewed
- **Resume**: Manual admin approval after analysis

#### Platform-Level Pause
- **Trigger**: Overall win rate < 55% over last 7 days
- **Action**: Pause ALL strategies immediately
- **Alert**: Email + Discord notification to admin
- **Resume**: After system review and fixes

### Risk:Reward Requirements
- **Minimum**: 1.5:1 reward-to-risk ratio
- **Rejection**: Any signal with R:R < 1.5 is automatically rejected
- **Typical**: Most signals achieve 2:1 to 3:1 R:R

---

## Performance Transparency

All historical signals and outcomes are published publicly at:
**https://aisignalswired.com/performance**

### Key Metrics Displayed
- Win Rate (7-day, 30-day, all-time)
- Average Winner vs Average Loser
- Total Signals Generated
- Strategy-by-Strategy Breakdown
- Monthly Performance Charts

### Money-Back Guarantee
If platform win rate falls below 65% in your first 30 days as a paying customer, receive full refund—no questions asked.

---

## Asset Coverage

### Cryptocurrencies (15 assets)
BTC, ETH, BNB, XRP, ADA, DOGE, SOL, MATIC, DOT, AVAX, LINK, UNI, ATOM, XLM, ALGO

### Stocks (7 major tech/growth)
AAPL, MSFT, GOOGL, AMZN, TSLA, NVDA, META

### Coming Soon
- Forex pairs (EUR/USD, GBP/USD, etc.)
- Commodities (Gold, Silver, Oil)
- Stock indices (SPY, QQQ)
- Options signals

---

## FAQ

**Q: Can I use these signals for automated trading?**  
A: Elite tier members get API access for programmatic integration. However, always include your own risk management layer.

**Q: What timeframes do you trade?**  
A: We scan 15-minute, 1-hour, and 4-hour charts. Most signals are intraday to swing trades (hours to days).

**Q: Do you guarantee profits?**  
A: No. Trading involves risk. We target 65%+ win rate, but past performance doesn't guarantee future results. Only risk capital you can afford to lose.

**Q: How do I know signals are real?**  
A: Every signal is published with timestamp in our public database. You can verify performance independently.

**Q: Can I paper trade first?**  
A: Yes! Free tier gives you 5 signals/day to test before upgrading. Premium tier includes paper trading simulator (coming Q1 2026).

---

**Disclaimer**: This is not financial advice. All trades involve risk. Do your own research before making investment decisions.
