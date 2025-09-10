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
    efficiency: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const schoolId = user?.school_id;
      if (!schoolId) return;

      // Fetch all stats in parallel
      const [
        { count: studentsCount },
        { count: vehiclesCount },
        { count: routesCount },
        { count: staffCount },
        { count: tripsCount },
        { data: attendanceToday },
        { data: payments },
        { data: vehicles }
      ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('school_id', schoolId),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).in('role', ['teacher', 'driver', 'admin']),
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('school_id', schoolId).eq('status', 'in_progress'),
        supabase.from('attendance').select('status').eq('school_id', schoolId).gte('date', new Date().toISOString().slice(0, 10)),
        supabase.from('payments').select('amount, status').eq('school_id', schoolId),
        supabase.from('vehicles').select('maintenance_info').eq('school_id', schoolId)
      ]);

      // Calculate attendance rate
      const present = (attendanceToday || []).filter(a => a.status === 'present').length;
      const attendanceRate = attendanceToday && attendanceToday.length > 0 ? (present / attendanceToday.length) * 100 : 0;

      // Calculate revenue
      const totalRevenue = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingPayments = (payments || []).filter(p => p.status === 'pending').length;

      // Calculate maintenance alerts
      const maintenanceAlerts = (vehicles || []).filter(v => {
        const maintenance = typeof v.maintenance_info === 'string' ? 
          JSON.parse(v.maintenance_info) : v.maintenance_info;
        const nextService = new Date(maintenance.nextService);
        return nextService <= new Date();
      }).length;

      // Calculate efficiency (mock calculation)
      const efficiency = Math.round((attendanceRate + (vehiclesCount || 0) * 10 + (routesCount || 0) * 5) / 3);

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
        efficiency
      });

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

      // Mock upcoming events
      setUpcomingEvents([
        { id: 1, title: 'Parent-Teacher Meeting', date: '2024-01-15', type: 'meeting' },
        { id: 2, title: 'School Assembly', date: '2024-01-18', type: 'event' },
        { id: 3, title: 'Field Trip', date: '2024-01-22', type: 'trip' }
      ]);

      // Mock alerts
      setAlerts([
        { id: 1, message: 'Bus #001 needs maintenance', type: 'warning', priority: 'high' },
        { id: 2, message: '3 students absent today', type: 'info', priority: 'medium' },
        { id: 3, message: 'Payment overdue for 5 families', type: 'error', priority: 'high' }
      ]);

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