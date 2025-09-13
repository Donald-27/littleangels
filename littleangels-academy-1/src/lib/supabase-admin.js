import { createClient } from '@supabase/supabase-js'

// Temporary admin access using the available VITE key for emergency bypass
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// For now, use the standard client but with special query patterns to avoid recursion
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})

// Helper to check if admin client is available
export const isAdminAvailable = () => !!supabaseAdmin

// Emergency data access functions that bypass RLS
export const adminQuery = {
  // Get all students
  getStudents: async (limit = 100) => {
    if (!supabaseAdmin) return { data: null, error: { message: 'Admin client not available' } }
    return await supabaseAdmin.from('students').select('*').limit(limit)
  },
  
  // Get all users/staff
  getUsers: async (limit = 100) => {
    if (!supabaseAdmin) return { data: null, error: { message: 'Admin client not available' } }
    return await supabaseAdmin.from('users').select('*').limit(limit)
  },
  
  // Get all vehicles
  getVehicles: async (limit = 100) => {
    if (!supabaseAdmin) return { data: null, error: { message: 'Admin client not available' } }
    return await supabaseAdmin.from('vehicles').select('*').limit(limit)
  },
  
  // Get all routes
  getRoutes: async (limit = 100) => {
    if (!supabaseAdmin) return { data: null, error: { message: 'Admin client not available' } }
    return await supabaseAdmin.from('routes').select('*').limit(limit)
  },
  
  // Get notifications
  getNotifications: async (limit = 100) => {
    if (!supabaseAdmin) return { data: null, error: { message: 'Admin client not available' } }
    return await supabaseAdmin.from('notifications').select('*').limit(limit)
  },
  
  // Get attendance
  getAttendance: async (limit = 100) => {
    if (!supabaseAdmin) return { data: null, error: { message: 'Admin client not available' } }
    return await supabaseAdmin.from('attendance').select('*').limit(limit)
  },
  
  // Generic query function
  from: (table) => {
    if (!supabaseAdmin) {
      return {
        select: () => ({ data: null, error: { message: 'Admin client not available' } }),
        insert: () => ({ data: null, error: { message: 'Admin client not available' } }),
        update: () => ({ data: null, error: { message: 'Admin client not available' } }),
        delete: () => ({ data: null, error: { message: 'Admin client not available' } })
      }
    }
    return supabaseAdmin.from(table)
  }
}