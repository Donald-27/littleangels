// Shared hook for notifications data with real-time updates
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useNotificationsData = (schoolId, userId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('school_id', schoolId)
        .or(`recipients.cs.{${userId}},recipients.eq.{}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      
      // Calculate unread count
      const unread = data?.filter(n => {
        const readBy = n.read_by || [];
        return !readBy.includes(userId);
      }).length || 0;
      
      setUnreadCount(unread);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [schoolId, userId]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      const readBy = notification.read_by || [];
      if (readBy.includes(userId)) return; // Already read

      const updatedReadBy = [...readBy, userId];

      const { error } = await supabase
        .from('notifications')
        .update({ read_by: updatedReadBy })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read_by: updatedReadBy } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [notifications, userId]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => {
        const readBy = n.read_by || [];
        return !readBy.includes(userId);
      });

      for (const notification of unreadNotifications) {
        const readBy = notification.read_by || [];
        const updatedReadBy = [...readBy, userId];

        await supabase
          .from('notifications')
          .update({ read_by: updatedReadBy })
          .eq('id', notification.id);
      }

      setNotifications(prev => prev.map(n => ({
        ...n,
        read_by: [...(n.read_by || []), userId]
      })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      toast.error('Failed to mark all as read');
    }
  }, [notifications, userId]);

  // Send notification
  const sendNotification = useCallback(async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          school_id: schoolId,
          sent_by: userId,
          status: 'sent'
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Notification sent successfully');
      return { success: true, data };
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Failed to send notification');
      return { success: false, error: err.message };
    }
  }, [schoolId, userId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!schoolId) return;

    fetchNotifications();

    // Subscribe to notification changes
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `school_id=eq.${schoolId}`
        },
        (payload) => {
          console.log('Notification change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new, ...prev]);
            
            // Check if this notification is for current user
            const recipients = payload.new.recipients || [];
            if (recipients.includes(userId) || recipients.length === 0) {
              setUnreadCount(prev => prev + 1);
              toast.info(payload.new.title);
            }
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(n => n.id === payload.new.id ? payload.new : n));
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [schoolId, userId, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    refetch: fetchNotifications
  };
};
