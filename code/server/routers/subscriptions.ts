import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const subscriptionsRouter = router({
  /**
   * Get current user's subscription status
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    return subscription || { tier: "free", status: "active" };
  }),

  /**
   * Get user preferences (Discord webhook, API key, etc.)
   */
  preferences: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserPreferences(ctx.user.id);
  }),

  /**
   * Update user preferences
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        discordWebhook: z.string().url().optional(),
        emailNotifications: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await db.upsertUserPreferences({
        userId: ctx.user.id,
        discordWebhook: input.discordWebhook,
        emailNotifications: input.emailNotifications ? 1 : 0,
      });
      return { success: true };
    }),

  /**
   * Generate API key for Elite tier users
   */
  generateApiKey: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    
    if (subscription?.tier !== "elite") {
      throw new Error("API key generation is only available for Elite tier subscribers");
    }

    // Generate a random API key
    const apiKey = `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    await db.upsertUserPreferences({
      userId: ctx.user.id,
      apiKey,
    });

    return { apiKey };
  }),

  /**
   * Create Stripe checkout session
   * Note: This is a placeholder - full Stripe integration requires webhook setup
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        tier: z.enum(["basic", "premium", "elite"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement Stripe checkout session creation
      // For MVP, we'll return a placeholder
      return {
        checkoutUrl: `https://checkout.stripe.com/placeholder?tier=${input.tier}`,
        message: "Stripe integration pending - contact admin for manual setup",
      };
    }),

  /**
   * Cancel subscription
   */
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);
    
    if (!subscription || subscription.tier === "free") {
      throw new Error("No active subscription to cancel");
    }

    await db.updateSubscription(ctx.user.id, {
      status: "canceled",
    });

    return { success: true };
  }),
});
