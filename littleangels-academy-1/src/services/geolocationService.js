// Geolocation Service for Little Angels Academy
import { supabase } from '../lib/supabase';

export const geolocationService = {
  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  },

  async watchPosition(callback) {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  },

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  async verifyLocationWithinRadius(currentLat, currentLon, targetLat, targetLon, radius) {
    const distance = this.calculateDistance(currentLat, currentLon, targetLat, targetLon);
    return {
      withinRadius: distance <= radius,
      distance: distance,
      distanceInMeters: Math.round(distance)
    };
  },

  async checkInAttendance(userId, userRole, schoolLocation) {
    try {
      const position = await this.getCurrentPosition();
      const verification = await this.verifyLocationWithinRadius(
        position.latitude,
        position.longitude,
        schoolLocation.latitude,
        schoolLocation.longitude,
        schoolLocation.radius || 30
      );

      const { data, error } = await supabase
        .from('location_attendance')
        .insert({
          user_id: userId,
          user_role: userRole,
          check_in_time: new Date().toISOString(),
          check_in_location: {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy
          },
          check_in_distance: verification.distance,
          check_in_verified: verification.withinRadius,
          date: new Date().toISOString().split('T')[0],
          status: verification.withinRadius ? 'present' : 'absent'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data, verification };
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  },

  async checkOutAttendance(userId, date) {
    try {
      const position = await this.getCurrentPosition();

      const { data, error } = await supabase
        .from('location_attendance')
        .update({
          check_out_time: new Date().toISOString(),
          check_out_location: {
            latitude: position.latitude,
            longitude: position.longitude,
            accuracy: position.accuracy
          }
        })
        .eq('user_id', userId)
        .eq('date', date)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
    }
  },

  async activateRouteAlert(routeId, vehicleId, driverId, tripType, studentsList, schoolId) {
    try {
      const { data, error } = await supabase
        .from('route_alerts')
        .insert({
          route_id: routeId,
          vehicle_id: vehicleId,
          driver_id: driverId,
          trip_type: tripType,
          status: 'active',
          students_list: studentsList,
          school_id: schoolId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Route alert activation error:', error);
      throw error;
    }
  },

  async sendProximityAlert(routeAlertId, parentId, studentId, alertType, distance, location, schoolId) {
    try {
      const { data, error } = await supabase
        .from('parent_alerts')
        .insert({
          route_alert_id: routeAlertId,
          parent_id: parentId,
          student_id: studentId,
          alert_type: alertType,
          distance: distance,
          location: location,
          school_id: schoolId
        })
        .select()
        .single();

      if (error) throw error;

      await this.sendNotification(parentId, alertType, studentId, distance);
      
      return { success: true, data };
    } catch (error) {
      console.error('Proximity alert error:', error);
      throw error;
    }
  },

  async sendNotification(recipientId, type, studentId, distance) {
    const messages = {
      approaching: `🚌 School bus is approaching! It's ${Math.round(distance)}m away from your location.`,
      arrived: `🏠 School bus has arrived at your location.`,
      departed: `🚌 School bus has departed from your area.`,
      no_show: `⚠️ Student was not present at pickup location.`
    };

    try {
      await supabase
        .from('notifications')
        .insert({
          title: 'Bus Location Alert',
          message: messages[type] || 'Bus location update',
          type: 'info',
          recipients: [recipientId],
          sent_by: recipientId,
          status: 'sent'
        });
    } catch (error) {
      console.error('Notification error:', error);
    }
  }
};

export default geolocationService;
