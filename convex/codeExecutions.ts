import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const codeExecutions = mutation({
    args:{
        language: v.string(),
        code: v.string(),
        output: v.optional(v.string()),
        error: v.optional(v.string()),

    },
    handler: async (ctx,args) => {

        // check if user is authenticated
        const userIndetity = await ctx.auth.getUserIdentity();
        if(!userIndetity) throw new Error("User not authenticated");

        // check if user is pro
        const user = await ctx.db
        .query("users")
        .withIndex("by_user_id")
        .filter((q) => q.eq("userId", userIndetity.subject))
        .first();

        if(!user?.isPro && args.language !== "javascript") {
            throw new ConvexError("Only pro users can use this language");
        }

        await ctx.db.insert("codeExecutions", {
            ...args,
            userId: userIndetity.subject,
           
        });
    }
})