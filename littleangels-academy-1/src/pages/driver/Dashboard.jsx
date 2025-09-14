import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Bus, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Square,
  Navigation,
  Phone,
  Calendar,
  TrendingUp,
  Fuel,
  Wrench,
  Bell,
  Eye,
  QrCode
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import LiveTracking from '../../components/LiveTracking';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [assignedRoutes, setAssignedRoutes] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    completedTrips: 0,
    totalHours: 0
  });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch assigned vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`
          *,
          routes(name, description, stops, distance, estimated_duration)
        `)
        .eq('driver_id', user?.id)
        .single();

      if (vehicleError && vehicleError.code !== 'PGRST116') throw vehicleError;
      setAssignedVehicle(vehicleData);

      // Fetch assigned routes
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select(`
          *,
          vehicle:vehicles(plate_number, make, model, capacity),
          students:students(id, name, grade, class, transport_info)
        `)
        .eq('driver_id', user?.id)
        .eq('is_active', true);

      if (routesError) throw routesError;
      setAssignedRoutes(routesData || []);

      // Fetch students for assigned routes
      const routeIds = routesData?.map(route => route.id) || [];
      if (routeIds.length > 0) {
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select(`
            *,
            parent:users!students_parent_id_fkey(name, phone),
            teacher:users!students_teacher_id_fkey(name)
          `)
          .in('route_id', routeIds)
          .eq('is_active', true);

        if (studentsError) throw studentsError;
        setStudents(studentsData || []);
      }

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          student:students(name, grade, class),
          route:routes(name)
        `)
        .eq('driver_id', user?.id)
        .eq('date', today)
        .order('pickup_time', { ascending: true });

      if (attendanceError) throw attendanceError;
      setAttendance(attendanceData || []);

      // Fetch current trip
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          *,
          route:routes(name, description),
          vehicle:vehicles(plate_number)
        `)
        .eq('driver_id', user?.id)
        .eq('status', 'in_progress')
        .single();

      if (tripError && tripError.code !== 'PGRST116') throw tripError;
      setCurrentTrip(tripData);

      // Calculate stats
      const presentToday = attendanceData?.filter(a => a.status === 'present').length || 0;
      const totalStudents = studentsData?.length || 0;

      setStats({
        totalStudents,
        presentToday,
        completedTrips: 0, // TODO: Calculate from trips table
        totalHours: 0 // TODO: Calculate from trips table
      });

    } catch (error) {
      console.error('Error fetching driver data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const startTrip = async (routeId) => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([{
          route_id: routeId,
          vehicle_id: assignedVehicle?.id,
          driver_id: user?.id,
          date: new Date().toISOString().split('T')[0],
          start_time: new Date().toISOString(),
          start_mileage: 0, // TODO: Get actual mileage
          status: 'in_progress',
          school_id: user?.school_id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setCurrentTrip(data);
      toast.success('Trip started successfully');
    } catch (error) {
      console.error('Error starting trip:', error);
      toast.error('Failed to start trip');
    }
  };

  const endTrip = async () => {
    if (!currentTrip) return;

    try {
      const { error } = await supabase
        .from('trips')
        .update({
          end_time: new Date().toISOString(),
          end_mileage: 0, // TODO: Get actual mileage
          status: 'completed'
        })
        .eq('id', currentTrip.id);

      if (error) throw error;
      
      setCurrentTrip(null);
      toast.success('Trip completed successfully');
    } catch (error) {
      console.error('Error ending trip:', error);
      toast.error('Failed to end trip');
    }
  };

  const markAttendance = async (studentId, status) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const student = students.find(s => s.id === studentId);
      
      const { error } = await supabase
        .from('attendance')
        .upsert([{
          student_id: studentId,
          route_id: student?.route_id,
          vehicle_id: assignedVehicle?.id,
          driver_id: user?.id,
          date: today,
          pickup_time: new Date().toISOString(),
          status: status,
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
              {trend > 0 ? '+' : ''}{trend}% from yesterday
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'green';
      case 'absent':
        return 'red';
      case 'late':
        return 'yellow';
      case 'early_pickup':
        return 'blue';
      default:
        return 'gray';
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
                <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
              </div>
              <div className="flex items-center space-x-4">
                {assignedVehicle && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Bus className="h-3 w-3 mr-1" />
                    {assignedVehicle.plate_number}
                  </Badge>
                )}
                {currentTrip && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <Play className="h-3 w-3 mr-1" />
                    Trip in Progress
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Assigned Students" 
            value={stats.totalStudents} 
            icon={Users} 
            color="blue"
            description="On your routes"
          />
          <StatCard 
            title="Present Today" 
            value={stats.presentToday} 
            icon={CheckCircle} 
            color="green"
            description="Out of {stats.totalStudents} students"
          />
          <StatCard 
            title="Completed Trips" 
            value={stats.completedTrips} 
            icon={TrendingUp} 
            color="purple"
            description="This week"
          />
          <StatCard 
            title="Total Hours" 
            value={stats.totalHours} 
            icon={Clock} 
            color="yellow"
            description="This week"
          />
        </div>

        {/* Current Trip Status */}
        {currentTrip && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <Play className="h-5 w-5 mr-2" />
                Trip in Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Route</p>
                  <p className="text-lg font-semibold text-gray-900">{currentTrip.route?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Started At</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(currentTrip.start_time).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={endTrip}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    End Trip
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="routes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="routes">My Routes</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
          </TabsList>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignedRoutes.map((route) => (
                <Card key={route.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        {route.name}
                      </span>
                      {!currentTrip && (
                        <Button
                          onClick={() => startTrip(route.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Trip
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Distance</span>
                        <span className="font-medium">{route.distance} km</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{route.estimated_duration} min</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Students</span>
                        <span className="font-medium">{route.students?.length || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Vehicle</span>
                        <span className="font-medium">
                          {route.vehicle?.make} {route.vehicle?.model} ({route.vehicle?.plate_number})
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-sm text-gray-900">{route.description || 'No description available'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Point</th>
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
                            <div className="text-sm text-gray-900">
                              {student.transport_info?.pickupPoint || 'Not specified'}
                            </div>
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
                <CardTitle>Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attendance.map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.student?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.pickup_time ? new Date(record.pickup_time).toLocaleTimeString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getStatusColor(record.status)}>
                              {record.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.route?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {assignedVehicle && assignedRoutes.length > 0 ? (
              <LiveTracking 
                vehicleId={assignedVehicle.id} 
                routeId={assignedRoutes[0].id} 
              />
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle or Route Assigned</h3>
                  <p className="text-gray-500">Contact the school administration to get a vehicle and route assigned for live tracking.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle" className="space-y-6">
            {assignedVehicle ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bus className="h-5 w-5 mr-2" />
                    {assignedVehicle.plate_number}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Vehicle Details</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Make & Model</span>
                          <span className="font-medium">{assignedVehicle.make} {assignedVehicle.model}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Year</span>
                          <span className="font-medium">{assignedVehicle.year}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Capacity</span>
                          <span className="font-medium">{assignedVehicle.capacity} seats</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Color</span>
                          <span className="font-medium">{assignedVehicle.color}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status</span>
                          <Badge variant={assignedVehicle.status === 'active' ? 'default' : 'secondary'}>
                            {assignedVehicle.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Maintenance Info</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Last Service</span>
                          <span className="font-medium">
                            {assignedVehicle.maintenance_info?.lastService || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Next Service</span>
                          <span className="font-medium">
                            {assignedVehicle.maintenance_info?.nextService || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Mileage</span>
                          <span className="font-medium">
                            {assignedVehicle.maintenance_info?.mileage || 0} km
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {assignedVehicle.features?.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicle Assigned</h3>
                  <p className="text-gray-500">Contact the school administration to get a vehicle assigned.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard;