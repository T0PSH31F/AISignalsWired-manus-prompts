/**
 * Risk Management Engine
 * Applies circuit breakers and position limits to all signals
 */

import { InsertSignal } from "../../drizzle/schema";
import * as db from "../db";

export const RISK_RULES = {
  maxPositionSize: 2, // % of capital per trade
  maxConcurrentTrades: 5, // Total open positions
  maxCorrelation: 0.80, // If 3+ trades, correlation limit
  minRiskReward: 1.5, // Minimum R:R ratio
  strategyPauseThreshold: 0.60, // Pause if 30-day win rate < 60%
  platformPauseThreshold: 0.55, // Pause ALL if 7-day win rate < 55%
};

/**
 * Portfolio state for risk calculations
 */
interface Portfolio {
  openTrades: number;
  assets: string[];
}

/**
 * Get current portfolio state
 */
async function getPortfolio(): Promise<Portfolio> {
  const openSignals = await db.getOpenSignalsCount();
  
  // TODO: Get list of assets with open positions
  // For MVP, we'll use a simplified version
  return {
    openTrades: openSignals,
    assets: [],
  };
}

/**
 * Calculate correlation between two assets (simplified)
 * In production, this would use historical price data
 */
function calculateAssetCorrelation(asset1: string, asset2: string): number {
  // Simplified correlation matrix for crypto pairs
  // In production, calculate from actual price data
  
  // BTC correlates highly with most crypto
  if (asset1.includes("BTC") || asset2.includes("BTC")) {
    return 0.7;
  }
  
  // ETH and major alts have moderate correlation
  if ((asset1.includes("ETH") || asset1.includes("BNB") || asset1.includes("SOL")) &&
      (asset2.includes("ETH") || asset2.includes("BNB") || asset2.includes("SOL"))) {
    return 0.6;
  }
  
  // Default moderate correlation for crypto market
  return 0.5;
}

/**
 * Apply risk management rules to a signal
 * Returns the signal if it passes all checks, null otherwise
 */
export async function applyRiskManagement(signal: InsertSignal): Promise<InsertSignal | null> {
  // Rule 1: Position size cap
  const positionSize = parseFloat(signal.positionSizePercent || "2.00");
  if (positionSize > RISK_RULES.maxPositionSize) {
    console.log(`Signal rejected: Position size ${positionSize}% exceeds max ${RISK_RULES.maxPositionSize}%`);
    return null;
  }

  // Rule 2: Concurrent trade limit
  const portfolio = await getPortfolio();
  if (portfolio.openTrades >= RISK_RULES.maxConcurrentTrades) {
    console.log(`Signal rejected: Max concurrent trades (${RISK_RULES.maxConcurrentTrades}) reached`);
    return null;
  }

  // Rule 3: Correlation check (if 3+ open trades)
  if (portfolio.openTrades >= 3) {
    // Check correlation with existing positions
    for (const existingAsset of portfolio.assets) {
      const correlation = calculateAssetCorrelation(signal.asset, existingAsset);
      if (correlation > RISK_RULES.maxCorrelation) {
        console.log(`Signal rejected: High correlation (${correlation}) with ${existingAsset}`);
        return null;
      }
    }
  }

  // Rule 4: Strategy-level circuit breaker
  if (!signal.strategyType) return signal; // Skip if no strategy type
  const strategyPerf = await db.getStrategyPerformance(signal.strategyType);
  if (strategyPerf && !Array.isArray(strategyPerf)) {
    const winRate30d = parseFloat(strategyPerf.winRate30d || "0");
    if (winRate30d < RISK_RULES.strategyPauseThreshold * 100) {
      console.warn(`Strategy ${signal.strategyType} paused: Win rate ${winRate30d}% below threshold`);
      
      // Auto-pause the strategy
      await db.toggleStrategyStatus(signal.strategyType, "paused");
      
      return null;
    }
    
    // Check if strategy is manually paused
    if (strategyPerf.status === "paused") {
      console.log(`Signal rejected: Strategy ${signal.strategyType} is paused`);
      return null;
    }
  }

  // Rule 5: Platform-level circuit breaker
  const platformWinRate7d = await db.calculatePlatformWinRate(7);
  if (platformWinRate7d < RISK_RULES.platformPauseThreshold) {
    console.error(`CRITICAL: Platform win rate ${(platformWinRate7d * 100).toFixed(1)}% below 55% - signal rejected`);
    
    // TODO: Alert admin
    // await notifyOwner({
    //   title: "Platform Circuit Breaker Triggered",
    //   content: `Platform win rate dropped to ${(platformWinRate7d * 100).toFixed(1)}%. All strategies paused.`
    // });
    
    return null;
  }

  // Rule 6: Risk:Reward validation
  const entryPrice = parseFloat(signal.entryPrice);
  const stopLoss = parseFloat(signal.stopLoss);
  const takeProfit = parseFloat(signal.takeProfit);
  
  const risk = Math.abs(entryPrice - stopLoss);
  const reward = Math.abs(takeProfit - entryPrice);
  const riskRewardRatio = reward / risk;
  
  if (riskRewardRatio < RISK_RULES.minRiskReward) {
    console.log(`Signal rejected: R:R ratio ${riskRewardRatio.toFixed(2)} below minimum ${RISK_RULES.minRiskReward}`);
    return null;
  }

  // All checks passed
  console.log(`✓ Signal passed risk management: ${signal.asset} ${signal.action} via ${signal.strategyType}`);
  return signal;
}

/**
 * Pause all strategies (emergency circuit breaker)
 */
export async function pauseAllStrategies(): Promise<void> {
  const strategies = await db.getStrategyPerformance();
  
  if (Array.isArray(strategies)) {
    for (const strategy of strategies) {
      await db.toggleStrategyStatus(strategy.strategyName, "paused");
    }
  }
  
  console.error("🚨 EMERGENCY: All strategies paused due to platform circuit breaker");
}
