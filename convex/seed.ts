import { mutation } from "./_generated/server";

export const fullSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data first
    await clearAllData(ctx);
    
    // Create Happy Valley Chepkanga school branch
    const branches = [];
    
    const branchData = [
      {
        name: "Happy Valley Chepkanga Primary School",
        location: "Chepkanga, Eldoret",
        address: "Chepkanga Road, P.O. Box 1247 Eldoret 30100, Kenya",
        coordinates: { lat: 0.5320, lng: 35.3100 },
        phone: "+254712345678",
        email: "info@happyvalleychepkanga.ac.ke",
        principal: "Mrs. Sarah Jepkosgei Kiprotich",
        established: "2010",
        students_count: 280,
        color: "#10B981"
      }
    ];

    for (const branch of branchData) {
      const branchId = await ctx.db.insert("branches", branch);
      branches.push({ id: branchId, ...branch });
    }

    const mainBranch = branches[0];

    // Create admin users
    const adminUsers = [];
    const adminData = [
      {
        auth_id: "admin_1",
        name: "Mr. David Kimutai Kigen", 
        email: "admin@happyvalleychepkanga.ac.ke",
        phone: "+254712345678",
        role: "admin" as const,
        branch_id: mainBranch.id,
        employee_id: "ADM001",
        address: "Chepkanga, Eldoret",
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        notification_preferences: {
          email: true,
          sms: true,
          whatsapp: true,
          push: true
        }
      }
    ];

    for (const admin of adminData) {
      const adminId = await ctx.db.insert("users", admin);
      adminUsers.push({ id: adminId, ...admin });
    }

    // Create drivers
    const drivers = [];
    const driverData = [
      {
        auth_id: "driver_1",
        name: "Moses Kiprop Rono",
        email: "moses.rono@happyvalleychepkanga.ac.ke", 
        phone: "+254723456789",
        role: "driver" as const,
        branch_id: mainBranch.id,
        employee_id: "DRV001",
        license_number: "DL123456789",
        emergency_contact: "+254734567890",
        address: "Pioneer Estate, Eldoret",
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        notification_preferences: {
          email: true,
          sms: true,
          whatsapp: false,
          push: true
        }
      },
      {
        auth_id: "driver_2", 
        name: "John Kiptoo Sang",
        email: "john.sang@happyvalleychepkanga.ac.ke",
        phone: "+254734567890",
        role: "driver" as const,
        branch_id: mainBranch.id,
        employee_id: "DRV002",
        license_number: "DL987654321",
        emergency_contact: "+254745678901",
        address: "Langas Estate, Eldoret", 
        created_at: new Date().toISOString(),
        last_active: new Date().toISOString(),
        notification_preferences: {
          email: true,
          sms: true,
          whatsapp: true,
          push: true
        }
      }
    ];

    for (const driver of driverData) {
      const driverId = await ctx.db.insert("users", driver);
      drivers.push({ id: driverId, ...driver });
    }

    // Create vehicles
    const vehicles = [];
    const vehicleData = [
      {
        registration: "KBY 245C",
        type: "bus" as const,
        capacity: 32,
        color: "Yellow",
        model: "Isuzu NPR",
        year: 2020,
        branch_id: mainBranch.id,
        driver_id: drivers[0].id,
        status: "active" as const,
        last_service_date: "2024-01-15",
        insurance_expiry: "2024-12-31"
      },
      {
        registration: "KCA 156D",
        type: "bus" as const,
        capacity: 28,
        color: "Blue",
        model: "Toyota Coaster",
        year: 2019,
        branch_id: mainBranch.id,
        driver_id: drivers[1].id,
        status: "active" as const,
        last_service_date: "2024-01-20",
        insurance_expiry: "2024-11-30"
      },
      {
        registration: "KBZ 890F",
        type: "nissan" as const,
        capacity: 14,
        color: "White",
        model: "Nissan Urvan",
        year: 2021,
        branch_id: mainBranch.id,
        status: "active" as const,
        last_service_date: "2024-02-01",
        insurance_expiry: "2025-01-31"
      }
    ];

    for (const vehicle of vehicleData) {
      const vehicleId = await ctx.db.insert("vehicles", vehicle);
      vehicles.push({ id: vehicleId, ...vehicle });
    }

    // Create routes
    const routes = [];
    const routeData = [
      {
        name: "Route 1 - Pioneer Estate",
        description: "Main route covering Pioneer Estate and surrounding areas",
        branch_id: mainBranch.id,
        vehicle_id: vehicles[0].id,
        stops: [
          {
            name: "Happy Valley School",
            coordinates: { lat: 0.5320, lng: 35.3100 },
            time: "06:30",
            students_count: 0
          },
          {
            name: "Kimumu Shopping Center",
            coordinates: { lat: 0.5280, lng: 35.2950 },
            time: "06:45", 
            students_count: 8
          },
          {
            name: "West Indies Junction",
            coordinates: { lat: 0.5250, lng: 35.2850 },
            time: "07:00",
            students_count: 6
          },
          {
            name: "Pioneer Estate Stage",
            coordinates: { lat: 0.5200, lng: 35.2800 },
            time: "07:15",
            students_count: 12
          },
          {
            name: "Langas Market",
            coordinates: { lat: 0.5150, lng: 35.2900 },
            time: "07:30",
            students_count: 6
          }
        ],
        distance_km: 18.5,
        estimated_duration_minutes: 65,
        color: "#EF4444",
        status: "active" as const,
        morning_start_time: "06:30",
        evening_start_time: "16:00"
      },
      {
        name: "Route 2 - Hospital Area",
        description: "Route covering Hospital roundabout and nearby estates",
        branch_id: mainBranch.id,
        vehicle_id: vehicles[1].id,
        stops: [
          {
            name: "Happy Valley School",
            coordinates: { lat: 0.5320, lng: 35.3100 },
            time: "06:30",
            students_count: 0
          },
          {
            name: "Hospital Roundabout",
            coordinates: { lat: 0.5100, lng: 35.2750 },
            time: "06:50",
            students_count: 10
          },
          {
            name: "Kapsoya Estate",
            coordinates: { lat: 0.5050, lng: 35.2700 },
            time: "07:10",
            students_count: 8
          },
          {
            name: "Sunshine Estate",
            coordinates: { lat: 0.5080, lng: 35.2650 },
            time: "07:25",
            students_count: 5
          }
        ],
        distance_km: 14.2,
        estimated_duration_minutes: 55,
        color: "#3B82F6",
        status: "active" as const,
        morning_start_time: "06:30", 
        evening_start_time: "16:00"
      }
    ];

    for (const route of routeData) {
      const routeId = await ctx.db.insert("routes", route);
      routes.push({ id: routeId, ...route });
    }

    // Create parent users and students
    const parents = [];
    const students = [];
    const studentData = [
      {
        student: {
          student_id: "HV24001",
          name: "Abigail Jepchumba Chepkemoi",
          grade: "Grade 5" as const,
          branch_id: mainBranch.id,
          class_name: "Grade 5A",
          date_of_birth: "2014-03-15",
          gender: "female" as const,
          admission_date: "2022-01-10",
          photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
          qr_code: "HV2024001ABC",
          medical_info: {
            allergies: [],
            conditions: [],
            medications: [],
            emergency_notes: "None"
          },
          route_id: null,
          pickup_location: "Pioneer Estate Stage",
          guardian_ids: [],
          status: "active" as const,
          fees_status: "paid" as const
        },
        parent: {
          auth_id: "parent_1",
          name: "Mary Jepchumba Cheruiyot",
          email: "mary.cheruiyot@gmail.com",
          phone: "+254701234567",
          role: "parent" as const,
          address: "Pioneer Estate, House No. 45, Eldoret",
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          notification_preferences: {
            email: true,
            sms: true,
            whatsapp: true,
            push: true
          }
        }
      },
      {
        student: {
          student_id: "HV24002",
          name: "Brian Kiprotich Kemboi",
          grade: "Grade 7" as const,
          branch_id: mainBranch.id,
          class_name: "Grade 7B", 
          date_of_birth: "2012-07-22",
          gender: "male" as const,
          admission_date: "2020-01-15",
          qr_code: "HV2024002DEF",
          medical_info: {
            allergies: [],
            conditions: [],
            medications: [],
            emergency_notes: "None"
          },
          route_id: null,
          pickup_location: "Kimumu Shopping Center",
          guardian_ids: [],
          status: "active" as const,
          fees_status: "paid" as const
        },
        parent: {
          auth_id: "parent_2",
          name: "Peter Kiprotich Bett",
          email: "peter.bett@gmail.com", 
          phone: "+254702345678",
          role: "parent" as const,
          address: "Kimumu Estate, Plot 12, Eldoret",
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          notification_preferences: {
            email: true,
            sms: true,
            whatsapp: false,
            push: true
          }
        }
      },
      {
        student: {
          student_id: "HV24003",
          name: "Grace Chebet Mutai",
          grade: "Grade 6" as const,
          branch_id: mainBranch.id,
          class_name: "Grade 6A",
          date_of_birth: "2013-11-08",
          gender: "female" as const,
          admission_date: "2021-01-08",
          qr_code: "HV2024003GHI",
          medical_info: {
            allergies: ["Peanuts"],
            conditions: [],
            medications: [],
            emergency_notes: "Allergic to peanuts - carry EpiPen"
          },
          route_id: null,
          pickup_location: "Hospital Roundabout",
          guardian_ids: [],
          status: "active" as const,
          fees_status: "paid" as const
        },
        parent: {
          auth_id: "parent_3",
          name: "Ruth Chebet Korir",
          email: "ruth.korir@yahoo.com",
          phone: "+254703456789",
          role: "parent" as const,
          address: "Kapsoya Estate, Block C-4, Eldoret",
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString(),
          notification_preferences: {
            email: true,
            sms: true,
            whatsapp: true,
            push: true
          }
        }
      }
    ];

    for (const data of studentData) {
      const parentId = await ctx.db.insert("users", data.parent);
      parents.push({ id: parentId, ...data.parent });
      
      const studentRecord = {
        ...data.student,
        guardian_ids: [parentId],
        route_id: routes[0].id
      };
      
      const studentId = await ctx.db.insert("students", studentRecord);
      students.push({ id: studentId, ...studentRecord });
    }

    // Create some sample notifications
    const notifications = [];
    for (const parent of parents) {
      const notificationData = [
        {
          user_id: parent.id,
          title: "Welcome to Happy Valley Transport System!",
          message: "Your account has been set up successfully. You can now track your child's bus and receive real-time updates.",
          type: "announcement" as const,
          priority: "medium" as const,
          read: false,
          timestamp: new Date().toISOString(),
          delivery_status: {
            push: true,
            email: true,
            sms: false,
            whatsapp: false
          }
        }
      ];
      
      for (const notif of notificationData) {
        const notifId = await ctx.db.insert("notifications", notif);
        notifications.push({ id: notifId, ...notif });
      }
    }

    // Create some sample eco metrics
    for (const student of students) {
      const ecoMetrics = {
        student_id: student.id,
        month: "2024-02",
        trips_count: 38,
        distance_km: 456.8,
        co2_saved_kg: 12.4,
        fuel_saved_liters: 5.2,
        calculated_at: new Date().toISOString()
      };
      
      await ctx.db.insert("eco_metrics", ecoMetrics);
    }

    // Create some sample rewards
    for (const student of students) {
      const rewardData = [
        {
          student_id: student.id,
          type: "perfect_attendance" as const,
          title: "Perfect Attendance",
          description: "30 consecutive school days",
          points: 50,
          badge_color: "#FFC107",
          earned_date: "2024-01-30",
          month: "2024-01",
          criteria_met: "30 days without absence",
          icon: "⭐"
        }
      ];
      
      for (const reward of rewardData) {
        await ctx.db.insert("rewards", reward);
      }
    }

    return {
      success: true,
      message: `Successfully seeded Happy Valley Chepkanga school with complete data`,
      data: {
        branches: branches.length,
        admins: adminUsers.length,
        drivers: drivers.length,
        vehicles: vehicles.length,
        routes: routes.length,
        parents: parents.length,
        students: students.length,
        notifications: notifications.length
      }
    };
  },
});

