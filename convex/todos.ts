import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTodos = query({
    handler: async (ctx) => {
        const todos = await ctx.db.query("todos").order("desc").collect()
        return todos;
    },
});

// responsible for adding a new todo to the database
export const addTodo = mutation({
    args: {text:v.string()},
    handler: async(ctx,args) => {
        const todoID = await ctx.db.insert("todos", {
            text: args.text,
            isCompleted: false,
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

        await ctx.db.patch(args.id, {
            isCompleted: !todo.isCompleted,
        })
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
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { 
            text: args.text, 
        });
    },
});

// responsible clearing ALL todos in the database
export const clearAllTodos = mutation({
    handler: async(ctx) => {
       const todos = await ctx.db.query("todos").collect();

       // Delete ALL todos
       for (const todo of todos) {
        await ctx.db.delete(todo._id);
        }

        return { deletedCount: todos.length };
    },
});
