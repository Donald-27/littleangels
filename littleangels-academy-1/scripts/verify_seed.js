import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

console.log('🔍 Verifying seeded data in Little Angels Academy database...\n')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

let allPassed = true
let totalChecks = 0
let passedChecks = 0

function check(name, condition, expected, actual) {
  totalChecks++
  if (condition) {
    passedChecks++
    console.log(`✅ ${name}`)
    return true
  } else {
    allPassed = false
    console.log(`❌ ${name}`)
    console.log(`   Expected: ${expected}, Got: ${actual}`)
    return false
  }
}

async function verify() {
  try {
    // Check schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('*')
    
    if (schoolsError) throw schoolsError
    check('Schools table has data', schools.length >= 1, '≥1 school', `${schools.length} schools`)
    
    const school = schools[0]
    const schoolId = school?.id

    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('school_id', schoolId)
    
    if (usersError) throw usersError
    check('Users table has data', users.length >= 5, '≥5 users', `${users.length} users`)
    
    const admins = users.filter(u => u.role === 'admin')
    const parents = users.filter(u => u.role === 'parent')
    const teachers = users.filter(u => u.role === 'teacher')
    const drivers = users.filter(u => u.role === 'driver')
    
    check('Has admin user', admins.length >= 1, '≥1 admin', `${admins.length} admins`)
    check('Has parent users', parents.length >= 2, '≥2 parents', `${parents.length} parents`)
    check('Has teacher users', teachers.length >= 2, '≥2 teachers', `${teachers.length} teachers`)
    check('Has driver users', drivers.length >= 1, '≥1 driver', `${drivers.length} drivers`)

    // Check students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('school_id', schoolId)
    
    if (studentsError) throw studentsError
    check('Students table has data', students.length >= 6, '≥6 students', `${students.length} students`)
    check('Students have QR codes', students.every(s => s.qr_code), 'All have QR codes', students.filter(s => s.qr_code).length)
    check('Students have parent assignments', students.every(s => s.parent_id), 'All have parents', students.filter(s => s.parent_id).length)

    // Check vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('*')
      .eq('school_id', schoolId)
    
    if (vehiclesError) throw vehiclesError
    check('Vehicles table has data', vehicles.length >= 2, '≥2 vehicles', `${vehicles.length} vehicles`)
    check('Vehicles have drivers', vehicles.filter(v => v.driver_id).length >= 1, '≥1 with driver', vehicles.filter(v => v.driver_id).length)

    // Check routes
    const { data: routes, error: routesError } = await supabase
      .from('routes')
      .select('*')
      .eq('school_id', schoolId)
    
    if (routesError) throw routesError
    check('Routes table has data', routes.length >= 3, '≥3 routes', `${routes.length} routes`)
    check('Routes have stops', routes.every(r => r.stops && r.stops.length > 0), 'All have stops', routes.filter(r => r.stops?.length > 0).length)

    // Check notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('school_id', schoolId)
    
    if (notificationsError) throw notificationsError
    check('Notifications table has data', notifications.length >= 5, '≥5 notifications', `${notifications.length} notifications`)

    // Check attendance
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance')
      .select('*')
      .eq('school_id', schoolId)
    
    if (!attendanceError) {
      check('Attendance records exist', attendance.length >= 1, '≥1 record', `${attendance.length} records`)
    }

    // Check payments
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('school_id', schoolId)
    
    if (!paymentsError) {
      check('Payment records exist', payments.length >= 1, '≥1 payment', `${payments.length} payments`)
    }

    // Cross-dashboard consistency checks
    console.log('\n📊 Cross-Dashboard Consistency Checks:')
    
    const studentsWithRoutes = students.filter(s => s.route_id)
    check('Students assigned to routes', studentsWithRoutes.length >= 1, '≥1 student', `${studentsWithRoutes.length} students`)
    
    const routesWithVehicles = routes.filter(r => r.vehicle_id)
    check('Routes assigned to vehicles', routesWithVehicles.length >= 1, '≥1 route', `${routesWithVehicles.length} routes`)

    // Summary
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📈 Verification Summary:`)
    console.log(`   Total Checks: ${totalChecks}`)
    console.log(`   Passed: ${passedChecks}`)
    console.log(`   Failed: ${totalChecks - passedChecks}`)
    console.log(`   Success Rate: ${Math.round((passedChecks / totalChecks) * 100)}%`)
    console.log(`${'='.repeat(60)}\n`)

    if (allPassed) {
      console.log('✅ ALL VERIFICATIONS PASSED! Database is properly seeded.')
      process.exit(0)
    } else {
      console.log('❌ SOME VERIFICATIONS FAILED. Please check the errors above.')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ Verification failed with error:', error.message)
    process.exit(1)
  }
}

verify()
