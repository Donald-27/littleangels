import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all branches
export const getBranches = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("branches").collect();
  },
});

// Get all students with their guardian info
export const getStudents = query({
  args: { branchId: v.optional(v.id("branches")) },
  handler: async (ctx, args) => {
    let studentsQuery = ctx.db.query("students");
    
    if (args.branchId) {
      studentsQuery = studentsQuery.filter((q) => q.eq(q.field("branch_id"), args.branchId));
    }
    
    const students = await studentsQuery.collect();
    
    // Get guardian info for each student
    const studentsWithGuardians = await Promise.all(
      students.map(async (student) => {
        const guardians = await Promise.all(
          student.guardian_ids.map(async (guardianId) => {
            return await ctx.db.get(guardianId);
          })
        );
        
        // Get route info
        const route = student.route_id ? await ctx.db.get(student.route_id) : null;
        
        return {
          ...student,
          guardians: guardians.filter(Boolean),
          route
        };
      })
    );
    
    return studentsWithGuardians;
  },
});

// Get all vehicles
export const getVehicles = query({
  args: { branchId: v.optional(v.id("branches")) },
  handler: async (ctx, args) => {
    let vehiclesQuery = ctx.db.query("vehicles");
    
    if (args.branchId) {
      vehiclesQuery = vehiclesQuery.filter((q) => q.eq(q.field("branch_id"), args.branchId));
    }
    
    const vehicles = await vehiclesQuery.collect();
    
    // Get driver info for each vehicle
    const vehiclesWithDrivers = await Promise.all(
      vehicles.map(async (vehicle) => {
        const driver = vehicle.driver_id ? await ctx.db.get(vehicle.driver_id) : null;
        const conductor = vehicle.conductor_id ? await ctx.db.get(vehicle.conductor_id) : null;
        
        return {
          ...vehicle,
          driver,
          conductor
        };
      })
    );
    
    return vehiclesWithDrivers;
  },
});

// Get all routes
export const getRoutes = query({
  args: { branchId: v.optional(v.id("branches")) },
  handler: async (ctx, args) => {
    let routesQuery = ctx.db.query("routes");
    
    if (args.branchId) {
      routesQuery = routesQuery.filter((q) => q.eq(q.field("branch_id"), args.branchId));
    }
    
    const routes = await routesQuery.collect();
    
    // Get vehicle and students info for each route
    const routesWithDetails = await Promise.all(
      routes.map(async (route) => {
        const vehicle = await ctx.db.get(route.vehicle_id);
        const students = await ctx.db.query("students")
          .filter((q) => q.eq(q.field("route_id"), route._id))
          .collect();
        
        return {
          ...route,
          vehicle,
          studentsCount: students.length,
          students
        };
      })
    );
    
    return routesWithDetails;
  },
});

// Get all users by role
export const getUsersByRole = query({
  args: { 
    role: v.union(v.literal("admin"), v.literal("driver"), v.literal("conductor"), v.literal("parent"), v.literal("teacher")),
    branchId: v.optional(v.id("branches"))
  },
  handler: async (ctx, args) => {
    let usersQuery = ctx.db.query("users").filter((q) => q.eq(q.field("role"), args.role));
    
    if (args.branchId) {
      usersQuery = usersQuery.filter((q) => q.eq(q.field("branch_id"), args.branchId));
    }
    
    return await usersQuery.collect();
  },
});

