/**
 * Strategy 2: MACD Crossover Optimization
 * 
 * Bullish Entry:
 * - MACD line crosses above signal line
 * - MACD histogram > 0 (positive)
 * - Price > EMA(50)
 * - Previous candle: MACD line ≤ signal line
 * 
 * Bearish Entry:
 * - MACD line crosses below signal line
 * - MACD histogram < 0 (negative)
 * - Price < EMA(50)
 * 
 * Risk Parameters:
 * - Position size: 2%
 * - Stop loss: 3% from entry
 * - Take profit: 6% from entry (2:1 R:R)
 * - MACD settings: (12, 26, 9)
 */

import { InsertSignal } from "../../drizzle/schema";
import * as indicators from "./indicators";
import { MarketData } from "./rsiBET";

export async function evaluateMACDCrossover(data: MarketData): Promise<InsertSignal | null> {
  const { asset, prices, currentPrice } = data;

  // Need at least 50 candles for reliable MACD + EMA(50)
  if (prices.length < 50) return null;

  // Calculate indicators
  const macd = indicators.calculateMACD(prices, 12, 26, 9);
  const ema50 = indicators.calculateEMA(prices, 50);
  
  // Calculate previous MACD to detect crossover
  const prevPrices = prices.slice(0, -1);
  const prevMACD = indicators.calculateMACD(prevPrices, 12, 26, 9);

  // Detect bullish crossover
  const bullishCrossover = 
    macd.macd > macd.signal &&
    prevMACD.macd <= prevMACD.signal &&
    macd.histogram > 0 &&
    currentPrice > ema50;

  // Detect bearish crossover
  const bearishCrossover = 
    macd.macd < macd.signal &&
    prevMACD.macd >= prevMACD.signal &&
    macd.histogram < 0 &&
    currentPrice < ema50;

  if (!bullishCrossover && !bearishCrossover) {
    return null;
  }

  const action = bullishCrossover ? "BUY" : "SELL";
  
  // Calculate risk parameters (3% stop, 6% target for 2:1 R:R)
  const stopLossPercent = 0.03;
  const takeProfitPercent = 0.06;
  
  const stopLoss = action === "BUY" 
    ? currentPrice * (1 - stopLossPercent)
    : currentPrice * (1 + stopLossPercent);
    
  const takeProfit = action === "BUY"
    ? currentPrice * (1 + takeProfitPercent)
    : currentPrice * (1 - takeProfitPercent);

  // Calculate confidence based on signal strength
  let confidence = 65; // Base confidence
  
  // Boost if histogram is strong
  if (Math.abs(macd.histogram) > Math.abs(macd.macd) * 0.1) {
    confidence += 5;
  }
  
  // Boost if price is well above/below EMA
  const emaDistance = Math.abs((currentPrice - ema50) / ema50);
  if (emaDistance > 0.02) { // 2% away from EMA
    confidence += 5;
  }
  
  confidence = Math.min(confidence, 100);

  const rationale = `MACD ${action === "BUY" ? "bullish" : "bearish"} crossover detected. ` +
    `MACD: ${macd.macd.toFixed(2)}, Signal: ${macd.signal.toFixed(2)}, Histogram: ${macd.histogram.toFixed(2)}. ` +
    `Price ${action === "BUY" ? "above" : "below"} EMA(50) at $${ema50.toFixed(2)}. ` +
    `2:1 Risk/Reward ratio with 3% stop.`;

  return {
    asset,
    action,
    strategyType: "macdCrossover",
    entryPrice: currentPrice.toFixed(8),
    stopLoss: stopLoss.toFixed(8),
    takeProfit: takeProfit.toFixed(8),
    positionSizePercent: "2.00",
    confidenceScore: confidence,
    rationale,
  };
}
