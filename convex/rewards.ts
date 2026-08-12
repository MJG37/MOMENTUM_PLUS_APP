import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const getEarnedPoints = async (ctx: any, owner: string) => {
  const todos = await ctx.db.query("todos").collect();
  return todos
    .filter((todo: any) => todo.owner === owner && todo.isCompleted)
    .reduce((total: number, todo: any) => total + (todo.points ?? 10), 0);
};

export const getSummary = query({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    const earned = await getEarnedPoints(ctx, args.owner);
    const redemptions = await ctx.db
      .query("redemptions")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner))
      .order("desc")
      .collect();
    const spent = redemptions.reduce((total, reward) => total + reward.cost, 0);
    return { earned, spent, available: earned - spent, redemptions };
  },
});

export const redeem = mutation({
  args: {
    owner: v.string(),
    rewardId: v.string(),
    rewardName: v.string(),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    const earned = await getEarnedPoints(ctx, args.owner);
    const redemptions = await ctx.db
      .query("redemptions")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner))
      .collect();
    const spent = redemptions.reduce((total, reward) => total + reward.cost, 0);

    if (earned - spent < args.cost) {
      throw new ConvexError("You do not have enough points for this reward.");
    }

    await ctx.db.insert("redemptions", args);
  },
});
