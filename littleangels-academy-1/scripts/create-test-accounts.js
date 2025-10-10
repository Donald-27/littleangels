import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

console.log('🔐 Creating test accounts for Little Angels Academy...')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { 
  auth: { 
    persistSession: false,
    autoRefreshToken: false
  } 
})

async function getOrCreateSchool() {
  const { data: existingSchool } = await supabase
    .from('schools')
    .select('*')
    .single()
  
  if (existingSchool) {
    console.log('✅ Found existing school:', existingSchool.name)
    return existingSchool
  }

  const { data: newSchool, error } = await supabase
    .from('schools')
    .insert({
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
  console.log('✅ Created school:', newSchool.name)
  return newSchool
}

async function createOrUpdateAuthUser(email, password, name, role, schoolId) {
  try {
    const { data: authRes, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
      app_metadata: { role, school_id: schoolId }
    })
    
    if (authError) {
      if (authError.message && authError.message.includes('already registered')) {
        console.log(`   ⚠️ User already exists: ${email}`)
        
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users?.users?.find(u => u.email === email)
        
        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            {
              email_confirm: true,
              user_metadata: { name },
              app_metadata: { role, school_id: schoolId }
            }
          )
          
          if (updateError) {
            console.error(`   ⚠️ Error updating metadata: ${updateError.message}`)
          } else {
            console.log(`   ✓ Updated metadata for: ${email}`)
          }
          
          await supabase
            .from('users')
            .upsert({
              id: existingUser.id,
              email,
              name,
              role,
              school_id: schoolId,
              is_active: true,
              phone: '+254700000000',
              address: 'Nairobi, Kenya',
              preferences: {
                language: 'en',
                notifications: { sms: true, email: true, whatsapp: false, push: true },
                theme: 'light'
              }
            })
          
          return existingUser.id
        }
        return null
      }
      throw authError
    }

    const userId = authRes.user.id
    console.log(`   ✓ Created auth user: ${email}`)

    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        role,
        school_id: schoolId,
        is_active: true,
        phone: '+254700000000',
        address: 'Nairobi, Kenya',
        preferences: {
          language: 'en',
          notifications: { sms: true, email: true, whatsapp: false, push: true },
          theme: 'light'
        }
      })
    
    if (profileError) {
      if (profileError.code === '23505') {
        console.log(`   ✓ Profile already exists: ${email}`)
      } else {
        throw profileError
      }
    } else {
      console.log(`   ✓ Created profile: ${email}`)
    }
    
    return userId
  } catch (error) {
    console.error(`   ❌ Error with ${email}:`, error.message)
    return null
  }
}

async function createTestAccounts() {
  try {
    const school = await getOrCreateSchool()
    
    const testAccounts = [
      { email: 'kipropdonald27@gmail.com', password: 'admin123', name: 'Donald Kiprop', role: 'admin' },
      { email: 'weldonkorir305@gmail.com', password: 'parent123', name: 'Weldon Korir', role: 'parent' },
      { email: 'teacher1@school.com', password: 'teacher123', name: 'Sarah Mutai', role: 'teacher' },
      { email: 'driver1@school.com', password: 'driver123', name: 'John Mwangi', role: 'driver' },
      { email: 'accounts@school.com', password: 'accounts123', name: 'Grace Wanjiku', role: 'accounts' },
      { email: 'admin@littleangels.ac.ke', password: 'admin123', name: 'Admin User', role: 'admin' },
      { email: 'parent1@example.com', password: 'parent123', name: 'Mary Chebet', role: 'parent' },
      { email: 'parent@littleangels.ac.ke', password: 'parent123', name: 'Parent User', role: 'parent' },
      { email: 'teacher2@school.com', password: 'teacher123', name: 'David Kiprotich', role: 'teacher' },
      { email: 'sarah.mutai@littleangels.ac.ke', password: 'teacher123', name: 'Sarah Mutai', role: 'teacher' },
      { email: 'david.kiprotich@littleangels.ac.ke', password: 'teacher123', name: 'David Kiprotich', role: 'teacher' },
      { email: 'john.mwangi@littleangels.ac.ke', password: 'driver123', name: 'John Mwangi', role: 'driver' },
      { email: 'peter.kimani@littleangels.ac.ke', password: 'driver123', name: 'Peter Kimani', role: 'driver' },
      { email: 'driver@littleangels.ac.ke', password: 'driver123', name: 'John Driver', role: 'driver' },
      { email: 'grace.wanjiku@littleangels.ac.ke', password: 'accounts123', name: 'Grace Wanjiku', role: 'accounts' }
    ]

    console.log('\n📝 Creating/updating test accounts...\n')
    
    for (const account of testAccounts) {
      console.log(`👤 ${account.role.toUpperCase()}: ${account.email}`)
      await createOrUpdateAuthUser(
        account.email, 
        account.password, 
        account.name, 
        account.role, 
        school.id
      )
    }
    
    console.log('\n✅ All test accounts created/updated successfully!')
    console.log('\n🔑 You can now login with any of these accounts.')
    console.log('   Primary accounts:')
    console.log('   - Admin: kipropdonald27@gmail.com / admin123')
    console.log('   - Parent: weldonkorir305@gmail.com / parent123')
    console.log('   - Teacher: teacher1@school.com / teacher123')
    console.log('   - Driver: driver1@school.com / driver123')
    console.log('   - Accounts: accounts@school.com / accounts123')
    
  } catch (error) {
    console.error('\n❌ Error creating test accounts:', error.message)
    process.exit(1)
  }
}

createTestAccounts()
