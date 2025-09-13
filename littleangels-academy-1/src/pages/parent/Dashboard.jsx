import React, { useState, useEffect } from 'react';
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
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    presentToday: 0,
    attendanceRate: 0,
    upcomingTrips: 0
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from('students')
        .select(`
          *,
          teacher:users!students_teacher_id_fkey(name, phone, email),
          route:routes(
            name, 
            description,
            vehicle:vehicles(plate_number, make, model, driver:users!vehicles_driver_id_fkey(name, phone))
          )
        `)
        .eq('parent_id', user?.id)
        .eq('is_active', true);

      if (childrenError) throw childrenError;
      setChildren(childrenData || []);

      // Fetch attendance for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(name, grade, class),
          route:routes(name),
          vehicle:vehicles(plate_number)
        `)
        .in('student_id', childrenData?.map(child => child.id) || [])
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData || []);

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .contains('recipients', [user?.id])
        .order('created_at', { ascending: false })
        .limit(10);

      if (notificationsError) throw notificationsError;
      setNotifications(notificationsData || []);

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendanceData?.filter(a => a.date === today) || [];
      const presentToday = todayAttendance.filter(a => a.status === 'present').length;
      
      const totalAttendanceDays = attendanceData?.length || 0;
      const presentDays = attendanceData?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = totalAttendanceDays > 0 ? (presentDays / totalAttendanceDays) * 100 : 0;

      setStats({
        totalChildren: childrenData?.length || 0,
        presentToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        upcomingTrips: 0 // TODO: Calculate based on scheduled trips
      });

    } catch (error) {
      console.error('Error fetching parent data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", description, trend }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Heart className="h-3 w-3 mr-1" />
                  {stats.totalChildren} Child{stats.totalChildren !== 1 ? 'ren' : ''}
                </Badge>
                <Button variant="outline" size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications ({notifications.length})
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="My Children" 
            value={stats.totalChildren} 
            icon={Users} 
            color="blue"
            description="Enrolled students"
          />
          <StatCard 
            title="Present Today" 
            value={stats.presentToday} 
            icon={CheckCircle} 
            color="green"
            description="Out of {stats.totalChildren} children"
          />
          <StatCard 
            title="Attendance Rate" 
            value={`${stats.attendanceRate}%`} 
            icon={TrendingUp} 
            color="purple"
            description="Last 30 days"
          />
          <StatCard 
            title="Transport Routes" 
            value={children.filter(c => c.route).length} 
            icon={Bus} 
            color="yellow"
            description="With transport"
          />
        </div>

        <Tabs defaultValue="children" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="children">My Children</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Children Tab */}
          <TabsContent value="children" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child) => (
                <Card key={child.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-blue-600">
                          {child.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{child.name}</CardTitle>
                        <p className="text-sm text-gray-500">{child.grade} - Class {child.class}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <School className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Student ID: {child.student_id}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Teacher: {child.teacher?.name || 'Not assigned'}</span>
                      </div>
                      {child.route && (
                        <div className="flex items-center text-sm">
                          <Bus className="h-4 w-4 mr-2 text-gray-400" />
                          <span>Route: {child.route.name}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status</span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance</CardTitle>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendance.slice(0, 20).map((record) => {
                        const statusInfo = getAttendanceStatus(record.status);
                        return (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(record.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {record.student?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={statusInfo.color} className="flex items-center w-fit">
                                <statusInfo.icon className="h-3 w-3 mr-1" />
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

          {/* Transport Tab */}
          <TabsContent value="transport" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.filter(child => child.route).map((child) => (
                <Card key={child.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Bus className="h-5 w-5 mr-2" />
                      {child.name}'s Transport
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Route</span>
                        <span className="text-sm text-gray-900">{child.route.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Vehicle</span>
                        <span className="text-sm text-gray-900">
                          {child.route.vehicle?.make} {child.route.vehicle?.model} ({child.route.vehicle?.plate_number})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Driver</span>
                        <span className="text-sm text-gray-900">{child.route.vehicle?.driver?.name || 'Not assigned'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Driver Phone</span>
                        <span className="text-sm text-gray-900">{child.route.vehicle?.driver?.phone || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Pickup Point</span>
                        <span className="text-sm text-gray-900">
                          {child.transport_info?.pickupPoint || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-gray-600">Dropoff Point</span>
                        <span className="text-sm text-gray-900">
                          {child.transport_info?.dropoffPoint || 'Not specified'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        View Route on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {children.filter(child => !child.route).length > 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transport Assigned</h3>
                  <p className="text-gray-500 mb-4">
                    Some of your children don't have transport assigned yet. Contact the school administration.
                  </p>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact School
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Badge variant="secondary" className="capitalize">
                            {notification.type}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                      <p className="text-gray-500">You're all caught up! No new notifications.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ParentDashboard;