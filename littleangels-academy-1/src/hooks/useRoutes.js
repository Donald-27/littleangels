// Shared hook for routes data with real-time updates
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useRoutes = (schoolId) => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch routes
  const fetchRoutes = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          vehicle:vehicle_id(id, plate_number, make, model),
          driver:driver_id(id, name, phone),
          conductor:conductor_id(id, name, phone)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRoutes(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching routes:', err);
      setError(err.message);
      toast.error('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Add route
  const addRoute = useCallback(async (routeData) => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert([{ ...routeData, school_id: schoolId }])
        .select()
        .single();

      if (error) throw error;
      
      setRoutes(prev => [...prev, data]);
      toast.success('Route added successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error adding route:', err);
      toast.error('Failed to add route');
      return { success: false, error: err.message };
    }
  }, [schoolId]);

  // Update route
  const updateRoute = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setRoutes(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Route updated successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating route:', err);
      toast.error('Failed to update route');
      return { success: false, error: err.message };
    }
  }, []);

  // Delete route
  const deleteRoute = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('routes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setRoutes(prev => prev.filter(r => r.id !== id));
      toast.success('Route deleted successfully');
      return { success: true };
    } catch (err) {
      console.error('Error deleting route:', err);
      toast.error('Failed to delete route');
      return { success: false, error: err.message };
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!schoolId) return;

    fetchRoutes();

    // Subscribe to route changes
    const channel = supabase
      .channel('routes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'routes',
          filter: `school_id=eq.${schoolId}`
        },
        (payload) => {
          console.log('Route change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setRoutes(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setRoutes(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
          } else if (payload.eventType === 'DELETE') {
            setRoutes(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, fetchRoutes]);

  return {
    routes,
    loading,
    error,
    addRoute,
    updateRoute,
    deleteRoute,
    refetch: fetchRoutes
  };
};
