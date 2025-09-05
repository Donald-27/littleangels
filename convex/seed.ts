import { mutation } from "./_generated/server";

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