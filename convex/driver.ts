import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get driver info and assigned vehicle
export const getDriverInfo = query({
  args: { authId: v.string() },
  handler: async (ctx, args) => {
    // Find driver user
    const driver = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("auth_id"), args.authId))
      .filter((q) => q.eq(q.field("role"), "driver"))
      .first();
    
    if (!driver) return null;
    
    // Find assigned vehicle
    const vehicle = await ctx.db.query("vehicles")
      .filter((q) => q.eq(q.field("driver_id"), driver._id))
      .first();
    
    if (!vehicle) return { driver, vehicle: null, route: null };
    
    // Find route for this vehicle
    const route = await ctx.db.query("routes")
      .filter((q) => q.eq(q.field("vehicle_id"), vehicle._id))
      .first();
    
    // Get students assigned to this route
    const students = route ? await ctx.db.query("students")
      .filter((q) => q.eq(q.field("route_id"), route._id))
      .collect() : [];
    
    return {
      driver,
      vehicle,
      route: route ? { ...route, students } : null
    };
  },
});

// Start a trip
export const startTrip = mutation({
  args: {
    driverId: v.id("users"),
    vehicleId: v.id("vehicles"),
    routeId: v.id("routes"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number()
    })
  },
  handler: async (ctx, args) => {
    // Create initial tracking entry
    const trackingId = await ctx.db.insert("live_tracking", {
      vehicle_id: args.vehicleId,
      driver_id: args.driverId,
      coordinates: args.coordinates,
      speed: 0,
      heading: 0,
      timestamp: new Date().toISOString(),
      trip_status: "picking_up",
      route_id: args.routeId,
      current_stop_index: 0,
      students_on_board: 0
    });
    
    return { success: true, trackingId };
  },
});

// Update location
export const updateLocation = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number()
    }),
    speed: v.number(),
    heading: v.number(),
    tripStatus: v.union(
      v.literal("not_started"),
      v.literal("picking_up"),
      v.literal("en_route_to_school"),
      v.literal("at_school"),
      v.literal("returning"),
      v.literal("completed")
    ),
    currentStopIndex: v.number(),
    studentsOnBoard: v.number()
  },
  handler: async (ctx, args) => {
    // Get current tracking entry
    const currentTracking = await ctx.db.query("live_tracking")
      .filter((q) => q.eq(q.field("vehicle_id"), args.vehicleId))
      .order("desc")
      .first();
    
    if (!currentTracking) {
      throw new Error("No active trip found for this vehicle");
    }
    
    // Update tracking entry
    await ctx.db.patch(currentTracking._id, {
      coordinates: args.coordinates,
      speed: args.speed,
      heading: args.heading,
      timestamp: new Date().toISOString(),
      trip_status: args.tripStatus,
      current_stop_index: args.currentStopIndex,
      students_on_board: args.studentsOnBoard
    });
    
    return { success: true };
  },
});

// Check student in/out
export const checkStudentInOut = mutation({
  args: {
    studentId: v.id("students"),
    vehicleId: v.id("vehicles"),
    driverId: v.id("users"),
    action: v.union(v.literal("pickup"), v.literal("dropoff")),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number()
    }),
    locationName: v.string(),
    qrScanned: v.boolean(),
    photoUrl: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Create boarding log entry
    const boardingLogId = await ctx.db.insert("boarding_logs", {
      student_id: args.studentId,
      vehicle_id: args.vehicleId,
      driver_id: args.driverId,
      action: args.action,
      timestamp: new Date().toISOString(),
      location: {
        name: args.locationName,
        coordinates: args.coordinates
      },
      qr_scanned: args.qrScanned,
      photo_verification: args.photoUrl,
      guardian_notified: false, // Will be updated when notification is sent
      trip_id: `trip_${new Date().toISOString().slice(0, 10)}_${args.vehicleId}`
    });
    
    // Get student and guardian info
    const student = await ctx.db.get(args.studentId);
    if (!student) throw new Error("Student not found");
    
    // Send notification to all guardians
    for (const guardianId of student.guardian_ids) {
      const guardian = await ctx.db.get(guardianId);
      if (guardian) {
        await ctx.db.insert("notifications", {
          user_id: guardianId,
          title: args.action === "pickup" ? "Student Picked Up 🚌" : "Student Dropped Off 🏠",
          message: `${student.name} has been safely ${args.action === "pickup" ? "picked up from" : "dropped off at"} ${args.locationName} at ${new Date().toLocaleTimeString()}.`,
          type: args.action,
          priority: "high",
          read: false,
          timestamp: new Date().toISOString(),
          data: {
            student_id: args.studentId,
            vehicle_id: args.vehicleId
          },
          delivery_status: {
            push: true,
            email: true,
            sms: false,
            whatsapp: false
          }
        });
      }
    }
    
    // Update boarding log to mark notifications sent
    await ctx.db.patch(boardingLogId, {
      guardian_notified: true
    });
    
    return { success: true, boardingLogId };
  },
});

