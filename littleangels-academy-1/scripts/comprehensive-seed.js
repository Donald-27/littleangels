import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

console.log('🚀 Starting COMPREHENSIVE seed for Little Angels Academy...')
console.log('📊 Creating: 100 students, 7 buses, 5 drivers, 3 cooks, 4 cleaners, 1 headteacher, 2 accounts personnel')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable!')
  console.log('💡 Run: SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/comprehensive-seed.js')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { 
  auth: { persistSession: false }
})

// Kenyan names for realistic data
const kenyanFirstNames = {
  male: ['Aiden', 'Brian', 'Collins', 'Dennis', 'Emmanuel', 'Felix', 'George', 'Harrison', 'Ian', 'James', 'Kevin', 'Lewis', 'Michael', 'Nathan', 'Oscar', 'Patrick', 'Robert', 'Samuel', 'Timothy', 'Victor', 'Wesley', 'Xavier', 'Yusuf', 'Zachary', 'Caleb', 'Daniel', 'Elijah', 'Frank', 'Henry', 'Isaac'],
  female: ['Abigail', 'Brenda', 'Catherine', 'Diana', 'Elizabeth', 'Faith', 'Grace', 'Hannah', 'Irene', 'Joy', 'Karen', 'Linda', 'Mary', 'Nancy', 'Olivia', 'Priscilla', 'Rachel', 'Sarah', 'Teresa', 'Violet', 'Winnie', 'Yvonne', 'Zipporah', 'Angela', 'Betty', 'Christine', 'Dorothy', 'Esther', 'Florence', 'Gloria']
}

const kenyanLastNames = ['Kiprop', 'Mutai', 'Korir', 'Chebet', 'Kiprotich', 'Wanjiku', 'Mwangi', 'Otieno', 'Njoroge', 'Kamau', 'Wanjiru', 'Kimani', 'Ochieng', 'Achieng', 'Maina', 'Kariuki', 'Nyambura', 'Juma', 'Mohamed', 'Ali', 'Ouma', 'Chepkoech', 'Rotich', 'Kiptoo', 'Cheruiyot']

const kenyanStreets = ['Kenyatta Avenue', 'Uhuru Highway', 'Moi Avenue', 'Kimathi Street', 'Tom Mboya Street', 'Harambee Avenue', 'Jogoo Road', 'Outering Road', 'Thika Road', 'Ngong Road']
const kenyanEstate = ['Kilimani', 'Westlands', 'South C', 'Lavington', 'Parklands', 'Karen', 'Langata', 'Embakasi', 'Kasarani', 'Ruaka', 'Kileleshwa', 'South B', 'Buruburu', 'Donholm', 'Pipeline']

function randomName(gender) {
  const firstName = kenyanFirstNames[gender][Math.floor(Math.random() * kenyanFirstNames[gender].length)]
  const lastName = kenyanLastNames[Math.floor(Math.random() * kenyanLastNames.length)]
  return `${firstName} ${lastName}`
}

function randomPhone() {
  return `+2547${Math.floor(10000000 + Math.random() * 90000000)}`
}

function randomAddress() {
  const street = kenyanStreets[Math.floor(Math.random() * kenyanStreets.length)]
  const estate = kenyanEstate[Math.floor(Math.random() * kenyanEstate.length)]
  const houseNo = Math.floor(Math.random() * 500) + 1
  return `House ${houseNo}, ${street}, ${estate}, Nairobi`
}

function randomDateOfBirth(minAge, maxAge) {
  const today = new Date()
  const birthYear = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1) + minAge)
  const month = Math.floor(Math.random() * 12)
  const day = Math.floor(Math.random() * 28) + 1
  return new Date(birthYear, month, day).toISOString().split('T')[0]
}

// Generate realistic Nairobi coordinates with slight variations
function generateNairobiCoordinates() {
  // Base coordinates for Nairobi area (Eldoret region for Little Angels)
  const baseLat = -1.2921
  const baseLng = 36.8219
  
  // Add random variation within ~10km radius
  const latVariation = (Math.random() - 0.5) * 0.15
  const lngVariation = (Math.random() - 0.5) * 0.15
  
  return {
    lat: baseLat + latVariation,
    lng: baseLng + lngVariation
  }
}

