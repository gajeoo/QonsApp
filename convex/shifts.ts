import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const all = await ctx.db
      .query("shifts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    let filtered = all;
    if (args.startDate) {
      filtered = filtered.filter((s) => s.date >= args.startDate!);
    }
    if (args.endDate) {
      filtered = filtered.filter((s) => s.date <= args.endDate!);
    }
    return filtered;
  },
});

export const listByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("shifts")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .collect();
  },
});

export const listByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const shifts = await ctx.db
      .query("shifts")
      .withIndex("by_propertyId", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    return shifts.filter((s) => s.userId === userId);
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { total: 0, scheduled: 0, open: 0, completed: 0 };
    const shifts = await ctx.db
      .query("shifts")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return {
      total: shifts.length,
      scheduled: shifts.filter((s) => s.status === "scheduled").length,
      open: shifts.filter((s) => s.status === "open").length,
      completed: shifts.filter((s) => s.status === "completed").length,
      inProgress: shifts.filter((s) => s.status === "in_progress").length,
    };
  },
});

export const create = mutation({
  args: {
    propertyId: v.id("properties"),
    staffId: v.optional(v.id("staff")),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    shiftType: v.union(v.literal("regular"), v.literal("overtime"), v.literal("emergency"), v.literal("training")),
    notes: v.optional(v.string()),
    isRecurring: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("shifts", {
      ...args,
      userId,
      status: args.staffId ? "scheduled" : "open",
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("shifts"),
    propertyId: v.optional(v.id("properties")),
    staffId: v.optional(v.id("staff")),
    date: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show"),
      v.literal("open"),
    )),
    shiftType: v.optional(v.union(v.literal("regular"), v.literal("overtime"), v.literal("emergency"), v.literal("training"))),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const shift = await ctx.db.get(args.id);
    if (!shift || shift.userId !== userId) throw new Error("Not found");
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    await ctx.db.patch(args.id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("shifts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const shift = await ctx.db.get(args.id);
    if (!shift || shift.userId !== userId) throw new Error("Not found");
    await ctx.db.delete(args.id);
  },
});

// AI Scheduling — automatically match staff to open shifts
export const aiSchedule = mutation({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const targetDate = args.date || new Date().toISOString().split("T")[0];
    const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
      new Date(targetDate + "T12:00:00").getDay()
    ] as string;

    // Get open shifts for this date
    const shifts = await ctx.db
      .query("shifts")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId).eq("date", targetDate))
      .collect();
    const openShifts = shifts.filter((s) => s.status === "open");

    if (openShifts.length === 0) return { assigned: 0, message: "No open shifts to fill" };

    // Get all active staff
    const allStaff = await ctx.db
      .query("staff")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    const activeStaff = allStaff.filter((s) => s.status === "active");

    // Get already-scheduled shifts for this date to avoid double-booking
    const scheduledShifts = shifts.filter(
      (s) => s.status === "scheduled" || s.status === "in_progress"
    );
    const busyStaffIds = new Set(
      scheduledShifts.filter((s) => s.staffId).map((s) => s.staffId!.toString())
    );

    let assigned = 0;
    for (const shift of openShifts) {
      // Score each available staff member
      const candidates = activeStaff
        .filter((s) => !busyStaffIds.has(s._id.toString()))
        .map((staff) => {
          let score = 50; // base score

          // Check availability for this day
          const dayAvail = staff.availability?.[dayOfWeek as keyof typeof staff.availability];
          if (dayAvail && dayAvail.length > 0) {
            score += 20; // available on this day
          }

          // Check if already assigned to this property
          if (staff.assignedPropertyIds?.includes(shift.propertyId)) {
            score += 25; // familiar with property
          }

          // Prefer lower hourly rate for regular shifts to optimize cost
          if (shift.shiftType === "regular") {
            score += Math.max(0, 10 - staff.hourlyRate / 10);
          }

          // Supervisors get priority for emergency shifts
          if (shift.shiftType === "emergency" && (staff.role === "supervisor" || staff.role === "manager")) {
            score += 30;
          }

          return { staff, score };
        })
        .sort((a, b) => b.score - a.score);

      if (candidates.length > 0) {
        const best = candidates[0];
        await ctx.db.patch(shift._id, {
          staffId: best.staff._id,
          status: "scheduled",
          aiAssigned: true,
          notes: `AI assigned (score: ${best.score}) — ${best.staff.name}`,
        });
        busyStaffIds.add(best.staff._id.toString());
        assigned++;
      }
    }

    return {
      assigned,
      total: openShifts.length,
      message: `AI assigned ${assigned} of ${openShifts.length} open shifts`,
    };
  },
});

// Emergency coverage — find replacement for a shift
export const findCoverage = mutation({
  args: { shiftId: v.id("shifts") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const shift = await ctx.db.get(args.shiftId);
    if (!shift || shift.userId !== userId) throw new Error("Not found");

    const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][
      new Date(shift.date + "T12:00:00").getDay()
    ] as string;

    // Get all staff scheduled for this date
    const dayShifts = await ctx.db
      .query("shifts")
      .withIndex("by_userId_date", (q) => q.eq("userId", userId).eq("date", shift.date))
      .collect();
    const busyStaffIds = new Set(
      dayShifts.filter((s) => s._id !== args.shiftId && s.staffId && s.status !== "cancelled")
        .map((s) => s.staffId!.toString())
    );

    const allStaff = await ctx.db
      .query("staff")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const available = allStaff
      .filter((s) => s.status === "active" && !busyStaffIds.has(s._id.toString()))
      .map((staff) => {
        let score = 50;
        const dayAvail = staff.availability?.[dayOfWeek as keyof typeof staff.availability];
        if (dayAvail && dayAvail.length > 0) score += 20;
        if (staff.assignedPropertyIds?.includes(shift.propertyId)) score += 25;
        return { staff, score };
      })
      .sort((a, b) => b.score - a.score);

    if (available.length > 0) {
      const best = available[0];
      await ctx.db.patch(args.shiftId, {
        staffId: best.staff._id,
        status: "scheduled",
        shiftType: "emergency",
        aiAssigned: true,
        notes: `Emergency coverage: ${best.staff.name} (AI score: ${best.score})`,
      });
      return { success: true, assignedTo: best.staff.name };
    }
    return { success: false, message: "No available staff found for coverage" };
  },
});
