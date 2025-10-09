// Shared hook for students data with real-time updates
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useStudents = (schoolId) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          parent:parent_id(id, name, email, phone),
          teacher:teacher_id(id, name, email),
          route:route_id(id, name)
        `)
        .eq('school_id', schoolId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.message);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  // Add student
  const addStudent = useCallback(async (studentData) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{ ...studentData, school_id: schoolId }])
        .select()
        .single();

      if (error) throw error;
      
      setStudents(prev => [...prev, data]);
      toast.success('Student added successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error adding student:', err);
      toast.error('Failed to add student');
      return { success: false, error: err.message };
    }
  }, [schoolId]);

  // Update student
  const updateStudent = useCallback(async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setStudents(prev => prev.map(s => s.id === id ? data : s));
      toast.success('Student updated successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error updating student:', err);
      toast.error('Failed to update student');
      return { success: false, error: err.message };
    }
  }, []);

  // Delete student
  const deleteStudent = useCallback(async (id) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted successfully');
      return { success: true };
    } catch (err) {
      console.error('Error deleting student:', err);
      toast.error('Failed to delete student');
      return { success: false, error: err.message };
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    if (!schoolId) return;

    fetchStudents();

    // Subscribe to student changes
    const channel = supabase
      .channel('students_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'students',
          filter: `school_id=eq.${schoolId}`
        },
        (payload) => {
          console.log('Student change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setStudents(prev => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setStudents(prev => prev.map(s => s.id === payload.new.id ? payload.new : s));
          } else if (payload.eventType === 'DELETE') {
            setStudents(prev => prev.filter(s => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, fetchStudents]);

  return {
    students,
    loading,
    error,
    addStudent,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents
  };
};
