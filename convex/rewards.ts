import { v } from "convex/values";
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

export const listCustomRewards = query({
  args: { owner: v.string() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("customRewards")
      .withIndex("by_owner", (q) => q.eq("owner", args.owner))
      .collect(),
});

export const addCustomReward = mutation({
  args: { owner: v.string(), name: v.string(), description: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    const description = args.description.trim();
    if (!name || !description || !Number.isInteger(args.cost) || args.cost < 1) {
      throw new Error("Enter a reward name, description, and a whole-number point cost.");
    }
    return await ctx.db.insert("customRewards", { ...args, name, description });
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
      // Insufficient points is normal user feedback, not a server failure.
      // Returning a result avoids surfacing an expected condition in Expo's LogBox.
      return { status: "insufficient_points" as const, available: earned - spent };
    }

    const redemptionId = await ctx.db.insert("redemptions", args);
    return {
      status: "redeemed" as const,
      redemptionId,
      available: earned - spent - args.cost,
    };
  },
});
