import React, { useState, useEffect } from 'react';
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
  School
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    recipients: [],
    send_immediately: true,
    scheduled_time: null
  });

  const notificationTypes = [
    { value: 'info', label: 'Information', icon: Info, color: 'blue' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'green' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'yellow' },
    { value: 'error', label: 'Error', icon: XCircle, color: 'red' },
    { value: 'transport', label: 'Transport', icon: Bus, color: 'purple' },
    { value: 'attendance', label: 'Attendance', icon: User, color: 'cyan' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'gray' },
    { value: 'medium', label: 'Medium', color: 'blue' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ];

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:users!notifications_sender_id_fkey(name, role)
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

  const createNotification = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          ...newNotification,
          sender_id: user?.id,
          school_id: user?.school_id,
          status: 'sent'
        }]);

      if (error) throw error;
      
      toast.success('Notification sent successfully');
      setShowCreateModal(false);
      setNewNotification({
        title: '',
        message: '',
        type: 'info',
        priority: 'medium',
        recipients: [],
        send_immediately: true,
        scheduled_time: null
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error('Failed to send notification');
    }
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
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const getTypeInfo = (type) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  const getPriorityInfo = (priority) => {
    return priorityLevels.find(p => p.value === priority) || priorityLevels[1];
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const StatCard = ({ title, value, icon: Icon, gradient, description }) => (
    <BeautifulCard gradient={gradient} className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-sm text-white/70 mt-1">{description}</p>
          )}
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </BeautifulCard>
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
                <h1 className="text-4xl font-bold text-white">Notifications Center</h1>
                <p className="text-white/80 mt-2">Manage communications and alerts</p>
              </div>
              <div className="flex items-center space-x-4">
                <BeautifulButton
                  onClick={() => setShowCreateModal(true)}
                  variant="success"
                  glow
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Notification
                </BeautifulButton>
                <BeautifulButton variant="info">
                  <Send className="h-4 w-4 mr-2" />
                  Send Bulk
                </BeautifulButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Notifications"
            value={notifications.length}
            icon={Bell}
            gradient="blue"
            description="All time"
          />
          <StatCard
            title="Sent Today"
            value={notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length}
            icon={Send}
            gradient="success"
            description="Last 24 hours"
          />
          <StatCard
            title="High Priority"
            value={notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length}
            icon={AlertTriangle}
            gradient="warning"
            description="Urgent alerts"
          />
          <StatCard
            title="Unread"
            value={notifications.filter(n => !n.read).length}
            icon={Eye}
            gradient="danger"
            description="Pending review"
          />
        </div>

        {/* Filters */}
        <BeautifulCard gradient="info" className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
                <BeautifulInput
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60"
                />
              </div>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all" className="text-gray-900">All Types</option>
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value} className="text-gray-900">{type.label}</option>
              ))}
            </select>
          </div>
        </BeautifulCard>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map((notification) => {
            const typeInfo = getTypeInfo(notification.type);
            const priorityInfo = getPriorityInfo(notification.priority);
            
            return (
              <BeautifulCard key={notification.id} gradient={typeInfo.color} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`w-12 h-12 rounded-full bg-white/20 flex items-center justify-center`}>
                      <typeInfo.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{notification.title}</h3>
                        <BeautifulBadge variant={priorityInfo.color} className="text-xs">
                          {priorityInfo.label}
                        </BeautifulBadge>
                        <BeautifulBadge variant="secondary" className="text-xs">
                          {typeInfo.label}
                        </BeautifulBadge>
                      </div>
                      <p className="text-white/80 mb-3">{notification.message}</p>
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
                          {notification.recipients?.length || 0} recipients
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BeautifulButton
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Eye className="h-4 w-4" />
                    </BeautifulButton>
                    <BeautifulButton
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Edit className="h-4 w-4" />
                    </BeautifulButton>
                    <BeautifulButton
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification(notification.id)}
                      className="text-white hover:bg-red-500/20"
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
            <BeautifulButton
              onClick={() => setShowCreateModal(true)}
              variant="success"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Notification
            </BeautifulButton>
          </BeautifulCard>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modal-beautiful w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Notification</h2>
              <form onSubmit={createNotification} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {notificationTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Enter notification message"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {priorityLevels.map(priority => (
                        <option key={priority.value} value={priority.value}>{priority.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                    <select
                      multiple
                      value={newNotification.recipients}
                      onChange={(e) => setNewNotification({...newNotification, recipients: Array.from(e.target.selectedOptions, option => option.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    >
                      <option value="all_students">All Students</option>
                      <option value="all_parents">All Parents</option>
                      <option value="all_teachers">All Teachers</option>
                      <option value="all_drivers">All Drivers</option>
                      <option value="all_staff">All Staff</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newNotification.send_immediately}
                      onChange={(e) => setNewNotification({...newNotification, send_immediately: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Send immediately</span>
                  </label>
                </div>

                {!newNotification.send_immediately && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Time</label>
                    <input
                      type="datetime-local"
                      value={newNotification.scheduled_time || ''}
                      onChange={(e) => setNewNotification({...newNotification, scheduled_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <BeautifulButton
                    type="button"
                    variant="ghost"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </BeautifulButton>
                  <BeautifulButton type="submit" variant="success">
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </BeautifulButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDashboard;
