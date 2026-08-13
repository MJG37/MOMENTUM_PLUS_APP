import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTodos = query({
    args: { owner: v.optional(v.string()) },
    handler: async (ctx, args) => {
        const todos = await ctx.db.query("todos").order("desc").collect()
        return todos.filter((todo) => !todo.owner || todo.owner === args.owner);
    },
});

// responsible for adding a new todo to the database
export const addTodo = mutation({
    args: {text:v.string(), points: v.number(), owner: v.string()},
    handler: async(ctx,args) => {
        if (!args.text.trim() || !Number.isInteger(args.points) || args.points < 1 || args.points > 300) throw new ConvexError("Tasks must have a name and take between 1 and 300 minutes.");
        const todoID = await ctx.db.insert("todos", {
            text: args.text,
            isCompleted: false,
            points: args.points,
            owner: args.owner,
        });

        return todoID;
    },
});

// responsible for toggling the "isCompleted" status of a todo in the database
export const toggleTodo = mutation({
    args: {id:v.id("todos")},
    handler: async(ctx,args) => {
        const todo = await ctx.db.get(args.id)
        if(!todo) throw new ConvexError("Todo not found")

        const isCompleted = !todo.isCompleted;
        if (isCompleted) {
          const existingEarning = await ctx.db.query("taskEarnings").withIndex("by_todo", (q) => q.eq("todoId", args.id)).unique();
          if (!existingEarning) await ctx.db.insert("taskEarnings", { owner: todo.owner ?? "", todoId: args.id, points: todo.points ?? 10 });
        }
        await ctx.db.patch(args.id, { isCompleted })
    }
})

// responsible for deleting A todo from the database
export const deleteTodo = mutation({
    args: {id:v.id("todos")},
    handler: async (ctx,args) => {
        await ctx.db.delete(args.id);
    },
});

// responsible for updating a todo in the database
export const updateTodo = mutation({
    args: {
        id: v.id("todos"),
        text: v.string(),
        points: v.number(),
    },
    handler: async (ctx, args) => {
        const todo = await ctx.db.get(args.id);
        if (!todo) throw new ConvexError("Todo not found.");
        if (!args.text.trim() || !Number.isInteger(args.points) || args.points < 1 || args.points > 300) throw new ConvexError("Use 1–300 minutes.");
        if (todo.isCompleted && todo.points !== args.points) throw new ConvexError("Completed task points cannot be changed.");
        await ctx.db.patch(args.id, { text: args.text.trim(), points: args.points });
    },
});

// responsible clearing ALL todos in the database
export const clearAllTodos = mutation({
    args: { owner: v.string() },
    handler: async(ctx, args) => {
       const todos = (await ctx.db.query("todos").collect()).filter(
        (todo) => todo.owner === args.owner
       );

       // Delete ALL todos
       for (const todo of todos) {
        await ctx.db.delete(todo._id);
        }

        return { deletedCount: todos.length };
    },
});
