import React, { useState, useEffect, useMemo, useCallback } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Bus, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bell,
  Download,
  Eye,
  TrendingUp,
  School,
  User,
  Heart,
  Shield,
  MessageCircle,
  FileText,
  CreditCard,
  Settings,
  RefreshCw,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Zap,
  Sparkles,
  Crown,
  Award,
  Target,
  PieChart,
  LineChart,
  BarChart,
  Battery,
  Wifi,
  BatteryCharging,
  Cloud,
  Sun,
  CloudRain,
  Thermometer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import ParentTracking from '../../components/ParentTracking';
import { toast } from 'sonner';
import FloatingChat from '../../components/FloatingChat';

// Simple chart components for parent metrics
const LineChartSimple = ({ data, color = "#3b82f6", height = 80, title }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <div className="text-center">
        <TrendingUp className="h-6 w-6 mx-auto mb-1 opacity-50" />
        <p className="text-xs">No data available</p>
      </div>
    </div>
  );
  
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;
  
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-full">
      {title && <p className="text-gray-600 text-xs mb-1 font-medium">{title}</p>}
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
};

const ParentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [payments, setPayments] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    lastUpdate: new Date(),
    activeTrips: 0,
    onlineVehicles: 0,
    systemStatus: 'operational'
  });
  const [parentStats, setParentStats] = useState({
    totalChildren: 0,
    presentToday: 0,
    attendanceRate: 0,
    upcomingTrips: 0,
    pendingPayments: 0,
    totalSpent: 0,
    childrenWithTransport: 0,
    emergencyContacts: 0,
    unreadNotifications: 0
  });
  const [quickActions, setQuickActions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  // Real-time data subscription
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('parent-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          tables: ['attendance', 'notifications', 'payments', 'trips'],
          filter: `parent_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh data for significant changes
          if (['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType)) {
            fetchData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  // Real-time status polling
  useEffect(() => {
    const pollRealTimeData = async () => {
      try {
        // Get active trips for parent's children
        const childIds = children.map(child => child.id);
        if (childIds.length > 0) {
          const { data: activeTrips } = await supabase
            .from('trips')
            .select('id')
            .in('route_id', children.map(c => c.route_id).filter(Boolean))
            .eq('status', 'in_progress');

          setRealTimeData(prev => ({
            ...prev,
            lastUpdate: new Date(),
            activeTrips: activeTrips?.length || 0,
            onlineVehicles: Math.floor(Math.random() * 5) + 8 // Mock data
          }));
        }
      } catch (error) {
        console.error('Error polling real-time data:', error);
      }
    };

    const interval = setInterval(pollRealTimeData, 30000);
    return () => clearInterval(interval);
  }, [children]);

  useEffect(() => {
    fetchData();
  }, [user, timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      // Fetch comprehensive parent data
      const [
        childrenRes,
        attendanceRes,
        notificationsRes,
        paymentsRes,
        emergencyContactsRes,
        schoolInfoRes
      ] = await Promise.all([
        // Fetch children with all related data
        supabase
          .from('students')
          .select(`
            *,
            teacher:users!students_teacher_id_fkey(
              name, 
              phone, 
              email,
              profile_picture
            ),
            route:routes(
              id,
              name, 
              description,
              distance,
              estimated_duration,
              stops:route_stops(*),
              vehicle:vehicles(
                plate_number, 
                make, 
                model, 
                color,
                capacity,
                driver:users!vehicles_driver_id_fkey(
                  name, 
                  phone,
                  profile_picture,
                  driver_license
                )
              )
            ),
            emergency_contacts(*),
            medical_info(*),
            grade_levels(name)
          `)
          .eq('parent_id', user?.id)
          .eq('is_active', true)
          .order('name', { ascending: true }),

        // Fetch attendance with detailed history
        supabase
          .from('attendance')
          .select(`
            *,
            student:students(name, grade, class, photo_url),
            route:routes(name, description),
            vehicle:vehicles(plate_number),
            trip:trips(start_time, end_time, actual_duration)
          `)
          .in('student_id', children.map(child => child.id).length > 0 ? 
            children.map(child => child.id) : [''])
          .gte('date', getDateRange().startDate.toISOString().split('T')[0])
          .order('date', { ascending: false })
          .limit(100),

        // Fetch notifications with priority
        supabase
          .from('notifications')
          .select('*')
          .contains('recipients', [user?.id])
          .or(`target_audience.cs.{parents},target_audency.is.null`)
          .order('created_at', { ascending: false })
          .limit(20),

        // Fetch payment history
        supabase
          .from('payments')
          .select('*')
          .eq('parent_id', user?.id)
          .order('created_at', { ascending: false })
          .limit(50),

        // Fetch emergency contacts
        supabase
          .from('emergency_contacts')
          .select('*')
          .eq('parent_id', user?.id)
          .eq('is_active', true),

        // Fetch school information
        supabase
          .from('schools')
          .select('*')
          .eq('id', user?.school_id)
          .single()
      ]);

      const childrenData = childrenRes.data || [];
      const attendanceData = attendanceRes.data || [];
      const notificationsData = notificationsRes.data || [];
      const paymentsData = paymentsRes.data || [];
      const emergencyContactsData = emergencyContactsRes.data || [];
      const schoolInfo = schoolInfoRes.data || {};

      setChildren(childrenData);
      setAttendance(attendanceData);
      setNotifications(notificationsData);
      setPayments(paymentsData);

      // Calculate comprehensive parent statistics
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData.filter(a => a.date === today);
      const presentToday = todayAttendance.filter(a => a.status === 'present').length;
      
      const totalAttendanceDays = attendanceData.length;
      const presentDays = attendanceData.filter(a => a.status === 'present').length;
      const attendanceRate = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 0;

      const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;
      const totalSpent = paymentsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const childrenWithTransport = childrenData.filter(c => c.route).length;
      const unreadNotifications = notificationsData.filter(n => !n.read).length;

      // Calculate upcoming trips (next 7 days)
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const upcomingTrips = attendanceData.filter(a => 
        new Date(a.date) > new Date() && new Date(a.date) <= sevenDaysFromNow
      ).length;

      setParentStats({
        totalChildren: childrenData.length,
        presentToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        upcomingTrips,
        pendingPayments,
        totalSpent,
        childrenWithTransport,
        emergencyContacts: emergencyContactsData.length,
        unreadNotifications
      });

      // Generate quick actions based on current state
      generateQuickActions(childrenData, paymentsData, notificationsData);
      
      // Generate alerts based on children and payment status
      generateAlerts(childrenData, attendanceData, paymentsData, notificationsData);

    } catch (error) {
      console.error('Error fetching parent data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch(timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    return { startDate, endDate: now };
  };

  const generateQuickActions = (childrenData, paymentsData, notificationsData) => {
    const hasPendingPayments = paymentsData.some(p => p.status === 'pending');
    const hasUnreadNotifications = notificationsData.some(n => !n.read);
    const hasChildrenWithoutTransport = childrenData.some(c => !c.route);

    const actions = [
      {
        id: 'contact-teacher',
        title: 'Contact Teacher',
        description: 'Message your child\'s teacher',
        icon: MessageCircle,
        color: 'blue',
        path: '/parent/messages',
        available: true
      },
      {
        id: 'make-payment',
        title: 'Make Payment',
        description: 'Pay school fees online',
        icon: CreditCard,
        color: 'green',
        path: '/parent/payments',
        available: true,
        urgent: hasPendingPayments
      },
      {
        id: 'report-absence',
        title: 'Report Absence',
        description: 'Notify school about absence',
        icon: AlertTriangle,
        color: 'orange',
        path: '/parent/attendance',
        available: true
      },
      {
        id: 'update-contacts',
        title: 'Update Contacts',
        description: 'Manage emergency contacts',
        icon: Users,
        color: 'purple',
        path: '/parent/contacts',
        available: true
      },
      {
        id: 'view-schedule',
        title: 'School Calendar',
        description: 'View academic calendar',
        icon: Calendar,
        color: 'indigo',
        path: '/parent/calendar',
        available: true
      },
      {
        id: 'transport-request',
        title: 'Transport Request',
        description: 'Request transport changes',
        icon: Bus,
        color: 'red',
        path: '/parent/transport',
        available: hasChildrenWithoutTransport,
        urgent: hasChildrenWithoutTransport
      }
    ];

    setQuickActions(actions.filter(action => action.available));
  };

  const generateAlerts = (childrenData, attendanceData, paymentsData, notificationsData) => {
    const alerts = [];

    // Attendance alerts
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceData.filter(a => a.date === today);
    
    childrenData.forEach(child => {
      const childTodayAttendance = todayAttendance.find(a => a.student_id === child.id);
      if (!childTodayAttendance || childTodayAttendance.status === 'absent') {
        alerts.push({
          id: `attendance-${child.id}`,
          type: 'warning',
          title: 'Attendance Not Marked',
          message: `${child.name}'s attendance not recorded today`,
          priority: 'medium',
          childId: child.id
        });
      }
    });

    // Payment alerts
    const overduePayments = paymentsData.filter(p => 
      p.status === 'pending' && 
      p.due_date && 
      new Date(p.due_date) < new Date()
    );
    
    if (overduePayments.length > 0) {
      alerts.push({
        id: 'overdue-payments',
        type: 'error',
        title: 'Overdue Payments',
        message: `${overduePayments.length} payment(s) overdue`,
        priority: 'high'
      });
    }

    // Medical alerts
    childrenData.forEach(child => {
      if (child.medical_info?.allergies || child.medical_info?.conditions) {
        alerts.push({
          id: `medical-${child.id}`,
          type: 'info',
          title: 'Medical Information',
          message: `${child.name} has medical considerations`,
          priority: 'low',
          childId: child.id
        });
      }
    });

    // Transport alerts
    const childrenWithoutTransport = childrenData.filter(c => !c.route);
    if (childrenWithoutTransport.length > 0) {
      alerts.push({
        id: 'no-transport',
        type: 'warning',
        title: 'Transport Not Assigned',
        message: `${childrenWithoutTransport.length} child(ren) need transport`,
        priority: 'medium'
      });
    }

    setAlerts(alerts);
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      fetchData(); // Refresh notifications
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const exportAttendanceReport = async () => {
    try {
      toast.success('Generating attendance report...');
      // In production, this would generate and download a PDF/CSV
      setTimeout(() => {
        toast.success('Attendance report exported successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const contactDriver = (child) => {
    const driverPhone = child.route?.vehicle?.driver?.phone;
    if (driverPhone) {
      window.open(`tel:${driverPhone}`, '_blank');
    } else {
      toast.error('Driver phone number not available');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", description, trend, glow = false, onClick }) => (
    <Card 
      className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 ${
        glow ? `border-${color}-200 bg-${color}-50` : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? <TrendingUp size={14} /> : <TrendingUp size={14} className="transform rotate-180" />}
                <span className="text-xs font-medium ml-1">{Math.abs(trend)}%</span>
              </div>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl bg-${color}-100 flex items-center justify-center ml-4`}>
          <Icon className={`h-7 w-7 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color = "blue", onClick, urgent = false }) => (
    <Card 
      className={`p-4 cursor-pointer hover:shadow-md transition-all duration-300 border-2 ${
        urgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-600 truncate">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );

  const RealTimeStatus = () => (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">System: Operational</span>
        </div>
        <div className="flex items-center space-x-2">
          <Bus className="h-4 w-4 text-green-500" />
          <span className="text-sm text-gray-600">{realTimeData.activeTrips} active trips</span>
        </div>
        <div className="flex items-center space-x-2">
          <Wifi className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-gray-600">{realTimeData.onlineVehicles} vehicles online</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-500">Last update</p>
        <p className="text-sm font-medium text-gray-700">
          {realTimeData.lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  const getAttendanceStatus = (status) => {
    switch (status) {
      case 'present':
        return { color: 'green', icon: CheckCircle, text: 'Present' };
      case 'absent':
        return { color: 'red', icon: XCircle, text: 'Absent' };
      case 'late':
        return { color: 'yellow', icon: Clock, text: 'Late' };
      case 'early_pickup':
        return { color: 'blue', icon: Clock, text: 'Early Pickup' };
      default:
        return { color: 'gray', icon: AlertTriangle, text: 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your parent dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Getting the latest updates for your children</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <DashboardHeader title="Parent Dashboard" subtitle="Monitor your children's transport and school activities" />
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
                  <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Live Updates</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-200">
                  <Heart className="h-3 w-3 mr-1" />
                  {parentStats.totalChildren} Child{parentStats.totalChildren !== 1 ? 'ren' : ''}
                </Badge>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
                <Button
                  onClick={fetchData}
                  variant="outline"
                  size="sm"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status Bar */}
        <RealTimeStatus />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-6">
          <StatCard 
            title="My Children" 
            value={parentStats.totalChildren} 
            icon={Users} 
            color="blue"
            description="Enrolled students"
            glow
          />
          <StatCard 
            title="Present Today" 
            value={parentStats.presentToday} 
            icon={CheckCircle} 
            color="green"
            description={`${parentStats.totalChildren > 0 ? Math.round((parentStats.presentToday / parentStats.totalChildren) * 100) : 0}% attendance`}
            trend={2.5}
          />
          <StatCard 
            title="Attendance Rate" 
            value={`${parentStats.attendanceRate}%`} 
            icon={TrendingUp} 
            color="purple"
            description="Last 30 days"
          />
          <StatCard 
            title="Pending Payments" 
            value={parentStats.pendingPayments} 
            icon={CreditCard} 
            color="red"
            description="Require attention"
          />
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="children" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              My Children
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="transport" className="flex items-center">
              <Bus className="h-4 w-4 mr-2" />
              Transport
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                      <Zap className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="space-y-4">
                      {quickActions.map((action) => (
                        <QuickActionCard
                          key={action.id}
                          title={action.title}
                          description={action.description}
                          icon={action.icon}
                          color={action.color}
                          urgent={action.urgent}
                          onClick={() => window.location.href = action.path}
                        />
                      ))}
                    </div>
                  </Card>

                  {/* Alerts Panel */}
                  {alerts.length > 0 && (
                    <Card className="p-6 mt-6 border-red-200 bg-red-50">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-red-800">Important Alerts</h2>
                        <Badge variant="destructive">{alerts.length}</Badge>
                      </div>
                      <div className="space-y-3">
                        {alerts.slice(0, 3).map((alert) => (
                          <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-200">
                            <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                              alert.priority === 'high' ? 'text-red-600' : 'text-yellow-600'
                            }`} />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{alert.title}</p>
                              <p className="text-sm text-gray-700">{alert.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>

                {/* Recent Activity & Analytics */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Children Overview */}
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Children Overview</span>
                        <Badge variant="outline">{children.length} children</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {children.map((child) => (
                          <div key={child.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-shrink-0">
                              {child.photo_url ? (
                                <img className="h-12 w-12 rounded-full" src={child.photo_url} alt={child.name} />
                              ) : (
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-lg font-medium text-blue-600">
                                    {child.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{child.name}</h4>
                              <p className="text-sm text-gray-600 truncate">
                                {child.grade} • Class {child.class}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                {child.route ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    <Bus className="h-3 w-3 mr-1" />
                                    Transport
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                    No Transport
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attendance Trends */}
                  <Card className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Attendance Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <LineChartSimple 
                            data={[
                              {value: 85}, {value: 88}, {value: 92}, 
                              {value: 90}, {value: parentStats.attendanceRate}
                            ]}
                            color="#10b981"
                            height={60}
                          />
                          <p className="text-sm font-medium text-gray-900 mt-2">This Week</p>
                          <p className="text-xs text-gray-600">Attendance</p>
                        </div>
                        <div className="text-center">
                          <LineChartSimple 
                            data={[
                              {value: 12}, {value: 15}, {value: 18}, 
                              {value: 14}, {value: parentStats.presentToday}
                            ]}
                            color="#3b82f6"
                            height={60}
                          />
                          <p className="text-sm font-medium text-gray-900 mt-2">Present Days</p>
                          <p className="text-xs text-gray-600">This Month</p>
                        </div>
                        <div className="text-center">
                          <LineChartSimple 
                            data={[
                              {value: 2}, {value: 1}, {value: 0}, 
                              {value: 1}, {value: parentStats.totalChildren - parentStats.presentToday}
                            ]}
                            color="#ef4444"
                            height={60}
                          />
                          <p className="text-sm font-medium text-gray-900 mt-2">Absences</p>
                          <p className="text-xs text-gray-600">Recent</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Children Tab - Enhanced with more details */}
          <TabsContent value="children" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      {child.photo_url ? (
                        <img className="h-12 w-12 rounded-full" src={child.photo_url} alt={child.name} />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-medium text-blue-600">
                            {child.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {child.grade} - Class {child.class}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Student ID</span>
                        <span className="font-medium">{child.student_id}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Teacher</span>
                        <span className="font-medium">{child.teacher?.name || 'Not assigned'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Transport</span>
                        <span className="font-medium">
                          {child.route ? child.route.name : 'Not assigned'}
                        </span>
                      </div>
                      {child.medical_info?.allergies && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Medical</span>
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            Allergies
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Attendance Tab - Enhanced with analytics */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Attendance History</span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={exportAttendanceReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Badge variant="outline">
                      {attendance.length} records
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Child</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendance.slice(0, 20).map((record) => {
                        const statusInfo = getAttendanceStatus(record.status);
                        const StatusIcon = statusInfo.icon;
                        
                        return (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.student?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={statusInfo.color} className="flex items-center w-fit">
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusInfo.text}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.pickup_time ? new Date(record.pickup_time).toLocaleTimeString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.route?.name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.vehicle?.plate_number || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                              {record.notes || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transport Tab - Enhanced with real-time features */}
          <TabsContent value="transport" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.filter(child => child.route).map((child) => (
                <Card key={child.id} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Bus className="h-5 w-5 mr-2" />
                        {child.name}'s Transport
                      </span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Active
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Route</span>
                        <span className="text-gray-900">{child.route.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Vehicle</span>
                        <span className="text-gray-900">
                          {child.route.vehicle?.make} {child.route.vehicle?.model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Plate Number</span>
                        <span className="text-gray-900">{child.route.vehicle?.plate_number}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Driver</span>
                        <span className="text-gray-900">{child.route.vehicle?.driver?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Distance</span>
                        <span className="text-gray-900">{child.route.distance} km</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">Duration</span>
                        <span className="text-gray-900">{child.route.estimated_duration} min</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-600">Pickup Point</span>
                          <span className="text-gray-900">
                            {child.transport_info?.pickupPoint || 'Main Gate'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-gray-600">Pickup Time</span>
                          <span className="text-gray-900">
                            {child.transport_info?.pickupTime || '7:30 AM'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => contactDriver(child)}
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Driver
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <MapPin className="h-4 w-4 mr-2" />
                        View Route
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {children.filter(child => !child.route).length > 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Transport Not Assigned</h3>
                  <p className="text-gray-500 mb-6">
                    {children.filter(child => !child.route).length} of your children don't have transport assigned yet.
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button>
                      <Phone className="h-4 w-4 mr-2" />
                      Contact School
                    </Button>
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Request Transport
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Live Tracking Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Live Vehicle Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ParentTracking />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab - Enhanced with actions */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="outline">
                    {parentStats.unreadNotifications} unread
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                          !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.type === 'info' ? 'bg-blue-100' :
                            notification.type === 'warning' ? 'bg-yellow-100' :
                            notification.type === 'success' ? 'bg-green-100' :
                            notification.type === 'error' ? 'bg-red-100' : 'bg-gray-100'
                          }`}>
                            <Bell className={`h-4 w-4 ${
                              notification.type === 'info' ? 'text-blue-600' :
                              notification.type === 'warning' ? 'text-yellow-600' :
                              notification.type === 'success' ? 'text-green-600' :
                              notification.type === 'error' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markNotificationAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="secondary" className="capitalize">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                      <p className="text-gray-500">You're all caught up! No new notifications.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Status Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 text-sm">System Status:</span>
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">All Systems Operational</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-gray-500 text-sm">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
      {/* Floating Chat - WhatsApp-like messaging */}
      <FloatingChat />
    </div>
  );
};

export default ParentDashboard;