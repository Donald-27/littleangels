// Shared hook for notifications with real-time updates
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export const useNotifications = (userId, schoolId) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!userId || !schoolId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`recipients.cs.{${userId}},sent_by.eq.${userId}`)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data || []);
      
      // Calculate unread count
      const unread = (data || []).filter(n => 
        !n.read_by || !Object.keys(n.read_by).includes(userId)
      ).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, schoolId]);

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;

      const updatedReadBy = {
        ...notification.read_by,
        [userId]: new Date().toISOString()
      };

      const { error } = await supabase
        .from('notifications')
        .update({ read_by: updatedReadBy })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read_by: updatedReadBy } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [userId, notifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => 
        !n.read_by || !Object.keys(n.read_by).includes(userId)
      );

      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [notifications, userId, markAsRead]);

  // Send notification
  const sendNotification = useCallback(async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          ...notificationData,
          sent_by: userId,
          school_id: schoolId,
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
  }, [userId, schoolId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!userId || !schoolId) return;

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
          
          // Check if notification is for this user
          const isForUser = payload.new?.recipients?.includes(userId) || 
                           payload.new?.sent_by === userId;
          
          if (payload.eventType === 'INSERT' && isForUser) {
            setNotifications(prev => [payload.new, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast for new notification
            if (payload.new.recipients?.includes(userId)) {
              toast.info(payload.new.title, {
                description: payload.new.message,
                duration: 5000
              });
            }
          } else if (payload.eventType === 'UPDATE' && isForUser) {
            setNotifications(prev => 
              prev.map(n => n.id === payload.new.id ? payload.new : n)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, schoolId, fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    sendNotification,
    refetch: fetchNotifications
  };
};
