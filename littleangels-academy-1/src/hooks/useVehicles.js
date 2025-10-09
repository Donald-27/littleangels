// Shared hook for vehicles data with real-time updates
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useVehicles = (schoolId) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vehicles
  const fetchVehicles = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          driver:driver_id(id, name, phone),
          conductor:conductor_id(id, name, phone)
        `)
        .eq('school_id', schoolId)
        .order('plate_number');

      if (error) throw error;
      setVehicles(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError(err.message);
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Add vehicle
  const addVehicle = useCallback(async (vehicleData) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{ ...vehicleData, school_id: schoolId }])
        .select()
        .single();

      if (error) throw error;
      
      setVehicles(prev => [...prev, data]);
      toast.success('Vehicle added successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error adding vehicle:', err);
      toast.error('Failed to add vehicle');
      return { success: false, error: err.message };
    }
  }, [schoolId]);

  // Update vehicle
  const updateVehicle = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setVehicles(prev => prev.map(v => v.id === id ? data : v));
      toast.success('Vehicle updated successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating vehicle:', err);
      toast.error('Failed to update vehicle');
      return { success: false, error: err.message };
    }
  }, []);

  // Delete vehicle
  const deleteVehicle = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;
      
      setVehicles(prev => prev.filter(v => v.id !== id));
      toast.success('Vehicle deleted successfully');
      return { success: true };
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      toast.error('Failed to delete vehicle');
      return { success: false, error: err.message };
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!schoolId) return;

    fetchVehicles();

    // Subscribe to vehicle changes
    const channel = supabase
      .channel('vehicles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
          filter: `school_id=eq.${schoolId}`
        },
        (payload) => {
          console.log('Vehicle change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setVehicles(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setVehicles(prev => prev.map(v => v.id === payload.new.id ? payload.new : v));
          } else if (payload.eventType === 'DELETE') {
            setVehicles(prev => prev.filter(v => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    refetch: fetchVehicles
  };
};
