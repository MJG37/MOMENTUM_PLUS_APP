import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const accountArgs = {
  username: v.string(),
  password: v.string(),
};

const answerValidator = v.object({
  birthday: v.string(),
  country: v.string(),
  favouriteColor: v.string(),
});

const usernameKey = (username: string) => username.trim().toLowerCase();

export const signup = mutation({
  args: accountArgs,
  handler: async (ctx, args) => {
    const username = args.username.trim();
    const key = usernameKey(username);
    if (await ctx.db.query("accounts").withIndex("by_usernameKey", q => q.eq("usernameKey", key)).unique()) {
      throw new ConvexError("An account already exists with that name.");
    }
    await ctx.db.insert("accounts", { username, usernameKey: key, password: args.password.trim() });
    return { username };
  },
});

export const login = mutation({
  args: accountArgs,
  handler: async (ctx, args) => {
    const account = await ctx.db.query("accounts").withIndex("by_usernameKey", q => q.eq("usernameKey", usernameKey(args.username))).unique();
    if (!account || account.password !== args.password.trim()) {
      return { status: "invalid_credentials" as const };
    }
    return { status: "authenticated" as const, username: account.username };
  },
});

export const saveSecurityAnswers = mutation({
  args: { username: v.string(), answers: answerValidator },
  handler: async (ctx, args) => {
    const account = await ctx.db.query("accounts").withIndex("by_usernameKey", q => q.eq("usernameKey", usernameKey(args.username))).unique();
    if (!account) throw new ConvexError("Account not found.");
    await ctx.db.patch(account._id, { securityAnswers: args.answers });
  },
});

export const resetPassword = mutation({
  args: { username: v.string(), answers: answerValidator, newPassword: v.string() },
  handler: async (ctx, args) => {
    const account = await ctx.db.query("accounts").withIndex("by_usernameKey", q => q.eq("usernameKey", usernameKey(args.username))).unique();
    const saved = account?.securityAnswers;
    const matches = saved && saved.birthday === args.answers.birthday && saved.country === args.answers.country && saved.favouriteColor.trim().toLowerCase() === args.answers.favouriteColor.trim().toLowerCase();
    if (!account || !matches) return { status: "authentication_failed" as const };
    await ctx.db.patch(account._id, { password: args.newPassword.trim() });
    return { status: "reset" as const };
  },
});

export const migrateLocalAccounts = mutation({
  args: { accounts: v.array(v.object({ username: v.string(), password: v.string(), securityAnswers: v.optional(answerValidator) })) },
  handler: async (ctx, args) => {
    for (const localAccount of args.accounts) {
      const key = usernameKey(localAccount.username);
      const existing = await ctx.db.query("accounts").withIndex("by_usernameKey", q => q.eq("usernameKey", key)).unique();
      if (!existing) await ctx.db.insert("accounts", { ...localAccount, username: localAccount.username.trim(), usernameKey: key });
    }
  },
});

export const deleteAccount = mutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const key = usernameKey(args.username);
    const account = await ctx.db.query("accounts").withIndex("by_usernameKey", q => q.eq("usernameKey", key)).unique();
    if (!account) throw new ConvexError("Account not found.");
    const todos = await ctx.db.query("todos").collect();
    const redemptions = await ctx.db.query("redemptions").withIndex("by_owner", q => q.eq("owner", account.username)).collect();
    const customRewards = await ctx.db.query("customRewards").withIndex("by_owner", q => q.eq("owner", account.username)).collect();
    const preferences = await ctx.db.query("rewardPreferences").withIndex("by_owner", q => q.eq("owner", account.username)).collect();
    for (const todo of todos.filter(todo => todo.owner === account.username)) await ctx.db.delete(todo._id);
    for (const redemption of redemptions) await ctx.db.delete(redemption._id);
    for (const reward of customRewards) await ctx.db.delete(reward._id);
    for (const preference of preferences) await ctx.db.delete(preference._id);
    await ctx.db.delete(account._id);
  },
});

export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const account = await ctx.db.query("accounts").withIndex("by_usernameKey", q => q.eq("usernameKey", usernameKey(args.username))).unique();
    return account ? { username: account.username } : null;
  },
});
