import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createSnippet = mutation({
    args: {
        title: v.string(),
        language: v.string(),
        code: v.string(),
    },
    handler: async (ctx, args) => {
      const userIdentity = await ctx.auth.getUserIdentity();
      if (!userIdentity) throw new Error("🔴 User not authenticated");

      // check if user in database
      const user = await ctx.db
        .query("users")
        .withIndex("by_user_id")
        .filter((q) => q.eq(q.field("userId"), userIdentity.subject))
        .first();

        if (!user) throw new Error("🔴 User not found");

       try {
         // add snippet to database
         const snippetId = await ctx.db.insert("snippets", {
           userId: userIdentity.subject,
           userName: user.name,
           title: args.title,
           language: args.language,
           code: args.code,
         });
          return snippetId;

       } catch (error) {
        console.error("❌ Error inserting snippets data:", error);
        throw new Error("Database insert failed");
       }
    },
})