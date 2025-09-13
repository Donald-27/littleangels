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

  useEffect(() => {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured. Auth will not work until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
      setIsLoading(false);
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        // Add timeout to prevent hanging forever
        const sessionTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const session = await Promise.race([
          getSession(),
          sessionTimeout
        ]);
        
        setSession(session);
        if (session?.user) {
          try {
            // Get user profile from our custom users table
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single();
            
            if (profileError) {
              console.warn('User profile not found in database - database may not be set up yet:', profileError.message);
              // Clear session if user profile doesn't exist
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
            } else {
              setUser(userProfile);
            }
          } catch (profileError) {
            console.warn('Database not set up yet. Please run the schema setup:', profileError.message);
            // Clear session if database isn't ready
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
          }
        }
      } catch (error) {
        if (error.message === 'Session check timeout') {
          console.log('Session check timed out - proceeding to login');
        } else {
          console.error('Error initializing auth:', error.message);
        }
        // Clear any partial state
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          try {
            // Get user profile from our custom users table
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('email', session.user.email)
              .single();
            
            if (profileError) {
              console.warn('User profile not found - database may not be set up yet:', profileError.message);
              setUser(null);
            } else {
              setUser(userProfile);
            }
          } catch (profileError) {
            console.warn('Database not ready - please set up the schema:', profileError.message);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      toast.error('Authentication not configured. Please set up Supabase credentials.');
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      setIsLoading(true);
      console.log('🔐 Signing in with:', email);
      
      // Add timeout to auth as well
      const authTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign-in timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        authTimeout
      ]);

      if (error) throw error;
      
      console.log('✅ Auth successful, fetching profile...');

      try {
        // Try to get user profile with timeout
        const profileTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        );
        
        const { data: userProfile, error: profileError } = await Promise.race([
          supabase.from('users').select('*').eq('email', email).single(),
          profileTimeout
        ]);

        if (profileError) {
          console.warn('No user profile found - database may not be set up. Creating basic profile.');
          // Create a basic user profile if database isn't set up
          const basicProfile = {
            id: data.user.id,
            email: email,
            name: data.user.user_metadata?.name || email.split('@')[0],
            role: 'admin', // Default role for demo
            is_active: true
          };
          setUser(basicProfile);
          toast.success('Welcome! (Using demo profile)');
          return { data, error: null, user: basicProfile };
        }

        setUser(userProfile);
        toast.success('Welcome back!');
        return { data, error: null, user: userProfile };
        
      } catch (profileError) {
        console.warn('Profile fetch failed:', profileError.message);
        // Create basic profile if database query fails
        const basicProfile = {
          id: data.user.id,
          email: email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 
                email.includes('teacher') ? 'teacher' :
                email.includes('parent') ? 'parent' :
                email.includes('driver') ? 'driver' : 'admin',
          is_active: true
        };
        setUser(basicProfile);
        toast.success('Welcome! (Demo mode)');
        return { data, error: null, user: basicProfile };
      }
      
    } catch (error) {
      if (error.message === 'Sign-in timeout') {
        toast.error('Sign-in is taking too long. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to sign in');
      }
      console.error('Sign-in error:', error.message);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setSession(null);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
      return { error: null };
    } catch (error) {
      toast.error(error.message || 'Failed to sign out');
      return { error };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};