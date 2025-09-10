import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars. Set SUPABASE_URL/VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

async function upsertSchool() {
  const { data, error } = await supabase
    .from('schools')
    .upsert({
      name: 'Little Angels School',
      address: 'Eldoret-Nakuru Highway, Eldoret, Kenya',
      phone: '+254712345678',
      email: 'info@littleangelsschool.ke',
      website: 'https://littleangelsschool.ke',
      motto: "Nurturing Tomorrow's Leaders",
      settings: { timeZone: 'Africa/Nairobi', defaultCurrency: 'KES' }
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

async function createAuthUser(email, password, name, role, schoolId) {
  // Create auth user
  const { data: authRes, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role }
  })
  if (authError) throw authError

  const userId = authRes.user.id

  // Insert profile row
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .upsert({
      id: userId,
      email,
      name,
      role,
      school_id: schoolId,
      is_active: true
    })
    .select('*')
    .single()
  if (profileError) throw profileError
  return profile
}

async function seed() {
  console.log('🌱 Seeding Supabase data...')
  const school = await upsertSchool()
  console.log('School:', school.name)

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
    const profile = await createAuthUser(email, password, name, role, school.id)
    users.push(profile)
    console.log(`User (${role}):`, email)
  }

  const parents = users.filter(u => u.role === 'parent')
  const teachers = users.filter(u => u.role === 'teacher')
  const drivers = users.filter(u => u.role === 'driver')

  // Vehicles
  const { data: vehicles, error: vehError } = await supabase
    .from('vehicles')
    .insert([
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
        insurance: { provider: 'Jubilee', policyNumber: 'JUB123' },
        licenses: { drivingLicense: 'DL123', roadworthyCertificate: 'RW123' },
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
        insurance: { provider: 'CIC', policyNumber: 'CIC987' },
        licenses: { drivingLicense: 'DL987', roadworthyCertificate: 'RW987' },
        school_id: school.id
      }
    ])
    .select('*')
  if (vehError) throw vehError

  // Routes
  const { data: routes, error: routeError } = await supabase
    .from('routes')
    .insert([
      {
        name: 'Kapsabet Route',
        description: 'Main route covering Kapsabet Road and surrounding areas',
        vehicle_id: vehicles[0].id,
        driver_id: drivers[0]?.id,
        stops: [],
        distance: 15.5,
        estimated_duration: 35,
        schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true },
        is_active: true,
        school_id: school.id
      },
      {
        name: 'Pioneer Route',
        description: 'Route covering Pioneer Estate and nearby residential areas',
        vehicle_id: vehicles[1].id,
        driver_id: drivers[0]?.id,
        stops: [],
        distance: 12.3,
        estimated_duration: 28,
        schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true },
        is_active: true,
        school_id: school.id
      }
    ])
    .select('*')
  if (routeError) throw routeError

  // Students
  const today = new Date().toISOString().slice(0,10)
  const { data: students, error: stuError } = await supabase
    .from('students')
    .insert([
      {
        student_id: 'LAS001',
        name: 'Kevin Korir',
        date_of_birth: '2015-03-15',
        grade: 'Grade 3',
        class: '3A',
        gender: 'male',
        qr_code: 'LAS-LAS001',
        parent_id: parents[0]?.id,
        teacher_id: teachers[0]?.id,
        route_id: routes[0].id,
        address: { city: 'Eldoret' },
        school_id: school.id
      },
      {
        student_id: 'LAS002',
        name: 'Faith Chebet',
        date_of_birth: '2014-07-22',
        grade: 'Grade 4',
        class: '4B',
        gender: 'female',
        qr_code: 'LAS-LAS002',
        parent_id: parents[1]?.id,
        teacher_id: teachers[1]?.id,
        route_id: routes[1].id,
        address: { city: 'Eldoret' },
        school_id: school.id
      }
    ])
    .select('*')
  if (stuError) throw stuError

  // Attendance sample
  const { error: attError } = await supabase.from('attendance').insert([
    {
      student_id: students[0].id,
      route_id: routes[0].id,
      vehicle_id: vehicles[0].id,
      driver_id: drivers[0]?.id,
      date: today,
      status: 'present',
      school_id: school.id
    }
  ])
  if (attError) throw attError

  console.log('✅ Seed complete')
}

seed().catch((e) => {
  console.error('❌ Seed error:', e)
  process.exit(1)
})


