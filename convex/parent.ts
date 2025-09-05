import { query } from "./_generated/server";
import { v } from "convex/values";

// Get student info by parent auth ID
export const getStudentByParent = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    // Find parent user
    const parent = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("auth_id"), args.authId))
      .filter((q) => q.eq(q.field("role"), "parent"))
      .first();
    
    if (!parent) return null;
    
    // Find student by guardian ID
    const student = await ctx.db.query("students")
      .filter((q) => q.eq(q.field("guardian_ids"), [parent._id]))
      .first();
    
    if (!student) return null;
    
    // Get additional info
    const [branch, route, guardians] = await Promise.all([
      ctx.db.get(student.branch_id),
      student.route_id ? ctx.db.get(student.route_id) : null,
      Promise.all(student.guardian_ids.map(id => ctx.db.get(id)))
    ]);
    
    // Get vehicle info if route exists
    let vehicle = null;
    let driver = null;
    if (route) {
      vehicle = await ctx.db.get(route.vehicle_id);
      if (vehicle?.driver_id) {
        driver = await ctx.db.get(vehicle.driver_id);
      }
    }
    
    return {
      ...student,
      branch,
      route,
      vehicle,
      driver,
      guardians: guardians.filter(Boolean)
    };
  },
});

// Get live bus tracking info
export const getLiveBusTracking = query({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    // Get latest tracking entry for this vehicle
    const latestTracking = await ctx.db.query("live_tracking")
      .filter((q) => q.eq(q.field("vehicle_id"), args.vehicleId))
      .order("desc")
      .first();
    
    if (!latestTracking) return null;
    
    // Get vehicle and route info
    const [vehicle, route, driver] = await Promise.all([
      ctx.db.get(args.vehicleId),
      ctx.db.get(latestTracking.route_id),
      ctx.db.get(latestTracking.driver_id)
    ]);
    
    return {
      ...latestTracking,
      vehicle,
      route,
      driver
    };
  },
});

// Get notifications for parent
export const getNotifications = query({
  args: { 
    authId: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    // Find parent user
    const parent = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("auth_id"), args.authId))
      .filter((q) => q.eq(q.field("role"), "parent"))
      .first();
    
    if (!parent) return [];
    
    // Get notifications
    let notificationsQuery = ctx.db.query("notifications")
      .filter((q) => q.eq(q.field("user_id"), parent._id))
      .order("desc");
    
    const notifications = await notificationsQuery.collect();
    
    if (args.limit) {
      return notifications.slice(0, args.limit);
    }
    
    return notifications;
  },
});

// Get eco metrics for student
export const getEcoMetrics = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const ecoMetrics = await ctx.db.query("eco_metrics")
      .filter((q) => q.eq(q.field("student_id"), args.studentId))
      .order("desc")
      .collect();
    
    // Calculate totals
    const totals = ecoMetrics.reduce((acc, metric) => ({
      totalTrips: acc.totalTrips + metric.trips_count,
      totalDistance: acc.totalDistance + metric.distance_km,
      totalCO2Saved: acc.totalCO2Saved + metric.co2_saved_kg,
      totalFuelSaved: acc.totalFuelSaved + metric.fuel_saved_liters
    }), {
      totalTrips: 0,
      totalDistance: 0,
      totalCO2Saved: 0,
      totalFuelSaved: 0
    });
    
    // Get current month metrics
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentMonthMetrics = ecoMetrics.find(m => m.month === currentMonth);
    
    return {
      currentMonth: currentMonthMetrics || {
        trips_count: 0,
        distance_km: 0,
        co2_saved_kg: 0,
        fuel_saved_liters: 0
      },
      totals,
      monthlyData: ecoMetrics
    };
  },
});

// Get rewards for student
export const getRewards = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const rewards = await ctx.db.query("rewards")
      .filter((q) => q.eq(q.field("student_id"), args.studentId))
      .order("desc")
      .collect();
    
    const totalPoints = rewards.reduce((sum, reward) => sum + reward.points, 0);
    const earnedBadges = rewards.length;
    
    return {
      rewards,
      totalPoints,
      earnedBadges
    };
  },
});

// Get attendance records
export const getAttendance = query({
  args: { 
    studentId: v.id("students"),
    month: v.optional(v.string()) // YYYY-MM format
  },
  handler: async (ctx, args) => {
    let attendanceQuery = ctx.db.query("attendance")
      .filter((q) => q.eq(q.field("student_id"), args.studentId));
    
    if (args.month) {
      const nextMonth = getNextMonth(args.month);
      // Filter by month (assuming date is in YYYY-MM-DD format)
      attendanceQuery = attendanceQuery.filter((q) => 
        q.gte(q.field("date"), `${args.month}-01`) &&
        q.lt(q.field("date"), nextMonth)
      );
    }
    
    const attendance = await attendanceQuery.order("desc").collect();
    
    // Calculate stats
    const stats = {
      present: attendance.filter(a => a.status === "present").length,
      absent: attendance.filter(a => a.status === "absent").length,
      late: attendance.filter(a => a.status === "late").length,
      excused: attendance.filter(a => a.status === "excused").length,
      transportUsed: attendance.filter(a => a.transport_used).length
    };
    
    return {
      attendance,
      stats
    };
  },
});

// Helper function to get next month
function getNextMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
  const nextYear = monthNum === 12 ? year + 1 : year;
  return `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
}