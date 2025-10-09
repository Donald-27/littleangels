// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getCurrentUser, getSession, isSupabaseConfigured } from '../lib/supabase';
import { toast } from 'sonner';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to create user profile from session
  const createUserProfile = (session) => {
    if (!session?.user) return null;

    try {
      const metadata = session.user.user_metadata || {};
      const appMetadata = session.user.app_metadata || {};
      
      // Define allowed roles
      const allowedRoles = ['admin', 'teacher', 'parent', 'driver', 'accounts'];
      
      // Get role with fallbacks
      let role = appMetadata.role || metadata.role;
      
      // If no role found, provide a default based on email or use 'parent' as fallback
      if (!role || !allowedRoles.includes(role)) {
        console.warn('⚠️ User missing or invalid role, using fallback');
        
        // Try to infer role from email (for demo purposes)
        if (session.user.email.includes('admin')) {
          role = 'admin';
        } else if (session.user.email.includes('teacher')) {
          role = 'teacher';
        } else if (session.user.email.includes('driver')) {
          role = 'driver';
        } else if (session.user.email.includes('accounts')) {
          role = 'accounts';
        } else {
          role = 'parent'; // Default fallback
        }
        
        console.log(`🎭 Using inferred role: ${role}`);
      }
      
      // Get school_id with fallbacks
      let school_id = appMetadata.school_id || metadata.school_id;
      
      // If no school_id, use a demo school ID for development
      if (!school_id) {
        console.warn('⚠️ User missing school_id, using demo school');
        school_id = 'demo-school-id';
      }
      
      const userProfile = {
        id: session.user.id,
        email: session.user.email,
        name: metadata.name || session.user.email.split('@')[0] || 'User',
        role: role,
        school_id: school_id,
        avatar: metadata.avatar || null,
        is_active: true,
        // Include raw metadata for debugging
        _raw: {
          user_metadata: metadata,
          app_metadata: appMetadata
        }
      };
      
      console.log('✅ Created user profile:', {
        name: userProfile.name,
        role: userProfile.role,
        school_id: userProfile.school_id
      });
      
      return userProfile;
      
    } catch (error) {
      console.error('❌ Error creating user profile:', error);
      return null;
    }
  };

  // Helper function to validate and update auth state
  const updateAuthState = async (session) => {
    setSession(session);
    
    if (session?.user) {
      const userProfile = createUserProfile(session);
      
      if (userProfile) {
        setUser(userProfile);
        setError(null);
      } else {
        console.warn('⚠️ Could not create user profile, but keeping session active');
        // Don't sign out - just set basic user info
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email.split('@')[0] || 'User',
          role: 'user', // Generic fallback
          school_id: 'unknown',
          is_active: true
        });
      }
    } else {
      setUser(null);
      setError(null);
    }
    
    setIsLoading(false);
  };

  // Initialize auth state
  const initializeAuth = async () => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Supabase not configured. Auth will work in demo mode.');
      setIsLoading(false);
      setError('Supabase not configured - using demo mode');
      return;
    }

    try {
      console.log('🔐 Initializing auth state...');
      const session = await getSession();
      
      if (session?.user) {
        console.log('👤 Found existing session for:', session.user.email);
      } else {
        console.log('👤 No existing session found');
      }
      
      await updateAuthState(session);
      
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();

    // Set up auth state change listener
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log(`🔐 Auth state change: ${event}`, session?.user?.email);
          
          switch (event) {
            case 'SIGNED_IN':
              console.log('✅ User signed in');
              await updateAuthState(session);
              break;
              
            case 'SIGNED_OUT':
              console.log('✅ User signed out');
              setUser(null);
              setSession(null);
              setError(null);
              setIsLoading(false);
              break;
              
            case 'USER_UPDATED':
              console.log('✅ User updated');
              await updateAuthState(session);
              break;
              
            case 'TOKEN_REFRESHED':
              console.log('✅ Token refreshed');
              break;
              
            case 'PASSWORD_RECOVERY':
              console.log('✅ Password recovery initiated');
              break;
              
            default:
              console.log(`🔐 Unknown auth event: ${event}`);
              await updateAuthState(session);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  const signIn = async (email, password) => {
    console.log('🔐 SignIn: Starting login process for:', email);
    
    if (!isSupabaseConfigured()) {
      console.log('❌ SignIn: Supabase not configured');
      
      // Demo mode - create a mock user for development
      const demoUser = {
        id: 'demo-user-id',
        email: email,
        name: email.split('@')[0] || 'Demo User',
        role: 'admin', // Default to admin in demo mode
        school_id: 'demo-school-id',
        is_active: true,
        _isDemo: true
      };
      
      setUser(demoUser);
      setSession({ user: demoUser });
      setIsLoading(false);
      
      toast.success('Demo mode - Signed in successfully!');
      return { 
        data: { user: demoUser, session: { user: demoUser } }, 
        error: null, 
        user: demoUser 
      };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 SignIn: Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 SignIn: Auth response received', { 
        hasUser: !!data?.user, 
        hasError: !!error,
        error: error?.message 
      });

      if (error) {
        console.log('❌ SignIn: Auth error:', error.message);
        
        // Provide user-friendly error messages
        let userMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          userMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Please check your email to confirm your account before signing in.';
        } else if (error.message.includes('too many requests')) {
          userMessage = 'Too many login attempts. Please try again in a few minutes.';
        }
        
        throw new Error(userMessage);
      }

      if (!data?.user) {
        throw new Error('No user data received from authentication');
      }

      // Create user profile from the authenticated data
      const userProfile = createUserProfile(data);
      
      if (!userProfile) {
        throw new Error('Could not create user profile from authentication data');
      }

      console.log('✅ SignIn: Login successful, setting user:', userProfile.role);
      setUser(userProfile);
      
      toast.success(`Welcome back, ${userProfile.name}!`);
      return { 
        data, 
        error: null, 
        user: userProfile 
      };
      
    } catch (error) {
      console.log('❌ SignIn: Final error:', error.message);
      setError(error.message);
      toast.error(error.message || 'Failed to sign in');
      return { 
        data: null, 
        error: { message: error.message } 
      };
    } finally {
      console.log('🔐 SignIn: Setting loading to false');
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔐 SignOut: Starting sign out process');
    
    // Clear local state immediately for better UX
    setUser(null);
    setSession(null);
    setError(null);
    
    if (!isSupabaseConfigured()) {
      console.log('🔐 SignOut: Supabase not configured - local sign out only');
      toast.success('Signed out successfully');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.warn('⚠️ SignOut: Error from Supabase, but local state cleared:', error.message);
        // Don't throw error - we've already cleared local state
      }
      
      console.log('✅ SignOut: Signed out successfully');
      toast.success('Signed out successfully');
      return { error: null };
      
    } catch (error) {
      console.error('❌ SignOut: Unexpected error:', error);
      // Still return success since local state is cleared
      toast.success('Signed out successfully');
      return { error: null };
    }
  };

  const refreshUser = async () => {
    if (!isSupabaseConfigured()) {
      console.log('🔐 Refresh: Supabase not configured');
      return;
    }

    try {
      console.log('🔐 Refreshing user data...');
      const session = await getSession();
      await updateAuthState(session);
      
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
      setError(error.message);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    session,
    isLoading,
    error,
    signIn,
    signOut,
    refreshUser,
    clearError,
    isAuthenticated: !!user,
    isDemo: user?._isDemo || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};