// Add a new student
export const addStudent = mutation({
  args: {
    studentId: v.string(),
    name: v.string(),
    grade: v.union(
      v.literal("PP1"), v.literal("PP2"),
      v.literal("Grade 1"), v.literal("Grade 2"), v.literal("Grade 3"),
      v.literal("Grade 4"), v.literal("Grade 5"), v.literal("Grade 6"),
      v.literal("Grade 7"), v.literal("Grade 8"), v.literal("Grade 9")
    ),
    branchId: v.id("branches"),
    className: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    admissionDate: v.string(),
    photoUrl: v.optional(v.string()),
    medicalInfo: v.object({
      allergies: v.array(v.string()),
      conditions: v.array(v.string()),
      medications: v.array(v.string()),
      emergency_notes: v.string(),
    }),
    pickupLocation: v.string(),
    routeId: v.optional(v.id("routes")),
    guardianName: v.string(),
    guardianEmail: v.string(),
    guardianPhone: v.string(),
    guardianAddress: v.string()
  },
  handler: async (ctx, args) => {
    // Generate QR code
    const qrCode = `HV${args.studentId}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
    
    // Create parent/guardian user
    const guardianId = await ctx.db.insert("users", {
      auth_id: `parent_${args.studentId}`,
      name: args.guardianName,
      email: args.guardianEmail,
      phone: args.guardianPhone,
      role: "parent",
      address: args.guardianAddress,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      notification_preferences: {
        email: true,
        sms: true,
        whatsapp: true,
        push: true
      }
    });
    
    // Create student
    const studentId = await ctx.db.insert("students", {
      student_id: args.studentId,
      name: args.name,
      grade: args.grade,
      branch_id: args.branchId,
      class_name: args.className,
      date_of_birth: args.dateOfBirth,
      gender: args.gender,
      admission_date: args.admissionDate,
      photo_url: args.photoUrl,
      qr_code: qrCode,
      medical_info: args.medicalInfo,
      route_id: args.routeId,
      pickup_location: args.pickupLocation,
      guardian_ids: [guardianId],
      status: "active",
      fees_status: "paid"
    });
    
    // Send welcome notification to parent
    await ctx.db.insert("notifications", {
      user_id: guardianId,
      title: "Welcome to Happy Valley Transport System!",
      message: `Your child ${args.name} has been successfully registered. You can now track their bus and receive real-time updates.`,
      type: "announcement",
      priority: "medium",
      read: false,
      timestamp: new Date().toISOString(),
      data: {
        student_id: studentId
      },
      delivery_status: {
        push: true,
        email: true,
        sms: false,
        whatsapp: false
      }
    });
    
    return { success: true, studentId, guardianId, qrCode };
  },
});

// Add a new vehicle
export const addVehicle = mutation({
  args: {
    registration: v.string(),
    type: v.union(v.literal("bus"), v.literal("nissan")),
    capacity: v.number(),
    color: v.string(),
    model: v.string(),
    year: v.number(),
    branchId: v.id("branches"),
    driverId: v.optional(v.id("users")),
    conductorId: v.optional(v.id("users")),
    lastServiceDate: v.string(),
    insuranceExpiry: v.string()
  },
  handler: async (ctx, args) => {
    const vehicleId = await ctx.db.insert("vehicles", {
      registration: args.registration,
      type: args.type,
      capacity: args.capacity,
      color: args.color,
      model: args.model,
      year: args.year,
      branch_id: args.branchId,
      driver_id: args.driverId,
      conductor_id: args.conductorId,
      status: "active",
      last_service_date: args.lastServiceDate,
      insurance_expiry: args.insuranceExpiry
    });
    
    return { success: true, vehicleId };
  },
});

// Add a new route
export const addRoute = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    branchId: v.id("branches"),
    vehicleId: v.id("vehicles"),
    stops: v.array(v.object({
      name: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number()
      }),
      time: v.string(),
      students_count: v.number()
    })),
    distanceKm: v.number(),
    estimatedDurationMinutes: v.number(),
    color: v.string(),
    morningStartTime: v.string(),
    eveningStartTime: v.string()
  },
  handler: async (ctx, args) => {
    const routeId = await ctx.db.insert("routes", {
      name: args.name,
      description: args.description,
      branch_id: args.branchId,
      vehicle_id: args.vehicleId,
      stops: args.stops,
      distance_km: args.distanceKm,
      estimated_duration_minutes: args.estimatedDurationMinutes,
      color: args.color,
      status: "active",
      morning_start_time: args.morningStartTime,
      evening_start_time: args.eveningStartTime
    });
    
    return { success: true, routeId };
  },
});

// Delete student
export const deleteStudent = mutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.studentId);
    return { success: true };
  },
});

// Delete vehicle  
export const deleteVehicle = mutation({
  args: { vehicleId: v.id("vehicles") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.vehicleId);
    return { success: true };
  },
});

// Delete route
export const deleteRoute = mutation({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.routeId);
    return { success: true };
  },
});

// Get dashboard stats
export const getDashboardStats = query({
  args: { branchId: v.optional(v.id("branches")) },
  handler: async (ctx, args) => {
    let studentsQuery = ctx.db.query("students");
    let vehiclesQuery = ctx.db.query("vehicles");
    let routesQuery = ctx.db.query("routes");
    
    if (args.branchId) {
      studentsQuery = studentsQuery.filter((q) => q.eq(q.field("branch_id"), args.branchId));
      vehiclesQuery = vehiclesQuery.filter((q) => q.eq(q.field("branch_id"), args.branchId));
      routesQuery = routesQuery.filter((q) => q.eq(q.field("branch_id"), args.branchId));
    }
    
    const [students, vehicles, routes] = await Promise.all([
      studentsQuery.collect(),
      vehiclesQuery.collect(),
      routesQuery.collect()
    ]);
    
    const activeVehicles = vehicles.filter(v => v.status === "active");
    const activeRoutes = routes.filter(r => r.status === "active");
    
    return {
      totalStudents: students.length,
      activeVehicles: activeVehicles.length,
      activeRoutes: activeRoutes.length,
      onTimeRate: 98.5, // This would be calculated from actual tracking data
      studentsToday: students.filter(s => s.status === "active").length
    };
  },
});