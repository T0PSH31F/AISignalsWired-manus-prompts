import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

/**
 * Admin-only procedure that checks if user has admin role
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  /**
   * Get all users with their subscription info
   */
  users: adminProcedure.query(async () => {
    // TODO: Implement user listing with subscription details
    return [];
  }),

  /**
   * Get strategy performance dashboard
   */
  strategyPerformance: adminProcedure.query(async () => {
    const strategies = await db.getStrategyPerformance();
    const platformWinRate7d = await db.calculatePlatformWinRate(7);
    const platformWinRate30d = await db.calculatePlatformWinRate(30);
    const openSignals = await db.getOpenSignalsCount();

    return {
      strategies,
      platformWinRate7d: (platformWinRate7d * 100).toFixed(2),
      platformWinRate30d: (platformWinRate30d * 100).toFixed(2),
      openSignals,
    };
  }),

  /**
   * Toggle strategy active/paused status
   */
  toggleStrategy: adminProcedure
    .input(
      z.object({
        strategyName: z.string(),
        status: z.enum(["active", "paused"]),
      })
    )
    .mutation(async ({ input }) => {
      await db.toggleStrategyStatus(input.strategyName, input.status);
      return { success: true };
    }),

  /**
   * Get system health metrics
   */
  systemHealth: adminProcedure.query(async () => {
    const openSignals = await db.getOpenSignalsCount();
    const winRate7d = await db.calculatePlatformWinRate(7);
    
    // Get latest signal timestamp
    const latestSignals = await db.getLatestSignals(1, "elite");
    const lastSignalTime = latestSignals[0]?.createdAt;
    
    const timeSinceLastSignal = lastSignalTime 
      ? Date.now() - new Date(lastSignalTime).getTime()
      : null;

    return {
      status: "operational",
      openSignals,
      winRate7d: (winRate7d * 100).toFixed(2),
      lastSignalTime,
      timeSinceLastSignal,
      alerts: timeSinceLastSignal && timeSinceLastSignal > 30 * 60 * 1000
        ? ["No signals generated in 30+ minutes"]
        : [],
    };
  }),

  /**
   * Manually trigger signal generation
   * This will be called by the scheduled task
   */
  generateSignals: adminProcedure.mutation(async () => {
    const { generateSignals } = await import("../engine/signalGenerator");
    const result = await generateSignals();
    return result;
  }),

  /**
   * Update signal outcome (for manual testing/correction)
   */
  updateSignalOutcome: adminProcedure
    .input(
      z.object({
        signalId: z.number(),
        outcome: z.enum(["win", "loss", "neutral"]),
        actualReturnPercent: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db.updateSignalOutcome(
        input.signalId,
        input.outcome,
        input.actualReturnPercent
      );
      return { success: true };
    }),
});