async function createOrUpdateUser(email, password, name, role, schoolId, phone = null) {
  console.log(`👤 Creating/updating user: ${email} (${role})`)
  
  try {
    const { data: authRes, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role, school_id: schoolId }
    })
    
    if (authError && authError.code !== 'email_exists' && !authError.message?.includes('already registered')) {
      throw authError
    }
    
    let userId
    if (authError?.code === 'email_exists' || authError?.message?.includes('already registered')) {
      console.log(`  ↳ User exists, fetching...`)
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users?.users?.find(u => u.email === email)
      if (!existingUser) throw new Error(`User ${email} not found after creation attempt`)
      
      userId = existingUser.id
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { name },
        app_metadata: { role, school_id: schoolId }
      })
    } else {
      userId = authRes.user.id
    }

    // Upsert profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email,
        name,
        role,
        school_id: schoolId,
        is_active: true,
        phone: phone || randomPhone(),
        address: randomAddress(),
        preferences: {
          language: 'en',
          notifications: { sms: true, email: true, whatsapp: false, push: true },
          theme: 'light'
        }
      }, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single()
    
    if (profileError) throw profileError
    console.log(`  ✅ ${name} (${role})`)
    return profile
    
  } catch (error) {
    console.error(`  ❌ Error creating user ${email}:`, error.message)
    throw error
  }
}

async function clearExistingData() {
  console.log('\n🧹 Clearing existing data...')
  
  // Clear in order to respect foreign keys
  const tables = [
    'boarding_logs',
    'attendance', 
    'trips', 
    'payments', 
    'notifications', 
    'messages', 
    'chats',
    'live_tracking',
    'maintenance_logs',
    'alerts',
    'students',
    'routes',
    'vehicles'
  ]
  
  for (const table of tables) {
    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
    console.log(`  ✅ Cleared ${table}`)
  }
  
  console.log('✅ Data cleared successfully\n')
}

