import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // School branches table
  branches: defineTable({
    name: v.string(),
    location: v.string(),
    address: v.string(),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    phone: v.string(),
    email: v.string(),
    principal: v.string(),
    established: v.string(),
    students_count: v.number(),
    color: v.string(), // Brand color for the branch
  }),

  // Vehicles table (buses and nissans)
  vehicles: defineTable({
    registration: v.string(),
    type: v.union(v.literal("bus"), v.literal("nissan")),
    capacity: v.number(),
    color: v.string(),
    model: v.string(),
    year: v.number(),
    branch_id: v.id("branches"),
    driver_id: v.optional(v.id("users")),
    conductor_id: v.optional(v.id("users")),
    status: v.union(v.literal("active"), v.literal("maintenance"), v.literal("inactive")),
    last_service_date: v.string(),
    insurance_expiry: v.string(),
  }).index("by_branch", ["branch_id"])
    .index("by_driver", ["driver_id"])
    .index("by_type", ["type"]),

  // Users table (parents, admins, drivers, conductors)
  users: defineTable({
    auth_id: v.string(), // From auth system
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("parent"),
      v.literal("admin"),
      v.literal("driver"),
      v.literal("conductor"),
      v.literal("teacher")
    ),
    avatar_url: v.optional(v.string()),
    branch_id: v.optional(v.id("branches")),
    employee_id: v.optional(v.string()),
    license_number: v.optional(v.string()), // For drivers
    emergency_contact: v.optional(v.string()),
    address: v.string(),
    created_at: v.string(),
    last_active: v.string(),
    notification_preferences: v.object({
      email: v.boolean(),
      sms: v.boolean(),
      whatsapp: v.boolean(),
      push: v.boolean(),
    }),
  }).index("by_auth_id", ["auth_id"])
    .index("by_role", ["role"])
    .index("by_branch", ["branch_id"])
    .index("by_email", ["email"]),

  // Students table
  students: defineTable({
    student_id: v.string(), // Unique school ID
    name: v.string(),
    grade: v.union(
      v.literal("PP1"), v.literal("PP2"),
      v.literal("Grade 1"), v.literal("Grade 2"), v.literal("Grade 3"),
      v.literal("Grade 4"), v.literal("Grade 5"), v.literal("Grade 6"),
      v.literal("Grade 7"), v.literal("Grade 8"), v.literal("Grade 9")
    ),
    branch_id: v.id("branches"),
    class_name: v.string(),
    date_of_birth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    admission_date: v.string(),
    photo_url: v.optional(v.string()),
    qr_code: v.string(), // Unique QR code for boarding
    medical_info: v.object({
      allergies: v.array(v.string()),
      conditions: v.array(v.string()),
      medications: v.array(v.string()),
      emergency_notes: v.string(),
    }),
    route_id: v.optional(v.id("routes")),
    pickup_location: v.optional(v.string()),
    guardian_ids: v.array(v.id("users")), // Multiple guardians
    status: v.union(v.literal("active"), v.literal("graduated"), v.literal("transferred")),
    fees_status: v.union(v.literal("paid"), v.literal("pending"), v.literal("overdue")),
  }).index("by_branch", ["branch_id"])
    .index("by_grade", ["grade"])
    .index("by_qr_code", ["qr_code"])
    .index("by_route", ["route_id"])
    .index("by_student_id", ["student_id"]),

  // Routes table
  routes: defineTable({
    name: v.string(),
    description: v.string(),
    branch_id: v.id("branches"),
    vehicle_id: v.id("vehicles"),
    stops: v.array(v.object({
      name: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
      time: v.string(), // Expected arrival time
      students_count: v.number(),
    })),
    distance_km: v.number(),
    estimated_duration_minutes: v.number(),
    color: v.string(), // Route color on map
    status: v.union(v.literal("active"), v.literal("suspended")),
    morning_start_time: v.string(),
    evening_start_time: v.string(),
  }).index("by_branch", ["branch_id"])
    .index("by_vehicle", ["vehicle_id"]),

  // Live tracking table
  live_tracking: defineTable({
    vehicle_id: v.id("vehicles"),
    driver_id: v.id("users"),
    coordinates: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    speed: v.number(),
    heading: v.number(),
    timestamp: v.string(),
    trip_status: v.union(
      v.literal("not_started"),
      v.literal("picking_up"),
      v.literal("en_route_to_school"),
      v.literal("at_school"),
      v.literal("returning"),
      v.literal("completed")
    ),
    route_id: v.id("routes"),
    current_stop_index: v.number(),
    students_on_board: v.number(),
    estimated_arrival: v.optional(v.string()),
  }).index("by_vehicle", ["vehicle_id"])
    .index("by_driver", ["driver_id"])
    .index("by_route", ["route_id"])
    .index("by_timestamp", ["timestamp"]),

  // Boarding logs table
  boarding_logs: defineTable({
    student_id: v.id("students"),
    vehicle_id: v.id("vehicles"),
    driver_id: v.id("users"),
    conductor_id: v.optional(v.id("users")),
    action: v.union(v.literal("pickup"), v.literal("dropoff")),
    timestamp: v.string(),
    location: v.object({
      name: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    }),
    qr_scanned: v.boolean(),
    photo_verification: v.optional(v.string()),
    guardian_notified: v.boolean(),
    trip_id: v.optional(v.string()),
  }).index("by_student", ["student_id"])
    .index("by_vehicle", ["vehicle_id"])
    .index("by_timestamp", ["timestamp"])
    .index("by_trip", ["trip_id"]),

  // Notifications table
  notifications: defineTable({
    user_id: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("pickup"),
      v.literal("dropoff"),
      v.literal("delay"),
      v.literal("announcement"),
      v.literal("emergency"),
      v.literal("payment"),
      v.literal("attendance")
    ),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    read: v.boolean(),
    timestamp: v.string(),
    data: v.optional(v.object({
      student_id: v.optional(v.id("students")),
      vehicle_id: v.optional(v.id("vehicles")),
      route_id: v.optional(v.id("routes")),
    })),
    delivery_status: v.object({
      push: v.boolean(),
      email: v.boolean(),
      sms: v.boolean(),
      whatsapp: v.boolean(),
    }),
  }).index("by_user", ["user_id"])
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"])
    .index("by_read_status", ["read"]),

  // Incidents table
  incidents: defineTable({
    reporter_id: v.id("users"), // Driver, conductor, or admin
    student_id: v.optional(v.id("students")),
    vehicle_id: v.id("vehicles"),
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
    timestamp: v.string(),
    location: v.optional(v.object({
      name: v.string(),
      coordinates: v.object({
        lat: v.number(),
        lng: v.number(),
      }),
    })),
    photos: v.array(v.string()), // Storage IDs
    status: v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("closed")
    ),
    resolution: v.optional(v.string()),
    resolved_by: v.optional(v.id("users")),
    resolved_at: v.optional(v.string()),
  }).index("by_reporter", ["reporter_id"])
    .index("by_student", ["student_id"])
    .index("by_vehicle", ["vehicle_id"])
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_timestamp", ["timestamp"]),

  // Lost and found table
  lost_items: defineTable({
    reporter_id: v.id("users"),
    vehicle_id: v.optional(v.id("vehicles")),
    item_name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("clothing"),
      v.literal("electronics"),
      v.literal("books"),
      v.literal("toys"),
      v.literal("accessories"),
      v.literal("other")
    ),
    photos: v.array(v.string()), // Storage IDs
    found_date: v.string(),
    found_location: v.string(),
    claimed_by: v.optional(v.id("users")),
    claimed_date: v.optional(v.string()),
    status: v.union(v.literal("found"), v.literal("claimed"), v.literal("returned")),
    contact_attempts: v.array(v.object({
      method: v.string(),
      timestamp: v.string(),
      success: v.boolean(),
    })),
  }).index("by_reporter", ["reporter_id"])
    .index("by_vehicle", ["vehicle_id"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_found_date", ["found_date"]),

  // Events and announcements table
  events: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("exam"),
      v.literal("meeting"),
      v.literal("holiday"),
      v.literal("sports"),
      v.literal("cultural"),
      v.literal("transport"),
      v.literal("academic"),
      v.literal("emergency")
    ),
    branch_id: v.optional(v.id("branches")), // null means all branches
    grade_level: v.optional(v.string()), // null means all grades
    start_date: v.string(),
    end_date: v.optional(v.string()),
    start_time: v.optional(v.string()),
    end_time: v.optional(v.string()),
    location: v.string(),
    created_by: v.id("users"),
    created_at: v.string(),
    color: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    requires_transport: v.boolean(),
    attachments: v.array(v.string()), // Storage IDs
    attendees_count: v.optional(v.number()),
  }).index("by_branch", ["branch_id"])
    .index("by_type", ["type"])
    .index("by_start_date", ["start_date"])
    .index("by_created_by", ["created_by"]),

  // Attendance records
  attendance: defineTable({
    student_id: v.id("students"),
    date: v.string(), // YYYY-MM-DD format
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused")
    ),
    transport_used: v.boolean(),
    boarding_log_id: v.optional(v.id("boarding_logs")),
    marked_by: v.id("users"),
    marked_at: v.string(),
    notes: v.optional(v.string()),
  }).index("by_student", ["student_id"])
    .index("by_date", ["date"])
    .index("by_student_and_date", ["student_id", "date"]),

  // Guardian substitutions
  guardian_substitutions: defineTable({
    student_id: v.id("students"),
    original_guardian_id: v.id("users"),
    substitute_guardian_id: v.id("users"),
    substitute_name: v.string(),
    substitute_phone: v.string(),
    substitute_relationship: v.string(),
    valid_from: v.string(),
    valid_until: v.string(),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    approved_by: v.optional(v.id("users")),
    approved_at: v.optional(v.string()),
    reason: v.string(),
    verification_photo: v.optional(v.string()), // Storage ID
  }).index("by_student", ["student_id"])
    .index("by_original_guardian", ["original_guardian_id"])
    .index("by_substitute", ["substitute_guardian_id"])
    .index("by_status", ["status"])
    .index("by_valid_dates", ["valid_from", "valid_until"]),

  // Eco metrics tracking
  eco_metrics: defineTable({
    student_id: v.id("students"),
    month: v.string(), // YYYY-MM format
    trips_count: v.number(),
    distance_km: v.number(),
    co2_saved_kg: v.number(),
    fuel_saved_liters: v.number(),
    calculated_at: v.string(),
  }).index("by_student", ["student_id"])
    .index("by_month", ["month"])
    .index("by_student_and_month", ["student_id", "month"]),

  // Payment records (simulation)
  payments: defineTable({
    student_id: v.id("students"),
    guardian_id: v.id("users"),
    amount: v.number(),
    currency: v.string(),
    term: v.string(),
    academic_year: v.string(),
    payment_method: v.union(
      v.literal("mpesa"),
      v.literal("bank_transfer"),
      v.literal("cash"),
      v.literal("cheque")
    ),
    reference_number: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    payment_date: v.string(),
    due_date: v.string(),
    receipt_number: v.string(),
    description: v.string(),
  }).index("by_student", ["student_id"])
    .index("by_guardian", ["guardian_id"])
    .index("by_status", ["status"])
    .index("by_term", ["term"])
    .index("by_payment_date", ["payment_date"]),

  // Rewards and achievements
  rewards: defineTable({
    student_id: v.id("students"),
    type: v.union(
      v.literal("perfect_attendance"),
      v.literal("punctuality"),
      v.literal("eco_champion"),
      v.literal("safety_star"),
      v.literal("good_behavior")
    ),
    title: v.string(),
    description: v.string(),
    points: v.number(),
    badge_color: v.string(),
    earned_date: v.string(),
    month: v.string(), // YYYY-MM
    criteria_met: v.string(),
    icon: v.string(),
  }).index("by_student", ["student_id"])
    .index("by_type", ["type"])
    .index("by_month", ["month"])
    .index("by_earned_date", ["earned_date"]),

  // System settings
  settings: defineTable({
    key: v.string(),
    value: v.union(v.string(), v.number(), v.boolean(), v.object({})),
    category: v.string(),
    description: v.string(),
    updated_by: v.id("users"),
    updated_at: v.string(),
  }).index("by_key", ["key"])
    .index("by_category", ["category"]),
});