import {defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema ({
    accounts: defineTable({
        username: v.string(),
        usernameKey: v.string(),
        password: v.string(),
        securityAnswers: v.optional(v.object({
            birthday: v.string(),
            country: v.string(),
            favouriteColor: v.string(),
        })),
    }).index("by_usernameKey", ["usernameKey"]),
    todos: defineTable ({
        text: v.string(),
        isCompleted: v.boolean(),
        points: v.optional(v.number()),
        owner: v.optional(v.string()),
    }),
    redemptions: defineTable({
        owner: v.string(),
        rewardId: v.string(),
        rewardName: v.string(),
        cost: v.number(),
    }).index("by_owner", ["owner"]),
});
