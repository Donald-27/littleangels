import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  Mail, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Edit,
  Filter,
  Search,
  Calendar,
  MapPin,
  Bus,
  User,
  School,
  Download,
  Upload,
  Archive,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  Smartphone,
  MailOpen,
  Target,
  Crown,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Reply,
  Forward,
  Bookmark,
  Share2,
  Copy,
  Link,
  QrCode,
  BellOff,
  BellRing,
  CalendarDays,
  Clock4,
  Map,
  Navigation,
  Car,
  Train,
  Bike,
  Plane,
  Ship,
  Rocket,
  Cloud,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  Cloudy
} from 'lucide-react';
import { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent } from '../../components/ui/beautiful-card';
import { BeautifulButton } from '../../components/ui/beautiful-button';
import { BeautifulBadge } from '../../components/ui/beautiful-badge';
import { BeautifulInput } from '../../components/ui/beautiful-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const NotificationsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [bulkSelection, setBulkSelection] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [templates, setTemplates] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [showSettings, setShowSettings] = useState(false);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    recipients: [],
    send_immediately: true,
    scheduled_time: null,
    channels: ['in_app'], // in_app, email, sms, push
    requires_acknowledgment: false,
    template_id: null,
    attachments: []
  });

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: Info, color: 'blue', description: 'General information updates' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'green', description: 'Positive updates and achievements' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'yellow', description: 'Important alerts and warnings' },
    { value: 'error', label: 'Error', icon: XCircle, color: 'red', description: 'Critical errors and issues' },
    { value: 'transport', label: 'Transport', icon: Bus, color: 'purple', description: 'Bus and route updates' },
    { value: 'attendance', label: 'Attendance', icon: User, color: 'cyan', description: 'Attendance-related notifications' },
    { value: 'academic', label: 'Academic', icon: School, color: 'indigo', description: 'Academic updates and events' },
    { value: 'safety', label: 'Safety', icon: Shield, color: 'orange', description: 'Safety and security alerts' },
    { value: 'weather', label: 'Weather', icon: Cloud, color: 'sky', description: 'Weather-related updates' },
    { value: 'emergency', label: 'Emergency', icon: Zap, color: 'rose', description: 'Emergency notifications' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'gray', description: 'Non-urgent information' },
    { value: 'medium', label: 'Medium', color: 'blue', description: 'Important updates' },
    { value: 'high', label: 'High', color: 'orange', description: 'Time-sensitive alerts' },
    { value: 'urgent', label: 'Urgent', color: 'red', description: 'Immediate action required' }
  ];

  const channels = [
    { value: 'in_app', label: 'In-App', icon: Bell, color: 'blue' },
    { value: 'email', label: 'Email', icon: Mail, color: 'green' },
    { value: 'sms', label: 'SMS', icon: MessageSquare, color: 'yellow' },
    { value: 'push', label: 'Push', icon: Smartphone, color: 'purple' }
  ];

  const recipientGroups = [
    { value: 'all_students', label: 'All Students', count: 250, icon: User },
    { value: 'all_parents', label: 'All Parents', count: 500, icon: Users },
    { value: 'all_teachers', label: 'All Teachers', count: 45, icon: School },
    { value: 'all_drivers', label: 'All Drivers', count: 12, icon: Bus },
    { value: 'all_staff', label: 'All Staff', count: 30, icon: Users },
    { value: 'grade_1', label: 'Grade 1 Students', count: 50, icon: User },
    { value: 'grade_2', label: 'Grade 2 Students', count: 48, icon: User },
    { value: 'grade_3', label: 'Grade 3 Students', count: 52, icon: User },
    { value: 'route_a', label: 'Route A Students', count: 35, icon: MapPin },
    { value: 'route_b', label: 'Route B Students', count: 42, icon: MapPin }
  ];

  useEffect(() => {
    fetchNotifications();
    fetchAnalytics();
    fetchTemplates();
    fetchUserPreferences();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!notifications_sender_id_fkey(name, role, avatar_url),
          notification_analytics(view_count, click_count, acknowledge_count),
          notification_recipients(user_id, status, read_at, acknowledged_at)
        `)
        .eq('school_id', user?.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_analytics')
        .select('*')
        .eq('school_id', user?.school_id);

      if (error) throw error;
      
      // Calculate analytics
      const totalNotifications = notifications.length;
      const readNotifications = notifications.filter(n => 
        n.notification_recipients?.some(r => r.read_at)
      ).length;
      const acknowledgedNotifications = notifications.filter(n => 
        n.notification_recipients?.some(r => r.acknowledged_at)
      ).length;

      setAnalytics({
        total: totalNotifications,
        read: readNotifications,
        acknowledged: acknowledgedNotifications,
        engagementRate: totalNotifications > 0 ? (readNotifications / totalNotifications) * 100 : 0,
        acknowledgmentRate: totalNotifications > 0 ? (acknowledgedNotifications / totalNotifications) * 100 : 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('school_id', user?.school_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      setUserPreferences(data || {
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        quiet_hours: { start: '22:00', end: '07:00' },
        categories: ['transport', 'attendance', 'academic', 'safety']
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const createNotification = async (e) => {
    e.preventDefault();
    try {
      const notificationData = {
        ...newNotification,
        sender_id: user?.id,
        school_id: user?.school_id,
        status: newNotification.send_immediately ? 'sent' : 'scheduled',
        scheduled_for: newNotification.send_immediately ? null : newNotification.scheduled_time
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select();

      if (error) throw error;

      // Create recipient records
      if (data && data[0]) {
        const recipients = await createRecipientRecords(data[0].id, newNotification.recipients);
        
        // Send notifications through different channels
        await sendNotificationChannels(data[0], recipients);
      }

      toast.success('Notification sent successfully');
      setShowCreateModal(false);
      resetNewNotification();
      fetchNotifications();
      fetchAnalytics();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const createRecipientRecords = async (notificationId, recipientGroups) => {
    try {
      // This would typically fetch actual user IDs based on recipient groups
      const recipientUsers = await getUsersFromGroups(recipientGroups);
      
      const recipientRecords = recipientUsers.map(userId => ({
        notification_id: notificationId,
        user_id: userId,
        status: 'sent',
        sent_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('notification_recipients')
        .insert(recipientRecords);

      if (error) throw error;
      return recipientRecords;
    } catch (error) {
      console.error('Error creating recipient records:', error);
      throw error;
    }
  };

  const getUsersFromGroups = async (groups) => {
    // Simulate fetching user IDs based on groups
    // In a real implementation, this would query your users table
    return Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => i);
  };

  const sendNotificationChannels = async (notification, recipients) => {
    const channels = newNotification.channels;
    
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            await sendEmailNotification(notification, recipients);
            break;
          case 'sms':
            await sendSMSNotification(notification, recipients);
            break;
          case 'push':
            await sendPushNotification(notification, recipients);
            break;
          case 'in_app':
            // In-app notifications are handled by the system
            break;
        }
      } catch (error) {
        console.error(`Error sending ${channel} notification:`, error);
      }
    }
  };

  const sendEmailNotification = async (notification, recipients) => {
    // Implement email sending logic
    console.log('Sending email notification:', notification);
  };

  const sendSMSNotification = async (notification, recipients) => {
    // Implement SMS sending logic
    console.log('Sending SMS notification:', notification);
  };

  const sendPushNotification = async (notification, recipients) => {
    // Implement push notification logic
    console.log('Sending push notification:', notification);
  };

  const deleteNotification = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Notification deleted successfully');
      fetchNotifications();
      fetchAnalytics();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const bulkDeleteNotifications = async () => {
    if (!bulkSelection.length || !confirm(`Are you sure you want to delete ${bulkSelection.length} notifications?`)) return;
    
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', bulkSelection);

      if (error) throw error;
      
      toast.success(`${bulkSelection.length} notifications deleted successfully`);
      setBulkSelection([]);
      fetchNotifications();
      fetchAnalytics();
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  const archiveNotification = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'archived' })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Notification archived');
      fetchNotifications();
    } catch (error) {
      console.error('Error archiving notification:', error);
      toast.error('Failed to archive notification');
    }
  };

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notification_recipients')
        .update({ read_at: new Date().toISOString() })
        .eq('notification_id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const acknowledgeNotification = async (id) => {
    try {
      const { error } = await supabase
        .from('notification_recipients')
        .update({ acknowledged_at: new Date().toISOString() })
        .eq('notification_id', id)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast.success('Notification acknowledged');
      fetchNotifications();
      fetchAnalytics();
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  };

  const useTemplate = (template) => {
    setNewNotification({
      ...newNotification,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      template_id: template.id
    });
    setShowTemplatesModal(false);
    setShowCreateModal(true);
  };

  const saveAsTemplate = async () => {
    try {
      const { error } = await supabase
        .from('notification_templates')
        .insert([{
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type,
          priority: newNotification.priority,
          school_id: user?.school_id,
          created_by: user?.id
        }]);

      if (error) throw error;
      
      toast.success('Template saved successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const updateUserPreferences = async (updates) => {
    try {
      const newPreferences = { ...userPreferences, ...updates };
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user?.id,
          ...newPreferences
        });

      if (error) throw error;
      
      setUserPreferences(newPreferences);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const getTypeInfo = (type) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const getPriorityInfo = (priority) => {
    return priorityLevels.find(p => p.value === priority) || priorityLevels[1];
  };

  const resetNewNotification = () => {
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      recipients: [],
      send_immediately: true,
      scheduled_time: null,
      channels: ['in_app'],
      requires_acknowledgment: false,
      template_id: null,
      attachments: []
    });
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || notification.type === filterType;
      const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
      
      let matchesTab = true;
      switch (selectedTab) {
        case 'unread':
          matchesTab = !notification.notification_recipients?.some(r => r.user_id === user?.id && r.read_at);
          break;
        case 'urgent':
          matchesTab = notification.priority === 'urgent' || notification.priority === 'high';
          break;
        case 'archived':
          matchesTab = notification.status === 'archived';
          break;
        case 'scheduled':
          matchesTab = notification.status === 'scheduled';
          break;
      }
      
      return matchesSearch && matchesType && matchesPriority && matchesStatus && matchesTab;
    });
  }, [notifications, searchTerm, filterType, filterPriority, filterStatus, selectedTab, user]);

  const StatCard = ({ title, value, icon: Icon, gradient, description, trend, onClick }) => (
    <BeautifulCard 
      gradient={gradient} 
      className="p-6 cursor-pointer transform hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-sm text-white/70 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? 'text-green-300' : 'text-red-300'}`} />
              <span className={`text-sm ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </BeautifulCard>
  );

  const ChannelIndicator = ({ channels }) => (
    <div className="flex items-center space-x-1">
      {channels.includes('in_app') && <Bell className="h-4 w-4 text-blue-400" />}
      {channels.includes('email') && <Mail className="h-4 w-4 text-green-400" />}
      {channels.includes('sms') && <MessageSquare className="h-4 w-4 text-yellow-400" />}
      {channels.includes('push') && <Smartphone className="h-4 w-4 text-purple-400" />}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-beautiful mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">Smart Notifications Center</h1>
                <p className="text-white/80 mt-2">Advanced communication and alert management system</p>
              </div>
              <div className="flex items-center space-x-3">
                <BeautifulButton
                  onClick={() => setShowAnalyticsModal(true)}
                  variant="info"
                  glow
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </BeautifulButton>
                <BeautifulButton
                  onClick={() => setShowTemplatesModal(true)}
                  variant="secondary"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Templates
                </BeautifulButton>
                <BeautifulButton
                  onClick={() => setShowSettings(true)}
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4" />
                </BeautifulButton>
                <BeautifulButton
                  onClick={() => setShowCreateModal(true)}
                  variant="success"
                  glow
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Notification
                </BeautifulButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Notifications"
            value={analytics.total || 0}
            icon={Bell}
            gradient="blue"
            description="All time"
            trend={5.2}
            onClick={() => setShowAnalyticsModal(true)}
          />
          <StatCard
            title="Engagement Rate"
            value={`${Math.round(analytics.engagementRate || 0)}%`}
            icon={MailOpen}
            gradient="success"
            description="Read notifications"
            trend={2.1}
          />
          <StatCard
            title="Urgent Alerts"
            value={notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length}
            icon={AlertTriangle}
            gradient="warning"
            description="High priority"
            trend={-1.5}
          />
          <StatCard
            title="Acknowledged"
            value={`${Math.round(analytics.acknowledgmentRate || 0)}%`}
            icon={CheckCircle}
            gradient="danger"
            description="Confirmed receipts"
            trend={3.8}
          />
        </div>

        {/* Enhanced Filters and Controls */}
        <BeautifulCard gradient="info" className="p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <BeautifulInput
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60"
                />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all" className="text-gray-900">All Types</option>
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value} className="text-gray-900">
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all" className="text-gray-900">All Priorities</option>
                {priorityLevels.map(priority => (
                  <option key={priority.value} value={priority.value} className="text-gray-900">
                    {priority.label}
                  </option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all" className="text-gray-900">All Status</option>
                <option value="sent" className="text-gray-900">Sent</option>
                <option value="scheduled" className="text-gray-900">Scheduled</option>
                <option value="archived" className="text-gray-900">Archived</option>
              </select>
            </div>
            
            {bulkSelection.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">
                  {bulkSelection.length} selected
                </span>
                <BeautifulButton
                  onClick={bulkDeleteNotifications}
                  variant="danger"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </BeautifulButton>
                <BeautifulButton
                  onClick={() => setBulkSelection([])}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  Cancel
                </BeautifulButton>
              </div>
            )}
          </div>
        </BeautifulCard>

        {/* Enhanced Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid grid-cols-5 mb-6 bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg p-1">
            <TabsTrigger value="all" className="text-white data-[state=active]:bg-white/30">
              All Notifications
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-white data-[state=active]:bg-white/30">
              Unread
            </TabsTrigger>
            <TabsTrigger value="urgent" className="text-white data-[state=active]:bg-white/30">
              Urgent
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="text-white data-[state=active]:bg-white/30">
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-white data-[state=active]:bg-white/30">
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Enhanced Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const typeInfo = getTypeInfo(notification.type);
            const priorityInfo = getPriorityInfo(notification.priority);
            const isRead = notification.notification_recipients?.some(r => r.user_id === user?.id && r.read_at);
            const isAcknowledged = notification.notification_recipients?.some(r => r.user_id === user?.id && r.acknowledged_at);
            const isSelected = bulkSelection.includes(notification.id);
            
            return (
              <BeautifulCard 
                key={notification.id} 
                gradient={typeInfo.color} 
                className={`p-6 transition-all ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent' : ''} ${
                  !isRead ? 'border-l-4 border-l-white' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelection(prev => [...prev, notification.id]);
                          } else {
                            setBulkSelection(prev => prev.filter(id => id !== notification.id));
                          }
                        }}
                        className="mt-2 w-4 h-4 text-blue-600 bg-white border-white rounded focus:ring-blue-500"
                      />
                      <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center`}>
                        <typeInfo.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`text-lg font-semibold ${isRead ? 'text-white/90' : 'text-white'}`}>
                          {notification.title}
                        </h3>
                        <BeautifulBadge variant={priorityInfo.color} className="text-xs">
                          {priorityInfo.label}
                        </BeautifulBadge>
                        <BeautifulBadge variant="secondary" className="text-xs">
                          {typeInfo.label}
                        </BeautifulBadge>
                        <ChannelIndicator channels={notification.channels || ['in_app']} />
                      </div>
                      <p className={`mb-3 ${isRead ? 'text-white/80' : 'text-white'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {notification.sender?.name || 'System'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {notification.notification_recipients?.length || 0} recipients
                        </span>
                        {notification.notification_analytics && (
                          <>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {notification.notification_analytics.view_count || 0}
                            </span>
                            <span className="flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {notification.notification_analytics.acknowledge_count || 0}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isRead && (
                      <BeautifulButton
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="text-white hover:bg-white/20"
                        title="Mark as read"
                      >
                        <Eye className="h-4 w-4" />
                      </BeautifulButton>
                    )}
                    {notification.requires_acknowledgment && !isAcknowledged && (
                      <BeautifulButton
                        variant="ghost"
                        size="sm"
                        onClick={() => acknowledgeNotification(notification.id)}
                        className="text-white hover:bg-green-500/20"
                        title="Acknowledge"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </BeautifulButton>
                    )}
                    <BeautifulButton
                      variant="ghost"
                      size="sm"
                      onClick={() => archiveNotification(notification.id)}
                      className="text-white hover:bg-yellow-500/20"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </BeautifulButton>
                    <BeautifulButton
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-white hover:bg-red-500/20"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </BeautifulButton>
                  </div>
                </div>
              </BeautifulCard>
            );
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <BeautifulCard gradient="info" className="p-12 text-center">
            <Bell className="h-16 w-16 text-white/60 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Notifications Found</h3>
            <p className="text-white/80 mb-6">No notifications match your current filters.</p>
            <div className="flex justify-center space-x-4">
              <BeautifulButton
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterPriority('all');
                  setFilterStatus('all');
                  setSelectedTab('all');
                }}
                variant="secondary"
              >
                Clear Filters
              </BeautifulButton>
              <BeautifulButton
                onClick={() => setShowCreateModal(true)}
                variant="success"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </BeautifulButton>
            </div>
          </BeautifulCard>
        )}
      </div>

      {/* Enhanced Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-beautiful w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Smart Notification</h2>
                <div className="flex items-center space-x-2">
                  <BeautifulButton
                    onClick={saveAsTemplate}
                    variant="secondary"
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Save Template
                  </BeautifulButton>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetNewNotification();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={createNotification} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                    <BeautifulInput
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                      placeholder="Enter notification title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {notificationTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Enter detailed notification message..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                    required
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {newNotification.message.length}/500 characters
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const templates = [
                          "Important update regarding school transportation.",
                          "Weather alert: Changes to pickup/dropoff schedules.",
                          "Reminder: Parent-teacher meeting scheduled.",
                          "Emergency notification: School closure information."
                        ];
                        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
                        setNewNotification({...newNotification, message: randomTemplate});
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Use template
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {priorityLevels.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {channels.map(channel => (
                        <label key={channel.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newNotification.channels.includes(channel.value)}
                            onChange={(e) => {
                              const updatedChannels = e.target.checked
                                ? [...newNotification.channels, channel.value]
                                : newNotification.channels.filter(c => c !== channel.value);
                              setNewNotification({...newNotification, channels: updatedChannels});
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <channel.icon className="h-4 w-4" />
                          <span className="text-sm">{channel.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipients *</label>
                    <select
                      multiple
                      value={newNotification.recipients}
                      onChange={(e) => setNewNotification({
                        ...newNotification, 
                        recipients: Array.from(e.target.selectedOptions, option => option.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                      required
                    >
                      {recipientGroups.map(group => (
                        <option key={group.value} value={group.value} className="text-gray-900">
                          {group.label} ({group.count})
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-between mt-1">
                      <span className="text-sm text-gray-500">
                        {newNotification.recipients.length} groups selected
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewNotification({...newNotification, recipients: ['all_parents', 'all_students']})}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Select all
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newNotification.send_immediately}
                        onChange={(e) => setNewNotification({...newNotification, send_immediately: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Send immediately</span>
                        <p className="text-sm text-gray-500">Send notification right away</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newNotification.requires_acknowledgment}
                        onChange={(e) => setNewNotification({...newNotification, requires_acknowledgment: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Require acknowledgment</span>
                        <p className="text-sm text-gray-500">Recipients must confirm receipt</p>
                      </div>
                    </label>
                  </div>

                  {!newNotification.send_immediately && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
                      <input
                        type="datetime-local"
                        value={newNotification.scheduled_time || ''}
                        onChange={(e) => setNewNotification({...newNotification, scheduled_time: e.target.value})}
                        min={new Date().toISOString().slice(0, 16)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <BeautifulButton
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetNewNotification();
                    }}
                  >
                    Cancel
                  </BeautifulButton>
                  <BeautifulButton type="submit" variant="success" glow>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </BeautifulButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-beautiful w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notification Analytics</h2>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <BeautifulCard gradient="blue" className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Total Sent</h3>
                  <p className="text-3xl font-bold text-white">{analytics.total}</p>
                </BeautifulCard>
                
                <BeautifulCard gradient="green" className="p-6 text-center">
                  <MailOpen className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Engagement Rate</h3>
                  <p className="text-3xl font-bold text-white">{Math.round(analytics.engagementRate)}%</p>
                </BeautifulCard>
                
                <BeautifulCard gradient="purple" className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-white mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Acknowledgment Rate</h3>
                  <p className="text-3xl font-bold text-white">{Math.round(analytics.acknowledgmentRate)}%</p>
                </BeautifulCard>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BeautifulCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications by Type</h3>
                  <div className="space-y-3">
                    {notificationTypes.map(type => {
                      const count = notifications.filter(n => n.type === type.value).length;
                      const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                      return (
                        <div key={type.value} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <type.icon className={`h-5 w-5 text-${type.color}-500`} />
                            <span className="text-sm font-medium text-gray-700">{type.label}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full bg-${type.color}-500`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </BeautifulCard>

                <BeautifulCard className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Delivery Success</span>
                        <span className="text-sm text-gray-600">98%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Open Rate</span>
                        <span className="text-sm text-gray-600">76%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Click-through Rate</span>
                        <span className="text-sm text-gray-600">42%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </BeautifulCard>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Modal */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-beautiful w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notification Templates</h2>
                <button
                  onClick={() => setShowTemplatesModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {templates.map(template => {
                  const typeInfo = getTypeInfo(template.type);
                  return (
                    <BeautifulCard key={template.id} gradient={typeInfo.color} className="p-4 cursor-pointer hover:scale-105 transition-transform">
                      <div onClick={() => useTemplate(template)}>
                        <div className="flex items-center space-x-2 mb-3">
                          <typeInfo.icon className="h-5 w-5 text-white" />
                          <h3 className="font-semibold text-white">{template.title}</h3>
                        </div>
                        <p className="text-white/80 text-sm line-clamp-3">{template.message}</p>
                        <div className="flex justify-between items-center mt-3">
                          <BeautifulBadge variant="secondary" className="text-xs">
                            {getPriorityInfo(template.priority).label}
                          </BeautifulBadge>
                          <span className="text-white/60 text-xs">
                            {new Date(template.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </BeautifulCard>
                  );
                })}
              </div>

              {templates.length === 0 && (
                <div className="text-center py-12">
                  <Copy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Available</h3>
                  <p className="text-gray-600 mb-6">Create your first template to save time on frequent notifications.</p>
                  <BeautifulButton
                    onClick={() => {
                      setShowTemplatesModal(false);
                      setShowCreateModal(true);
                    }}
                    variant="success"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </BeautifulButton>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-beautiful w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Channels</h3>
                  <div className="space-y-3">
                    {channels.map(channel => (
                      <label key={channel.value} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <channel.icon className={`h-5 w-5 text-${channel.color}-500`} />
                          <div>
                            <span className="font-medium text-gray-700">{channel.label}</span>
                            <p className="text-sm text-gray-500">Receive notifications via {channel.label.toLowerCase()}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={userPreferences[`${channel.value}_notifications`] !== false}
                          onChange={(e) => updateUserPreferences({
                            [`${channel.value}_notifications`]: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {notificationTypes.map(type => (
                      <label key={type.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={userPreferences.categories?.includes(type.value) !== false}
                          onChange={(e) => {
                            const currentCategories = userPreferences.categories || [];
                            const updatedCategories = e.target.checked
                              ? [...currentCategories, type.value]
                              : currentCategories.filter(c => c !== type.value);
                            updateUserPreferences({ categories: updatedCategories });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <type.icon className={`h-5 w-5 text-${type.color}-500`} />
                        <div>
                          <span className="font-medium text-gray-700">{type.label}</span>
                          <p className="text-sm text-gray-500">{type.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                      <input
                        type="time"
                        value={userPreferences.quiet_hours?.start || '22:00'}
                        onChange={(e) => updateUserPreferences({
                          quiet_hours: { ...userPreferences.quiet_hours, start: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                      <input
                        type="time"
                        value={userPreferences.quiet_hours?.end || '07:00'}
                        onChange={(e) => updateUserPreferences({
                          quiet_hours: { ...userPreferences.quiet_hours, end: e.target.value }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Notifications will be delayed during quiet hours (except for urgent alerts)
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
                <BeautifulButton
                  onClick={() => setShowSettings(false)}
                  variant="ghost"
                >
                  Close
                </BeautifulButton>
                <BeautifulButton
                  onClick={() => {
                    // Reset to default preferences
                    updateUserPreferences({
                      email_notifications: true,
                      push_notifications: true,
                      sms_notifications: false,
                      quiet_hours: { start: '22:00', end: '07:00' },
                      categories: ['transport', 'attendance', 'academic', 'safety']
                    });
                  }}
                  variant="secondary"
                >
                  Reset to Defaults
                </BeautifulButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDashboard;