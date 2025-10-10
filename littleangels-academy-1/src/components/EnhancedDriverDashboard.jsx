import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Square, MapPin, Users, MessageCircle, Navigation, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import routeTrackingService from '../services/routeTrackingService';
import geolocationService from '../services/geolocationService';

export default function EnhancedDriverDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [students, setStudents] = useState([]);
  const [tripMode, setTripMode] = useState('pickup');
  const [isTracking, setIsTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [routeAlert, setRouteAlert] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDriverAssignments();
    }
  }, [user]);

  const fetchDriverAssignments = async () => {
    try {
      setLoading(true);
      
      const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('driver_id', user.id)
        .single();

      if (vehicleError && vehicleError.code !== 'PGRST116') {
        console.error('Vehicle fetch error:', vehicleError);
      }
      
      if (vehicle) {
        setAssignedVehicle(vehicle);

        const { data: route, error: routeError } = await supabase
          .from('routes')
          .select('*')
          .eq('vehicle_id', vehicle.id)
          .eq('is_active', true)
          .single();

        if (routeError && routeError.code !== 'PGRST116') {
          console.error('Route fetch error:', routeError);
        }

        if (route) {
          setAssignedRoute(route);

          const { data: routeStudents, error: studentsError } = await supabase
            .from('students')
            .select(`
              *,
              users!parent_id(id, name, phone, email)
            `)
            .eq('route_id', route.id)
            .eq('is_active', true);

          if (studentsError) {
            console.error('Students fetch error:', studentsError);
          } else {
            setStudents(routeStudents || []);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching driver assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateRoute = async () => {
    if (!assignedRoute || !assignedVehicle || students.length === 0) {
      toast.error('Cannot activate route: Missing assignments or students');
      return;
    }

    try {
      const studentIds = students.map(s => s.id);
      
      const { data: alert } = await geolocationService.activateRouteAlert(
        assignedRoute.id,
        assignedVehicle.id,
        user.id,
        tripMode,
        studentIds,
        user.school_id
      );

      setRouteAlert(alert.data);

      await routeTrackingService.startRouteTracking(
        alert.data.id,
        assignedVehicle.id,
        user.id,
        students,
        800
      );

      setIsTracking(true);
      toast.success(`Route activated for ${tripMode}!`);
    } catch (error) {
      console.error('Route activation error:', error);
      toast.error('Failed to activate route');
    }
  };

  const handleDeactivateRoute = async () => {
    try {
      await routeTrackingService.stopRouteTracking();
      setIsTracking(false);
      setRouteAlert(null);
      toast.success('Route deactivated');
    } catch (error) {
      console.error('Route deactivation error:', error);
      toast.error('Failed to deactivate route');
    }
  };

  const handleSendMessage = async (student, messageType, customMessage = '') => {
    if (!student.users) return;

    try {
      const position = await geolocationService.getCurrentPosition();
      
      await routeTrackingService.sendDriverMessage(
        user.id,
        student.parent_id,
        student.id,
        messageType,
        customMessage,
        {
          latitude: position.latitude,
          longitude: position.longitude
        },
        user.school_id
      );

      toast.success(`Message sent to ${student.users.name}`);
    } catch (error) {
      console.error('Message send error:', error);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <Navigation className="h-8 w-8" />
            Route Control Center
          </CardTitle>
          <p className="text-blue-100">Manage your assigned route and track students</p>
        </CardHeader>
      </Card>

      {assignedRoute && assignedVehicle ? (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plate Number:</span>
                  <span className="font-semibold">{assignedVehicle.plate_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Make/Model:</span>
                  <span className="font-semibold">{assignedVehicle.make} {assignedVehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-semibold">{assignedVehicle.capacity} students</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Route Name:</span>
                  <span className="font-semibold">{assignedRoute.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance:</span>
                  <span className="font-semibold">{assignedRoute.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students:</span>
                  <span className="font-semibold">{students.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Route Activation
                {isTracking && (
                  <Badge variant="success" className="bg-green-500">
                    <span className="animate-pulse mr-2">●</span> Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 items-center">
                <label className="text-sm font-medium">Trip Mode:</label>
                <div className="flex gap-2">
                  <Button
                    variant={tripMode === 'pickup' ? 'default' : 'outline'}
                    onClick={() => setTripMode('pickup')}
                    disabled={isTracking}
                  >
                    📍 Pickup
                  </Button>
                  <Button
                    variant={tripMode === 'dropoff' ? 'default' : 'outline'}
                    onClick={() => setTripMode('dropoff')}
                    disabled={isTracking}
                  >
                    🏠 Drop-off
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                {!isTracking ? (
                  <Button
                    onClick={handleActivateRoute}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Activate Route ({tripMode})
                  </Button>
                ) : (
                  <Button
                    onClick={handleDeactivateRoute}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Deactivate Route
                  </Button>
                )}
              </div>

              {isTracking && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    🚌 <strong>Route is active!</strong> Parents within 800m of your location will receive automatic alerts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students on Route ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          {student.grade} - {student.class}
                        </p>
                        {student.users && (
                          <p className="text-xs text-gray-500">
                            Parent: {student.users.name} • {student.users.phone}
                          </p>
                        )}
                        {student.address?.street && (
                          <p className="text-xs text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 inline mr-1" />
                            {student.address.street.substring(0, 50)}...
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendMessage(student, 'approaching')}
                        disabled={!isTracking}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Notify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendMessage(student, 'no_show')}
                      >
                        <AlertCircle className="h-4 w-4 mr-1" />
                        No Show
                      </Button>
                    </div>
                  </div>
                ))}

                {students.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No students assigned to this route</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Navigation className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Route Assigned</h3>
              <p>Contact your administrator to be assigned a vehicle and route.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
