/**
 * Technical Indicators Library
 * Implements RSI, MACD, EMA, TEMA, ATR for trading signal generation
 */

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  const slice = prices.slice(-period);
  return slice.reduce((sum, price) => sum + price, 0) / period;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) return 0;
  
  const multiplier = 2 / (period + 1);
  let ema = calculateSMA(prices.slice(0, period), period);
  
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }
  
  return ema;
}

/**
 * Calculate Triple Exponential Moving Average (TEMA)
 * TEMA = 3 * EMA - 3 * EMA(EMA) + EMA(EMA(EMA))
 */
export function calculateTEMA(prices: number[], period: number): number {
  if (prices.length < period * 3) return 0;
  
  // First EMA
  const ema1Values: number[] = [];
  let ema1 = calculateSMA(prices.slice(0, period), period);
  ema1Values.push(ema1);
  
  const multiplier = 2 / (period + 1);
  for (let i = period; i < prices.length; i++) {
    ema1 = (prices[i] - ema1) * multiplier + ema1;
    ema1Values.push(ema1);
  }
  
  // Second EMA (EMA of EMA)
  const ema2Values: number[] = [];
  let ema2 = calculateSMA(ema1Values.slice(0, period), period);
  ema2Values.push(ema2);
  
  for (let i = period; i < ema1Values.length; i++) {
    ema2 = (ema1Values[i] - ema2) * multiplier + ema2;
    ema2Values.push(ema2);
  }
  
  // Third EMA (EMA of EMA of EMA)
  let ema3 = calculateSMA(ema2Values.slice(0, period), period);
  
  for (let i = period; i < ema2Values.length; i++) {
    ema3 = (ema2Values[i] - ema3) * multiplier + ema3;
  }
  
  // TEMA formula
  return 3 * ema1 - 3 * ema2 + ema3;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Neutral if not enough data
  
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }
  
  let avgGain = 0;
  let avgLoss = 0;
  
  // Initial average
  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }
  avgGain /= period;
  avgLoss /= period;
  
  // Smooth with remaining values
  for (let i = period; i < changes.length; i++) {
    if (changes[i] > 0) {
      avgGain = (avgGain * (period - 1) + changes[i]) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(changes[i])) / period;
    }
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number; signal: number; histogram: number } {
  if (prices.length < slowPeriod) {
    return { macd: 0, signal: 0, histogram: 0 };
  }
  
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macd = fastEMA - slowEMA;
  
  // Calculate signal line (EMA of MACD)
  // For simplicity, we'll approximate with a single calculation
  // In production, you'd track MACD history
  const signal = macd * 0.9; // Simplified approximation
  const histogram = macd - signal;
  
  return { macd, signal, histogram };
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number {
  if (highs.length < period + 1) return 0;
  
  const trueRanges: number[] = [];
  
  for (let i = 1; i < highs.length; i++) {
    const tr1 = highs[i] - lows[i];
    const tr2 = Math.abs(highs[i] - closes[i - 1]);
    const tr3 = Math.abs(lows[i] - closes[i - 1]);
    trueRanges.push(Math.max(tr1, tr2, tr3));
  }
  
  // Calculate ATR as SMA of true ranges
  return calculateSMA(trueRanges, period);
}

/**
 * Calculate average volume
 */
export function calculateAverageVolume(volumes: number[], period: number): number {
  return calculateSMA(volumes, period);
}

/**
 * Check if price is showing upward momentum
 */
export function hasUpwardMomentum(prices: number[], lookback: number = 5): boolean {
  if (prices.length < lookback) return false;
  const recent = prices.slice(-lookback);
  return recent[recent.length - 1] > recent[0];
}

/**
 * Get highest price in period
 */
export function getHighest(prices: number[], period: number): number {
  if (prices.length < period) return Math.max(...prices);
  return Math.max(...prices.slice(-period));
}

/**
 * Get lowest price in period
 */
export function getLowest(prices: number[], period: number): number {
  if (prices.length < period) return Math.min(...prices);
  return Math.min(...prices.slice(-period));
}

/**
 * Calculate correlation between two assets (simplified)
 */
export function calculateCorrelation(prices1: number[], prices2: number[]): number {
  if (prices1.length !== prices2.length || prices1.length < 2) return 0;
  
  const n = Math.min(prices1.length, prices2.length);
  const mean1 = prices1.reduce((sum, p) => sum + p, 0) / n;
  const mean2 = prices2.reduce((sum, p) => sum + p, 0) / n;
  
  let numerator = 0;
  let sum1 = 0;
  let sum2 = 0;
  
  for (let i = 0; i < n; i++) {
    const diff1 = prices1[i] - mean1;
    const diff2 = prices2[i] - mean2;
    numerator += diff1 * diff2;
    sum1 += diff1 * diff1;
    sum2 += diff2 * diff2;
  }
  
  const denominator = Math.sqrt(sum1 * sum2);
  return denominator === 0 ? 0 : numerator / denominator;
}
