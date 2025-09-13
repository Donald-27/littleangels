import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars. Set SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { 
  auth: { persistSession: false },
  db: { schema: 'public' }
})

async function upsertSchool() {
  console.log('🏫 Creating/updating school...')
  const { data, error } = await supabase
    .from('schools')
    .upsert({
      id: '1fd55bdb-517a-4213-a914-8ff59dbfe3ed',
      name: 'Little Angels School',
      address: 'Eldoret-Nakuru Highway, Eldoret, Kenya',
      phone: '+254712345678',
      email: 'info@littleangelsschool.ke',
      website: 'https://littleangelsschool.ke',
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
    }, { 
      onConflict: 'id',
      ignoreDuplicates: false 
    })
    .select('*')
    .single()
  
  if (error) throw error
  return data
}

async function createOrUpdateAuthUser(email, password, name, role, schoolId) {
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
        created_by: 'system',
        account_type: 'school_staff'
      }
    })
    
    if (authError && authError.code !== 'email_exists') {
      throw authError
    }
    
    let userId
    if (authError?.code === 'email_exists') {
      console.log(`  ↳ User exists, updating app_metadata...`)
      // Get existing user
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users.users.find(u => u.email === email)
      if (!existingUser) throw new Error(`User ${email} not found`)
      
      userId = existingUser.id
      
      // Update app_metadata for existing user
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { 
          role, 
          school_id: schoolId,
          created_by: 'system',
          account_type: 'school_staff'
        },
        user_metadata: { name }
      })
      if (updateError) throw updateError
    } else {
      userId = authRes.user.id
      console.log(`  ↳ New user created`)
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
        preferences: {
          language: 'en',
          notifications: {
            sms: true,
            email: true,
            whatsapp: false,
            push: true
          },
          theme: 'light'
        }
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select('*')
      .single()
    
    if (profileError) throw profileError
    console.log(`  ✅ Profile updated: ${name}`)
    return profile
    
  } catch (error) {
    console.error(`  ❌ Error with user ${email}:`, error.message)
    throw error
  }
}

async function seedVehiclesAndRoutes(school, users) {
  console.log('🚌 Creating vehicles and routes...')
  
  const drivers = users.filter(u => u.role === 'driver')
  const teachers = users.filter(u => u.role === 'teacher')
  
  // Create vehicles
  const vehicleData = [
    {
      plate_number: 'KCB 123A',
      make: 'Toyota',
      model: 'Coaster',
      year: 2018,
      capacity: 33,
      type: 'bus',
      color: 'White and Blue',
      driver_id: drivers[0]?.id,
      status: 'active',
      insurance: { 
        provider: 'Jubilee Insurance', 
        policyNumber: 'JUB123456',
        expiryDate: '2025-06-30',
        coverage: 'Comprehensive'
      },
      licenses: { 
        drivingLicense: 'DL123456', 
        roadworthyCertificate: 'RW123456',
        psv: 'PSV789012'
      },
      features: ['GPS Tracking', 'First Aid Kit', 'Fire Extinguisher', 'Speed Governor'],
      school_id: school.id
    },
    {
      plate_number: 'KCC 456B',
      make: 'Nissan',
      model: 'Civilian',
      year: 2019,
      capacity: 28,
      type: 'bus',
      color: 'Yellow and Green',
      driver_id: drivers[0]?.id,
      status: 'active',
      insurance: { 
        provider: 'CIC Insurance', 
        policyNumber: 'CIC987654',
        expiryDate: '2025-08-15',
        coverage: 'Comprehensive'
      },
      licenses: { 
        drivingLicense: 'DL987654', 
        roadworthyCertificate: 'RW987654',
        psv: 'PSV345678'
      },
      features: ['GPS Tracking', 'CCTV', 'First Aid Kit', 'Emergency Exit'],
      school_id: school.id
    }
  ]
  
  const { data: vehicles, error: vehError } = await supabase
    .from('vehicles')
    .upsert(vehicleData, { onConflict: 'plate_number' })
    .select('*')
  
  if (vehError) throw vehError
  console.log(`  ✅ Created ${vehicles.length} vehicles`)
  
  // Create routes
  const routeData = [
    {
      name: 'Eldoret Town Route',
      description: 'Main route covering Eldoret town center and surrounding areas',
      vehicle_id: vehicles[0]?.id,
      driver_id: drivers[0]?.id,
      stops: [
        { name: 'School Gate', coordinates: [35.2697, 0.5143], time: '06:30' },
        { name: 'Eldoret Town Center', coordinates: [35.2697, 0.5200], time: '06:45' },
        { name: 'West Indies Estate', coordinates: [35.2800, 0.5100], time: '07:00' },
        { name: 'Pioneer Estate', coordinates: [35.2750, 0.5180], time: '07:15' }
      ],
      distance: 25.5,
      estimated_duration: 45,
      schedule: {
        monday: true, tuesday: true, wednesday: true, 
        thursday: true, friday: true, saturday: false, sunday: false
      },
      fuel_consumption: 8.5,
      toll_fees: 0,
      is_active: true,
      school_id: school.id
    },
    {
      name: 'Kapsoya - Langas Route',
      description: 'Route covering Kapsoya and Langas residential areas',
      vehicle_id: vehicles[1]?.id,
      driver_id: drivers[0]?.id,
      stops: [
        { name: 'School Gate', coordinates: [35.2697, 0.5143], time: '06:30' },
        { name: 'Kapsoya Center', coordinates: [35.2900, 0.5250], time: '06:50' },
        { name: 'Langas Phase 1', coordinates: [35.2850, 0.5300], time: '07:05' },
        { name: 'Langas Phase 2', coordinates: [35.2820, 0.5320], time: '07:20' }
      ],
      distance: 18.2,
      estimated_duration: 50,
      schedule: {
        monday: true, tuesday: true, wednesday: true, 
        thursday: true, friday: true, saturday: false, sunday: false
      },
      fuel_consumption: 7.2,
      toll_fees: 0,
      is_active: true,
      school_id: school.id
    }
  ]
  
  const { data: routes, error: routeError } = await supabase
    .from('routes')
    .upsert(routeData, { onConflict: 'name,school_id' })
    .select('*')
  
  if (routeError) throw routeError
  console.log(`  ✅ Created ${routes.length} routes`)
  
  return { vehicles, routes }
}

