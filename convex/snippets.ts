import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// add data to database
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
});

// Get Snippets data
export const getSnippets = query({
  handler: async (ctx) => {
    try {
      const snippets = await ctx.db
      .query("snippets")
      .order("desc")
      .collect();

      return snippets;
    } catch (error) {
      console.error("❌ Error fetching snippets data:", error);
    }
  },
});

// Snipped Stars
export const isSnippetStarred = query({
  args: { 
    snippetId: v.id("snippets") 
  },

  handler: async (ctx, args) => {
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("🔴 User not authenticated");

    try {
      const star = await ctx.db
        .query("stars")
        .withIndex("by_user_id_and_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .first();

      return !!star;
    } catch (error) {
      console.error("❌ Error fetching star data:", error);
      throw new Error("Database query failed");
    }
  }
});

// Star Snippet count
export const getSnippetStarCount = query({
  args: { 
    snippetId: v.id("snippets") 
  },
  handler: async (ctx, args) => {
    try {
      const stars = await ctx.db
        .query("stars")
        .withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .collect();
        return stars.length;
    } catch (error) {
      console.error("❌ Error fetching star count:", error);
    }
  }
});