import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

console.log('🌱 Starting Simple Working Seed for Little Angels Academy...')

// Get credentials from environment 
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY_HERE'

if (!SUPABASE_URL || SERVICE_ROLE_KEY === 'YOUR_SERVICE_KEY_HERE') {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable')
  console.log('💡 Usage: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/simple-working-seed.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { 
  auth: { persistSession: false }
})

async function clearExistingData() {
  console.log('🧹 Clearing existing data...')
  
  // Clear in order to respect foreign keys
  await supabase.from('boarding_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('trips').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('chats').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('student_guardians').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('vehicle_drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('routes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('✅ Existing data cleared')
}

async function seedBasicData() {
  console.log('🏫 Seeding basic data...')
  
  // Get existing school
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .single()
  
  if (!school) {
    console.error('❌ No school found. Please ensure school exists.')
    process.exit(1)
  }
  
  console.log(`✅ Using school: ${school.name}`)
  
  // Create vehicles with correct schema
  const vehicles = [
    {
      registration_number: 'KCB 001A',
      make: 'Toyota',
      model: 'Coaster',
      year: 2020,
      capacity: 33,
      type: 'bus',
      status: 'active',
      gps_device_id: 'GPS001',
      school_id: school.id
    },
    {
      registration_number: 'KCD 002B', 
      make: 'Isuzu',
      model: 'NPR',
      year: 2019,
      capacity: 28,
      type: 'bus',
      status: 'active',
      gps_device_id: 'GPS002',
      school_id: school.id
    }
  ]
  
  const { data: insertedVehicles, error: vehicleError } = await supabase
    .from('vehicles')
    .insert(vehicles)
    .select('*')
  
  if (vehicleError) {
    console.error('❌ Vehicle creation error:', vehicleError)
    throw vehicleError
  }
  
  console.log(`✅ Created ${insertedVehicles.length} vehicles`)
  
  // Create routes with correct schema
  const routes = [
    {
      name: 'Eldoret Town Route',
      description: 'Main route covering Eldoret town center',
      stops: [
        { name: 'School Gate', coordinates: [35.2697, 0.5143], time: '06:30' },
        { name: 'Town Center', coordinates: [35.2697, 0.5200], time: '06:45' },
        { name: 'West Indies', coordinates: [35.2800, 0.5100], time: '07:00' }
      ],
      distance_km: 25.5,
      estimated_duration: 45,
      is_active: true,
      status: 'active',
      school_id: school.id
    },
    {
      name: 'Kapsoya Route',
      description: 'Route covering Kapsoya residential areas', 
      stops: [
        { name: 'School Gate', coordinates: [35.2697, 0.5143], time: '06:30' },
        { name: 'Kapsoya Center', coordinates: [35.2900, 0.5250], time: '06:50' },
        { name: 'Langas Phase 1', coordinates: [35.2850, 0.5300], time: '07:05' }
      ],
      distance_km: 18.2,
      estimated_duration: 50,
      is_active: true,
      status: 'active', 
      school_id: school.id
    }
  ]
  
  const { data: insertedRoutes, error: routeError } = await supabase
    .from('routes')
    .insert(routes)
    .select('*')
  
  if (routeError) {
    console.error('❌ Route creation error:', routeError)
    throw routeError
  }
  
  console.log(`✅ Created ${insertedRoutes.length} routes`)
  
  return { school, vehicles: insertedVehicles, routes: insertedRoutes }
}

async function seedStudentsAndGuardians(school, routes) {
  console.log('👨‍👩‍👧‍👦 Creating students and guardians...')
  
  // Get existing users (guardians)
  const { data: existingUsers } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'parent')
  
  console.log(`📝 Found ${existingUsers?.length || 0} existing parent users`)
  
  // Create sample students with correct schema
  const students = []
  const guardianRelations = []
  
  const grades = ['Nursery', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5']
  const kenyanNames = [
    'Aiden Kiprop', 'Brenda Mutai', 'Collins Korir', 'Diana Chebet',
    'Emmanuel Kiprotich', 'Faith Wanjiku', 'George Mwangi', 'Hannah Otieno',
    'Ian Njoroge', 'Joy Kamau', 'Kevin Wanjiru', 'Linda Kimani', 'Michael Ochieng'
  ]
  
  for (let i = 0; i < 50; i++) {
    const route = routes[Math.floor(Math.random() * routes.length)]
    const grade = grades[Math.floor(Math.random() * grades.length)]
    const name = kenyanNames[Math.floor(Math.random() * kenyanNames.length)]
    
    // Calculate age-appropriate birth date
    const age = 4 + Math.floor(Math.random() * 12) // Ages 4-15
    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - age)
    birthDate.setMonth(Math.floor(Math.random() * 12))
    birthDate.setDate(Math.floor(Math.random() * 28) + 1)
    
    const student = {
      student_id: `LA2024${String(i + 1).padStart(3, '0')}`,
      name: name,
      date_of_birth: birthDate.toISOString().split('T')[0],
      grade: grade,
      class: `${grade} A`,
      gender: Math.random() > 0.5 ? 'male' : 'female',
      route_id: route.id,
      dropoff_location: route.stops[Math.floor(Math.random() * route.stops.length)].name,
      qr_code: `QR_LA2024${String(i + 1).padStart(3, '0')}`,
      medical_info: {
        allergies: Math.random() > 0.8 ? 'None' : 'Nuts',
        medications: 'None',
        emergency_contact: '+254700000000'
      },
      emergency_contacts: [
        { name: 'Parent', phone: '+254700000000', relationship: 'parent' }
      ],
      transport_info: {
        pickup_point: route.stops[0].name,
        dropoff_point: route.stops[Math.floor(Math.random() * route.stops.length)].name,
        needs_transport: true
      },
      academic_info: {
        admission_date: '2024-01-15',
        class_teacher: 'Teacher Name'
      },
      is_active: true,
      school_id: school.id
    }
    
    students.push(student)
  }
  
  // Insert students in batches
  const batchSize = 10
  const insertedStudents = []
  
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize)
    const { data, error } = await supabase
      .from('students')
      .insert(batch)
      .select('*')
    
    if (error) {
      console.error('❌ Student creation error:', error)
      throw error
    }
    
    insertedStudents.push(...data)
    console.log(`  ↳ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(students.length / batchSize)}`)
  }
  
  console.log(`✅ Created ${insertedStudents.length} students`)
  
  // Create guardian relationships if we have parent users
  if (existingUsers && existingUsers.length > 0) {
    for (const student of insertedStudents.slice(0, 20)) { // First 20 students get guardian relationships
      const guardian = existingUsers[Math.floor(Math.random() * existingUsers.length)]
      
      guardianRelations.push({
        student_id: student.id,
        guardian_id: guardian.id,
        relationship: 'parent',
        is_primary: true,
        can_pickup: true,
        emergency_contact: true
      })
    }
    
    if (guardianRelations.length > 0) {
      const { error: guardianError } = await supabase
        .from('student_guardians')
        .insert(guardianRelations)
      
      if (guardianError) {
        console.error('❌ Guardian relationship error:', guardianError)
      } else {
        console.log(`✅ Created ${guardianRelations.length} guardian relationships`)
      }
    }
  }
  
  return insertedStudents
}

