// Route Tracking Service for Driver Dashboard
import { supabase } from '../lib/supabase';
import geolocationService from './geolocationService';

export const routeTrackingService = {
  activeTracking: null,
  trackingInterval: null,

  async startRouteTracking(routeAlertId, vehicleId, driverId, students, alertRadius = 800) {
    try {
      this.activeTracking = {
        routeAlertId,
        vehicleId,
        driverId,
        students,
        alertRadius,
        alertedStudents: new Set()
      };

      const watchId = await geolocationService.watchPosition(async (position) => {
        await this.updateVehicleLocation(position);
        await this.checkProximityAlerts(position);
      });

      this.activeTracking.watchId = watchId;
      return { success: true };
    } catch (error) {
      console.error('Route tracking start error:', error);
      throw error;
    }
  },

  async updateVehicleLocation(position) {
    if (!this.activeTracking) return;

    try {
      await supabase
        .from('live_tracking')
        .upsert({
          vehicle_id: this.activeTracking.vehicleId,
          driver_id: this.activeTracking.driverId,
          location: {
            latitude: position.latitude,
            longitude: position.longitude
          },
          speed: position.speed || 0,
          heading: position.heading || 0,
          timestamp: new Date().toISOString(),
          status: 'on_route'
        }, {
          onConflict: 'vehicle_id,timestamp'
        });
    } catch (error) {
      console.error('Location update error:', error);
    }
  },

  async checkProximityAlerts(position) {
    if (!this.activeTracking) return;

    for (const student of this.activeTracking.students) {
      if (this.activeTracking.alertedStudents.has(student.id)) continue;

      if (!student.address?.lat || !student.address?.lng) continue;

      const distance = geolocationService.calculateDistance(
        position.latitude,
        position.longitude,
        student.address.lat,
        student.address.lng
      );

      if (distance <= this.activeTracking.alertRadius) {
        await this.sendProximityAlert(student, distance, position);
        this.activeTracking.alertedStudents.add(student.id);
      }
    }
  },

  async sendProximityAlert(student, distance, position) {
    try {
      await geolocationService.sendProximityAlert(
        this.activeTracking.routeAlertId,
        student.parent_id,
        student.id,
        'approaching',
        distance,
        {
          latitude: position.latitude,
          longitude: position.longitude
        },
        student.school_id
      );

      console.log(`🔔 Alert sent to parent of ${student.name} - Distance: ${Math.round(distance)}m`);
    } catch (error) {
      console.error('Alert sending error:', error);
    }
  },

  async stopRouteTracking() {
    if (!this.activeTracking) return;

    if (this.activeTracking.watchId) {
      navigator.geolocation.clearWatch(this.activeTracking.watchId);
    }

    try {
      await supabase
        .from('route_alerts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', this.activeTracking.routeAlertId);

      await supabase
        .from('live_tracking')
        .update({
          status: 'off_duty'
        })
        .eq('driver_id', this.activeTracking.driverId);
    } catch (error) {
      console.error('Stop tracking error:', error);
    }

    this.activeTracking = null;
  },

  async sendDriverMessage(driverId, parentId, studentId, messageType, customMessage, location, schoolId) {
    try {
      const messages = {
        approaching: 'The school bus is approaching your location.',
        arrived: 'The school bus has arrived at your pickup point.',
        no_show: 'Student was not present at the pickup location.',
        delay: 'There is a slight delay in the bus schedule.',
        emergency: 'Emergency situation - please contact the driver immediately.',
        custom: customMessage || 'Message from driver'
      };

      const { data, error } = await supabase
        .from('driver_messages')
        .insert({
          driver_id: driverId,
          parent_id: parentId,
          student_id: studentId,
          message_type: messageType,
          message_content: messages[messageType],
          location: location,
          school_id: schoolId
        })
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('notifications')
        .insert({
          title: 'Message from Driver',
          message: messages[messageType],
          type: messageType === 'emergency' ? 'error' : 'info',
          recipients: [parentId],
          sent_by: driverId,
          status: 'sent'
        });

      return { success: true, data };
    } catch (error) {
      console.error('Driver message error:', error);
      throw error;
    }
  },

  async getStudentsOnRoute(routeId) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*, users!parent_id(*)')
        .eq('route_id', routeId)
        .eq('is_active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get route students error:', error);
      throw error;
    }
  }
};

export default routeTrackingService;
