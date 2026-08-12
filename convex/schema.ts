import {defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";

export default defineSchema ({
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
