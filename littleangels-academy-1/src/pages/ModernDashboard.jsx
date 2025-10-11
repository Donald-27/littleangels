import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Bus, 
  BookOpen, 
  Shield, 
  DollarSign,
  Heart,
  Star,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Activity,
  Bell,
  MapPin,
  Clock,
  BarChart3,
  Settings,
  MessageCircle,
  LogOut,
  User,
  Home,
  Calendar,
  FileText,
  ShieldCheck,
  Wifi,
  Battery,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  RotateCw
} from 'lucide-react';

// Import modern components
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernStatsCard } from '../components/ui/modern-card';
import { ModernButton, ModernIconButton } from '../components/ui/modern-button';
import { Badge } from '../components/ui/badge';

/**
 * Enhanced Modern Dashboard Selector with Comprehensive Features
 */
const ModernDashboard = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [realTimeData, setRealTimeData] = useState({
    systemStatus: 'operational',
    activeBuses: 12,
    onlineUsers: 47,
    lastUpdate: new Date(),
    weather: 'sunny',
    temperature: 24
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'info', title: 'System Update', message: 'New features available', time: '2 min ago', read: false },
    { id: 2, type: 'success', title: 'Payment Received', message: 'KES 15,000 received', time: '1 hour ago', read: true },
    { id: 3, type: 'warning', title: 'Maintenance', message: 'Scheduled maintenance tonight', time: '3 hours ago', read: true }
  ]);
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'login', user: 'You', time: 'Just now', icon: User },
    { id: 2, action: 'payment_processed', user: 'Finance Team', time: '5 min ago', icon: DollarSign },
    { id: 3, action: 'bus_departed', user: 'Bus KA-123', time: '15 min ago', icon: Bus }
  ]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        lastUpdate: new Date(),
        activeBuses: Math.floor(Math.random() * 5) + 10,
        onlineUsers: Math.floor(Math.random() * 10) + 40
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const dashboards = [
    {
      role: 'admin',
      title: 'Admin Command Center',
      description: 'Complete system oversight and management',
      icon: Shield,
      gradient: 'violet-coral',
      features: ['Student Management', 'Staff Oversight', 'Transport Control', 'Analytics Hub', 'System Reports', 'Security Settings'],
      color: 'from-violet-500 to-orange-500',
      stats: { users: '1,247', vehicles: '24', efficiency: '98.5%' },
      path: '/admin'
    },
    {
      role: 'teacher',
      title: 'Teacher Hub',
      description: 'Classroom management and student insights',
      icon: BookOpen,
      gradient: 'teal-violet',
      features: ['Student Records', 'Attendance Tracking', 'Performance Analytics', 'Parent Communication', 'Lesson Planning'],
      color: 'from-teal-500 to-violet-500',
      stats: { students: '156', attendance: '94.2%', grades: '8.7/10' },
      path: '/teacher'
    },
    {
      role: 'parent',
      title: 'Parent Portal',
      description: 'Your child\'s journey in real-time',
      icon: Heart,
      gradient: 'teal-coral',
      features: ['Live Bus Tracking', 'Attendance Updates', 'Academic Progress', 'Payment History', 'Safety Alerts'],
      color: 'from-teal-500 to-orange-500',
      stats: { children: '2', safety: '100%', payments: 'Current' },
      path: '/parent'
    },
    {
      role: 'driver',
      title: 'Driver Dashboard',
      description: 'Route optimization and safety first',
      icon: Bus,
      gradient: 'violet',
      features: ['GPS Navigation', 'Student Manifest', 'Safety Protocols', 'Trip Reports', 'Vehicle Status'],
      color: 'from-violet-600 to-violet-400',
      stats: { routes: '3', onTime: '96.8%', safety: '5★' },
      path: '/driver'
    },
    {
      role: 'accounts',
      title: 'Finance Center',
      description: 'Financial oversight and billing management',
      icon: DollarSign,
      gradient: 'coral',
      features: ['Revenue Tracking', 'Payment Processing', 'Financial Reports', 'Budget Analysis', 'Invoice Management'],
      color: 'from-orange-600 to-orange-400',
      stats: { revenue: 'KES 2.4M', payments: '99.1%', growth: '+12.5%' },
      path: '/accounts'
    }
  ];

  const currentDashboard = dashboards.find(d => d.role === user?.role);
  
  // Admin can access all dashboards, others only their own
  const availableDashboards = user?.role === 'admin' 
    ? dashboards 
    : dashboards.filter(d => d.role === user?.role);

  const handleDashboardSelect = (dashboard) => {
    navigate(dashboard.path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSwitchUser = () => {
    navigate('/login');
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-violet-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-violet-50 to-orange-50">
      {/* Navigation Header */}
      <header className="p-6 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 via-violet-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
              LA
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-violet-600 to-orange-600 bg-clip-text text-transparent">
                Little Angels Academy
              </h1>
              <p className="text-gray-600">Smart School Transport & Safety System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Real-time Status Badge */}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>

            {/* Notifications */}
            <div className="relative">
              <ModernIconButton
                variant="glass-teal"
                icon={<Bell className="w-5 h-5" />}
                onClick={() => setActiveTab('notifications')}
              />
              {unreadNotifications > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
                  {unreadNotifications}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative group">
              <ModernIconButton
                variant="glass-violet"
                icon={<User className="w-5 h-5" />}
              />
              <div className="absolute right-0 top-12 w-48 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <div className="p-4 border-b border-gray-200/50">
                  <p className="font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                </div>
                <div className="p-2">
                  <button 
                    onClick={handleSwitchUser}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Switch User</span>
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>

            <ModernButton variant="outline-coral" onClick={handleSignOut} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </ModernButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Welcome Section */}
        <div className="text-center mb-12 mt-8">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-500 via-violet-500 to-orange-500 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Your personalized dashboard is ready. Choose your role to access specialized tools and insights.
          </p>
        </div>

        {/* Real-time Status Bar */}
        <ModernCard variant="glass" className="mb-8 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  realTimeData.systemStatus === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm font-medium text-gray-700">
                  System: {realTimeData.systemStatus.charAt(0).toUpperCase() + realTimeData.systemStatus.slice(1)}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Bus className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">{realTimeData.activeBuses} active buses</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-gray-600">{realTimeData.onlineUsers} users online</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {realTimeData.weather === 'sunny' ? (
                  <Sun className="h-4 w-4 text-yellow-500" />
                ) : (
                  <CloudRain className="h-4 w-4 text-blue-500" />
                )}
                <span className="text-sm text-gray-600">
                  {realTimeData.weather} • {realTimeData.temperature}°C
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-xs text-gray-500">Last update</p>
              <p className="text-sm font-medium text-gray-700">
                {realTimeData.lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </ModernCard>

        {/* Quick Stats */}
        {currentDashboard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {Object.entries(currentDashboard.stats).map(([key, value], index) => (
              <ModernStatsCard
                key={key}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                gradient={['teal', 'violet', 'coral'][index % 3]}
                trend={Math.random() * 10 + 5}
                glow={true}
                onClick={() => handleDashboardSelect(currentDashboard)}
              />
            ))}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50">
            {['overview', 'dashboards', 'notifications', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {availableDashboards.map((dashboard) => (
                <ModernCard
                  key={dashboard.role}
                  variant="glass"
                  hover={true}
                  glow={hoveredRole === dashboard.role}
                  className="relative group cursor-pointer h-full"
                  onClick={() => handleDashboardSelect(dashboard)}
                  onMouseEnter={() => setHoveredRole(dashboard.role)}
                  onMouseLeave={() => setHoveredRole(null)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${dashboard.color} opacity-5 rounded-[20px] group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <ModernCardHeader className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${dashboard.color} rounded-2xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                          <dashboard.icon className="w-8 h-8" />
                        </div>
                        <div>
                          <ModernCardTitle gradient={true} gradientType={dashboard.gradient.split('-')[0]}>
                            {dashboard.title}
                          </ModernCardTitle>
                          <p className="text-gray-600 mt-1 text-sm">{dashboard.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </ModernCardContent>

                  <ModernCardContent className="relative">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Key Features:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {dashboard.features.slice(0, 4).map((feature, index) => (
                            <div key={feature} className="flex items-center space-x-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {dashboard.role === user?.role && (
                        <div className="pt-4 border-t border-gray-200/50">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-600">Your Active Dashboard</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </ModernCardContent>
                </ModernCard>
              ))}
            </div>

            {/* Quick Actions */}
            <ModernCard variant="glass" className="p-8">
              <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ModernButton 
                  variant="glass-teal" 
                  className="p-6 h-auto flex-col space-y-2"
                  onClick={() => navigate('/tracking')}
                >
                  <MapPin className="w-6 h-6" />
                  <span>Track Buses</span>
                </ModernButton>
                <ModernButton 
                  variant="glass-violet" 
                  className="p-6 h-auto flex-col space-y-2"
                  onClick={() => navigate('/reports')}
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>View Reports</span>
                </ModernButton>
                <ModernButton 
                  variant="glass-coral" 
                  className="p-6 h-auto flex-col space-y-2"
                  onClick={() => navigate('/messages')}
                >
                  <MessageCircle className="w-6 h-6" />
                  <span>Messages</span>
                </ModernButton>
                <ModernButton 
                  variant="glass" 
                  className="p-6 h-auto flex-col space-y-2"
                  onClick={() => navigate('/status')}
                >
                  <Activity className="w-6 h-6" />
                  <span>Live Status</span>
                </ModernButton>
              </div>
            </ModernCard>
          </div>
        )}

        {activeTab === 'notifications' && (
          <ModernCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
                Notifications
              </h3>
              <Badge variant="outline" className="bg-teal-50 text-teal-700">
                {unreadNotifications} unread
              </Badge>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-2xl border transition-all duration-300 ${
                    notification.read 
                      ? 'bg-gray-50/50 border-gray-200/50' 
                      : 'bg-white border-teal-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        notification.type === 'info' ? 'bg-blue-500' :
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <h4 className="font-semibold text-gray-800">{notification.title}</h4>
                        <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                        <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        )}

        {activeTab === 'activity' && (
          <ModernCard variant="glass" className="p-6">
            <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-2xl bg-white/50 border border-gray-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-violet-100 rounded-xl flex items-center justify-center">
                    <activity.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">
                      {activity.action === 'login' ? 'User logged in' :
                       activity.action === 'payment_processed' ? 'Payment processed' :
                       activity.action === 'bus_departed' : 'Bus departed'}
                    </p>
                    <p className="text-gray-600 text-sm">{activity.user}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </ModernCard>
        )}

        {/* System Status Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard variant="glass" glow={true} className="text-center p-6 cursor-pointer" onClick={() => navigate('/status')}>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">System Status</h4>
            <p className="text-green-600 font-medium">All Systems Operational</p>
          </ModernCard>

          <ModernCard variant="glass" glow={true} className="text-center p-6 cursor-pointer" onClick={() => navigate('/performance')}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Last Updated</h4>
            <p className="text-blue-600 font-medium">Just now</p>
          </ModernCard>

          <ModernCard variant="glass" glow={true} className="text-center p-6 cursor-pointer" onClick={() => navigate('/analytics')}>
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Performance</h4>
            <p className="text-violet-600 font-medium">Excellent (98.5%)</p>
          </ModernCard>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-gray-200/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 via-violet-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                LA
              </div>
              <p className="text-gray-600">Little Angels Academy Management System</p>
            </div>
            <div className="flex items-center space-x-6">
              <button 
                onClick={handleSwitchUser}
                className="text-teal-600 hover:text-teal-700 text-sm font-medium transition-colors"
              >
                Switch User
              </button>
              <button 
                onClick={() => navigate('/help')}
                className="text-violet-600 hover:text-violet-700 text-sm font-medium transition-colors"
              >
                Help & Support
              </button>
              <button 
                onClick={() => navigate('/privacy')}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          </div>
          <div className="text-center mt-6 pt-6 border-t border-gray-200/50">
            <p className="text-gray-500 text-sm">
              ✨ Powered by Modern Design System - Little Angels Academy ✨
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernDashboard;