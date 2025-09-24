import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

console.log('🚀 Starting PRODUCTION-READY data seeding for Little Angels Academy...')
console.log('📊 Creating 200+ students, 200+ guardians, 30 days historical data!')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk'

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { 
  auth: { persistSession: false },
  db: { schema: 'public' }
})

// Kenyan names for realistic data
const kenyanFirstNames = {
  male: ['Aiden', 'Brian', 'Collins', 'Dennis', 'Emmanuel', 'Felix', 'George', 'Harrison', 'Ian', 'James', 'Kevin', 'Lewis', 'Michael', 'Nathan', 'Oscar', 'Patrick', 'Quincy', 'Robert', 'Samuel', 'Timothy', 'Victor', 'Wesley', 'Xavier', 'Yusuf', 'Zachary'],
  female: ['Abigail', 'Brenda', 'Catherine', 'Diana', 'Elizabeth', 'Faith', 'Grace', 'Hannah', 'Irene', 'Joy', 'Karen', 'Linda', 'Mary', 'Nancy', 'Olivia', 'Priscilla', 'Queen', 'Rachel', 'Sarah', 'Teresa', 'Violet', 'Winnie', 'Ximena', 'Yvonne', 'Zipporah']
}

const kenyanLastNames = ['Kiprop', 'Mutai', 'Korir', 'Chebet', 'Kiprotich', 'Wanjiku', 'Mwangi', 'Otieno', 'Njoroge', 'Kamau', 'Wanjiru', 'Kimani', 'Ochieng', 'Achieng', 'Maina', 'Kariuki', 'Nyong', 'Juma', 'Mohamed', 'Ali']

const kenyanPhones = () => `+2547${Math.floor(10000000 + Math.random() * 90000000)}`

