import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CONFIG } from '../../config/supabase-config.js'

// Supabase configuration (gracefully handle missing env vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.url
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey)
}

// Create Supabase client only if configured
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
  : null


// Helper to get error when Supabase is not configured
const getConfigError = () => ({
  error: { message: 'Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.' }
})

// Helper functions for common operations
export const signIn = async (email, password) => {
  if (!supabase) return getConfigError()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email, password, metadata = {}) => {
  if (!supabase) return getConfigError()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  return { data, error }
}

export const signOut = async () => {
  if (!supabase) return getConfigError()
  
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  if (!supabase) return null
  
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getSession = async () => {
  if (!supabase) return null
  
  const { data: { session } } = await supabase.auth.getSession()
  return session
}