/**
 * Strategy 3: Triple EMA (TEMA) Momentum
 * 
 * Bullish Alignment (LONG):
 * - TEMA(4) > TEMA(9) > TEMA(18) (perfect alignment)
 * - All three TEMAs trending upward
 * - Price > TEMA(4)
 * - TEMA(4) > TEMA(4) from 5 candles ago
 * 
 * Exit Signal:
 * - TEMA(4) crosses below TEMA(9)
 * 
 * Risk Parameters:
 * - Position size: 2%
 * - Stop loss: Below TEMA(18) OR 2.5% from entry (whichever is closer)
 * - Take profit: 5% from entry (2:1 R:R)
 * - Confidence boost: +5% if strong 5-period uptrend
 */

import { InsertSignal } from "../../drizzle/schema";
import * as indicators from "./indicators";
import { MarketData } from "./rsiBET";

export async function evaluateTEMA(data: MarketData): Promise<InsertSignal | null> {
  const { asset, prices, currentPrice } = data;

  // Need at least 60 candles for reliable TEMA calculations
  if (prices.length < 60) return null;

  // Calculate TEMAs
  const tema4 = indicators.calculateTEMA(prices, 4);
  const tema9 = indicators.calculateTEMA(prices, 9);
  const tema18 = indicators.calculateTEMA(prices, 18);
  
  // Calculate TEMA(4) from 5 candles ago
  const prices5Ago = prices.slice(0, -5);
  const tema4_5ago = indicators.calculateTEMA(prices5Ago, 4);

  // Check for perfect bullish alignment
  const perfectAlignment = tema4 > tema9 && tema9 > tema18;
  const priceAboveTEMA4 = currentPrice > tema4;
  const tema4Trending = tema4 > tema4_5ago;

  if (!perfectAlignment || !priceAboveTEMA4 || !tema4Trending) {
    return null;
  }

  // Calculate risk parameters
  const stopLossFromTEMA18 = tema18;
  const stopLossFromPercent = currentPrice * 0.975; // 2.5% below entry
  const stopLoss = Math.max(stopLossFromTEMA18, stopLossFromPercent); // Closer stop
  
  const takeProfit = currentPrice * 1.05; // 5% above entry

  // Calculate confidence
  let confidence = 65; // Base confidence for TEMA alignment
  
  // Boost if strong uptrend (TEMA4 significantly above 5 candles ago)
  const temaGrowth = (tema4 - tema4_5ago) / tema4_5ago;
  if (temaGrowth > 0.02) { // 2% growth
    confidence += 5;
  }
  
  // Boost if wide TEMA spread (strong trend)
  const temaSpread = (tema4 - tema18) / tema18;
  if (temaSpread > 0.03) { // 3% spread
    confidence += 5;
  }
  
  confidence = Math.min(confidence, 100);

  const rationale = `Perfect TEMA alignment: TEMA(4)=$${tema4.toFixed(2)} > TEMA(9)=$${tema9.toFixed(2)} > TEMA(18)=$${tema18.toFixed(2)}. ` +
    `Strong upward momentum with ${(temaGrowth * 100).toFixed(1)}% TEMA(4) growth over 5 periods. ` +
    `Stop at TEMA(18) or 2.5%, target 5% for 2:1 R:R.`;

  return {
    asset,
    action: "BUY",
    strategyType: "temaMomentum",
    entryPrice: currentPrice.toFixed(8),
    stopLoss: stopLoss.toFixed(8),
    takeProfit: takeProfit.toFixed(8),
    positionSizePercent: "2.00",
    confidenceScore: confidence,
    rationale,
  };
}
