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
          try {
            // Use ONLY app_metadata for authorization - never trust user_metadata for role/school_id
            const metadata = session.user.user_metadata || {};
            const appMetadata = session.user.app_metadata || {};
            
            const allowedRoles = ['admin', 'teacher', 'parent', 'driver', 'accounts'];
            const role = appMetadata.role;
            const school_id = appMetadata.school_id;
            
            if (!role || !allowedRoles.includes(role)) {
              console.warn('User missing or invalid role in app_metadata, signing out');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              return;
            }
            
            if (!school_id) {
              console.warn('User missing school_id in app_metadata, signing out');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              return;
            }
            
            const userData = {
              id: session.user.id,
              email: session.user.email,
              name: metadata.name || session.user.email.split('@')[0],
              role: role, // Only from app_metadata
              school_id: school_id, // Only from app_metadata
              avatar: metadata.avatar || null,
              is_active: true
            };
            
            console.log('✅ Using auth metadata for user profile:', userData.role);
            setUser(userData);
          } catch (profileError) {
            console.warn('Auth initialization error:', profileError.message);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error.message);
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
            // Use ONLY app_metadata for authorization - never trust user_metadata for role/school_id
            const metadata = session.user.user_metadata || {};
            const appMetadata = session.user.app_metadata || {};
            
            const allowedRoles = ['admin', 'teacher', 'parent', 'driver', 'accounts'];
            const role = appMetadata.role;
            const school_id = appMetadata.school_id;
            
            if (!role || !allowedRoles.includes(role)) {
              console.warn('User missing or invalid role in app_metadata, signing out');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              return;
            }
            
            if (!school_id) {
              console.warn('User missing school_id in app_metadata, signing out');
              await supabase.auth.signOut();
              setSession(null);
              setUser(null);
              return;
            }
            
            const userData = {
              id: session.user.id,
              email: session.user.email,
              name: metadata.name || session.user.email.split('@')[0],
              role: role, // Only from app_metadata
              school_id: school_id, // Only from app_metadata
              avatar: metadata.avatar || null,
              is_active: true
            };
            
            console.log('✅ Using auth metadata for user profile:', userData.role);
            setUser(userData);
          } catch (profileError) {
            console.warn('Auth state change error:', profileError.message);
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
    console.log('🔐 SignIn: Starting login process for:', email);
    
    if (!isSupabaseConfigured()) {
      console.log('❌ SignIn: Supabase not configured');
      toast.error('Authentication not configured. Please set up Supabase credentials.');
      return { data: null, error: { message: 'Supabase not configured' } };
    }

    try {
      setIsLoading(true);
      console.log('🔐 SignIn: Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 SignIn: Auth response received', { hasData: !!data, hasError: !!error });

      if (error) {
        console.log('❌ SignIn: Auth error:', error.message);
        throw error;
      }

      console.log('🔐 SignIn: Auth successful, creating user profile from metadata');

      // Use ONLY app_metadata for authorization - never trust user_metadata for role/school_id
      const metadata = data.user.user_metadata || {};
      const appMetadata = data.user.app_metadata || {};
      
      const allowedRoles = ['admin', 'teacher', 'parent', 'driver', 'accounts'];
      const role = appMetadata.role;
      const school_id = appMetadata.school_id;
      
      if (!role || !allowedRoles.includes(role)) {
        console.warn('User missing or invalid role in app_metadata');
        await supabase.auth.signOut();
        throw new Error('Account not properly configured. Please contact administrator.');
      }
      
      if (!school_id) {
        console.warn('User missing school_id in app_metadata');
        await supabase.auth.signOut();
        throw new Error('Account not properly configured. Please contact administrator.');
      }
      
      const userProfile = {
        id: data.user.id,
        email: data.user.email,
        name: metadata.name || data.user.email.split('@')[0],
        role: role, // Only from app_metadata
        school_id: school_id, // Only from app_metadata
        avatar: metadata.avatar || null,
        is_active: true
      };

      console.log('✅ SignIn: Login successful, setting user:', userProfile.role);
      setUser(userProfile);
      toast.success('Welcome back!');
      return { data, error: null, user: userProfile };
    } catch (error) {
      console.log('❌ SignIn: Final error:', error.message);
      toast.error(error.message || 'Failed to sign in');
      return { data: null, error };
    } finally {
      console.log('🔐 SignIn: Setting loading to false');
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