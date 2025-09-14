import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { gpsTrackingService } from '../services/gpsTracking';
import { notificationService } from '../services/notificationService';
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

const LiveTracking = ({ vehicleId, routeId }) => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [studentsOnBoard, setStudentsOnBoard] = useState([]);
  const [nextStop, setNextStop] = useState(null);
  const [estimatedArrival, setEstimatedArrival] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const [mapCenter, setMapCenter] = useState([-1.2921, 36.8219]); // Nairobi coordinates
  const mapRef = useRef(null);
  const trackingIntervalRef = useRef(null);

  useEffect(() => {
    if (vehicleId && routeId) {
      loadRouteData();
      loadStudentsOnBoard();
    }

    return () => {
      if (trackingIntervalRef.current) {
        clearInterval(trackingIntervalRef.current);
      }
    };
  }, [vehicleId, routeId]);

  const loadRouteData = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('id', routeId)
        .single();

      if (error) throw error;
      setRouteData(data);
    } catch (error) {
      console.error('Error loading route data:', error);
      toast.error('Failed to load route data');
    }
  };

  const loadStudentsOnBoard = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, grade, class, address')
        .eq('route_id', routeId);

      if (error) throw error;
      setStudentsOnBoard(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const startTracking = async () => {
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation is not supported by this browser');
        return;
      }

      await gpsTrackingService.startTracking(vehicleId, routeId, user.id, user.school_id);
      setIsTracking(true);
      toast.success('GPS tracking started');

      // Update location every 30 seconds
      trackingIntervalRef.current = setInterval(async () => {
        await updateLocation();
      }, 30000);

    } catch (error) {
      console.error('Error starting tracking:', error);
      toast.error('Failed to start GPS tracking');
    }
  };

  const stopTracking = () => {
    gpsTrackingService.stopTracking();
    setIsTracking(false);
    
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
    }
    
    toast.success('GPS tracking stopped');
  };

  const updateLocation = async () => {
    try {
      const location = await gpsTrackingService.getCurrentLocation();
      setCurrentLocation(location);
      setSpeed(location.speed || 0);
      setHeading(location.heading || 0);
      
      // Update map center
      setMapCenter([location.lat, location.lng]);
      
      // Check if near next stop
      if (routeData && routeData.stops && routeData.stops.length > 0) {
        const currentStopIndex = findCurrentStopIndex(location);
        if (currentStopIndex !== -1) {
          const currentStop = routeData.stops[currentStopIndex];
          setNextStop(currentStop);
          
          // Calculate estimated arrival
          const arrival = await gpsTrackingService.getEstimatedArrival(vehicleId, currentStop);
          setEstimatedArrival(arrival);
          
          // Send arrival notification if within 5 minutes
          if (arrival && new Date(arrival) - new Date() < 5 * 60 * 1000) {
            await sendArrivalNotification(currentStop);
          }
        }
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const findCurrentStopIndex = (location) => {
    if (!routeData || !routeData.stops) return -1;
    
    for (let i = 0; i < routeData.stops.length; i++) {
      const stop = routeData.stops[i];
      const distance = gpsTrackingService.calculateDistance(
        location.lat,
        location.lng,
        stop.lat,
        stop.lng
      );
      
      if (distance <= 0.5) { // Within 500m
        return i;
      }
    }
    
    return -1;
  };

  const sendArrivalNotification = async (stop) => {
    try {
      // Get parent IDs for students on this route
      const parentIds = studentsOnBoard.map(student => student.parent_id);
      
      await notificationService.sendBusArrivalNotification(
        vehicleId,
        stop.name,
        estimatedArrival,
        parentIds
      );
    } catch (error) {
      console.error('Error sending arrival notification:', error);
    }
  };

  const handleEmergency = async () => {
    try {
      const confirmed = window.confirm('Are you sure you want to send an emergency alert?');
      if (!confirmed) return;

      const success = await gpsTrackingService.shareEmergencyLocation(
        vehicleId,
        user.id,
        user.school_id,
        'panic'
      );

      if (success) {
        toast.success('Emergency alert sent');
      } else {
        toast.error('Failed to send emergency alert');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast.error('Failed to send emergency alert');
    }
  };

  const getSpeedColor = (speed) => {
    if (speed < 20) return 'text-green-600';
    if (speed < 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSpeedStatus = (speed) => {
    if (speed < 20) return 'Slow';
    if (speed < 40) return 'Normal';
    return 'Fast';
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Live Tracking Control</h3>
          <div className="flex space-x-3">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Start Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Tracking
              </button>
            )}
            <button
              onClick={handleEmergency}
              className="bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-900 transition-colors"
            >
              Emergency Alert
            </button>
          </div>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Status</div>
            <div className={`font-semibold ${isTracking ? 'text-green-600' : 'text-gray-600'}`}>
              {isTracking ? 'Tracking Active' : 'Tracking Inactive'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Speed</div>
            <div className={`font-semibold ${getSpeedColor(speed)}`}>
              {speed.toFixed(1)} km/h ({getSpeedStatus(speed)})
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Students On Board</div>
            <div className="font-semibold text-blue-600">
              {studentsOnBoard.length}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Next Stop</div>
            <div className="font-semibold text-purple-600">
              {nextStop ? nextStop.name : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Live Map</h3>
        </div>
        <div className="h-96">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Current Location Marker */}
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>
                  <div>
                    <strong>Current Location</strong><br />
                    Speed: {speed.toFixed(1)} km/h<br />
                    Heading: {heading.toFixed(0)}°<br />
                    Time: {new Date(currentLocation.timestamp).toLocaleTimeString()}
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
                    Students: {studentsOnBoard.filter(s => s.address?.coordinates?.lat === stop.lat).length}
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
          </MapContainer>
        </div>
      </div>

      {/* Students On Board */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Students On Board</h3>
        </div>
        <div className="p-4">
          {studentsOnBoard.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentsOnBoard.map((student) => (
                <div key={student.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="font-semibold">{student.name}</div>
                  <div className="text-sm text-gray-600">{student.grade} - {student.class}</div>
                  <div className="text-sm text-gray-500">
                    {student.address?.street || 'Address not available'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No students assigned to this route
            </div>
          )}
        </div>
      </div>

      {/* Route Information */}
      {routeData && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">Route Information</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Stops</div>
                <div className="space-y-2">
                  {routeData.stops.map((stop, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{stop.name}</span>
                      <span className="text-sm text-gray-500">{stop.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracking;
