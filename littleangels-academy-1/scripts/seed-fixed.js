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

async function ensureAuthUser(email, password, name, role, schoolId) {
  try {
    // First, check if auth user exists by listing all users and finding by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError
    
    const existingAuthUser = users.find(u => u.email === email)
    let userId
    
    if (existingAuthUser) {
      console.log(`🔄 Updating existing user: ${email}`)
      userId = existingAuthUser.id
      
      // Update the existing user's password and metadata
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { name, role }
      })
      
      if (updateError) throw updateError
    } else {
      console.log(`➕ Creating new user: ${email}`)
      
      // Create new auth user
      const { data: authRes, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role }
      })
      
      if (authError) throw authError
      userId = authRes.user.id
    }

    // Always upsert the profile to ensure it exists with correct data
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
    
    console.log(`✅ User ready: ${email} (${role})`)
    return profile
    
  } catch (error) {
    console.error(`❌ Failed to ensure user ${email}:`, error.message)
    return null
  }
}

async function seed() {
  console.log('🌱 Seeding Little Angels School data...')
  
  try {
    const school = await upsertSchool()
    console.log('✅ School:', school.name)

    const users = []
    const userSpecs = [
      ['kipropdonald27@gmail.com', 'admin123', 'Donald Kiprop', 'admin'],
      ['weldonkorir305@gmail.com', 'parent123', 'Weldon Korir', 'parent'],
      ['teacher1@school.com', 'teacher123', 'Sarah Mutai', 'teacher'],
      ['driver1@school.com', 'driver123', 'John Mwangi', 'driver']
    ]

    console.log('👥 Setting up demo users...')
    for (const [email, password, name, role] of userSpecs) {
      const profile = await ensureAuthUser(email, password, name, role, school.id)
      if (profile) {
        users.push(profile)
      }
    }

    console.log(`🎉 Successfully set up ${users.length} demo users!`)
    console.log('\n🔐 Demo Login Credentials:')
    console.log('Admin: kipropdonald27@gmail.com / admin123')
    console.log('Teacher: teacher1@school.com / teacher123')
    console.log('Parent: weldonkorir305@gmail.com / parent123')
    console.log('Driver: driver1@school.com / driver123')
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message)
    process.exit(1)
  }
}

// Run the seeding
seed()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error.message)
    process.exit(1)
  })