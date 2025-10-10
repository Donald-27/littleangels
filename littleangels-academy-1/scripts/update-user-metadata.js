import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

console.log('🔧 Updating user metadata for test accounts...')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { 
  auth: { 
    persistSession: false,
    autoRefreshToken: false
  } 
})

async function getSchoolId() {
  const { data: school } = await supabase
    .from('schools')
    .select('id')
    .limit(1)
    .single()
  
  if (school) {
    return school.id
  }
  
  console.log('⚠️  No school found, creating one...')
  
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
    .select('id')
    .single()
  
  if (error) {
    console.error('❌ Error creating school:', error.message)
    process.exit(1)
  }
  
  console.log('✅ Created school')
  return newSchool.id
}

async function updateUserMetadata() {
  try {
    const schoolId = await getSchoolId()
    console.log('✅ Found school ID:', schoolId)
    
    const accountsMap = {
      'kipropdonald27@gmail.com': { name: 'Donald Kiprop', role: 'admin' },
      'weldonkorir305@gmail.com': { name: 'Weldon Korir', role: 'parent' },
      'teacher1@school.com': { name: 'Sarah Mutai', role: 'teacher' },
      'driver1@school.com': { name: 'John Mwangi', role: 'driver' },
      'accounts@school.com': { name: 'Grace Wanjiku', role: 'accounts' },
      'admin@littleangels.ac.ke': { name: 'Admin User', role: 'admin' },
      'parent1@example.com': { name: 'Mary Chebet', role: 'parent' },
      'parent@littleangels.ac.ke': { name: 'Parent User', role: 'parent' },
      'teacher2@school.com': { name: 'David Kiprotich', role: 'teacher' },
      'sarah.mutai@littleangels.ac.ke': { name: 'Sarah Mutai', role: 'teacher' },
      'david.kiprotich@littleangels.ac.ke': { name: 'David Kiprotich', role: 'teacher' },
      'john.mwangi@littleangels.ac.ke': { name: 'John Mwangi', role: 'driver' },
      'peter.kimani@littleangels.ac.ke': { name: 'Peter Kimani', role: 'driver' },
      'driver@littleangels.ac.ke': { name: 'John Driver', role: 'driver' },
      'grace.wanjiku@littleangels.ac.ke': { name: 'Grace Wanjiku', role: 'accounts' }
    }

    const { data: allUsers } = await supabase.auth.admin.listUsers()
    
    if (!allUsers || !allUsers.users) {
      console.error('❌ No users found!')
      return
    }

    console.log(`\n📝 Found ${allUsers.users.length} users in auth system\n`)

    for (const user of allUsers.users) {
      const accountInfo = accountsMap[user.email]
      
      if (!accountInfo) {
        console.log(`⏭️  Skipping ${user.email} (not in test accounts)`)
        continue
      }

      console.log(`👤 Updating ${user.email}...`)
      
      const { error } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          email_confirm: true,
          user_metadata: { 
            name: accountInfo.name 
          },
          app_metadata: { 
            role: accountInfo.role, 
            school_id: schoolId 
          }
        }
      )
      
      if (error) {
        console.error(`   ❌ Error updating ${user.email}:`, error.message)
      } else {
        console.log(`   ✅ Updated app_metadata: role=${accountInfo.role}, school_id=${schoolId}`)
        console.log(`   ✅ Updated user_metadata: name=${accountInfo.name}`)
      }
    }
    
    console.log('\n✅ Metadata update complete!')
    console.log('\n🔑 Test accounts are now ready to use:')
    console.log('   - Admin: kipropdonald27@gmail.com / admin123')
    console.log('   - Parent: weldonkorir305@gmail.com / parent123')
    console.log('   - Teacher: teacher1@school.com / teacher123')
    console.log('   - Driver: driver1@school.com / driver123')
    console.log('   - Accounts: accounts@school.com / accounts123')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

updateUserMetadata()
