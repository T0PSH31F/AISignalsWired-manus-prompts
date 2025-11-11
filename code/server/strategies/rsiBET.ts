/**
 * Strategy 1: RSI Breadth Entry Trigger (rsiBET)
 * 
 * Entry Conditions (ALL must be true):
 * - RSI(14) < 30 (oversold threshold)
 * - Current volume > 20-day avg volume × 2.0
 * - Price > EMA(20)
 * - Price showing upward momentum
 * 
 * Risk Parameters:
 * - Position size: 2% of capital
 * - Stop loss: Entry - (3 × ATR(14))
 * - Take profit: Entry + (3.75 × ATR(14))  // 1.5:1 R:R
 * - Confidence boost: +5% if RSI < 20
 */

import { InsertSignal } from "../../drizzle/schema";
import * as indicators from "./indicators";

export interface MarketData {
  asset: string;
  prices: number[];
  highs: number[];
  lows: number[];
  volumes: number[];
  currentPrice: number;
}

export async function evaluateRsiBET(data: MarketData): Promise<InsertSignal | null> {
  const { asset, prices, highs, lows, volumes, currentPrice } = data;

  // Need at least 30 candles for reliable calculation
  if (prices.length < 30) return null;

  // Calculate indicators
  const rsi = indicators.calculateRSI(prices, 14);
  const ema20 = indicators.calculateEMA(prices, 20);
  const atr = indicators.calculateATR(highs, lows, prices, 14);
  const avgVolume = indicators.calculateAverageVolume(volumes, 20);
  const currentVolume = volumes[volumes.length - 1];
  const hasUpwardMomentum = indicators.hasUpwardMomentum(prices, 5);

  // Entry conditions
  const isOversold = rsi < 30;
  const hasVolumeSpike = currentVolume > avgVolume * 2.0;
  const isPriceAboveEMA = currentPrice > ema20;
  const hasMomentum = hasUpwardMomentum;

  // Check if all conditions are met
  if (!isOversold || !hasVolumeSpike || !isPriceAboveEMA || !hasMomentum) {
    return null;
  }

  // Calculate risk parameters
  const stopLoss = currentPrice - (3 * atr);
  const takeProfit = currentPrice + (3.75 * atr);
  
  // Base confidence: 60%
  let confidence = 60;
  
  // Boost confidence if extremely oversold
  if (rsi < 20) confidence += 5;
  
  // Boost if strong volume spike
  if (currentVolume > avgVolume * 3.0) confidence += 5;
  
  // Cap at 100
  confidence = Math.min(confidence, 100);

  // Generate rationale
  const rationale = `RSI(${rsi.toFixed(1)}) oversold with ${(currentVolume / avgVolume).toFixed(1)}x volume spike. ` +
    `Price above EMA(20) at $${ema20.toFixed(2)} showing upward momentum. ` +
    `Risk/Reward: 1.5:1 with ATR-based stops.`;

  return {
    asset,
    action: "BUY",
    strategyType: "rsiBET",
    entryPrice: currentPrice.toFixed(8),
    stopLoss: stopLoss.toFixed(8),
    takeProfit: takeProfit.toFixed(8),
    positionSizePercent: "2.00",
    confidenceScore: confidence,
    rationale,
  };
}
