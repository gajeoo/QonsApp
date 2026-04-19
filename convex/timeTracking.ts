import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    staffId: v.optional(v.id("staff")),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    let entries;
    if (args.staffId) {
      entries = await ctx.db
        .query("timeEntries")
        .withIndex("by_staffId", (q) => q.eq("staffId", args.staffId!))
        .collect();
      entries = entries.filter((e) => e.userId === userId);
    } else {
      entries = await ctx.db
        .query("timeEntries")
        .withIndex("by_userId", (q) => q.eq("userId", userId))
        .collect();
    }
    if (args.status) {
      entries = entries.filter((e) => e.status === args.status);
    }
    return entries.sort((a, b) => b.clockIn - a.clockIn);
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return entries.filter((e) => e.status === "clocked_in");
  },
});

export const getStats = query({
  args: {
    periodStart: v.optional(v.number()),
    periodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { totalHours: 0, activeNow: 0, entries: 0, avgHoursPerDay: 0 };
    const entries = await ctx.db
      .query("timeEntries")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    let filtered = entries;
    if (args.periodStart) {
      filtered = filtered.filter((e) => e.clockIn >= args.periodStart!);
    }
    if (args.periodEnd) {
      filtered = filtered.filter((e) => e.clockIn <= args.periodEnd!);
    }

    const totalHours = filtered.reduce((sum, e) => sum + (e.totalHours || 0), 0);
    const activeNow = entries.filter((e) => e.status === "clocked_in").length;
    const uniqueDays = new Set(filtered.map((e) => new Date(e.clockIn).toISOString().split("T")[0])).size;

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      activeNow,
      entries: filtered.length,
      avgHoursPerDay: uniqueDays > 0 ? Math.round((totalHours / uniqueDays) * 100) / 100 : 0,
    };
  },
});

export const clockIn = mutation({
  args: {
    staffId: v.id("staff"),
    propertyId: v.id("properties"),
    shiftId: v.optional(v.id("shifts")),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check staff is not already clocked in
    const existing = await ctx.db
      .query("timeEntries")
      .withIndex("by_staffId", (q) => q.eq("staffId", args.staffId))
      .collect();
    const alreadyClockedIn = existing.find((e) => e.status === "clocked_in");
    if (alreadyClockedIn) throw new Error("Staff member is already clocked in");

    const entryId = await ctx.db.insert("timeEntries", {
      userId,
      staffId: args.staffId,
      propertyId: args.propertyId,
      shiftId: args.shiftId,
      clockIn: Date.now(),
      clockInLat: args.latitude,
      clockInLng: args.longitude,
      status: "clocked_in",
      notes: args.notes,
    });

    // Update shift status if linked
    if (args.shiftId) {
      await ctx.db.patch(args.shiftId, { status: "in_progress" });
    }

    return entryId;
  },
});

export const clockOut = mutation({
  args: {
    id: v.id("timeEntries"),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    breakMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== userId) throw new Error("Not found");
    if (entry.status !== "clocked_in") throw new Error("Not clocked in");

    const clockOut = Date.now();
    const rawHours = (clockOut - entry.clockIn) / (1000 * 60 * 60);
    const breakHours = (args.breakMinutes || 0) / 60;
    const totalHours = Math.max(0, rawHours - breakHours);

    await ctx.db.patch(args.id, {
      clockOut,
      clockOutLat: args.latitude,
      clockOutLng: args.longitude,
      breakMinutes: args.breakMinutes,
      totalHours: Math.round(totalHours * 100) / 100,
      status: "clocked_out",
      notes: args.notes || entry.notes,
    });

    // Update linked shift
    if (entry.shiftId) {
      await ctx.db.patch(entry.shiftId, { status: "completed" });
    }
  },
});

export const approve = mutation({
  args: { id: v.id("timeEntries") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const entry = await ctx.db.get(args.id);
    if (!entry || entry.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { status: "approved" });
  },
});