async function seedStudents(school, users, routes) {
  console.log('👨‍👩‍👧‍👦 Creating students...')
  
  const parents = users.filter(u => u.role === 'parent')
  const teachers = users.filter(u => u.role === 'teacher')
  
  const studentData = [
    {
      student_id: 'LA2024001',
      name: 'Aiden Kiprop',
      date_of_birth: '2015-03-15',
      grade: 'Grade 4',
      class: '4A',
      gender: 'male',
      qr_code: 'QR_LA2024001_AIDEN',
      parent_id: parents[0]?.id,
      teacher_id: teachers[0]?.id,
      route_id: routes[0]?.id,
      address: {
        street: '123 Pioneer Estate',
        city: 'Eldoret',
        county: 'Uasin Gishu',
        postal_code: '30100'
      },
      medical_info: {
        allergies: ['Peanuts'],
        medications: [],
        conditions: [],
        bloodType: 'O+',
        doctorContact: '+254712345678'
      },
      emergency_contacts: [
        { name: 'Weldon Korir', relation: 'Father', phone: '+254712345678' },
        { name: 'Grace Korir', relation: 'Mother', phone: '+254712345679' }
      ],
      transport_info: {
        needsTransport: true,
        pickupPoint: 'Pioneer Estate',
        dropoffPoint: 'Pioneer Estate',
        specialInstructions: 'Needs assistance with seatbelt'
      },
      academic_info: {
        admissionDate: '2022-01-15',
        previousSchool: 'Eldoret Primary',
        performanceLevel: 'Above Average'
      },
      school_id: school.id
    },
    {
      student_id: 'LA2024002',
      name: 'Mercy Chebet',
      date_of_birth: '2014-07-22',
      grade: 'Grade 5',
      class: '5B',
      gender: 'female',
      qr_code: 'QR_LA2024002_MERCY',
      parent_id: parents[1]?.id || parents[0]?.id,
      teacher_id: teachers[1]?.id || teachers[0]?.id,
      route_id: routes[1]?.id,
      address: {
        street: '456 Kapsoya Road',
        city: 'Eldoret',
        county: 'Uasin Gishu',
        postal_code: '30100'
      },
      medical_info: {
        allergies: [],
        medications: ['Inhaler for asthma'],
        conditions: ['Mild asthma'],
        bloodType: 'A+',
        doctorContact: '+254712345690'
      },
      emergency_contacts: [
        { name: 'Mary Chebet', relation: 'Mother', phone: '+254712345690' },
        { name: 'Joseph Chebet', relation: 'Father', phone: '+254712345691' }
      ],
      transport_info: {
        needsTransport: true,
        pickupPoint: 'Kapsoya Center',
        dropoffPoint: 'Kapsoya Center',
        specialInstructions: 'Carries inhaler in backpack'
      },
      academic_info: {
        admissionDate: '2021-09-01',
        previousSchool: 'Moi Girls Primary',
        performanceLevel: 'Excellent'
      },
      school_id: school.id
    }
  ]
  
  const { data: students, error: studError } = await supabase
    .from('students')
    .upsert(studentData, { onConflict: 'student_id' })
    .select('*')
  
  if (studError) throw studError
  console.log(`  ✅ Created ${students.length} students`)
  
  return students
}