// Helper function to clear all data
async function clearAllData(ctx: any) {
  const tables = [
    "notifications", "boarding_logs", "live_tracking", "attendance", 
    "eco_metrics", "rewards", "payments", "incidents", "lost_items", 
    "events", "guardian_substitutions", "students", "routes", 
    "vehicles", "users", "branches", "settings"
  ];
  
  for (const table of tables) {
    try {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    } catch (error) {
      // Table might not exist yet, continue
    }
  }
}

export const quickSeed = mutation({
  args: {},
  handler: async (ctx) => {
    // Create a few sample branches for Eldoret
    const branches = [];
    
    const branchData = [
      {
        name: "Eldoret Main Campus",
        location: "Eldoret CBD",
        address: "Uganda Road, opposite Eldoret Sports Club, P.O. Box 125 Eldoret 30100",
        coordinates: { lat: 0.5143, lng: 35.2697 },
        phone: "+254701234567",
        email: "main@smartschooltransport.ac.ke",
        principal: "Dr. Margaret Jepkosgei Rotich",
        established: "1995",
        students_count: 85,
        color: "#FF6B6B"
      },
      {
        name: "Pioneer Branch",
        location: "Pioneer Estate", 
        address: "Pioneer Estate, near Pioneer High School, P.O. Box 890 Eldoret 30100",
        coordinates: { lat: 0.5200, lng: 35.2800 },
        phone: "+254702345678",
        email: "pioneer@smartschooltransport.ac.ke",
        principal: "Prof. John Kiprotich Sang",
        established: "2008",
        students_count: 65,
        color: "#4ECDC4"
      },
      {
        name: "Langas Branch",
        location: "Langas Estate",
        address: "Langas Shopping Center, next to Equity Bank, P.O. Box 450 Eldoret 30100", 
        coordinates: { lat: 0.5050, lng: 35.2900 },
        phone: "+254703456789",
        email: "langas@smartschooltransport.ac.ke",
        principal: "Mrs. Grace Chebet Koech",
        established: "2012",
        students_count: 50,
        color: "#45B7D1"
      }
    ];

    for (const branch of branchData) {
      const branchId = await ctx.db.insert("branches", branch);
      branches.push({ id: branchId, ...branch });
    }

    // Create sample admin user
    const adminId = await ctx.db.insert("users", {
      auth_id: "sample_admin",
      name: "Admin User",
      email: "admin@smartschooltransport.ac.ke",
      phone: "+254700000000",
      role: "admin",
      branch_id: branches[0].id,
      employee_id: "EMP001",
      address: "Eldoret CBD",
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      notification_preferences: {
        email: true,
        sms: true,
        whatsapp: true,
        push: true
      }
    });

    return {
      success: true,
      message: `Seeded ${branches.length} branches with admin user`,
      branches: branches.length
    };
  },
});

export const clearData = mutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["users", "branches"];
    
    for (const table of tables) {
      const docs = await ctx.db.query(table as any).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
    }
    
    return { success: true, message: "Sample data cleared" };
  },
});