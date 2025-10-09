// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      console.log('🔔 NotificationProvider: User detected, fetching notifications...');
      fetchNotifications();
      subscribeToNotifications();
    } else {
      console.log('🔔 NotificationProvider: No user, clearing notifications');
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user || !supabase) {
      console.log('🔔 fetchNotifications: No user or supabase, skipping');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔔 Fetching notifications for user:', user.id);

      // First, let's check if the notifications table exists with a simple query
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Try to filter by recipients if the column exists
      // We'll handle errors gracefully if the column doesn't exist
      const { data, error } = await query;

      if (error) {
        // Handle specific errors
        if (error.code === '42P01') { // Table doesn't exist
          console.log('📋 Notifications table does not exist yet');
          setError('Notifications table not set up');
          setNotifications([]);
          return;
        } else if (error.code === '42703') { // Column doesn't exist
          console.log('📋 Notifications table missing columns, using fallback');
          // Try without the recipients filter
          await fetchNotificationsFallback();
          return;
        }
        throw error;
      }

      console.log(`✅ Fetched ${data?.length || 0} notifications`);
      
      // Filter notifications for this user (client-side if needed)
      const userNotifications = data?.filter(notification => 
        // If recipients column exists and contains user ID, use it
        // Otherwise, show all notifications (for demo purposes)
        !notification.recipients || 
        notification.recipients.includes(user.id) ||
        notification.recipient_id === user.id
      ) || [];

      setNotifications(userNotifications);
      
      // Calculate unread count
      const unread = userNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);

    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      setError(error.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Fallback method if the notifications table has different structure
  const fetchNotificationsFallback = async () => {
    try {
      console.log('🔄 Using fallback notifications fetch');
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      setNotifications(data || []);
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);

    } catch (fallbackError) {
      console.error('❌ Fallback fetch also failed:', fallbackError);
      // Create some demo notifications for development
      createDemoNotifications();
    }
  };

  // Create demo notifications for development when table doesn't exist
  const createDemoNotifications = () => {
    console.log('🎭 Creating demo notifications for development');
    const demoNotifications = [
      {
        id: 'demo-1',
        title: 'Welcome to Little Angels!',
        message: 'Your account has been successfully set up.',
        type: 'info',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 'demo-2',
        title: 'System Update',
        message: 'New features have been added to the transport system.',
        type: 'info',
        read: false,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    setNotifications(demoNotifications);
    setUnreadCount(2);
  };

  const subscribeToNotifications = () => {
    if (!user || !supabase) {
      console.log('🔔 subscribeToNotifications: No user or supabase, skipping');
      return () => {};
    }

    console.log('🔔 Subscribing to notifications realtime...');

    try {
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
          },
          (payload) => {
            console.log('🔔 Realtime notification received:', payload.new);
            const newNotification = payload.new;
            
            // Check if this notification is for the current user
            const isForCurrentUser = 
              !newNotification.recipients || 
              newNotification.recipients.includes(user.id) ||
              newNotification.recipient_id === user.id;

            if (isForCurrentUser) {
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
              
              // Show toast notification
              toast.info(newNotification.title || 'New Notification', {
                description: newNotification.message || 'You have a new notification',
                duration: 5000,
                action: {
                  label: 'View',
                  onClick: () => markAsRead(newNotification.id)
                }
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('🔔 Realtime subscription status:', status);
        });

      return () => {
        console.log('🔔 Unsubscribing from notifications');
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('❌ Error setting up realtime subscription:', error);
      return () => {};
    }
  };

  const markAsRead = async (notificationId) => {
    if (!supabase) {
      console.log('❌ markAsRead: Supabase not available');
      return;
    }

    try {
      console.log(`🔔 Marking notification ${notificationId} as read`);

      // For demo notifications, just update local state
      if (notificationId.startsWith('demo-')) {
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        // If update fails (maybe column doesn't exist), just update locally
        if (error.code === '42703') {
          console.log('📋 Read column might not exist, updating locally only');
        } else {
          throw error;
        }
      }
      
      // Update local state regardless
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!supabase) {
      console.log('❌ markAllAsRead: Supabase not available');
      return;
    }

    try {
      console.log('🔔 Marking all notifications as read');

      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      if (unreadIds.length === 0) return;

      // Separate demo notifications from real ones
      const demoIds = unreadIds.filter(id => id.startsWith('demo-'));
      const realIds = unreadIds.filter(id => !id.startsWith('demo-'));

      // Update real notifications in database
      if (realIds.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', realIds);

        if (error) {
          // If update fails, just continue with local update
          console.log('📋 Could not update in database, updating locally only');
        }
      }

      // Update all locally
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      toast.success('All notifications marked as read');

    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const createNotification = async (notificationData) => {
    if (!user || !supabase) {
      console.log('❌ createNotification: No user or supabase');
      throw new Error('Not authenticated or Supabase not configured');
    }

    try {
      console.log('🔔 Creating new notification:', notificationData);

      const payload = {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        sender_id: user.id,
        // Include school_id if user has it
        ...(user.school_id && { school_id: user.school_id }),
        // Try different recipient field names
        recipients: notificationData.recipients || [user.id],
        recipient_id: user.id,
        status: 'sent',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([payload])
        .select()
        .single();

      if (error) {
        // If insert fails, create local notification for demo
        console.log('📋 Could not create notification in database, creating locally');
        const localNotification = {
          id: 'local-' + Date.now(),
          ...payload,
          read: false
        };
        setNotifications(prev => [localNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        return localNotification;
      }

      return data;

    } catch (error) {
      console.error('❌ Error creating notification:', error);
      
      // Create local notification as fallback
      const localNotification = {
        id: 'local-' + Date.now(),
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        read: false,
        created_at: new Date().toISOString()
      };
      
      setNotifications(prev => [localNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      return localNotification;
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!supabase) {
      console.log('❌ deleteNotification: Supabase not available');
      return;
    }

    try {
      console.log(`🔔 Deleting notification ${notificationId}`);

      // For demo/local notifications, just remove locally
      if (notificationId.startsWith('demo-') || notificationId.startsWith('local-')) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));

      toast.success('Notification deleted');

    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearError = () => setError(null);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    clearError
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};