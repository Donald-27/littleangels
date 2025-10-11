import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const [userResult, schoolResult] = await Promise.all([
        supabase.from('users').select('preferences').eq('id', user.id).single(),
        supabase.from('schools').select('*').eq('id', user.school_id).single()
      ]);

      const userPrefs = userResult.data?.preferences || {};
      const schoolData = schoolResult.data || {};

      setSettings({
        user: {
          theme: userPrefs.theme || userPrefs.appearance?.theme || 'light',
          language: userPrefs.language || userPrefs.appearance?.language || 'en',
          notifications: userPrefs.notifications || {},
          appearance: userPrefs.appearance || {},
          privacy: userPrefs.privacy || {},
          security: userPrefs.security || {}
        },
        school: {
          id: schoolData.id,
          name: schoolData.name || '',
          logo: schoolData.logo || '',
          motto: schoolData.motto || '',
          vision: schoolData.vision || '',
          mission: schoolData.mission || '',
          address: schoolData.address || '',
          phone: schoolData.phone || '',
          email: schoolData.email || '',
          website: schoolData.website || '',
          settings: schoolData.settings || {},
          timezone: schoolData.settings?.timezone || 'Africa/Nairobi',
          currency: schoolData.settings?.currency || 'KES',
          academic_year: schoolData.settings?.academic_year || new Date().getFullYear().toString(),
          term: schoolData.settings?.term || 'Term 1'
        }
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserSettings = async (updates) => {
    try {
      const newPrefs = {
        ...settings.user,
        ...updates,
        theme: updates.theme || settings.user.theme,
        language: updates.language || settings.user.language
      };

      const { error } = await supabase
        .from('users')
        .update({ preferences: newPrefs })
        .eq('id', user.id);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        user: newPrefs
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return { success: false, error };
    }
  };

  const updateSchoolSettings = async (updates) => {
    try {
      const newSettings = {
        ...settings.school.settings,
        ...updates,
        timezone: updates.timezone || settings.school.timezone,
        currency: updates.currency || settings.school.currency,
        academic_year: updates.academic_year || settings.school.academic_year,
        term: updates.term || settings.school.term
      };

      const { error } = await supabase
        .from('schools')
        .update({
          ...updates,
          settings: newSettings
        })
        .eq('id', user.school_id);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        school: {
          ...prev.school,
          ...updates,
          settings: newSettings
        }
      }));

      return { success: true };
    } catch (error) {
      console.error('Error updating school settings:', error);
      return { success: false, error };
    }
  };

  const value = {
    settings,
    loading,
    updateUserSettings,
    updateSchoolSettings,
    refreshSettings: loadSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
