import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Submit a new lead from the contact form (public — no auth required)
 */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    properties: v.optional(v.string()),
    message: v.optional(v.string()),
    inquiryType: v.union(
      v.literal("demo"),
      v.literal("beta"),
      v.literal("general"),
      v.literal("trial"),
      v.literal("question"),
      v.literal("partnership"),
      v.literal("pricing"),
      v.literal("support"),
    ),
  },
  returns: v.id("leads"),
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      ...args,
      status: "new",
    });
    return leadId;
  },
});

/**
 * List all leads (admin only)
 */
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("converted"),
        v.literal("archived"),
      ),
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("leads"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      company: v.optional(v.string()),
      properties: v.optional(v.string()),
      message: v.optional(v.string()),
      inquiryType: v.union(
        v.literal("demo"),
        v.literal("beta"),
        v.literal("general"),
        v.literal("trial"),
        v.literal("question"),
        v.literal("partnership"),
        v.literal("pricing"),
        v.literal("support"),
      ),
      status: v.union(
        v.literal("new"),
        v.literal("contacted"),
        v.literal("converted"),
        v.literal("archived"),
      ),
      notes: v.optional(v.string()),
      notifiedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, { status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Check admin role
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile || profile.role !== "admin") return [];

    if (status) {
      return await ctx.db
        .query("leads")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("leads").order("desc").collect();
  },
});

/**
 * Update lead status (admin only)
 */
export const updateStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("contacted"),
      v.literal("converted"),
      v.literal("archived"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, { leadId, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile || profile.role !== "admin")
      throw new Error("Not authorized");

    await ctx.db.patch(leadId, { status });
    return null;
  },
});

/**
 * Add note to a lead (admin only)
 */
export const addNote = mutation({
  args: {
    leadId: v.id("leads"),
    notes: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { leadId, notes }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile || profile.role !== "admin")
      throw new Error("Not authorized");

    await ctx.db.patch(leadId, { notes });
    return null;
  },
});

/**
 * Get lead stats for admin dashboard
 */
export const getStats = query({
  args: {},
  returns: v.object({
    total: v.number(),
    new: v.number(),
    contacted: v.number(),
    converted: v.number(),
    thisWeek: v.number(),
    thisMonth: v.number(),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId)
      return {
        total: 0,
        new: 0,
        contacted: 0,
        converted: 0,
        thisWeek: 0,
        thisMonth: 0,
      };

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile || profile.role !== "admin")
      return {
        total: 0,
        new: 0,
        contacted: 0,
        converted: 0,
        thisWeek: 0,
        thisMonth: 0,
      };

    const allLeads = await ctx.db.query("leads").collect();
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      total: allLeads.length,
      new: allLeads.filter((l) => l.status === "new").length,
      contacted: allLeads.filter((l) => l.status === "contacted").length,
      converted: allLeads.filter((l) => l.status === "converted").length,
      thisWeek: allLeads.filter((l) => l._creationTime > weekAgo).length,
      thisMonth: allLeads.filter((l) => l._creationTime > monthAgo).length,
    };
  },
});
