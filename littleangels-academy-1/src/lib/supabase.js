// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Use environment variables first, fallback to config if needed
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://zvkfuljxidxtuqrmquso.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a2Z1bGp4aWR4dHVxcm1xdXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5NTQxMTgsImV4cCI6MjA3MTUzMDExOH0.aL72I0Ls2ziZs2EJaX_bpMkI9gj8AGHFModINaQVb_8';

// Debug logging
console.log('🔧 Supabase Configuration:', {
  url: SUPABASE_URL,
  keyPresent: !!SUPABASE_ANON_KEY,
  source: import.meta.env.VITE_SUPABASE_URL ? 'env' : 'hardcoded'
});

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase configuration missing!');
  console.error('URL:', SUPABASE_URL);
  console.error('Key present:', !!SUPABASE_ANON_KEY);
}

// Create Supabase client with optimized settings
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'little-angels-transport'
    }
  }
});

// Test connection on import
(async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('Failed to fetch')) {
        console.error('🌐 Network issue detected. Check:');
        console.error('  1. Internet connection');
        console.error('  2. CORS settings in Supabase dashboard');
        console.error('  3. Firewall restrictions');
      }
    } else {
      console.log('✅ Supabase connected successfully!');
      console.log('📧 Current session:', data.session ? `User: ${data.session.user?.email}` : 'No active session');
    }
  } catch (error) {
    console.error('❌ Supabase connection test error:', error.message);
  }
})();

/* -------------------------
   Enhanced Helper Wrappers
   ------------------------- */

export const isSupabaseConfigured = () => !!(SUPABASE_URL && SUPABASE_ANON_KEY);

/**
 * Enhanced signIn with better error handling
 */
export const signIn = async (email, password) => {
  if (!isSupabaseConfigured()) {
    return { 
      error: { 
        message: 'Supabase not configured. Check your environment variables.' 
      } 
    };
  }

  try {
    console.log(`🔐 Attempting sign in for: ${email}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      console.error('❌ Sign in error:', error.message);
      
      // Enhanced error messages
      let userMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        userMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        userMessage = 'Please confirm your email address before signing in.';
      }
      
      return { 
        data: null, 
        error: { ...error, message: userMessage } 
      };
    }

    console.log('✅ Sign in successful:', data.user.email);
    return { data, error: null };

  } catch (error) {
    console.error('❌ Network error during sign in:', error);
    
    return { 
      error: { 
        message: 'Network error. Please check your connection and try again.' 
      } 
    };
  }
};

/**
 * Enhanced signUp with better error handling
 */
export const signUp = async (email, password, metadata = {}) => {
  if (!isSupabaseConfigured()) {
    return { 
      error: { 
        message: 'Supabase not configured. Check your environment variables.' 
      } 
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('❌ Sign up error:', error.message);
      return { data: null, error };
    }

    console.log('✅ Sign up successful:', data.user?.email);
    return { data, error: null };

  } catch (error) {
    console.error('❌ Network error during sign up:', error);
    return { 
      error: { 
        message: 'Network error during registration. Please try again.' 
      } 
    };
  }
};

/**
 * Enhanced signOut
 */
export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { 
      error: { 
        message: 'Supabase not configured. Check your environment variables.' 
      } 
    };
  }

  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Sign out error:', error.message);
      return { error };
    }

    console.log('✅ Sign out successful');
    return { error: null };

  } catch (error) {
    console.error('❌ Network error during sign out:', error);
    return { 
      error: { 
        message: 'Network error during sign out. Please try again.' 
      } 
    };
  }
};

/**
 * Get current user with enhanced error handling
 */
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - cannot get current user');
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Get user error:', error.message);
      return null;
    }

    return data?.user ?? null;

  } catch (error) {
    console.error('❌ Network error getting user:', error);
    return null;
  }
};

/**
 * Get session with enhanced error handling
 */
export const getSession = async () => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - cannot get session');
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Get session error:', error.message);
      return null;
    }

    return data?.session ?? null;

  } catch (error) {
    console.error('❌ Network error getting session:', error);
    return null;
  }
};

/**
 * Reset password
 */
export const resetPassword = async (email) => {
  if (!isSupabaseConfigured()) {
    return { 
      error: { 
        message: 'Supabase not configured. Check your environment variables.' 
      } 
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      console.error('❌ Password reset error:', error.message);
      return { error };
    }

    console.log('✅ Password reset email sent to:', email);
    return { error: null };

  } catch (error) {
    console.error('❌ Network error during password reset:', error);
    return { 
      error: { 
        message: 'Network error. Please try again.' 
      } 
    };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (updates) => {
  if (!isSupabaseConfigured()) {
    return { 
      error: { 
        message: 'Supabase not configured. Check your environment variables.' 
      } 
    };
  }

  try {
    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) {
      console.error('❌ Profile update error:', error.message);
      return { data: null, error };
    }

    console.log('✅ Profile updated successfully');
    return { data, error: null };

  } catch (error) {
    console.error('❌ Network error during profile update:', error);
    return { 
      error: { 
        message: 'Network error. Please try again.' 
      } 
    };
  }
};

// Export configuration for debugging
export const supabaseConfig = {
  url: SUPABASE_URL,
  isConfigured: isSupabaseConfigured()
};

export default supabase;