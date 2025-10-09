// Shared hook for staff data with real-time updates
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useStaff = (schoolId) => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch staff
  const fetchStaff = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('school_id', schoolId)
        .in('role', ['teacher', 'driver', 'accounts', 'admin'])
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStaff(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err.message);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Add staff member
  const addStaff = useCallback(async (staffData) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ ...staffData, school_id: schoolId }])
        .select()
        .single();

      if (error) throw error;
      
      setStaff(prev => [...prev, data]);
      toast.success('Staff member added successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error adding staff:', err);
      toast.error('Failed to add staff member');
      return { success: false, error: err.message };
    }
  }, [schoolId]);

  // Update staff member
  const updateStaff = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setStaff(prev => prev.map(s => s.id === id ? data : s));
      toast.success('Staff member updated successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating staff:', err);
      toast.error('Failed to update staff member');
      return { success: false, error: err.message };
    }
  }, []);

  // Delete staff member
  const deleteStaff = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setStaff(prev => prev.filter(s => s.id !== id));
      toast.success('Staff member removed successfully');
      return { success: true };
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error('Failed to remove staff member');
      return { success: false, error: err.message };
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!schoolId) return;

    fetchStaff();

    // Subscribe to user changes for staff members
    const channel = supabase
      .channel('staff_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `school_id=eq.${schoolId}`
        },
        (payload) => {
          console.log('Staff change detected:', payload);
          
          // Only process if it's a staff member role
          const isStaff = payload.new && ['teacher', 'driver', 'accounts', 'admin'].includes(payload.new.role);
          
          if (payload.eventType === 'INSERT' && isStaff) {
            setStaff(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE' && isStaff) {
            setStaff(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
          } else if (payload.eventType === 'DELETE') {
            setStaff(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, fetchStaff]);

  return {
    staff,
    loading,
    error,
    addStaff,
    updateStaff,
    deleteStaff,
    refetch: fetchStaff
  };
};
