/**
 * Signal Generation Engine
 * Orchestrates market data fetching, strategy evaluation, and risk management
 */

import * as db from "../db";
import { evaluateMACDCrossover } from "../strategies/macdCrossover";
import { evaluateRsiBET } from "../strategies/rsiBET";
import { evaluateTEMA } from "../strategies/temaMomentum";
import { fetchAllMarketData } from "./marketData";
import { applyRiskManagement } from "./riskManagement";

/**
 * Main signal generation function
 * Called every 15 minutes by the scheduled task
 */
export async function generateSignals(): Promise<{
  success: boolean;
  signalsGenerated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let signalsGenerated = 0;

  try {
    console.log("🔄 Starting signal generation cycle...");

    // 1. Fetch market data for all assets
    console.log("📊 Fetching market data...");
    const marketDataList = await fetchAllMarketData();
    console.log(`✓ Fetched data for ${marketDataList.length} assets`);

    // 2. Evaluate all strategies for each asset
    for (const marketData of marketDataList) {
      try {
        console.log(`\n📈 Evaluating ${marketData.asset}...`);

        // Evaluate each strategy
        const signals = await Promise.all([
          evaluateRsiBET(marketData),
          evaluateMACDCrossover(marketData),
          evaluateTEMA(marketData),
        ]);

        // 3. Filter out null signals and apply risk management
        for (const signal of signals) {
          if (!signal) continue;

          console.log(`  → ${signal.strategyType} generated ${signal.action} signal`);

          // Apply risk management
          const validatedSignal = await applyRiskManagement(signal);

          if (validatedSignal) {
            // Save to database
            await db.createSignal(validatedSignal);
            signalsGenerated++;

            console.log(`  ✓ Signal saved: ${signal.asset} ${signal.action} (confidence: ${signal.confidenceScore}%)`);

            // TODO: Notify users based on their tier and preferences
            // await notifyUsers(validatedSignal);
          } else {
            console.log(`  ✗ Signal rejected by risk management`);
          }
        }
      } catch (error) {
        const errorMsg = `Error evaluating ${marketData.asset}: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    // 4. Update strategy performance metrics
    console.log("\n📊 Updating strategy performance...");
    await updateStrategyPerformance();

    console.log(`\n✅ Signal generation complete: ${signalsGenerated} signals generated`);

    return {
      success: true,
      signalsGenerated,
      errors,
    };
  } catch (error) {
    const errorMsg = `Signal generation failed: ${error}`;
    console.error(errorMsg);
    errors.push(errorMsg);

    // TODO: Alert admin
    // await notifyOwner({
    //   title: "Signal Generation Error",
    //   content: errorMsg
    // });

    return {
      success: false,
      signalsGenerated,
      errors,
    };
  }
}

/**
 * Update performance metrics for all strategies
 */
async function updateStrategyPerformance(): Promise<void> {
  const strategies = ["rsiBET", "macdCrossover", "temaMomentum"];

  for (const strategyName of strategies) {
    try {
      // Calculate 7-day win rate
      const startDate7d = new Date();
      startDate7d.setDate(startDate7d.getDate() - 7);
      const signals7d = await db.getSignalsByDateRange(startDate7d, new Date());
      const strategySignals7d = signals7d.filter(s => s.strategyType === strategyName && s.outcome !== "open");
      const wins7d = strategySignals7d.filter(s => s.outcome === "win").length;
      const winRate7d = strategySignals7d.length > 0 ? (wins7d / strategySignals7d.length) * 100 : 0;

      // Calculate 30-day win rate
      const startDate30d = new Date();
      startDate30d.setDate(startDate30d.getDate() - 30);
      const signals30d = await db.getSignalsByDateRange(startDate30d, new Date());
      const strategySignals30d = signals30d.filter(s => s.strategyType === strategyName && s.outcome !== "open");
      const wins30d = strategySignals30d.filter(s => s.outcome === "win").length;
      const winRate30d = strategySignals30d.length > 0 ? (wins30d / strategySignals30d.length) * 100 : 0;

      // Calculate average return
      const closedSignals = strategySignals30d.filter(s => s.actualReturnPercent);
      const avgReturn = closedSignals.length > 0
        ? closedSignals.reduce((sum, s) => sum + parseFloat(s.actualReturnPercent || "0"), 0) / closedSignals.length
        : 0;

      // Upsert strategy performance
      await db.upsertStrategyPerformance({
        strategyName,
        winRate7d: winRate7d.toFixed(2),
        winRate30d: winRate30d.toFixed(2),
        totalSignals: strategySignals30d.length,
        avgReturnPercent: avgReturn.toFixed(2),
        status: "active",
      });

      console.log(`  ✓ ${strategyName}: 7d=${winRate7d.toFixed(1)}%, 30d=${winRate30d.toFixed(1)}%`);
    } catch (error) {
      console.error(`Error updating performance for ${strategyName}:`, error);
    }
  }
}
