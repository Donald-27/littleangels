import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent } from '../../components/ui/beautiful-card';
import { BeautifulButton } from '../../components/ui/beautiful-button';
import { BeautifulBadge } from '../../components/ui/beautiful-badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
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
    // Enhanced stats
    monthlyRevenue: 0,
    averageGrade: 0,
    studentSatisfaction: 0,
    fuelConsumption: 0,
    safetyIncidents: 0,
    parentEngagement: 0,
    operationalCosts: 0,
    carbonFootprint: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  // Enhanced dashboard state
  const [weatherData, setWeatherData] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);
  const [financialTrends, setFinancialTrends] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [quickActions, setQuickActions] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Enhanced helper functions
  const fetchPerformanceMetrics = async (schoolId) => {
    try {
      // Get attendance trends for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('date, status')
        .eq('school_id', schoolId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);
      
      // Process attendance data for charts
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
      
      // Group payments by month
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

  const fetchWeatherData = async () => {
    try {
      // Mock weather data for Eldoret, Kenya
      // In production, this would integrate with a weather API
      const mockWeather = {
        location: 'Eldoret, Kenya',
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        visibility: 10,
        uvIndex: 6,
        precipitation: 0
      };
      
      setWeatherData(mockWeather);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const generateQuickActions = async (schoolId) => {
    try {
      const actions = [
        {
          id: 'send-announcement',
          title: 'Send School Announcement',
          description: 'Broadcast message to all parents',
          icon: Bell,
          color: 'blue',
          urgent: false
        },
        {
          id: 'emergency-alert',
          title: 'Emergency Alert System',
          description: 'Send emergency notification',
          icon: AlertTriangle,
          color: 'red',
          urgent: true
        },
        {
          id: 'generate-reports',
          title: 'Generate Monthly Reports',
          description: 'Create comprehensive school reports',
          icon: BarChart3,
          color: 'green',
          urgent: false
        },
        {
          id: 'schedule-maintenance',
          title: 'Schedule Vehicle Maintenance',
          description: 'Plan upcoming vehicle services',
          icon: Wrench,
          color: 'orange',
          urgent: stats.maintenanceAlerts > 0
        },
        {
          id: 'review-finances',
          title: 'Review Financial Status',
          description: 'Check payments and expenses',
          icon: DollarSign,
          color: 'purple',
          urgent: stats.pendingPayments > 5
        },
        {
          id: 'update-routes',
          title: 'Optimize Transport Routes',
          description: 'Review and update bus routes',
          icon: Route,
          color: 'teal',
          urgent: false
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
      const schoolId = user?.school_id;
      if (!schoolId) {
        setLoading(false);
        return;
      }

      console.log('📊 Loading dashboard data for school:', schoolId);
      
      // Fetch real data from database
      const [studentsResult, vehiclesResult, routesResult, staffResult, tripsResult, paymentsResult, attendanceResult] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('role', ['teacher', 'driver']),
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'active'),
        supabase.from('payments').select('*').eq('school_id', schoolId),
        supabase.from('attendance').select('*').eq('school_id', schoolId).gte('date', new Date().toISOString().split('T')[0])
      ]);

      const studentsCount = studentsResult.count || 0;
      const vehiclesCount = vehiclesResult.count || 0;
      const routesCount = routesResult.count || 0;  
      const staffCount = staffResult.count || 0;
      const tripsCount = tripsResult.count || 0;
      const payments = paymentsResult.data || [];
      const attendanceToday = attendanceResult.data || [];

      // Get vehicles with maintenance info for alerts
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('maintenance_info')
        .eq('school_id', schoolId);

      // Calculate attendance rate
      const present = (attendanceToday || []).filter(a => a.status === 'present').length;
      const attendanceRate = attendanceToday && attendanceToday.length > 0 ? (present / attendanceToday.length) * 100 : 0;

      // Calculate revenue
      const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingPayments = (payments || []).filter(p => p.status === 'pending').length;

      // Calculate maintenance alerts
      const maintenanceAlerts = (vehicles || []).reduce((count, v) => {
        try {
          const maintenance = typeof v.maintenance_info === 'string' ? 
            JSON.parse(v.maintenance_info) : v.maintenance_info;
          const nextService = maintenance?.nextService ? new Date(maintenance.nextService) : null;
          return count + (nextService && !isNaN(nextService.getTime()) && nextService <= new Date() ? 1 : 0);
        } catch {
          return count; // Skip invalid maintenance data
        }
      }, 0);

      // Calculate efficiency (mock calculation)
      const efficiency = Math.round((attendanceRate + (vehiclesCount || 0) * 10 + (routesCount || 0) * 5) / 3);

      // Enhanced calculations for comprehensive metrics
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const monthlyPayments = payments.filter(p => new Date(p.created_at) >= thisMonth);
      const monthlyRevenue = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      // Calculate operational metrics
      const fuelConsumption = vehiclesCount * 45.5; // Mock calculation: avg 45.5L per vehicle
      const operationalCosts = vehiclesCount * 15000 + staffCount * 45000; // Mock monthly costs
      const carbonFootprint = fuelConsumption * 2.31; // Mock CO2 calculation
      
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
        // Enhanced metrics
        monthlyRevenue,
        averageGrade: 85.4, // Mock data - would come from grades table
        studentSatisfaction: 92.1, // Mock data - would come from surveys
        fuelConsumption: Math.round(fuelConsumption * 100) / 100,
        safetyIncidents: 0, // Mock data - would come from incidents table
        parentEngagement: 78.9, // Mock data - would come from communication logs
        operationalCosts: Math.round(operationalCosts),
        carbonFootprint: Math.round(carbonFootprint * 100) / 100
      });
      
      // Fetch enhanced performance metrics for charts
      await fetchPerformanceMetrics(schoolId);
      await fetchFinancialTrends(schoolId);
      await fetchWeatherData();
      await generateQuickActions(schoolId);

      // Fetch recent activity
      const { data: activity } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(name),
          route:routes(name)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentActivity(activity || []);

      // Generate upcoming events from system data
      const upcomingEvents = [];
      
      // Add maintenance due events
      if (vehicles && vehicles.length > 0) {
        vehicles.forEach((vehicle, index) => {
          try {
            const maintenance = typeof vehicle.maintenance_info === 'string' ? 
              JSON.parse(vehicle.maintenance_info) : vehicle.maintenance_info;
            const nextService = maintenance?.nextService ? new Date(maintenance.nextService) : null;
            
            if (nextService && !isNaN(nextService.getTime())) {
              const today = new Date();
              const diffDays = Math.ceil((nextService - today) / (1000 * 60 * 60 * 24));
              
              if (diffDays <= 30 && diffDays > 0) {
                upcomingEvents.push({
                  id: `maintenance-${index}`,
                  title: `Vehicle Maintenance Due`,
                  date: nextService.toLocaleDateString(),
                  type: 'maintenance'
                });
              }
            }
          } catch (error) {
            console.warn('Invalid maintenance_info for vehicle:', vehicle.id);
          }
        });
      }
      
      // Future: Add real events from database when events table is implemented
      // For now, only show maintenance-related events from actual vehicle data

      setUpcomingEvents(upcomingEvents);

      // Generate dynamic alerts based on real data
      const alerts = [];
      
      // Maintenance alerts
      const overdueVehicles = (vehicles || []).filter(v => {
        try {
          const maintenance = typeof v.maintenance_info === 'string' ? 
            JSON.parse(v.maintenance_info) : v.maintenance_info;
          const nextService = maintenance?.nextService ? new Date(maintenance.nextService) : null;
          return nextService && !isNaN(nextService.getTime()) && nextService <= new Date();
        } catch (error) {
          return false; // Skip invalid maintenance data
        }
      }).length;
      
      if (overdueVehicles > 0) {
        alerts.push({
          id: 'maintenance-overdue',
          message: `${overdueVehicles} vehicle${overdueVehicles > 1 ? 's' : ''} need${overdueVehicles === 1 ? 's' : ''} maintenance`,
          type: 'warning',
          priority: 'high'
        });
      }
      
      // Attendance alerts
      const absentCount = attendanceToday.filter(a => a.status === 'absent').length;
      if (absentCount > 0) {
        alerts.push({
          id: 'attendance-low',
          message: `${absentCount} student${absentCount > 1 ? 's' : ''} absent today`,
          type: 'info',
          priority: 'medium'
        });
      }
      
      // Payment alerts
      const overduePayments = payments.filter(p => p.status === 'pending').length;
      if (overduePayments > 0) {
        alerts.push({
          id: 'payments-overdue',
          message: `${overduePayments} payment${overduePayments > 1 ? 's' : ''} overdue`,
          type: 'error',
          priority: 'high'
        });
      }
      
      // No active trips alert
      if (tripsCount === 0 && vehiclesCount > 0) {
        alerts.push({
          id: 'no-active-trips',
          message: 'No active trips running - check vehicle schedules',
          type: 'warning',
          priority: 'medium'
        });
      }

      setAlerts(alerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient, trend, description, glow = false }) => (
    <BeautifulCard gradient={gradient} glow={glow} className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {description && (
            <p className="text-sm text-white/70 mt-1">{description}</p>
          )}
          {trend && (
            <p className={`text-sm mt-1 ${trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </BeautifulCard>
  );

  const QuickActionCard = ({ title, description, icon: Icon, gradient, onClick }) => (
    <BeautifulCard 
      gradient={gradient} 
      className="p-6 cursor-pointer hover:scale-105 transition-transform duration-300"
      onClick={onClick}
    >
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/80">{description}</p>
      </div>
    </BeautifulCard>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-beautiful mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white">Welcome back, {user?.name}! 👋</h1>
                <p className="text-white/80 mt-2">Here's what's happening at Little Angels Academy today</p>
              </div>
              <div className="flex items-center space-x-4">
                <BeautifulButton variant="info" glow>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications ({alerts.length})
                </BeautifulButton>
                <BeautifulButton variant="success">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </BeautifulButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            gradient="blue"
            trend={5.2}
            description="Active enrollment"
            glow
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendanceRate}%`}
            icon={CheckCircle}
            gradient="success"
            trend={2.1}
            description="Today's attendance"
          />
          <StatCard
            title="Active Vehicles"
            value={stats.totalVehicles}
            icon={Bus}
            gradient="warning"
            trend={-1.3}
            description="Fleet size"
          />
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            gradient="danger"
            trend={8.7}
            description="All time earnings"
            glow
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Trips"
            value={stats.activeTrips}
            icon={Route}
            gradient="purple"
            description="Currently running"
          />
          <StatCard
            title="Staff Members"
            value={stats.totalStaff}
            icon={Shield}
            gradient="info"
            description="Teachers & drivers"
          />
          <StatCard
            title="Maintenance Alerts"
            value={stats.maintenanceAlerts}
            icon={Wrench}
            gradient="orange"
            description="Requires attention"
          />
          <StatCard
            title="System Efficiency"
            value={`${stats.efficiency}%`}
            icon={Target}
            gradient="pink"
            description="Overall performance"
            glow
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <QuickActionCard
                title="Add Student"
                description="Enroll new student"
                icon={Users}
                gradient="blue"
                onClick={() => window.location.href = '/admin/students'}
              />
              <QuickActionCard
                title="Manage Transport"
                description="Update routes & vehicles"
                icon={Bus}
                gradient="success"
                onClick={() => window.location.href = '/admin/transport'}
              />
              <QuickActionCard
                title="View Reports"
                description="Generate analytics"
                icon={BarChart3}
                gradient="purple"
                onClick={() => window.location.href = '/admin/reports'}
              />
              <QuickActionCard
                title="Send Notification"
                description="Communicate with parents"
                icon={Bell}
                gradient="warning"
                onClick={() => window.location.href = '/admin/notifications'}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <BeautifulCard gradient="info" className="p-6">
              <BeautifulCardHeader>
                <BeautifulCardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </BeautifulCardTitle>
              </BeautifulCardHeader>
              <BeautifulCardContent>
                <div className="space-y-4">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 bg-white/10 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {activity.student?.name} marked {activity.status}
                          </p>
                          <p className="text-white/70 text-sm">
                            {activity.route?.name} • {new Date(activity.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        <BeautifulBadge variant={activity.status === 'present' ? 'success' : 'warning'}>
                          {activity.status}
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
          {/* Alerts */}
          <BeautifulCard gradient="danger" className="p-6">
            <BeautifulCardHeader>
              <BeautifulCardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                System Alerts
              </BeautifulCardTitle>
            </BeautifulCardHeader>
            <BeautifulCardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      alert.priority === 'high' ? 'bg-red-400' :
                      alert.priority === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                    <p className="text-white flex-1">{alert.message}</p>
                    <BeautifulBadge variant={alert.priority === 'high' ? 'danger' : 'warning'}>
                      {alert.priority}
                    </BeautifulBadge>
                  </div>
                ))}
              </div>
            </BeautifulCardContent>
          </BeautifulCard>

          {/* Upcoming Events */}
          <BeautifulCard gradient="purple" className="p-6">
            <BeautifulCardHeader>
              <BeautifulCardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Events
              </BeautifulCardTitle>
            </BeautifulCardHeader>
            <BeautifulCardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-white/10 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-white/70 text-sm">{event.date}</p>
                    </div>
                    <BeautifulBadge variant="info">
                      {event.type}
                    </BeautifulBadge>
                  </div>
                ))}
              </div>
            </BeautifulCardContent>
          </BeautifulCard>
        </div>

        {/* Performance Overview */}
        <div className="mt-8">
          <BeautifulCard gradient="success" className="p-6">
            <BeautifulCardHeader>
              <BeautifulCardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Performance Overview
              </BeautifulCardTitle>
            </BeautifulCardHeader>
            <BeautifulCardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stats.attendanceRate}%</div>
                  <p className="text-white/80">Attendance Rate</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${stats.attendanceRate}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stats.efficiency}%</div>
                  <p className="text-white/80">System Efficiency</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${stats.efficiency}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{stats.totalRoutes}</div>
                  <p className="text-white/80">Active Routes</p>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div 
                      className="bg-white rounded-full h-2 transition-all duration-1000"
                      style={{ width: `${Math.min((stats.totalRoutes / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </BeautifulCardContent>
          </BeautifulCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;