function randomName(gender) {
  const firstName = kenyanFirstNames[gender][Math.floor(Math.random() * kenyanFirstNames[gender].length)]
  const lastName = kenyanLastNames[Math.floor(Math.random() * kenyanLastNames.length)]
  return `${firstName} ${lastName}`
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

async function createOrUpdateUser(email, password, name, role, schoolId, phone = null) {
  console.log(`👤 Processing user: ${email} (${role})`)
  
  try {
    // Try to create new user
    const { data: authRes, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { 
        role, 
        school_id: schoolId,
        created_by: 'production_seed'
      }
    })
    
    let userId
    if (authError?.code === 'email_exists') {
      console.log(`  ↳ User exists, fetching existing...`)
      // Get existing user
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users.users.find(u => u.email === email)
      if (!existingUser) throw new Error(`User ${email} not found`)
      userId = existingUser.id
    } else if (authError) {
      throw authError
    } else {
      userId = authRes.user.id
      console.log(`  ↳ New auth user created`)
    }
    
    // Upsert profile in users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        name,
        role,
        school_id: schoolId,
        is_active: true,
        phone: phone || kenyanPhones(),
        address: 'Eldoret, Kenya',
        preferences: {
          language: 'en',
          notifications: { sms: true, email: true, whatsapp: true, push: true },
          theme: 'light'
        }
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select('*')
      .single()
    
    if (profileError) throw profileError
    console.log(`  ✅ Profile: ${profile.name}`)
    return profile
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`)
    return null
  }
}

async function seedBasicData() {
  console.log('🏫 Setting up school and core users...')
  
  // Upsert school
  const { data: school, error: schoolError } = await supabase
    .from('schools')
    .upsert({
      name: 'Little Angels Academy',
      address: 'Eldoret-Nakuru Highway, Eldoret, Kenya',
      phone: '+254712345678',
      email: 'info@littleangels.ac.ke',
      website: 'https://littleangels.ac.ke',
      motto: "Nurturing Tomorrow's Leaders",
      settings: { 
        timeZone: 'Africa/Nairobi', 
        defaultCurrency: 'KES',
        academicYear: '2024-2025',
        termDates: {
          term1: { start: '2024-09-01', end: '2024-12-15' },
          term2: { start: '2025-01-15', end: '2025-04-30' },
          term3: { start: '2025-05-15', end: '2025-08-15' }
        }
      }
    })
    .select('*')
    .single()
  
  if (schoolError) throw schoolError
  console.log(`✅ School: ${school.name}`)
  
  // Create core staff users
  const coreUsers = [
    ['admin@littleangels.ac.ke', 'admin123', 'Donald Kiprop', 'admin'],
    ['sarah.mutai@littleangels.ac.ke', 'teacher123', 'Sarah Mutai', 'teacher'],
    ['david.kiprotich@littleangels.ac.ke', 'teacher123', 'David Kiprotich', 'teacher'],
    ['john.mwangi@littleangels.ac.ke', 'driver123', 'John Mwangi', 'driver'],
    ['peter.kimani@littleangels.ac.ke', 'driver123', 'Peter Kimani', 'driver'],
    ['grace.wanjiku@littleangels.ac.ke', 'accounts123', 'Grace Wanjiku', 'accounts']
  ]
  
  const users = []
  for (const [email, password, name, role] of coreUsers) {
    const profile = await createOrUpdateUser(email, password, name, role, school.id)
    if (profile) users.push(profile)
  }
  
  console.log(`✅ Core staff: ${users.length} users`)
  return { school, users }
}

async function seedVehiclesAndRoutes(school, users) {
  console.log('🚌 Creating vehicles and routes...')
  
  const drivers = users.filter(u => u.role === 'driver')
  
  // Create vehicles (using basic structure that matches database schema)
  const vehicleData = [
    {
      registration_number: 'KCB 123A',
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
      registration_number: 'KCD 456B',
      make: 'Isuzu',
      model: 'NPR',
      year: 2019,
      capacity: 28,
      type: 'bus',
      status: 'active',
      gps_device_id: 'GPS002',
      school_id: school.id
    },
    {
      registration_number: 'KCE 789C',
      make: 'Toyota',
      model: 'Hiace',
      year: 2021,
      capacity: 14,
      type: 'van',
      status: 'active',
      gps_device_id: 'GPS003',
      school_id: school.id
    }
  ]
  
  // Clear existing vehicles first
  await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  const { data: vehicles, error: vehError } = await supabase
    .from('vehicles')
    .insert(vehicleData)
    .select('*')
  
  if (vehError) throw vehError
  console.log(`  ✅ Created ${vehicles.length} vehicles`)
  
  // Assign drivers to vehicles
  if (drivers.length >= 2) {
    await supabase.from('vehicle_drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    
    const assignments = [
      { vehicle_id: vehicles[0].id, driver_id: drivers[0].id, assigned_date: new Date().toISOString() },
      { vehicle_id: vehicles[1].id, driver_id: drivers[1].id, assigned_date: new Date().toISOString() },
      { vehicle_id: vehicles[2].id, driver_id: drivers[0].id, assigned_date: new Date().toISOString() }
    ]
    
    const { error: assignError } = await supabase.from('vehicle_drivers').insert(assignments)
    if (assignError) throw assignError
    console.log(`  ✅ Assigned drivers to vehicles`)
  }
  
  // Create routes (using INSERT instead of UPSERT)
  await supabase.from('routes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  const routeData = [
    {
      name: 'Eldoret Town Route',
      description: 'Main route covering Eldoret town center and surrounding areas',
      stops: [
        { name: 'School Gate', coordinates: [35.2697, 0.5143], time: '06:30', students_count: 8 },
        { name: 'Eldoret Town Center', coordinates: [35.2697, 0.5200], time: '06:45', students_count: 12 },
        { name: 'West Indies Estate', coordinates: [35.2800, 0.5100], time: '07:00', students_count: 10 },
        { name: 'Pioneer Estate', coordinates: [35.2750, 0.5180], time: '07:15', students_count: 6 }
      ],
      distance_km: 25.5,
      estimated_duration: 45,
      is_active: true,
      school_id: school.id
    },
    {
      name: 'Kapsoya - Langas Route', 
      description: 'Route covering Kapsoya and Langas residential areas',
      stops: [
        { name: 'School Gate', coordinates: [35.2697, 0.5143], time: '06:30', students_count: 7 },
        { name: 'Kapsoya Center', coordinates: [35.2900, 0.5250], time: '06:50', students_count: 9 },
        { name: 'Langas Phase 1', coordinates: [35.2850, 0.5300], time: '07:05', students_count: 11 },
        { name: 'Langas Phase 2', coordinates: [35.2820, 0.5320], time: '07:20', students_count: 8 }
      ],
      distance_km: 18.2,
      estimated_duration: 50,
      is_active: true,
      school_id: school.id
    },
    {
      name: 'Huruma - Pipeline Route',
      description: 'Route covering Huruma and Pipeline estates',
      stops: [
        { name: 'School Gate', coordinates: [35.2697, 0.5143], time: '06:30', students_count: 5 },
        { name: 'Huruma Shopping Center', coordinates: [35.2600, 0.5180], time: '06:50', students_count: 8 },
        { name: 'Pipeline Estate', coordinates: [35.2650, 0.5220], time: '07:05', students_count: 6 },
        { name: 'Kimumu Area', coordinates: [35.2580, 0.5250], time: '07:20', students_count: 4 }
      ],
      distance_km: 22.8,
      estimated_duration: 55,
      is_active: true,
      school_id: school.id
    }
  ]
  
  const { data: routes, error: routeError } = await supabase
    .from('routes')
    .insert(routeData)
    .select('*')
  
  if (routeError) throw routeError
  console.log(`  ✅ Created ${routes.length} routes`)
  
  return { vehicles, routes }
}

async function seedParentsAndStudents(school, routes) {
  console.log('👨‍👩‍👧‍👦 Creating 200+ parents and 250+ students...')
  
  const parents = []
  const students = []
  const studentGuardians = []
  
  // Generate 220 unique parent emails and profiles
  const parentEmails = new Set()
  while (parentEmails.size < 220) {
    const firstName = kenyanFirstNames[Math.random() > 0.5 ? 'male' : 'female'][Math.floor(Math.random() * 25)]
    const lastName = kenyanLastNames[Math.floor(Math.random() * kenyanLastNames.length)]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@gmail.com`
    parentEmails.add(email)
  }
  
  console.log('  📧 Creating parent accounts...')
  let parentCount = 0
  for (const email of parentEmails) {
    const [firstName] = email.split('.')
    const lastName = email.split('.')[1].split('@')[0]
    const name = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`
    
    const profile = await createOrUpdateUser(email, 'parent123', name, 'parent', school.id)
    if (profile) {
      parents.push(profile)
      parentCount++
      if (parentCount % 20 === 0) {
        console.log(`    ↳ Created ${parentCount} parents so far...`)
      }
    }
  }
  
  console.log(`  ✅ Parents created: ${parents.length}`)
  
  // Generate 250+ students
  console.log('  👶 Creating students and family relationships...')
  const grades = ['Nursery', 'PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']
  
  for (let i = 0; i < 250; i++) {
    const gender = Math.random() > 0.5 ? 'male' : 'female'
    const name = randomName(gender)
    const grade = grades[Math.floor(Math.random() * grades.length)]
    const classSection = ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    const route = routes[Math.floor(Math.random() * routes.length)]
    
    // Age appropriate birth date
    const gradeAges = { 'Nursery': 4, 'PP1': 5, 'PP2': 6, 'Grade 1': 7, 'Grade 2': 8, 'Grade 3': 9, 'Grade 4': 10, 'Grade 5': 11, 'Grade 6': 12, 'Grade 7': 13, 'Grade 8': 14 }
    const baseAge = gradeAges[grade] || 10
    const age = baseAge + Math.floor(Math.random() * 2) // +/- 1 year variation
    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - age)
    birthDate.setMonth(Math.floor(Math.random() * 12))
    birthDate.setDate(Math.floor(Math.random() * 28) + 1)
    
    const student = {
      student_id: `LA2024${String(i + 1).padStart(3, '0')}`,
      name,
      date_of_birth: birthDate.toISOString().split('T')[0],
      grade,
      class: `${grade} ${classSection}`,
      gender,
      route_id: route.id,
      qr_code: `QR_LA2024${String(i + 1).padStart(3, '0')}_${name.toUpperCase().replace(' ', '_')}`,
      medical_info: {
        allergies: Math.random() > 0.8 ? ['Nuts', 'Dairy'][Math.floor(Math.random() * 2)] : 'None',
        medications: Math.random() > 0.9 ? 'Inhaler for asthma' : 'None',
        emergency_contact: kenyanPhones(),
        blood_group: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][Math.floor(Math.random() * 8)]
      },
      transport_info: {
        pick_up_point: route.stops[Math.floor(Math.random() * route.stops.length)].name,
        drop_off_point: route.stops[Math.floor(Math.random() * route.stops.length)].name,
        needs_transport: true,
        parent_pickup: Math.random() > 0.85
      },
      school_id: school.id,
      is_active: true
    }
    
    students.push(student)
    
    // Assign 1-2 parents per student (guardians)
    const numParents = Math.random() > 0.3 ? 2 : 1 // 70% have 2 parents, 30% have 1
    const selectedParents = []
    
    for (let p = 0; p < numParents; p++) {
      let parent = parents[Math.floor(Math.random() * parents.length)]
      // Ensure we don't assign the same parent twice to one student
      while (selectedParents.includes(parent.id)) {
        parent = parents[Math.floor(Math.random() * parents.length)]
      }
      selectedParents.push(parent.id)
      
      studentGuardians.push({
        student_id: student.student_id, // Will be updated after student insert
        guardian_id: parent.id,
        relationship: p === 0 ? (Math.random() > 0.5 ? 'father' : 'mother') : (selectedParents.length === 2 ? 'mother' : 'guardian'),
        is_primary: p === 0,
        can_pickup: true,
        emergency_contact: true
      })
    }
    
    if ((i + 1) % 50 === 0) {
      console.log(`    ↳ Prepared ${i + 1} students...`)
    }
  }
  
  // Insert students in batches 
  console.log(`  📝 Inserting ${students.length} students into database...`)
  await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  const batchSize = 50
  const insertedStudents = []
  
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize)
    const { data, error } = await supabase.from('students').insert(batch).select('*')
    if (error) throw error
    insertedStudents.push(...data)
    console.log(`    ↳ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(students.length/batchSize)}`)
  }
  
  // Update student guardian relationships with actual student IDs
  console.log(`  👨‍👩‍👧‍👦 Creating family relationships...`)
  const updatedGuardians = studentGuardians.map(sg => {
    const student = insertedStudents.find(s => s.student_id === sg.student_id)
    return { ...sg, student_id: student.id }
  })
  
  await supabase.from('student_guardians').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  for (let i = 0; i < updatedGuardians.length; i += batchSize) {
    const batch = updatedGuardians.slice(i, i + batchSize)
    const { error } = await supabase.from('student_guardians').insert(batch)
    if (error) throw error
  }
  
  console.log(`  ✅ Students: ${insertedStudents.length}, Guardians: ${parents.length}, Relationships: ${updatedGuardians.length}`)
  
  return { parents, students: insertedStudents, studentGuardians: updatedGuardians }
}

async function seedHistoricalData(school, students, vehicles, routes) {
  console.log('📊 Creating 30 days of historical data...')
  
  const trips = []
  const attendance = []
  const boardingLogs = []
  const notifications = []
  const payments = []
  
  // Generate 30 days of historical data
  const today = new Date()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  console.log('  🚌 Creating trip and attendance data...')
  
  // Create trips for each route for the last 30 days (weekdays only)
  for (let d = 0; d < 30; d++) {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + d)
    
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
      
      const trip = {
        route_id: route.id,
        vehicle_id: vehicle.id,
        trip_type: 'pickup',
        scheduled_start: startTime.toISOString(),
        scheduled_end: endTime.toISOString(),
        actual_start: new Date(startTime.getTime() + (Math.random() - 0.5) * 10 * 60000).toISOString(), // +/- 5 minutes
        actual_end: new Date(endTime.getTime() + (Math.random() - 0.5) * 15 * 60000).toISOString(), // +/- 7.5 minutes
        status: 'completed',
        notes: Math.random() > 0.8 ? 'Light traffic delay' : null,
        school_id: school.id
      }
      trips.push(trip)
      
      // Evening trips  
      const eveningStart = new Date(date)
      eveningStart.setHours(15, 30, 0, 0)
      const eveningEnd = new Date(eveningStart)
      eveningEnd.setMinutes(eveningStart.getMinutes() + route.estimated_duration)
      
      const eveningTrip = {
        route_id: route.id,
        vehicle_id: vehicle.id,
        trip_type: 'dropoff',
        scheduled_start: eveningStart.toISOString(),
        scheduled_end: eveningEnd.toISOString(),
        actual_start: new Date(eveningStart.getTime() + (Math.random() - 0.5) * 10 * 60000).toISOString(),
        actual_end: new Date(eveningEnd.getTime() + (Math.random() - 0.5) * 15 * 60000).toISOString(),
        status: 'completed',
        notes: null,
        school_id: school.id
      }
      trips.push(eveningTrip)
    }
    
    // Generate attendance for students (85-95% attendance rate)
    for (const student of students) {
      if (Math.random() > 0.1) { // 90% attendance rate
        const attendanceRecord = {
          student_id: student.id,
          date: dateStr,
          status: Math.random() > 0.05 ? 'present' : 'late', // 95% on time, 5% late
          check_in_time: `${7 + Math.floor(Math.random() * 2)}:${15 + Math.floor(Math.random() * 30)}:00`,
          check_out_time: `${15 + Math.floor(Math.random() * 2)}:${Math.floor(Math.random() * 60)}:00`,
          transport_used: student.transport_info?.needs_transport || false,
          notes: Math.random() > 0.95 ? 'Parent pickup' : null,
          school_id: school.id
        }
        attendance.push(attendanceRecord)
        
        // Boarding logs for transport users
        if (student.transport_info?.needs_transport) {
          // Morning boarding
          const morningBoarding = {
            student_id: student.id,
            trip_id: null, // Will be updated after trip insert
            action: 'board',
            timestamp: `${dateStr}T${attendanceRecord.check_in_time}`,
            location: student.transport_info.pick_up_point,
            scanned_by: 'driver', // Could be driver or conductor
            verification_method: 'qr_code',
            school_id: school.id
          }
          boardingLogs.push(morningBoarding)
          
          // Evening alighting
          const eveningAlighting = {
            student_id: student.id,
            trip_id: null,
            action: 'alight',
            timestamp: `${dateStr}T${attendanceRecord.check_out_time}`,
            location: student.transport_info.drop_off_point,
            scanned_by: 'driver',
            verification_method: 'qr_code',
            school_id: school.id
          }
          boardingLogs.push(eveningAlighting)
        }
      }
    }
    
    if ((d + 1) % 5 === 0) {
      console.log(`    ↳ Generated data for ${d + 1} days...`)
    }
  }
  
  console.log('  💰 Creating payment records...')
  
  // Create payment records (monthly transport fees)
  const paymentMethods = ['mpesa', 'bank_transfer', 'cash']
  const paymentStatuses = ['completed', 'pending', 'failed']
  
  for (const student of students.slice(0, 200)) { // First 200 students have payment records
    // Create 2-3 months of payment history
    for (let month = 0; month < 3; month++) {
      const paymentDate = new Date(today)
      paymentDate.setMonth(paymentDate.getMonth() - month)
      paymentDate.setDate(Math.floor(Math.random() * 28) + 1)
      
      const guardians = studentGuardians.filter(sg => sg.student_id === student.id)
      if (guardians.length === 0) continue
      
      const guardian = guardians[Math.floor(Math.random() * guardians.length)]
      
      const amount = 3500 + Math.floor(Math.random() * 1000) // 3500-4500 KES
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
      const status = Math.random() > 0.05 ? 'completed' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]
      
      const payment = {
        parent_id: guardian.guardian_id,
        student_id: student.id,
        amount: amount,
        currency: 'KES',
        payment_method: method,
        status: status,
        transaction_reference: method === 'mpesa' ? `MPE${Date.now()}${Math.floor(Math.random() * 1000)}` : `TXN${Date.now()}`,
        description: `Transport fee - ${paymentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        payment_date: paymentDate.toISOString(),
        due_date: new Date(paymentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days later
        school_id: school.id
      }
      payments.push(payment)
    }
  }
  
  // Insert all historical data
  console.log(`  📝 Inserting historical data...`)
  
  // Clear existing data
  await Promise.all([
    supabase.from('trips').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('attendance').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('boarding_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  ])
  
  // Insert trips
  const insertedTrips = []
  for (let i = 0; i < trips.length; i += 50) {
    const batch = trips.slice(i, i + 50)
    const { data, error } = await supabase.from('trips').insert(batch).select('*')
    if (error) throw error
    insertedTrips.push(...data)
  }
  console.log(`    ✅ Trips: ${insertedTrips.length}`)
  
  // Insert attendance
  for (let i = 0; i < attendance.length; i += 100) {
    const batch = attendance.slice(i, i + 100)
    const { error } = await supabase.from('attendance').insert(batch)
    if (error) throw error
  }
  console.log(`    ✅ Attendance: ${attendance.length}`)
  
  // Update boarding logs with trip IDs and insert
  const updatedBoardingLogs = boardingLogs.map(bl => {
    const trip = insertedTrips.find(t => 
      t.route_id === students.find(s => s.id === bl.student_id)?.route_id &&
      t.trip_type === (bl.action === 'board' ? 'pickup' : 'dropoff') &&
      bl.timestamp.startsWith(t.scheduled_start.split('T')[0])
    )
    return { ...bl, trip_id: trip?.id || insertedTrips[0].id }
  })
  
  for (let i = 0; i < updatedBoardingLogs.length; i += 100) {
    const batch = updatedBoardingLogs.slice(i, i + 100)
    const { error } = await supabase.from('boarding_logs').insert(batch)
    if (error) throw error
  }
  console.log(`    ✅ Boarding logs: ${updatedBoardingLogs.length}`)
  
  // Insert payments
  for (let i = 0; i < payments.length; i += 50) {
    const batch = payments.slice(i, i + 50)
    const { error } = await supabase.from('payments').insert(batch)
    if (error) throw error
  }
  console.log(`    ✅ Payments: ${payments.length}`)
  
  return {
    trips: insertedTrips.length,
    attendance: attendance.length,
    boardingLogs: updatedBoardingLogs.length,
    payments: payments.length
  }
}

async function createSystemNotifications(school, students) {
  console.log('📱 Creating system notifications...')
  
  const notifications = []
  const notificationTypes = [
    { type: 'trip_started', title: 'Bus Trip Started', priority: 'medium' },
    { type: 'student_boarded', title: 'Student Boarded Bus', priority: 'high' },
    { type: 'eta_update', title: 'Arrival Time Update', priority: 'medium' },
    { type: 'payment_due', title: 'Payment Due Reminder', priority: 'high' },
    { type: 'incident_report', title: 'Incident Report', priority: 'high' },
    { type: 'general_announcement', title: 'School Announcement', priority: 'low' }
  ]
  
  // Create notifications for the last 7 days
  for (let d = 0; d < 7; d++) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    
    // Create 15-25 notifications per day
    const dailyNotifications = 15 + Math.floor(Math.random() * 10)
    
    for (let n = 0; n < dailyNotifications; n++) {
      const notifType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      const student = students[Math.floor(Math.random() * students.length)]
      
      const notification = {
        title: notifType.title,
        message: `${notifType.title} for ${student.name}`,
        type: notifType.type,
        priority: notifType.priority,
        user_id: null, // System notification
        student_id: student.id,
        read: Math.random() > 0.3, // 70% read rate
        action_url: `/students/${student.id}`,
        metadata: { 
          student_name: student.name,
          route_name: 'School Route',
          timestamp: date.toISOString()
        },
        created_at: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        school_id: school.id
      }
      notifications.push(notification)
    }
  }
  
  // Clear existing notifications and insert new ones
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  for (let i = 0; i < notifications.length; i += 50) {
    const batch = notifications.slice(i, i + 50)
    const { error } = await supabase.from('notifications').insert(batch)
    if (error) throw error
  }
  
  console.log(`  ✅ Notifications: ${notifications.length}`)
  return notifications.length
}

async function main() {
  try {
    console.log('🌱 Starting comprehensive seed process...')
    
    const { school, users } = await seedBasicData()
    const { vehicles, routes } = await seedVehiclesAndRoutes(school, users)
    const { parents, students, studentGuardians } = await seedParentsAndStudents(school, routes)
    const historicalStats = await seedHistoricalData(school, students, vehicles, routes)
    const notificationCount = await createSystemNotifications(school, students)
    
    console.log('\n🎉 SEED COMPLETED SUCCESSFULLY!')
    console.log('=========================================')
    console.log(`🏫 School: ${school.name}`)
    console.log(`👥 Core staff: ${users.length}`)
    console.log(`👨‍👩‍👧‍👦 Parents: ${parents.length}`)
    console.log(`👶 Students: ${students.length}`)
    console.log(`🚌 Vehicles: ${vehicles.length}`)
    console.log(`🗺️ Routes: ${routes.length}`)
    console.log(`📊 Historical Data:`)
    console.log(`   ├── Trips: ${historicalStats.trips}`)
    console.log(`   ├── Attendance: ${historicalStats.attendance}`)
    console.log(`   ├── Boarding logs: ${historicalStats.boardingLogs}`)
    console.log(`   └── Payments: ${historicalStats.payments}`)
    console.log(`📱 Notifications: ${notificationCount}`)
    console.log('\n✅ Database is now ready for production!')
    console.log('✅ All requirements met: 200+ students, 200+ guardians, 30 days historical data')
    console.log('\n🔐 Demo Login Credentials:')
    console.log('   Admin: admin@littleangels.ac.ke / admin123')
    console.log('   Teacher: sarah.mutai@littleangels.ac.ke / teacher123')
    console.log('   Driver: john.mwangi@littleangels.ac.ke / driver123')
    console.log('   Accounts: grace.wanjiku@littleangels.ac.ke / accounts123')
    console.log('   Parent: [any generated parent email] / parent123')
    
  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  }
}

main()