async function seedSampleTripsAndAttendance(school, students, routes, vehicles) {
  console.log('📊 Creating sample trips and attendance...')
  
  const trips = []
  const attendance = []
  
  // Create trips for the last 7 days
  for (let d = 0; d < 7; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const dateStr = date.toISOString().split('T')[0]
    
    // Morning trips
    for (const route of routes) {
      const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
      const startTime = new Date(date)
      startTime.setHours(6, 30, 0, 0)
      
      const endTime = new Date(startTime)
      endTime.setMinutes(startTime.getMinutes() + route.estimated_duration)
      
      trips.push({
        route_id: route.id,
        vehicle_id: vehicle.id,
        trip_type: 'pickup',
        scheduled_start: startTime.toISOString(),
        scheduled_end: endTime.toISOString(),
        actual_start: startTime.toISOString(),
        actual_end: endTime.toISOString(),
        status: 'completed',
        school_id: school.id
      })
    }
    
    // Create attendance for some students
    const dailyStudents = students.slice(0, 30) // First 30 students attend daily
    for (const student of dailyStudents) {
      if (Math.random() > 0.1) { // 90% attendance rate
        attendance.push({
          student_id: student.id,
          date: dateStr,
          status: 'present',
          check_in_time: `07:${15 + Math.floor(Math.random() * 30)}:00`,
          check_out_time: `15:${Math.floor(Math.random() * 60)}:00`,
          transport_used: true,
          school_id: school.id
        })
      }
    }
  }
  
  // Insert trips
  if (trips.length > 0) {
    const { error: tripError } = await supabase
      .from('trips')
      .insert(trips)
    
    if (tripError) {
      console.error('❌ Trip creation error:', tripError)
    } else {
      console.log(`✅ Created ${trips.length} trips`)
    }
  }
  
  // Insert attendance
  if (attendance.length > 0) {
    const { error: attendanceError } = await supabase
      .from('attendance')
      .insert(attendance)
    
    if (attendanceError) {
      console.error('❌ Attendance creation error:', attendanceError)
    } else {
      console.log(`✅ Created ${attendance.length} attendance records`)
    }
  }
  
  return { trips: trips.length, attendance: attendance.length }
}

async function main() {
  try {
    await clearExistingData()
    const { school, vehicles, routes } = await seedBasicData()
    const students = await seedStudentsAndGuardians(school, routes)
    const stats = await seedSampleTripsAndAttendance(school, students, routes, vehicles)
    
    console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!')
    console.log('===============================')
    console.log(`🏫 School: ${school.name}`)
    console.log(`🚌 Vehicles: ${vehicles.length}`)
    console.log(`🗺️ Routes: ${routes.length}`)
    console.log(`👶 Students: ${students.length}`)
    console.log(`🚌 Trips: ${stats.trips}`)
    console.log(`📋 Attendance: ${stats.attendance}`)
    
    console.log('\n🔐 Demo Login Credentials:')
    console.log('   Admin: admin@littleangels.ac.ke / admin123')
    console.log('   Teacher: sarah.mutai@littleangels.ac.ke / teacher123')
    console.log('   Driver: john.mwangi@littleangels.ac.ke / driver123')
    console.log('   Parent: [check existing users in database]')
    
    console.log('\n✅ Database is ready for application development!')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

main()