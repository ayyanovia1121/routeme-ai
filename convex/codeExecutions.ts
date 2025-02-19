import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const saveExecution = mutation({
    args:{
        language: v.string(),
        code: v.string(),
        output: v.optional(v.string()),
        error: v.optional(v.string()),

    },
    handler: async (ctx,args) => {
        // check if user is authenticated
        const userIdentity = await ctx.auth.getUserIdentity();
        if (!userIdentity) throw new Error("User not authenticated");

        // check if user is pro
        const user = await ctx.db
          .query("users")
          .withIndex("by_user_id")
          .filter((q) => q.eq(q.field("userId"), userIdentity.subject))
          .first();

        if (!user) throw new Error("User not found");

        if(!user?.isPro && args.language !== "javascript") {
            throw new ConvexError("Only pro users can use this language");
        }

        try {
          await ctx.db.insert("codeExecutions", {
            language: args.language,
            code: args.code,
            output: args.output,
            error: args.error,
            userId: userIdentity.subject,
          });

          return {
            message: "Execution data saved successfully",
            success: true,
          };
        } catch (error) {
          console.error("❌ Error inserting execution data:", error);
          throw new Error("Database insert failed");
        }
    }
});