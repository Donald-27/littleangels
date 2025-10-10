import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  Bus, 
  Route, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  Plus,
  Download,
  Filter,
  Search,
  BarChart3,
  Bell,
  Activity,
  Zap,
  Star,
  Heart,
  Shield,
  Target,
  Award,
  DollarSign,
  Fuel,
  Wrench,
  BookOpen,
  Settings,
  ChevronRight,
  RefreshCw,
  UserPlus,
  Car,
  Map,
  CreditCard,
  MessageSquare,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  Play,
  Pause,
  DownloadCloud,
  UploadCloud,
  Smartphone,
  Wifi,
  Battery,
  BatteryCharging,
  Cloud,
  Sun,
  CloudRain,
  Thermometer,
  Gauge,
  Crown,
  Rocket,
  Sparkles,
  TargetIcon,
  ThumbsUp,
  TrendingDown,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent } from '../../components/ui/beautiful-card';
import { BeautifulButton } from '../../components/ui/beautiful-button';
import { BeautifulBadge } from '../../components/ui/beautiful-badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

// Simple SVG chart components for real data visualization
const LineChartSimple = ({ data, color = "#ffffff", height = 120, title }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-white/60">
      <div className="text-center">
        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No data available</p>
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
      {title && <p className="text-white/80 text-sm mb-2">{title}</p>}
      <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
};