// Report incident
export const reportIncident = mutation({
  args: {
    reporterId: v.id("users"),
    vehicleId: v.id("vehicles"),
    studentId: v.optional(v.id("students")),
    type: v.union(
      v.literal("late_boarding"),
      v.literal("misbehavior"),
      v.literal("medical"),
      v.literal("lost_item"),
      v.literal("vehicle_issue"),
      v.literal("route_delay"),
      v.literal("other")
    ),
    title: v.string(),
    description: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    coordinates: v.optional(v.object({
      lat: v.number(),
      lng: v.number()
    })),
    locationName: v.optional(v.string()),
    photos: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    const incidentId = await ctx.db.insert("incidents", {
      reporter_id: args.reporterId,
      student_id: args.studentId,
      vehicle_id: args.vehicleId,
      type: args.type,
      title: args.title,
      description: args.description,
      severity: args.severity,
      timestamp: new Date().toISOString(),
      location: args.coordinates && args.locationName ? {
        name: args.locationName,
        coordinates: args.coordinates
      } : undefined,
      photos: args.photos || [],
      status: "open"
    });
    
    // Notify admins about the incident
    const admins = await ctx.db.query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .collect();
    
    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        user_id: admin._id,
        title: `${args.severity.toUpperCase()} Incident Reported`,
        message: `${args.title} - ${args.description}`,
        type: "emergency",
        priority: args.severity === "high" ? "high" : "medium",
        read: false,
        timestamp: new Date().toISOString(),
        data: {
          vehicle_id: args.vehicleId,
          student_id: args.studentId
        },
        delivery_status: {
          push: true,
          email: true,
          sms: args.severity === "high",
          whatsapp: false
        }
      });
    }
    
    return { success: true, incidentId };
  },
});

// Get driver dashboard stats
export const getDriverStats = query({
  args: { driverId: v.id("users") },
  handler: async (ctx, args) => {
    // Get assigned vehicle
    const vehicle = await ctx.db.query("vehicles")
      .filter((q) => q.eq(q.field("driver_id"), args.driverId))
      .first();
    
    if (!vehicle) {
      return {
        studentsToday: 0,
        onTimeRate: 0,
        safetyRating: 0,
        incidents: 0
      };
    }
    
    // Get today's date
    const today = new Date().toISOString().slice(0, 10);
    
    // Get boarding logs for today
    const todayBoardingLogs = await ctx.db.query("boarding_logs")
      .filter((q) => q.eq(q.field("vehicle_id"), vehicle._id))
      .filter((q) => q.eq(q.field("driver_id"), args.driverId))
      .filter((q) => q.gte(q.field("timestamp"), today))
      .collect();
    
    // Get incidents for this driver
    const incidents = await ctx.db.query("incidents")
      .filter((q) => q.eq(q.field("reporter_id"), args.driverId))
      .filter((q) => q.gte(q.field("timestamp"), today))
      .collect();
    
    // Count unique students today
    const uniqueStudents = new Set(todayBoardingLogs.map(log => log.student_id));
    
    return {
      studentsToday: uniqueStudents.size,
      onTimeRate: 98.5, // This would be calculated from actual timing data
      safetyRating: 4.9, // This would be calculated from feedback
      incidents: incidents.length
    };
  },
});

// End trip
export const endTrip = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number()
    })
  },
  handler: async (ctx, args) => {
    // Get current tracking entry
    const currentTracking = await ctx.db.query("live_tracking")
      .filter((q) => q.eq(q.field("vehicle_id"), args.vehicleId))
      .order("desc")
      .first();
    
    if (!currentTracking) {
      throw new Error("No active trip found for this vehicle");
    }
    
    // Update tracking entry to completed
    await ctx.db.patch(currentTracking._id, {
      coordinates: args.coordinates,
      timestamp: new Date().toISOString(),
      trip_status: "completed",
      students_on_board: 0
    });
    
    return { success: true };
  },
});