async function seedNotifications(school, users) {
  console.log('📢 Creating notifications...')
  
  const admin = users.find(u => u.role === 'admin')
  const allUserIds = users.map(u => u.id)
  
  const notificationData = [
    {
      title: 'Welcome to Little Angels Academy',
      message: 'Welcome to our new school management system! You can now track your child\'s transport, view academic progress, and stay updated with school announcements.',
      type: 'info',
      priority: 'high',
      recipients: allUserIds,
      channels: ['push', 'email'],
      sender_id: admin?.id,
      status: 'sent',
      school_id: school.id
    },
    {
      title: 'Term 1 Academic Calendar Released',
      message: 'The academic calendar for Term 1 2024-2025 has been published. Please check your dashboard for important dates including exams, holidays, and parent meetings.',
      type: 'info',
      priority: 'medium',
      recipients: allUserIds,
      channels: ['push'],
      sender_id: admin?.id,
      status: 'sent',
      school_id: school.id
    }
  ]
  
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .upsert(notificationData)
    .select('*')
  
  if (notifError) throw notifError
  console.log(`  ✅ Created ${notifications.length} notifications`)
  
  return notifications
}

async function seedPayments(school, students, users) {
  console.log('💰 Creating payment records...')
  
  const paymentData = students.flatMap(student => [
    {
      transaction_id: `TXN_${student.student_id}_TERM1_2024`,
      student_id: student.id,
      parent_id: student.parent_id,
      amount: 15000.00,
      currency: 'KES',
      description: 'Term 1 2024-2025 Transport Fee',
      type: 'transport_fee',
      method: 'mpesa',
      status: 'completed',
      payment_details: {
        mpesaCode: 'QK7X8YZ123',
        phoneNumber: '+254712345678',
        reference: student.student_id
      },
      due_date: '2024-09-15',
      paid_at: '2024-09-10T10:30:00Z',
      receipt: `RCPT_${student.student_id}_TERM1`,
      school_id: school.id
    }
  ])
  
  const { data: payments, error: payError } = await supabase
    .from('payments')
    .upsert(paymentData, { onConflict: 'transaction_id' })
    .select('*')
  
  if (payError) throw payError
  console.log(`  ✅ Created ${payments.length} payment records`)
  
  return payments
}

async function seedAttendance(school, students, routes, vehicles, users) {
  console.log('📋 Creating attendance records...')
  
  const drivers = users.filter(u => u.role === 'driver')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  const attendanceData = students.flatMap(student => [
    {
      student_id: student.id,
      route_id: student.route_id,
      vehicle_id: routes.find(r => r.id === student.route_id)?.vehicle_id,
      driver_id: drivers[0]?.id,
      date: yesterday,
      pickup_time: '2024-09-12T06:45:00Z',
      pickup_location: { name: 'Pioneer Estate', coordinates: [35.2750, 0.5180] },
      dropoff_time: '2024-09-12T16:30:00Z',
      dropoff_location: { name: 'Pioneer Estate', coordinates: [35.2750, 0.5180] },
      status: 'present',
      scanned_by: drivers[0]?.id,
      notes: 'On time pickup and dropoff',
      parent_notified: true,
      school_id: school.id
    },
    {
      student_id: student.id,
      route_id: student.route_id,
      vehicle_id: routes.find(r => r.id === student.route_id)?.vehicle_id,
      driver_id: drivers[0]?.id,
      date: today,
      pickup_time: '2024-09-13T06:50:00Z',
      pickup_location: { name: 'Pioneer Estate', coordinates: [35.2750, 0.5180] },
      status: 'present',
      scanned_by: drivers[0]?.id,
      notes: 'Slightly late pickup due to traffic',
      parent_notified: true,
      school_id: school.id
    }
  ])
  
  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .upsert(attendanceData, { onConflict: 'student_id,date' })
    .select('*')
  
  if (attError) throw attError
  console.log(`  ✅ Created ${attendance.length} attendance records`)
  
  return attendance
}

