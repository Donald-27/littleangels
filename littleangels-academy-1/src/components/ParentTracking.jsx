import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ParentTracking = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([-1.2921, 36.8219]); // Nairobi coordinates

  useEffect(() => {
    loadStudentData();
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      loadVehicleTracking();
      loadAttendanceStatus();
      
      // Update tracking every 30 seconds
      const interval = setInterval(loadVehicleTracking, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedStudent]);

  const loadStudentData = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          routes(*),
          vehicles(*)
        `)
        .eq('parent_id', user.id);

      if (error) throw error;
      
      setStudents(data || []);
      
      if (data && data.length > 0) {
        setSelectedStudent(data[0]);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Failed to load student data');
      setIsLoading(false);
    }
  };

  const loadVehicleTracking = async () => {
    if (!selectedStudent) return;

    try {
      // Get latest tracking data for the vehicle
      const { data, error } = await supabase
        .from('live_tracking')
        .select('*')
        .eq('vehicle_id', selectedStudent.vehicles?.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (data) {
        setVehicleLocation(data);
        setMapCenter([data.location.lat, data.location.lng]);
      }
    } catch (error) {
      console.error('Error loading vehicle tracking:', error);
    }
  };

  const loadAttendanceStatus = async () => {
    if (!selectedStudent) return;

    try {
      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', selectedStudent.id)
        .eq('date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setAttendanceStatus(data);
    } catch (error) {
      console.error('Error loading attendance status:', error);
    }
  };

  const loadRouteData = async () => {
    if (!selectedStudent?.route_id) return;

    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', selectedStudent.route_id)
        .single();

      if (error) throw error;
      setRouteData(data);
    } catch (error) {
      console.error('Error loading route data:', error);
    }
  };

  useEffect(() => {
    if (selectedStudent?.route_id) {
      loadRouteData();
    }
  }, [selectedStudent?.route_id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100';
      case 'absent': return 'text-red-600 bg-red-100';
      case 'late': return 'text-yellow-600 bg-yellow-100';
      case 'early_pickup': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVehicleStatusColor = (status) => {
    switch (status) {
      case 'on_route': return 'text-green-600 bg-green-100';
      case 'at_stop': return 'text-blue-600 bg-blue-100';
      case 'delayed': return 'text-yellow-600 bg-yellow-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  const calculateETA = (location, nextStop) => {
    if (!location || !nextStop) return 'N/A';
    
    // Simple calculation based on distance and average speed
    const distance = calculateDistance(
      location.lat,
      location.lng,
      nextStop.lat,
      nextStop.lng
    );
    
    const averageSpeed = 30; // km/h
    const timeInMinutes = (distance / averageSpeed) * 60;
    
    const eta = new Date(Date.now() + timeInMinutes * 60 * 1000);
    return eta.toLocaleTimeString();
  };

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No students found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Select Student</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedStudent?.id === student.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-semibold">{student.name}</div>
              <div className="text-sm text-gray-600">{student.grade} - {student.class}</div>
              <div className="text-sm text-gray-500">
                Route: {student.routes?.name || 'No route assigned'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <>
          {/* Status Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Student</div>
                <div className="font-semibold">{selectedStudent.name}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Attendance Today</div>
                <div className={`font-semibold px-2 py-1 rounded text-sm ${
                  attendanceStatus ? getStatusColor(attendanceStatus.status) : 'text-gray-600 bg-gray-100'
                }`}>
                  {attendanceStatus ? attendanceStatus.status : 'Not recorded'}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Vehicle Status</div>
                <div className={`font-semibold px-2 py-1 rounded text-sm ${
                  vehicleLocation ? getVehicleStatusColor(vehicleLocation.status) : 'text-gray-600 bg-gray-100'
                }`}>
                  {vehicleLocation ? vehicleLocation.status : 'Unknown'}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Last Update</div>
                <div className="font-semibold">
                  {vehicleLocation ? formatTime(vehicleLocation.timestamp) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Live Map */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Live Bus Tracking</h3>
            </div>
            <div className="h-96">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Vehicle Location */}
                {vehicleLocation && (
                  <Marker position={[vehicleLocation.location.lat, vehicleLocation.location.lng]}>
                    <Popup>
                      <div>
                        <strong>Bus Location</strong><br />
                        Speed: {vehicleLocation.speed?.toFixed(1) || 0} km/h<br />
                        Status: {vehicleLocation.status}<br />
                        Time: {formatTime(vehicleLocation.timestamp)}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route Stops */}
                {routeData && routeData.stops && routeData.stops.map((stop, index) => (
                  <Marker key={index} position={[stop.lat, stop.lng]}>
                    <Popup>
                      <div>
                        <strong>{stop.name}</strong><br />
                        Time: {stop.time}<br />
                        ETA: {calculateETA(vehicleLocation?.location, stop)}
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Route Line */}
                {routeData && routeData.stops && routeData.stops.length > 1 && (
                  <Polyline
                    positions={routeData.stops.map(stop => [stop.lat, stop.lng])}
                    color="blue"
                    weight={3}
                    opacity={0.7}
                  />
                )}

                {/* Student's Pickup/Dropoff Points */}
                {selectedStudent.transport_info && (
                  <>
                    {selectedStudent.transport_info.pickupPoint && (
                      <Marker position={[selectedStudent.address?.coordinates?.lat || 0, selectedStudent.address?.coordinates?.lng || 0]}>
                        <Popup>
                          <div>
                            <strong>Pickup Point</strong><br />
                            {selectedStudent.transport_info.pickupPoint}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </>
                )}
              </MapContainer>
            </div>
          </div>

          {/* Route Information */}
          {routeData && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Route Information</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Route Name</div>
                    <div className="font-semibold">{routeData.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Distance</div>
                    <div className="font-semibold">{routeData.distance} km</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Estimated Duration</div>
                    <div className="font-semibold">{routeData.estimated_duration} minutes</div>
                  </div>
                </div>
                
                {routeData.stops && routeData.stops.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Stops Schedule</div>
                    <div className="space-y-2">
                      {routeData.stops.map((stop, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                          <div>
                            <span className="font-medium">{stop.name}</span>
                            {vehicleLocation && (
                              <span className="ml-2 text-sm text-gray-500">
                                ETA: {calculateETA(vehicleLocation.location, stop)}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{stop.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance History */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">Recent Attendance</h3>
            </div>
            <div className="p-4">
              {attendanceStatus ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div>
                      <span className="font-medium">Today</span>
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(attendanceStatus.status)}`}>
                        {attendanceStatus.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTime(attendanceStatus.pickup_time)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  No attendance recorded for today
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ParentTracking;
