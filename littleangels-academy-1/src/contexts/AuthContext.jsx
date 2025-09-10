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
        const session = await getSession();
        setSession(session);
        if (session?.user) {
          // Get user profile from our custom users table
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
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
          // Get user profile from our custom users table
          const { data: userProfile } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
          
          setUser(userProfile);
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      setUser(userProfile);
      toast.success('Welcome back!');
      return { data, error: null, user: userProfile };
    } catch (error) {
      toast.error(error.message || 'Failed to sign in');
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