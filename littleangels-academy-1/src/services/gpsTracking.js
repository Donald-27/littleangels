import { supabase } from '../lib/supabase';

class GPSTrackingService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
    this.isTracking = false;
    this.updateInterval = null;
  }

  // Get current location using browser geolocation
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Start continuous location tracking
  async startTracking(vehicleId, routeId, driverId, schoolId) {
    if (this.isTracking) {
      console.warn('GPS tracking is already active');
      return;
    }

    try {
      // Get initial location
      const initialLocation = await this.getCurrentLocation();
      this.currentLocation = initialLocation;

      // Start watching position
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed || 0,
            heading: position.coords.heading || 0,
            timestamp: new Date().toISOString()
          };

          // Update location in database
          this.updateVehicleLocation(vehicleId, routeId, driverId, schoolId);
        },
        (error) => {
          console.error('GPS tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000 // 30 seconds
        }
      );

      this.isTracking = true;
      console.log('GPS tracking started');
    } catch (error) {
      console.error('Failed to start GPS tracking:', error);
      throw error;
    }
  }

  // Stop GPS tracking
  stopTracking() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    console.log('GPS tracking stopped');
  }

  // Update vehicle location in database
  async updateVehicleLocation(vehicleId, routeId, driverId, schoolId) {
    if (!this.currentLocation) return;

    try {
      // Update live tracking table
      const { error: trackingError } = await supabase
        .from('live_tracking')
        .insert({
          vehicle_id: vehicleId,
          location: {
            lat: this.currentLocation.lat,
            lng: this.currentLocation.lng,
            address: await this.getAddressFromCoordinates(this.currentLocation.lat, this.currentLocation.lng)
          },
          speed: this.currentLocation.speed || 0,
          heading: this.currentLocation.heading || 0,
          timestamp: this.currentLocation.timestamp,
          route_id: routeId,
          driver_id: driverId,
          status: 'on_route',
          school_id: schoolId
        });

      if (trackingError) {
        console.error('Error updating live tracking:', trackingError);
        return;
      }

      // Update vehicle current location
      const { error: vehicleError } = await supabase
        .from('vehicles')
        .update({
          current_location: {
            lat: this.currentLocation.lat,
            lng: this.currentLocation.lng,
            address: await this.getAddressFromCoordinates(this.currentLocation.lat, this.currentLocation.lng),
            timestamp: this.currentLocation.timestamp
          }
        })
        .eq('id', vehicleId);

      if (vehicleError) {
        console.error('Error updating vehicle location:', vehicleError);
      }

    } catch (error) {
      console.error('Error updating location:', error);
    }
  }

  // Get address from coordinates using reverse geocoding
  async getAddressFromCoordinates(lat, lng) {
    try {
      // Using a free geocoding service (you can replace with Google Maps API)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.localityInfo && data.localityInfo.administrative) {
        const admin = data.localityInfo.administrative[0];
        return `${admin.name}, ${data.countryName}`;
      }
      
      return `${lat}, ${lng}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat}, ${lng}`;
    }
  }

  // Get live tracking data for a vehicle
  async getLiveTrackingData(vehicleId) {
    try {
      const { data, error } = await supabase
        .from('live_tracking')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching live tracking data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching live tracking data:', error);
      return null;
    }
  }

  // Get all active vehicles with their current locations
  async getAllActiveVehicles(schoolId) {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          live_tracking!inner(*)
        `)
        .eq('school_id', schoolId)
        .eq('status', 'active')
        .order('live_tracking.timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching active vehicles:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error fetching active vehicles:', error);
      return [];
    }
  }

  // Calculate distance between two coordinates
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Check if vehicle is near a stop
  isNearStop(vehicleLocation, stopLocation, threshold = 0.1) {
    const distance = this.calculateDistance(
      vehicleLocation.lat,
      vehicleLocation.lng,
      stopLocation.lat,
      stopLocation.lng
    );
    return distance <= threshold;
  }

  // Get estimated arrival time to next stop
  async getEstimatedArrival(vehicleId, nextStopLocation) {
    try {
      const trackingData = await this.getLiveTrackingData(vehicleId);
      if (!trackingData || !nextStopLocation) return null;

      const distance = this.calculateDistance(
        trackingData.location.lat,
        trackingData.location.lng,
        nextStopLocation.lat,
        nextStopLocation.lng
      );

      const speed = trackingData.speed || 30; // Default speed in km/h
      const timeInHours = distance / speed;
      const estimatedArrival = new Date(Date.now() + timeInHours * 60 * 60 * 1000);

      return estimatedArrival.toISOString();
    } catch (error) {
      console.error('Error calculating estimated arrival:', error);
      return null;
    }
  }

  // Emergency location sharing
  async shareEmergencyLocation(vehicleId, driverId, schoolId, emergencyType = 'panic') {
    try {
      const location = await this.getCurrentLocation();
      
      const { error } = await supabase
        .from('live_tracking')
        .insert({
          vehicle_id: vehicleId,
          location: {
            lat: location.lat,
            lng: location.lng,
            address: await this.getAddressFromCoordinates(location.lat, location.lng)
          },
          speed: location.speed || 0,
          heading: location.heading || 0,
          timestamp: location.timestamp,
          driver_id: driverId,
          status: 'emergency',
          school_id: schoolId
        });

      if (error) {
        console.error('Error sharing emergency location:', error);
        return false;
      }

      // Send emergency notification
      await this.sendEmergencyNotification(vehicleId, driverId, schoolId, emergencyType, location);
      
      return true;
    } catch (error) {
      console.error('Error in emergency location sharing:', error);
      return false;
    }
  }

  // Send emergency notification
  async sendEmergencyNotification(vehicleId, driverId, schoolId, emergencyType, location) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          title: `Emergency Alert - ${emergencyType.toUpperCase()}`,
          message: `Emergency alert from vehicle ${vehicleId}. Location: ${location.lat}, ${location.lng}`,
          type: 'emergency',
          priority: 'high',
          recipients: [], // Will be populated with admin users
          channels: ['sms', 'email', 'push'],
          sent_by: driverId,
          status: 'pending',
          related_entity: { type: 'vehicle', id: vehicleId },
          school_id: schoolId
        });

      if (error) {
        console.error('Error sending emergency notification:', error);
      }
    } catch (error) {
      console.error('Error sending emergency notification:', error);
    }
  }
}

// Create singleton instance
export const gpsTrackingService = new GPSTrackingService();
export default gpsTrackingService;
