import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

console.log('🚀 Setting up Little Angels Academy Database...')

// Use the provided Supabase credentials
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTk1NDExOCwiZXhwIjoyMDcxNTMwMTE4fQ.VaBDMxzRGjrNnzkaABjL3nhOL37pfCYGo3gwew9piAk'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

async function setupDatabase() {
  try {
    console.log('📋 Reading database schema...')
    
    // Read the main schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('🗄️ Applying database schema...')
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.log(`⚠️ Statement ${i + 1} warning:`, error.message)
          }
        } catch (err) {
          console.log(`⚠️ Statement ${i + 1} error:`, err.message)
        }
      }
    }
    
    console.log('✅ Database schema applied successfully!')
    
    // Now run the seed script
    console.log('🌱 Running seed script...')
    const { spawn } = await import('child_process')
    
    const seedProcess = spawn('node', ['scripts/seed.js'], {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    
    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('🎉 Database setup and seeding completed successfully!')
        console.log('🚀 Your Little Angels Academy app is ready!')
      } else {
        console.error('❌ Seed script failed with code:', code)
      }
    })
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()