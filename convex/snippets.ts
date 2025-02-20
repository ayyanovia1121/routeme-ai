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

// delete snippet from database

export const deleteSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    // check if user is authenticated
    const userIdentity = await ctx.auth.getUserIdentity();
    if (!userIdentity) throw new Error("🔴 User not authenticated");

    // check if snippet exists
    const snippet = await ctx.db.get(args.snippetId);
    if (!snippet) throw new Error("🔴 Snippet not found");

    // check if user is owner of snippet
    if (snippet.userId !== userIdentity.subject) {
      throw new Error(
        "🔴 User is not owner of snippet, cannot delete this snippet"
      );
    }

    // these will be set to true if deletion is successful
    let starsDeleted = false;
    let commentsDeleted = false;
    let snippetDeleted = false;

    // delete comments associated with snippet
    try {
      const comments = await ctx.db
        .query("snippetComments")
        .withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .collect();
      for (const comment of comments) {
        await ctx.db.delete(comment._id);
      }
      commentsDeleted = true;
    } catch (error) {
      console.error("❌ Error deleting comments:", error);
      throw new Error("Database delete failed");
    }

    // delete stars associated with snippet
    try {
      const stars = await ctx.db
        .query("stars")
        .withIndex("by_snippet_id")
        .filter((q) => q.eq(q.field("snippetId"), args.snippetId))
        .collect();
      for (const star of stars) {
        await ctx.db.delete(star._id);
      }
      starsDeleted = true;
    } catch (error) {
      console.error("❌ Error deleting stars:", error);
      throw new Error("Database delete failed");
    }

    // delete snippet
    try {
      await ctx.db.delete(args.snippetId);
      snippetDeleted = true;
    } catch (error) {
      console.error("❌ Error deleting snippet:", error);
      throw new Error("Database delete failed");
    }
  },
});

// Star Snippet
export const starSnippet = mutation({
  args: {
    snippetId: v.id("snippets"),
  },
  handler: async (ctx, args) => {
    try {
      // Check if user is authenticated
      const userIdentity = await ctx.auth.getUserIdentity();
      if (!userIdentity) throw new Error("🔴 User not authenticated");

      // Check if snippet star already exists
      const starExisting = await ctx.db
        .query("stars")
        .withIndex("by_user_id_and_snippet_id")
        .filter(
          (q) =>
            q.eq(q.field("userId"), userIdentity.subject) &&
            q.eq(q.field("snippetId"), args.snippetId)
        )
        .first();

      if (starExisting) {
        // If snippet star already exists, remove it (unstar)
        await ctx.db.delete(starExisting._id);
      } else {
        // If snippet star does not exist, add it (star)
        await ctx.db.insert("stars", {
          userId: userIdentity.subject,
          snippetId: args.snippetId,
        });
      }
    } catch (error) {
      console.error("❌ Error starring/un-starring snippet:", error);
      throw new Error("Database operation failed");
    }
  },
});

// Get Snippets data
export const getSnippets = query({
  handler: async (ctx) => {
    try {
      const snippets = await ctx.db.query("snippets").order("desc").collect();

      return snippets;
    } catch (error) {
      console.error("❌ Error fetching snippets data:", error);
    }
  },
});

// Snipped Stars
export const isSnippetStarred = query({
  args: {
    snippetId: v.id("snippets"),
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
  },
});

// Star Snippet count
export const getSnippetStarCount = query({
  args: {
    snippetId: v.id("snippets"),
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
  },
});
