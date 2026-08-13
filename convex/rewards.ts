import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const getEarnedPoints = async (ctx: any, owner: string) => {
  const todos = await ctx.db.query("todos").collect();
  const earnings = await ctx.db.query("taskEarnings").withIndex("by_owner", (q: any) => q.eq("owner", owner)).collect();
  const earnedTodoIds = new Set(earnings.map((earning: any) => String(earning.todoId)));
  const legacyCompletedPoints = todos
    .filter((todo: any) => todo.owner === owner && todo.isCompleted && !earnedTodoIds.has(String(todo._id)))
    .reduce((total: number, todo: any) => total + (todo.points ?? 10), 0);
  return earnings.reduce((total: number, earning: any) => total + earning.points, 0) + legacyCompletedPoints;
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
    return { earned, spent, available: Math.max(0, earned - spent), redemptions };
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

export const getPreferences = query({
  args: { owner: v.string() },
  handler: async (ctx, args) =>
    await ctx.db.query("rewardPreferences").withIndex("by_owner", (q) => q.eq("owner", args.owner)).unique(),
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

export const updateCustomReward = mutation({
  args: { id: v.id("customRewards"), owner: v.string(), name: v.string(), description: v.string(), cost: v.number() },
  handler: async (ctx, args) => {
    const reward = await ctx.db.get(args.id);
    if (!reward || reward.owner !== args.owner) throw new Error("Reward not found.");
    if (!args.name.trim() || !args.description.trim() || !Number.isInteger(args.cost) || args.cost < 1) throw new Error("Enter valid reward details.");
    await ctx.db.patch(args.id, { name: args.name.trim(), description: args.description.trim(), cost: args.cost });
  },
});

export const deleteCustomReward = mutation({
  args: { id: v.id("customRewards"), owner: v.string() },
  handler: async (ctx, args) => {
    const reward = await ctx.db.get(args.id);
    if (reward?.owner === args.owner) await ctx.db.delete(args.id);
  },
});

export const hideBuiltInReward = mutation({
  args: { owner: v.string(), rewardId: v.string() },
  handler: async (ctx, args) => {
    const preference = await ctx.db.query("rewardPreferences").withIndex("by_owner", (q) => q.eq("owner", args.owner)).unique();
    const hiddenRewardIds = Array.from(new Set([...(preference?.hiddenRewardIds ?? []), args.rewardId]));
    if (preference) await ctx.db.patch(preference._id, { hiddenRewardIds }); else await ctx.db.insert("rewardPreferences", { owner: args.owner, hiddenRewardIds });
  },
});

export const restoreBuiltInRewards = mutation({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    const preference = await ctx.db.query("rewardPreferences").withIndex("by_owner", (q) => q.eq("owner", args.owner)).unique();
    if (preference) await ctx.db.patch(preference._id, { hiddenRewardIds: [] });
  },
});

export const clearRedemptions = mutation({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    const redemptions = await ctx.db.query("redemptions").withIndex("by_owner", (q) => q.eq("owner", args.owner)).collect();
    for (const redemption of redemptions) await ctx.db.delete(redemption._id);
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

    const available = Math.max(0, earned - spent);
    if (available < args.cost) {
      // Insufficient points is normal user feedback, not a server failure.
      // Returning a result avoids surfacing an expected condition in Expo's LogBox.
      return { status: "insufficient_points" as const, available };
    }

    const redemptionId = await ctx.db.insert("redemptions", args);
    return {
      status: "redeemed" as const,
      redemptionId,
      available: available - args.cost,
    };
  },
});
