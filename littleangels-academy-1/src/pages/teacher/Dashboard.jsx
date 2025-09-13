import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Bell,
  Eye,
  Plus,
  Edit,
  Download,
  BarChart3,
  GraduationCap,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    attendanceRate: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select(`
          *,
          parent:users!students_parent_id_fkey(name, phone, email),
          route:routes(name, vehicle:vehicles(plate_number, driver:users!vehicles_driver_id_fkey(name, phone)))
        `)
        .eq('teacher_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

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
        .in('student_id', studentsData?.map(s => s.id) || [])
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
        totalStudents: studentsData?.length || 0,
        presentToday,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        upcomingEvents: 0 // TODO: Calculate from events/calendar
      });

    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId, status, notes = '') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const student = students.find(s => s.id === studentId);
      
      const { error } = await supabase
        .from('attendance')
        .upsert([{
          student_id: studentId,
          route_id: student?.route_id,
          vehicle_id: null, // Teacher marking attendance at school
          driver_id: null,
          date: today,
          pickup_time: new Date().toISOString(),
          status: status,
          notes: notes,
          school_id: user?.school_id
        }]);

      if (error) throw error;
      
      toast.success(`Attendance marked as ${status}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to mark attendance');
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
                <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {stats.totalStudents} Students
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
            title="My Students" 
            value={stats.totalStudents} 
            icon={Users} 
            color="blue"
            description="Assigned to me"
          />
          <StatCard 
            title="Present Today" 
            value={stats.presentToday} 
            icon={CheckCircle} 
            color="green"
            description="Out of {stats.totalStudents} students"
          />
          <StatCard 
            title="Attendance Rate" 
            value={`${stats.attendanceRate}%`} 
            icon={TrendingUp} 
            color="purple"
            description="Last 30 days"
          />
          <StatCard 
            title="Upcoming Events" 
            value={stats.upcomingEvents} 
            icon={Calendar} 
            color="yellow"
            description="This week"
          />
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">ID: {student.student_id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.grade}</div>
                            <div className="text-sm text-gray-500">Class {student.class}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.parent?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{student.parent?.phone || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.route ? (
                              <div>
                                <div className="text-sm text-gray-900">{student.route.name}</div>
                                <div className="text-sm text-gray-500">
                                  {student.route.vehicle?.plate_number} - {student.route.vehicle?.driver?.name}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="secondary">No Transport</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Active
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'present')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'absent')}
                                className="text-red-600 hover:text-red-900"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Attendance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {students.map((student) => {
                      const todayRecord = attendance.find(a => 
                        a.student_id === student.id && 
                        a.date === new Date().toISOString().split('T')[0]
                      );
                      const status = todayRecord?.status || 'not_marked';
                      
                      return (
                        <Card key={student.id} className={`p-4 ${
                          status === 'present' ? 'border-green-200 bg-green-50' :
                          status === 'absent' ? 'border-red-200 bg-red-50' :
                          status === 'late' ? 'border-yellow-200 bg-yellow-50' :
                          'border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.grade} - Class {student.class}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'present')}
                                className={`text-green-600 hover:text-green-900 ${
                                  status === 'present' ? 'bg-green-100' : ''
                                }`}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'absent')}
                                className={`text-red-600 hover:text-red-900 ${
                                  status === 'absent' ? 'bg-red-100' : ''
                                }`}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAttendance(student.id, 'late')}
                                className={`text-yellow-600 hover:text-yellow-900 ${
                                  status === 'late' ? 'bg-yellow-100' : ''
                                }`}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          {status !== 'not_marked' && (
                            <div className="mt-2">
                              <Badge variant={getAttendanceStatus(status).color}>
                                {getAttendanceStatus(status).text}
                              </Badge>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Attendance Records</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
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
                                {record.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Attendance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Students</span>
                      <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Present Today</span>
                      <span className="text-2xl font-bold text-green-600">{stats.presentToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Absent Today</span>
                      <span className="text-2xl font-bold text-red-600">{stats.totalStudents - stats.presentToday}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Attendance Rate</span>
                      <span className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Attendance Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Monthly Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
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

export default TeacherDashboard;