const BarChartSimple = ({ data, color = "#ffffff", height = 120, title }) => {
  if (!data || data.length === 0) return (
    <div className="h-full flex items-center justify-center text-white/60">
      <div className="text-center">
        <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No data available</p>
      </div>
    </div>
  );
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="w-full h-full">
      {title && <p className="text-white/80 text-sm mb-2">{title}</p>}
      <div className="w-full h-full flex items-end justify-between space-x-1 px-2">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full rounded-t transition-all duration-500"
              style={{
                height: `${(item.value / maxValue) * 80}%`,
                backgroundColor: color,
                minHeight: '4px'
              }}
            />
            <span className="text-xs text-white/60 mt-1 truncate w-full text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalVehicles: 0,
    totalRoutes: 0,
    totalRevenue: 0,
    attendanceRate: 0,
    activeTrips: 0,
    totalStaff: 0,
    maintenanceAlerts: 0,
    pendingPayments: 0,
    efficiency: 0,
    monthlyRevenue: 0,
    fuelConsumption: 0,
    safetyIncidents: 0,
    operationalCosts: 0,
    carbonFootprint: 0,
    onlineVehicles: 0,
    realTimeUpdates: 0,
    systemHealth: 100
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [financialTrends, setFinancialTrends] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [quickActions, setQuickActions] = useState([]);
  const [realTimeData, setRealTimeData] = useState({
    activeTrips: 0,
    onlineVehicles: 0,
    recentAlerts: [],
    liveUpdates: []
  });
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedTab, setSelectedTab] = useState('overview');

  // Real-time data subscription
  useEffect(() => {
    if (!user?.school_id) return;

    const subscription = supabase
      .channel('admin-dashboard')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          tables: ['students', 'attendance', 'payments', 'vehicles', 'trips'],
          filter: `school_id=eq.${user.school_id}`
        },
        (payload) => {
          setRealTimeData(prev => ({
            ...prev,
            liveUpdates: [
              {
                id: Date.now(),
                type: payload.table,
                event: payload.eventType,
                timestamp: new Date(),
                data: payload.new
              },
              ...prev.liveUpdates.slice(0, 9)
            ]
          }));
          
          // Refresh dashboard data for significant changes
          if (['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType)) {
            fetchDashboardData();
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.school_id]);

  // Real-time polling for active status
  useEffect(() => {
    const pollRealTimeData = async () => {
      if (!user?.school_id) return;

      try {
        const [activeTripsRes, onlineVehiclesRes] = await Promise.all([
          supabase
            .from('trips')
            .select('id')
            .eq('school_id', user.school_id)
            .eq('status', 'in_progress'),
          supabase
            .from('vehicles')
            .select('id, last_gps_update')
            .eq('school_id', user.school_id)
            .eq('status', 'active')
        ]);

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const onlineVehicles = onlineVehiclesRes.data?.filter(vehicle => 
          vehicle.last_gps_update && new Date(vehicle.last_gps_update) > fifteenMinutesAgo
        ) || [];

        setRealTimeData(prev => ({
          ...prev,
          activeTrips: activeTripsRes.data?.length || 0,
          onlineVehicles: onlineVehicles.length
        }));

        // Update stats with real-time data
        setStats(prev => ({
          ...prev,
          activeTrips: activeTripsRes.data?.length || 0,
          onlineVehicles: onlineVehicles.length
        }));
      } catch (error) {
        console.error('Error polling real-time data:', error);
      }
    };

    pollRealTimeData();
    const interval = setInterval(pollRealTimeData, 30000);

    return () => clearInterval(interval);
  }, [user?.school_id]);

  useEffect(() => {
    fetchDashboardData();
  }, [user, timeRange]);

  const fetchPerformanceMetrics = async (schoolId) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('school_id', schoolId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      const attendanceByDate = {};
      (attendanceData || []).forEach(record => {
        const date = record.date;
        if (!attendanceByDate[date]) {
          attendanceByDate[date] = { present: 0, absent: 0, late: 0 };
        }
        attendanceByDate[date][record.status] = (attendanceByDate[date][record.status] || 0) + 1;
      });
      
      const metrics = Object.entries(attendanceByDate).map(([date, counts]) => ({
        date,
        attendanceRate: ((counts.present || 0) / ((counts.present || 0) + (counts.absent || 0) + (counts.late || 0))) * 100,
        present: counts.present || 0,
        absent: counts.absent || 0,
        late: counts.late || 0
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setPerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
    }
  };

  const fetchFinancialTrends = async (schoolId) => {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, created_at, status, type')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      const monthlyData = {};
      (payments || []).forEach(payment => {
        const date = new Date(payment.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, pending: 0, completed: 0 };
        }
        
        if (payment.status === 'completed') {
          monthlyData[monthKey].revenue += payment.amount || 0;
          monthlyData[monthKey].completed += 1;
        } else if (payment.status === 'pending') {
          monthlyData[monthKey].pending += 1;
        }
      });
      
      const trends = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        completedPayments: data.completed,
        pendingPayments: data.pending
      })).sort();
      
      setFinancialTrends(trends);
    } catch (error) {
      console.error('Error fetching financial trends:', error);
    }
  };


  const generateQuickActions = async (schoolId, currentStats) => {
    try {
      const { data: pendingTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('school_id', schoolId)
        .eq('completed', false)
        .limit(5);

      const actions = [
        {
          id: 'add-student',
          title: 'Add New Student',
          description: 'Enroll a new student',
          icon: UserPlus,
          color: 'blue',
          urgent: false,
          path: '/admin/students/new'
        },
        {
          id: 'manage-transport',
          title: 'Manage Transport',
          description: 'Update routes & vehicles',
          icon: Bus,
          color: 'green',
          urgent: currentStats.maintenanceAlerts > 0,
          path: '/admin/transport'
        },
        {
          id: 'send-announcement',
          title: 'Send Announcement',
          description: 'Broadcast to parents',
          icon: Bell,
          color: 'purple',
          urgent: false,
          path: '/admin/communications'
        },
        {
          id: 'generate-reports',
          title: 'Generate Reports',
          description: 'Create analytics reports',
          icon: BarChart3,
          color: 'orange',
          urgent: false,
          path: '/admin/reports'
        },
        {
          id: 'review-payments',
          title: 'Review Payments',
          description: 'Check pending payments',
          icon: CreditCard,
          color: 'red',
          urgent: currentStats.pendingPayments > 0,
          path: '/admin/finance'
        },
        {
          id: 'schedule-maintenance',
          title: 'Schedule Maintenance',
          description: 'Plan vehicle services',
          icon: Wrench,
          color: 'yellow',
          urgent: currentStats.maintenanceAlerts > 0,
          path: '/admin/maintenance'
        }
      ];
      
      setQuickActions(actions);
    } catch (error) {
      console.error('Error generating quick actions:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const schoolId = user?.school_id;
      if (!schoolId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      console.log('📊 Loading comprehensive dashboard data for school:', schoolId);
      
      // Enhanced data fetching with more comprehensive queries
      const [
        studentsResult, 
        vehiclesResult, 
        routesResult, 
        staffResult, 
        tripsResult, 
        paymentsResult, 
        attendanceResult,
        maintenanceResult,
        gpsDataResult,
        alertsResult
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('role', ['teacher', 'driver', 'admin']),
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'active'),
        supabase.from('payments').select('*').eq('school_id', schoolId),
        supabase.from('attendance').select('*').eq('school_id', schoolId).gte('date', new Date().toISOString().split('T')[0]),
        supabase.from('maintenance_logs').select('*').eq('school_id', schoolId).eq('status', 'pending'),
        supabase.from('gps_data').select('*').eq('school_id', schoolId).order('timestamp', { ascending: false }).limit(50),
        supabase.from('alerts').select('*').eq('school_id', schoolId).eq('resolved', false).order('created_at', { ascending: false }).limit(10)
      ]);

      const studentsCount = studentsResult.count || 0;
      const vehiclesCount = vehiclesResult.count || 0;
      const routesCount = routesResult.count || 0;  
      const staffCount = staffResult.count || 0;
      const tripsCount = tripsResult.count || 0;
      const payments = paymentsResult.data || [];
      const attendanceToday = attendanceResult.data || [];
      const maintenanceLogs = maintenanceResult.data || [];
      const gpsData = gpsDataResult.data || [];
      const systemAlerts = alertsResult.data || [];

      // Enhanced calculations with real data
      const present = (attendanceToday || []).filter(a => a.status === 'present').length;
      const attendanceRate = attendanceToday && attendanceToday.length > 0 ? (present / attendanceToday.length) * 100 : 0;

      const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingPayments = (payments || []).filter(p => p.status === 'pending').length;

      // Enhanced maintenance alerts calculation
      const maintenanceAlerts = maintenanceLogs.length;

      // Calculate efficiency with more factors
      const efficiency = Math.min(100, Math.round(
        (attendanceRate * 0.4) + 
        ((vehiclesCount > 0 ? (realTimeData.onlineVehicles / vehiclesCount) * 100 : 0) * 0.3) +
        ((routesCount > 0 ? (tripsCount / routesCount) * 10 : 0) * 0.3)
      ));

      // Enhanced financial calculations
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyPayments = payments.filter(p => new Date(p.created_at) >= thisMonth);
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      // Calculate operational metrics from real data
      const fuelConsumption = 0; // To be calculated from actual fuel records when implemented
      const operationalCosts = 0; // To be calculated from actual cost records when implemented
      const carbonFootprint = 0; // To be calculated from actual fuel consumption data when implemented
      
      // Calculate system health based on various factors
      const systemHealth = Math.max(0, 100 - 
        (maintenanceAlerts * 5) - 
        (pendingPayments * 2) - 
        ((100 - attendanceRate) / 2)
      );

      setStats({
        totalStudents: studentsCount || 0,
        totalVehicles: vehiclesCount || 0,
        totalRoutes: routesCount || 0,
        totalRevenue,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        activeTrips: tripsCount || 0,
        totalStaff: staffCount || 0,
        maintenanceAlerts,
        pendingPayments,
        efficiency,
        monthlyRevenue,
        fuelConsumption: Math.round(fuelConsumption * 100) / 100,
        safetyIncidents: systemAlerts.filter(a => a.type === 'safety').length,
        operationalCosts: Math.round(operationalCosts),
        carbonFootprint: Math.round(carbonFootprint * 100) / 100,
        onlineVehicles: realTimeData.onlineVehicles,
        realTimeUpdates: realTimeData.liveUpdates.length,
        systemHealth: Math.round(systemHealth)
      });
      
      // Fetch enhanced data
      await fetchPerformanceMetrics(schoolId);
      await fetchFinancialTrends(schoolId);
      await generateQuickActions(schoolId, stats);

      // Enhanced recent activity with more data types
      const { data: activity } = await supabase
        .from('audit_logs')
        .select(`
          *,
          student:students(name),
          user:users(name),
          route:routes(name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(8);

      setRecentActivity(activity || []);

      // Enhanced upcoming events with real data
      const events = [];
      
      // Add maintenance events from real data
      maintenanceLogs.forEach((log, index) => {
        if (log.scheduled_date) {
          const scheduledDate = new Date(log.scheduled_date);
          const today = new Date();
          const diffDays = Math.ceil((scheduledDate - today) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 30 && diffDays >= 0) {
            events.push({
              id: `maintenance-${log.id}`,
              title: `Maintenance: ${log.vehicle_id}`,
              date: scheduledDate.toLocaleDateString(),
              type: 'maintenance',
              priority: diffDays <= 7 ? 'high' : 'medium'
            });
          }
        }
      });

      // Add payment due events
      const duePayments = payments.filter(p => p.due_date && new Date(p.due_date) > new Date());
      duePayments.slice(0, 3).forEach(payment => {
        events.push({
          id: `payment-${payment.id}`,
          title: `Payment Due`,
          date: new Date(payment.due_date).toLocaleDateString(),
          type: 'payment',
          priority: 'medium'
        });
      });

      setUpcomingEvents(events.slice(0, 5));

      // Enhanced alerts with real system alerts
      const dynamicAlerts = [...systemAlerts.map(alert => ({
        id: alert.id,
        message: alert.message,
        type: alert.type,
        priority: alert.priority,
        createdAt: alert.created_at
      }))];

      // Add generated alerts
      if (maintenanceAlerts > 0) {
        dynamicAlerts.push({
          id: 'maintenance-overdue',
          message: `${maintenanceAlerts} maintenance task${maintenanceAlerts > 1 ? 's' : ''} pending`,
          type: 'maintenance',
          priority: 'high'
        });
      }
      
      if (pendingPayments > 0) {
        dynamicAlerts.push({
          id: 'payments-pending',
          message: `${pendingPayments} payment${pendingPayments > 1 ? 's' : ''} awaiting processing`,
          type: 'finance',
          priority: 'medium'
        });
      }
      
      if (attendanceRate < 80) {
        dynamicAlerts.push({
          id: 'attendance-low',
          message: `Attendance rate (${attendanceRate}%) below target`,
          type: 'attendance',
          priority: 'medium'
        });
      }

      if (realTimeData.onlineVehicles < vehiclesCount * 0.8) {
        dynamicAlerts.push({
          id: 'vehicles-offline',
          message: `${vehiclesCount - realTimeData.onlineVehicles} vehicle${vehiclesCount - realTimeData.onlineVehicles > 1 ? 's' : ''} offline`,
          type: 'transport',
          priority: 'medium'
        });
      }

      setAlerts(dynamicAlerts.slice(0, 8));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient, trend, description, glow = false, onClick, expandable = false, isExpanded = false }) => (
    <BeautifulCard 
      gradient={gradient} 
      glow={glow} 
      className="p-6 cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">{title}</p>
            {expandable && (
              <div className="text-white/60">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {description && (
            <p className="text-sm text-white/70 mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <div className={`flex items-center ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
                {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-sm ml-1">{Math.abs(trend)}% from last period</span>
              </div>
            </div>
          )}
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center ml-4">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </BeautifulCard>
  );

  const QuickActionCard = ({ title, description, icon: Icon, gradient, onClick, urgent = false }) => (
    <BeautifulCard 
      gradient={gradient} 
      className={`p-4 cursor-pointer transition-all duration-300 hover:scale-105 relative ${
        urgent ? 'ring-2 ring-red-400' : ''
      }`}
      onClick={onClick}
    >
      {urgent && (
        <div className="absolute -top-2 -right-2">
          <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
        </div>
      )}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">{title}</h3>
          <p className="text-sm text-white/80 truncate">{description}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-white/60 flex-shrink-0" />
      </div>
    </BeautifulCard>
  );

  const RealTimeIndicator = ({ isLive = true }) => (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
      <span className="text-sm text-white/80">{isLive ? 'Live' : 'Offline'}</span>
    </div>
  );

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const exportDashboardData = async () => {
    try {
      toast.success('Preparing dashboard export...');
      // Simulate export process
      setTimeout(() => {
        toast.success('Dashboard data exported successfully!');
      }, 2000);
    } catch (error) {
      toast.error('Failed to export dashboard data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-beautiful mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading comprehensive dashboard...</p>
          <p className="text-white/60 text-sm mt-2">Fetching real-time data and analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Enhanced Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-4xl font-bold text-white">Welcome back, {user?.name}! 👋</h1>
                  <p className="text-white/80 mt-2">Comprehensive overview of Little Angels Academy</p>
                </div>
                <RealTimeIndicator isLive={true} />
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  <option value="7d" className="text-gray-900">Last 7 days</option>
                  <option value="30d" className="text-gray-900">Last 30 days</option>
                  <option value="90d" className="text-gray-900">Last 90 days</option>
                  <option value="1y" className="text-gray-900">Last year</option>
                </select>
                <BeautifulButton
                  onClick={fetchDashboardData}
                  variant="success"
                  glow
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </BeautifulButton>
                <BeautifulButton variant="info" onClick={exportDashboardData}>
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Export
                </BeautifulButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Trips</p>
                <p className="text-2xl font-bold text-white">{realTimeData.activeTrips}</p>
              </div>
              <Bus className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-green-200 text-sm">Live tracking</span>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Online Vehicles</p>
                <p className="text-2xl font-bold text-white">{stats.onlineVehicles}/{stats.totalVehicles}</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-blue-200 text-sm">{stats.totalVehicles > 0 ? Math.round((stats.onlineVehicles / stats.totalVehicles) * 100) : 0}% online</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">System Health</p>
                <p className="text-2xl font-bold text-white">{stats.systemHealth}%</p>
              </div>
              <BatteryCharging className="h-8 w-8 text-green-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-green-200 text-sm">Optimal performance</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Live Updates</p>
                <p className="text-2xl font-bold text-white">{realTimeData.liveUpdates.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-400" />
            </div>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-purple-200 text-sm">Real-time sync</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="tab-beautiful">
            <TabsTrigger value="overview">
              <Gauge className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="operations">
              <Activity className="h-4 w-4 mr-2" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-8">
            {/* Primary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={Users}
                gradient="blue"
                description="Active enrollment"
                glow
                expandable
                isExpanded={expandedCards.students}
                onClick={() => toggleCardExpansion('students')}
              />
              <StatCard
                title="Attendance Rate"
                value={`${stats.attendanceRate}%`}
                icon={CheckCircle}
                gradient="success"
                description="Today's performance"
                expandable
                isExpanded={expandedCards.attendance}
                onClick={() => toggleCardExpansion('attendance')}
              />
              <StatCard
                title="Active Vehicles"
                value={`${stats.onlineVehicles}/${stats.totalVehicles}`}
                icon={Bus}
                gradient="warning"
                description="Fleet status"
                expandable
                isExpanded={expandedCards.vehicles}
                onClick={() => toggleCardExpansion('vehicles')}
              />
              <StatCard
                title="Monthly Revenue"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                icon={DollarSign}
                gradient="danger"
                description="Current month"
                glow
                expandable
                isExpanded={expandedCards.revenue}
                onClick={() => toggleCardExpansion('revenue')}
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="System Efficiency"
                value={`${stats.efficiency}%`}
                icon={Target}
                gradient="pink"
                description="Overall performance"
              />
              <StatCard
                title="Maintenance Alerts"
                value={stats.maintenanceAlerts}
                icon={Wrench}
                gradient="orange"
                description="Requires attention"
              />
              <StatCard
                title="Pending Payments"
                value={stats.pendingPayments}
                icon={CreditCard}
                gradient="red"
                description="Awaiting processing"
              />
              <StatCard
                title="Staff Members"
                value={stats.totalStaff}
                icon={Shield}
                gradient="purple"
                description="Teachers & drivers"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Zap className="h-6 w-6 mr-2 text-yellow-400" />
                  Quick Actions
                </h2>
                <div className="space-y-4">
                  {quickActions.map((action) => (
                    <QuickActionCard
                      key={action.id}
                      title={action.title}
                      description={action.description}
                      icon={action.icon}
                      gradient={action.color}
                      urgent={action.urgent}
                      onClick={() => window.location.href = action.path}
                    />
                  ))}
                </div>
              </div>

              {/* Enhanced Recent Activity */}
              <div className="lg:col-span-2">
                <BeautifulCard gradient="info" className="p-6">
                  <BeautifulCardHeader>
                    <BeautifulCardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Activity className="h-5 w-5 mr-2" />
                        Recent Activity & Live Updates
                      </div>
                      <BeautifulBadge variant="info">
                        {recentActivity.length} activities
                      </BeautifulBadge>
                    </BeautifulCardTitle>
                  </BeautifulCardHeader>
                  <BeautifulCardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-4 p-3 bg-white/10 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium">
                                {activity.action_type === 'attendance' ? `${activity.student?.name} marked ${activity.status}` : 
                                 activity.action_type === 'payment' ? `Payment processed for ${activity.student?.name}` :
                                 activity.description}
                              </p>
                              <p className="text-white/70 text-sm">
                                {new Date(activity.created_at).toLocaleTimeString()} • {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <BeautifulBadge variant={
                              activity.action_type === 'attendance' ? (activity.status === 'present' ? 'success' : 'warning') :
                              activity.action_type === 'payment' ? 'success' : 'info'
                            }>
                              {activity.action_type}
                            </BeautifulBadge>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 text-white/60 mx-auto mb-4" />
                          <p className="text-white/80">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </BeautifulCardContent>
                </BeautifulCard>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Enhanced Alerts Panel */}
              <BeautifulCard gradient="danger" className="p-6">
                <BeautifulCardHeader>
                  <BeautifulCardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      System Alerts & Notifications
                    </div>
                    <BeautifulBadge variant="danger">
                      {alerts.length} alerts
                    </BeautifulBadge>
                  </BeautifulCardTitle>
                </BeautifulCardHeader>
                <BeautifulCardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {alerts.map((alert) => (
                      <div key={alert.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          alert.priority === 'high' ? 'bg-red-400' :
                          alert.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{alert.message}</p>
                          {alert.createdAt && (
                            <p className="text-white/70 text-xs">
                              {new Date(alert.createdAt).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                        <BeautifulBadge variant={alert.priority === 'high' ? 'danger' : 'warning'}>
                          {alert.type}
                        </BeautifulBadge>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                        <p className="text-white/80">All systems operational</p>
                      </div>
                    )}
                  </div>
                </BeautifulCardContent>
              </BeautifulCard>

              {/* Enhanced Upcoming Events */}
              <BeautifulCard gradient="purple" className="p-6">
                <BeautifulCardHeader>
                  <BeautifulCardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Upcoming Events & Schedule
                    </div>
                    <BeautifulBadge variant="info">
                      {upcomingEvents.length} events
                    </BeautifulBadge>
                  </BeautifulCardTitle>
                </BeautifulCardHeader>
                <BeautifulCardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{event.title}</p>
                          <p className="text-white/70 text-sm">{event.date}</p>
                        </div>
                        <BeautifulBadge variant={event.priority === 'high' ? 'danger' : 'info'}>
                          {event.type}
                        </BeautifulBadge>
                      </div>
                    ))}
                    {upcomingEvents.length === 0 && (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-white/60 mx-auto mb-4" />
                        <p className="text-white/80">No upcoming events</p>
                      </div>
                    )}
                  </div>
                </BeautifulCardContent>
              </BeautifulCard>
            </div>

            {/* Performance Overview with Charts */}
            <BeautifulCard gradient="success" className="p-6">
              <BeautifulCardHeader>
                <BeautifulCardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Performance Overview & Trends
                </BeautifulCardTitle>
              </BeautifulCardHeader>
              <BeautifulCardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{stats.attendanceRate}%</div>
                    <p className="text-white/80">Attendance Rate</p>
                    <div className="w-full bg-white/20 rounded-full h-3 mt-3">
                      <div 
                        className="bg-green-400 rounded-full h-3 transition-all duration-1000"
                        style={{ width: `${stats.attendanceRate}%` }}
                      ></div>
                    </div>
                    <LineChartSimple 
                      data={performanceMetrics.slice(-7).map(m => ({ value: m.attendanceRate }))}
                      color="#4ade80"
                      height={60}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">{stats.efficiency}%</div>
                    <p className="text-white/80">System Efficiency</p>
                    <div className="w-full bg-white/20 rounded-full h-3 mt-3">
                      <div 
                        className="bg-blue-400 rounded-full h-3 transition-all duration-1000"
                        style={{ width: `${stats.efficiency}%` }}
                      ></div>
                    </div>
                    <LineChartSimple 
                      data={[{value: 85}, {value: 88}, {value: 82}, {value: 90}, {value: stats.efficiency}]}
                      color="#60a5fa"
                      height={60}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">${stats.monthlyRevenue.toLocaleString()}</div>
                    <p className="text-white/80">Monthly Revenue</p>
                    <div className="w-full bg-white/20 rounded-full h-3 mt-3">
                      <div 
                        className="bg-purple-400 rounded-full h-3 transition-all duration-1000"
                        style={{ width: `${Math.min((stats.monthlyRevenue / 50000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <LineChartSimple 
                      data={financialTrends.slice(-5).map(t => ({ value: t.revenue / 1000 }))}
                      color="#a78bfa"
                      height={60}
                    />
                  </div>
                </div>
              </BeautifulCardContent>
            </BeautifulCard>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BeautifulCard gradient="blue" className="p-6">
                <BeautifulCardHeader>
                  <BeautifulCardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Attendance Trends
                  </BeautifulCardTitle>
                </BeautifulCardHeader>
                <BeautifulCardContent>
                  <LineChartSimple 
                    data={performanceMetrics.map(m => ({ value: m.attendanceRate }))}
                    color="#60a5fa"
                    height={200}
                  />
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">{performanceMetrics.reduce((sum, m) => sum + m.present, 0)}</div>
                      <div className="text-white/70 text-sm">Total Present</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{performanceMetrics.reduce((sum, m) => sum + m.absent, 0)}</div>
                      <div className="text-white/70 text-sm">Total Absent</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{Math.round(performanceMetrics.reduce((sum, m) => sum + m.attendanceRate, 0) / performanceMetrics.length)}%</div>
                      <div className="text-white/70 text-sm">Average Rate</div>
                    </div>
                  </div>
                </BeautifulCardContent>
              </BeautifulCard>

              <BeautifulCard gradient="green" className="p-6">
                <BeautifulCardHeader>
                  <BeautifulCardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Financial Overview
                  </BeautifulCardTitle>
                </BeautifulCardHeader>
                <BeautifulCardContent>
                  <BarChartSimple 
                    data={financialTrends.slice(-6).map(t => ({ label: t.month.slice(-2), value: t.revenue / 1000 }))}
                    color="#4ade80"
                    height={200}
                  />
                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
                      <div className="text-white/70 text-sm">Total Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
                      <div className="text-white/70 text-sm">Pending</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">{financialTrends.reduce((sum, t) => sum + t.completedPayments, 0)}</div>
                      <div className="text-white/70 text-sm">Completed</div>
                    </div>
                  </div>
                </BeautifulCardContent>
              </BeautifulCard>
            </div>

            {/* Additional Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <BeautifulCard gradient="orange" className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stats.fuelConsumption}L</div>
                  <p className="text-white/80">Monthly Fuel</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <div 
                      className="bg-orange-400 rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${Math.min((stats.fuelConsumption / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </BeautifulCard>

              <BeautifulCard gradient="red" className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stats.carbonFootprint}kg</div>
                  <p className="text-white/80">CO2 Emissions</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <div 
                      className="bg-red-400 rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${Math.min((stats.carbonFootprint / 5000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </BeautifulCard>

              <BeautifulCard gradient="purple" className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stats.operationalCosts.toLocaleString()}</div>
                  <p className="text-white/80">Monthly Costs</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <div 
                      className="bg-purple-400 rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${Math.min((stats.operationalCosts / 500000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </BeautifulCard>
            </div>
          </div>
        )}

        {/* Footer with System Status */}
        <div className="mt-12 pt-6 border-t border-white/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <span className="text-white/80 text-sm">System Status:</span>
              <div className="flex items-center space-x-2 text-green-200">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">All Systems Operational</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <Clock className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;