async function seed() {
  try {
    // Clear existing data first
    await clearExistingData()
    
    // 1. Create/Get School
    console.log('🏫 Creating school...')
    const { data: school, error: schoolError } = await supabase
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
      .select()
      .single()
    
    if (schoolError) throw schoolError
    const schoolId = school.id
    console.log(`✅ School: ${school.name}\n`)

    // 2. Create Staff (1 admin/headteacher, 2 accounts, 5 drivers, 3 cooks, 4 cleaners)
    console.log('👥 Creating staff...')
    
    // Headteacher (Admin)
    const headteacher = await createOrUpdateUser(
      'admin@littleangels.com',
      'admin123',
      'Dr. Margaret Wanjiru',
      'admin',
      schoolId,
      '+254712345001'
    )

    // Accounts Personnel
    const accounts1 = await createOrUpdateUser(
      'accounts1@littleangels.com',
      'accounts123',
      'John Kamau',
      'accounts',
      schoolId,
      '+254712345002'
    )

    const accounts2 = await createOrUpdateUser(
      'accounts2@littleangels.com',
      'accounts123',
      'Mary Njoroge',
      'accounts',
      schoolId,
      '+254712345003'
    )

    // 5 Drivers
    const driverNames = [
      'James Kiprop', 'Peter Mutai', 'David Korir', 'Samuel Otieno', 'Joseph Kimani'
    ]
    const drivers = []
    for (let i = 0; i < 5; i++) {
      const driver = await createOrUpdateUser(
        `driver${i + 1}@littleangels.com`,
        'driver123',
        driverNames[i],
        'driver',
        schoolId,
        `+25471234500${i + 4}`
      )
      drivers.push(driver)
    }

    // 3 Cooks
    const cookNames = ['Grace Achieng', 'Faith Wanjiku', 'Elizabeth Chebet']
    const cooks = []
    for (let i = 0; i < 3; i++) {
      const cook = await createOrUpdateUser(
        `cook${i + 1}@littleangels.com`,
        'cook123',
        cookNames[i],
        'support',
        schoolId,
        `+25471234501${i}`
      )
      cooks.push(cook)
    }

    // 4 Cleaners
    const cleanerNames = ['Sarah Mwangi', 'Agnes Nyambura', 'Jane Wanjiru', 'Lucy Achieng']
    const cleaners = []
    for (let i = 0; i < 4; i++) {
      const cleaner = await createOrUpdateUser(
        `cleaner${i + 1}@littleangels.com`,
        'cleaner123',
        cleanerNames[i],
        'support',
        schoolId,
        `+25471234512${i}`
      )
      cleaners.push(cleaner)
    }

    console.log(`\n✅ Created ${1 + 2 + 5 + 3 + 4} staff members\n`)

    // 3. Create 7 Buses
    console.log('🚌 Creating 7 buses...')
    const buses = []
    const busData = [
      { plate: 'KBZ 123A', make: 'Toyota', model: 'Coaster', color: 'Yellow', capacity: 35 },
      { plate: 'KCA 456B', make: 'Nissan', model: 'Civilian', color: 'White', capacity: 30 },
      { plate: 'KDA 789C', make: 'Isuzu', model: 'Elf', color: 'Blue', capacity: 25 },
      { plate: 'KBB 012D', make: 'Mitsubishi', model: 'Rosa', color: 'Red', capacity: 28 },
      { plate: 'KCC 345E', make: 'Toyota', model: 'Hiace', color: 'Silver', capacity: 14 },
      { plate: 'KDD 678F', make: 'Ford', model: 'Transit', color: 'White', capacity: 16 },
      { plate: 'KAA 901G', make: 'Mercedes', model: 'Sprinter', color: 'Black', capacity: 20 }
    ]

    for (let i = 0; i < 7; i++) {
      const { data: bus, error } = await supabase
        .from('vehicles')
        .insert({
          plate_number: busData[i].plate,
          make: busData[i].make,
          model: busData[i].model,
          year: 2020 + Math.floor(Math.random() * 4),
          capacity: busData[i].capacity,
          type: 'bus',
          color: busData[i].color,
          driver_id: drivers[i % 5].id, // Rotate drivers
          gps_device_id: `GPS-${1000 + i}`,
          status: 'active',
          insurance: {
            provider: 'Britam Insurance',
            policyNumber: `POL-${10000 + i}`,
            expiryDate: '2025-12-31',
            coverage: 'Comprehensive'
          },
          licenses: {
            drivingLicense: `DL-${20000 + i}`,
            roadworthyCertificate: `RW-${30000 + i}`,
            inspectionDate: '2024-06-01',
            expiryDate: '2025-06-01'
          },
          maintenance_info: {
            lastService: '2024-09-01',
            nextService: '2024-12-01',
            mileage: Math.floor(Math.random() * 50000) + 10000,
            serviceInterval: 5000
          },
          features: ['gps', 'ac', 'safety_belts', 'fire_extinguisher', 'first_aid'],
          school_id: schoolId
        })
        .select()
        .single()

      if (error) throw error
      buses.push(bus)
      console.log(`  ✅ ${bus.make} ${bus.model} - ${bus.plate_number}`)
    }
    
    console.log(`\n✅ Created ${buses.length} buses\n`)

    // 4. Create Routes for each bus
    console.log('🛣️  Creating routes...')
    const routes = []
    const routeNames = [
      'Kilimani - Westlands Route',
      'South C - CBD Route',
      'Karen - Langata Route',
      'Embakasi - Donholm Route',
      'Kasarani - Roysambu Route',
      'Ruaka - Kiambu Route',
      'Thika Road Express'
    ]

    for (let i = 0; i < 7; i++) {
      const stops = []
      const numStops = Math.floor(Math.random() * 3) + 5 // 5-7 stops
      
      for (let j = 0; j < numStops; j++) {
        const coords = generateNairobiCoordinates()
        stops.push({
          id: `stop-${i}-${j}`,
          name: `${kenyanEstate[Math.floor(Math.random() * kenyanEstate.length)]} Stop ${j + 1}`,
          location: {
            lat: coords.lat,
            lng: coords.lng,
            address: randomAddress()
          },
          arrivalTime: `0${6 + j}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          order: j + 1,
          students: []
        })
      }

      const { data: route, error } = await supabase
        .from('routes')
        .insert({
          name: routeNames[i],
          description: `${routeNames[i]} - Morning and afternoon service`,
          vehicle_id: buses[i].id,
          driver_id: drivers[i % 5].id,
          stops: stops,
          distance: (Math.random() * 20 + 10).toFixed(2), // 10-30 km
          estimated_duration: Math.floor(Math.random() * 30) + 45, // 45-75 minutes
          schedule: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
          },
          fuel_consumption: (Math.random() * 5 + 8).toFixed(2), // 8-13 km/l
          toll_fees: Math.floor(Math.random() * 500),
          is_active: true,
          school_id: schoolId
        })
        .select()
        .single()

      if (error) throw error
      routes.push(route)
      console.log(`  ✅ ${route.name}`)
    }

    console.log(`\n✅ Created ${routes.length} routes\n`)

    // 5. Create 100 Students with Parents
    console.log('👶 Creating 100 students with parents...')
    const students = []
    const parents = []
    const grades = ['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']
    const classes = ['A', 'B', 'C', 'D']

    for (let i = 0; i < 100; i++) {
      const gender = Math.random() > 0.5 ? 'male' : 'female'
      const studentName = randomName(gender)
      const parentGender = Math.random() > 0.5 ? 'male' : 'female'
      const parentName = `${parentGender === 'male' ? 'Mr.' : 'Mrs.'} ${studentName.split(' ')[1]}`
      const parentEmail = `parent${i + 1}@littleangels.com`
      
      // Create parent
      const parent = await createOrUpdateUser(
        parentEmail,
        'parent123',
        parentName,
        'parent',
        schoolId
      )
      parents.push(parent)

      // Assign to route (distribute across 7 routes)
      const assignedRoute = routes[i % 7]
      
      // Generate home location from one of the route stops
      const stopIndex = Math.floor(Math.random() * assignedRoute.stops.length)
      const homeStop = assignedRoute.stops[stopIndex]
      const homeLocation = {
        lat: homeStop.location.lat + (Math.random() - 0.5) * 0.01, // Slight variation
        lng: homeStop.location.lng + (Math.random() - 0.5) * 0.01,
        address: randomAddress()
      }

      // Create student
      const { data: student, error } = await supabase
        .from('students')
        .insert({
          student_id: `LA${(i + 1).toString().padStart(4, '0')}`,
          name: studentName,
          date_of_birth: randomDateOfBirth(4, 14), // 4-14 years old
          grade: grades[Math.floor(Math.random() * grades.length)],
          class: classes[Math.floor(Math.random() * classes.length)],
          gender: gender,
          qr_code: `QR-LA-${(i + 1).toString().padStart(4, '0')}`,
          parent_id: parent.id,
          route_id: assignedRoute.id,
          address: homeLocation, // Save home location here!
          medical_info: {
            allergies: Math.random() > 0.8 ? ['Peanuts'] : [],
            medications: [],
            conditions: [],
            bloodType: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)],
            doctorContact: randomPhone()
          },
          emergency_contacts: [
            {
              name: parentName,
              relationship: parentGender === 'male' ? 'Father' : 'Mother',
              phone: parent.phone,
              isPrimary: true
            }
          ],
          transport_info: {
            needsTransport: true,
            pickupPoint: homeStop.name,
            dropoffPoint: 'Little Angels School',
            homeLocation: homeLocation, // Also save here for easy access
            specialInstructions: ''
          },
          academic_info: {
            admissionDate: '2024-01-15',
            currentTerm: 2,
            previousSchool: ''
          },
          is_active: true,
          school_id: schoolId
        })
        .select()
        .single()

      if (error) throw error
      students.push(student)
      
      if ((i + 1) % 20 === 0) {
        console.log(`  ✅ Created ${i + 1}/100 students...`)
      }
    }

    console.log(`\n✅ Created ${students.length} students with ${parents.length} parents\n`)

    // 6. Create sample attendance records for the last 7 days
    console.log('📝 Creating sample attendance records...')
    let attendanceCount = 0
    
    for (let day = 0; day < 7; day++) {
      const date = new Date()
      date.setDate(date.getDate() - day)
      const dateStr = date.toISOString().split('T')[0]
      
      for (const student of students) {
        const status = Math.random() > 0.9 ? 'absent' : Math.random() > 0.95 ? 'late' : 'present'
        
        await supabase.from('attendance').insert({
          student_id: student.id,
          route_id: student.route_id,
          vehicle_id: routes.find(r => r.id === student.route_id)?.vehicle_id,
          driver_id: routes.find(r => r.id === student.route_id)?.driver_id,
          date: dateStr,
          pickup_time: status !== 'absent' ? `${dateStr}T06:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00Z` : null,
          status: status,
          school_id: schoolId
        })
        attendanceCount++
      }
    }
    
    console.log(`✅ Created ${attendanceCount} attendance records\n`)

    // 7. Create sample payments
    console.log('💰 Creating sample payment records...')
    let paymentCount = 0
    
    for (const student of students) {
      // Create 3 months of transport fees
      for (let month = 0; month < 3; month++) {
        const date = new Date()
        date.setMonth(date.getMonth() - month)
        const status = month === 0 ? (Math.random() > 0.7 ? 'pending' : 'completed') : 'completed'
        
        await supabase.from('payments').insert({
          transaction_id: `TXN-${Date.now()}-${student.id.substring(0, 8)}-${month}`,
          student_id: student.id,
          parent_id: student.parent_id,
          amount: 5000, // KES 5000 per month
          currency: 'KES',
          description: `Transport Fee - ${date.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
          type: 'transport_fee',
          method: ['mpesa', 'bank_transfer', 'cash'][Math.floor(Math.random() * 3)],
          status: status,
          due_date: new Date(date.getFullYear(), date.getMonth(), 5).toISOString().split('T')[0],
          paid_at: status === 'completed' ? new Date(date.getFullYear(), date.getMonth(), Math.floor(Math.random() * 28) + 1).toISOString() : null,
          school_id: schoolId
        })
        paymentCount++
      }
    }
    
    console.log(`✅ Created ${paymentCount} payment records\n`)

    // 8. Create sample trips for the last 5 days
    console.log('🚗 Creating sample trip records...')
    let tripCount = 0
    
    for (let day = 0; day < 5; day++) {
      const date = new Date()
      date.setDate(date.getDate() - day)
      const dateStr = date.toISOString().split('T')[0]
      
      for (const route of routes) {
        // Morning trip
        await supabase.from('trips').insert({
          route_id: route.id,
          vehicle_id: route.vehicle_id,
          driver_id: route.driver_id,
          date: dateStr,
          start_time: `${dateStr}T06:00:00Z`,
          end_time: `${dateStr}T07:30:00Z`,
          start_mileage: Math.floor(Math.random() * 100000),
          end_mileage: Math.floor(Math.random() * 100000) + 50,
          status: 'completed',
          school_id: schoolId
        })
        tripCount++
        
        // Afternoon trip
        await supabase.from('trips').insert({
          route_id: route.id,
          vehicle_id: route.vehicle_id,
          driver_id: route.driver_id,
          date: dateStr,
          start_time: `${dateStr}T15:00:00Z`,
          end_time: `${dateStr}T16:30:00Z`,
          start_mileage: Math.floor(Math.random() * 100000),
          end_mileage: Math.floor(Math.random() * 100000) + 50,
          status: 'completed',
          school_id: schoolId
        })
        tripCount++
      }
    }
    
    console.log(`✅ Created ${tripCount} trip records\n`)

    // 9. Create sample notifications
    console.log('🔔 Creating sample notifications...')
    
    const sampleNotifications = [
      {
        title: 'Welcome to Little Angels Transport System',
        message: 'Your child has been successfully enrolled in our transport system. Track their journey in real-time!',
        type: 'success',
        priority: 'medium'
      },
      {
        title: 'Bus Arrival Alert',
        message: 'The bus is approximately 10 minutes away from your location.',
        type: 'info',
        priority: 'high'
      },
      {
        title: 'Payment Reminder',
        message: 'Transport fee payment for this month is due in 3 days.',
        type: 'warning',
        priority: 'medium'
      }
    ]

    for (const notif of sampleNotifications) {
      await supabase.from('notifications').insert({
        ...notif,
        recipients: parents.slice(0, 10).map(p => p.id), // Send to first 10 parents
        channels: ['email', 'sms'],
        sent_by: headteacher.id,
        status: 'sent',
        school_id: schoolId
      })
    }
    
    console.log(`✅ Created ${sampleNotifications.length} notifications\n`)

    // Summary
    console.log('\n🎉 SEEDING COMPLETED SUCCESSFULLY!\n')
    console.log('📊 Summary:')
    console.log(`   👥 Staff: 1 headteacher, 2 accounts, 5 drivers, 3 cooks, 4 cleaners`)
    console.log(`   🚌 Buses: ${buses.length}`)
    console.log(`   🛣️  Routes: ${routes.length}`)
    console.log(`   👶 Students: ${students.length}`)
    console.log(`   👨‍👩‍👧 Parents: ${parents.length}`)
    console.log(`   📝 Attendance: ${attendanceCount} records`)
    console.log(`   💰 Payments: ${paymentCount} records`)
    console.log(`   🚗 Trips: ${tripCount} records`)
    console.log(`   🔔 Notifications: ${sampleNotifications.length}`)
    console.log('\n✅ All home locations saved with student records!')
    console.log('\n📧 LOGIN CREDENTIALS:')
    console.log('   Admin: admin@littleangels.com / admin123')
    console.log('   Accounts: accounts1@littleangels.com / accounts123')
    console.log('   Driver: driver1@littleangels.com / driver123')
    console.log('   Parent: parent1@littleangels.com / parent123')
    console.log('\n🚀 System ready for testing!\n')

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

seed()