async function seedSettings(school) {
  console.log('⚙️ Creating system settings...')
  
  const settingsData = [
    {
      key: 'transport_fee_term1',
      value: { amount: 15000, currency: 'KES', dueDate: '2024-09-15' },
      category: 'fees',
      description: 'Transport fee for Term 1 2024-2025',
      is_public: true,
      school_id: school.id
    },
    {
      key: 'pickup_time_morning',
      value: { start: '06:30', end: '07:30' },
      category: 'transport',
      description: 'Morning pickup time window',
      is_public: true,
      school_id: school.id
    },
    {
      key: 'dropoff_time_evening',
      value: { start: '16:00', end: '17:00' },
      category: 'transport',
      description: 'Evening dropoff time window',
      is_public: true,
      school_id: school.id
    }
  ]
  
  const { data: settings, error: setError } = await supabase
    .from('settings')
    .upsert(settingsData, { onConflict: 'key,school_id' })
    .select('*')
  
  if (setError) throw setError
  console.log(`  ✅ Created ${settings.length} settings`)
  
  return settings
}

async function enterpriseSeed() {
  console.log('🚀 Starting Enterprise Seed Process...')
  console.log('====================================')
  
  try {
    // Create school
    const school = await upsertSchool()
    console.log(`✅ School: ${school.name}`)
    
    // Create users with proper app_metadata
    const users = []
    const userSpecs = [
      ['kipropdonald27@gmail.com', 'admin123', 'Donald Kiprop', 'admin'],
      ['weldonkorir305@gmail.com', 'parent123', 'Weldon Korir', 'parent'],
      ['parent1@example.com', 'parent123', 'Mary Chebet', 'parent'],
      ['teacher1@school.com', 'teacher123', 'Sarah Mutai', 'teacher'],
      ['teacher2@school.com', 'teacher123', 'David Kiprotich', 'teacher'],
      ['driver1@school.com', 'driver123', 'John Mwangi', 'driver'],
      ['accounts@school.com', 'accounts123', 'Grace Wanjiku', 'accounts']
    ]
    
    for (const [email, password, name, role] of userSpecs) {
      const profile = await createOrUpdateAuthUser(email, password, name, role, school.id)
      users.push(profile)
    }
    
    console.log(`✅ Users: ${users.length} profiles created/updated`)
    
    // Create transport infrastructure
    const { vehicles, routes } = await seedVehiclesAndRoutes(school, users)
    
    // Create students
    const students = await seedStudents(school, users, routes)
    
    // Create notifications
    const notifications = await seedNotifications(school, users)
    
    // Create payments
    const payments = await seedPayments(school, students, users)
    
    // Create attendance
    const attendance = await seedAttendance(school, students, routes, vehicles, users)
    
    // Create settings
    const settings = await seedSettings(school)
    
    console.log('')
    console.log('🎉 ENTERPRISE SEED COMPLETE!')
    console.log('============================')
    console.log(`📊 Summary:`)
    console.log(`  • School: ${school.name}`)
    console.log(`  • Users: ${users.length}`)
    console.log(`  • Students: ${students.length}`)
    console.log(`  • Vehicles: ${vehicles.length}`)
    console.log(`  • Routes: ${routes.length}`)
    console.log(`  • Notifications: ${notifications.length}`)
    console.log(`  • Payments: ${payments.length}`)
    console.log(`  • Attendance Records: ${attendance.length}`)
    console.log(`  • Settings: ${settings.length}`)
    console.log('')
    console.log('🔐 Test Accounts:')
    userSpecs.forEach(([email, password, name, role]) => {
      console.log(`  • ${role.toUpperCase()}: ${email} / ${password}`)
    })
    
  } catch (error) {
    console.error('❌ Seed error:', error)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run enterprise seeding
enterpriseSeed()