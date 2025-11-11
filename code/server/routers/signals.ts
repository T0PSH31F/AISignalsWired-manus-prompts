import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const signalsRouter = router({
  /**
   * Get latest signals based on user's subscription tier
   */
  latest: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      // Determine user's tier
      let tier = "free";
      if (ctx.user) {
        const subscription = await db.getUserSubscription(ctx.user.id);
        tier = subscription?.tier || "free";
      }

      const signals = await db.getLatestSignals(input.limit, tier);
      return signals;
    }),

  /**
   * Get signal by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getSignalById(input.id);
    }),

  /**
   * Get signals within date range
   */
  getByDateRange: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      return await db.getSignalsByDateRange(input.startDate, input.endDate);
    }),

  /**
   * Get performance statistics
   */
  performance: publicProcedure
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      })
    )
    .query(async ({ input }) => {
      const winRate = await db.calculatePlatformWinRate(input.days);
      const strategies = await db.getStrategyPerformance();
      const openSignals = await db.getOpenSignalsCount();

      return {
        winRate: (winRate * 100).toFixed(2),
        strategies,
        openSignals,
      };
    }),
});
