import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MapPin, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import geolocationService from '../services/geolocationService';

export default function TeacherAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schoolSettings, setSchoolSettings] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchSchoolSettings();
    fetchTodayAttendance();
  }, [user]);

  const fetchSchoolSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('School settings error:', error);
      }

      if (data) {
        setSchoolSettings(data);
      } else {
        setSchoolSettings({
          school_location: {
            latitude: 0.5143,
            longitude: 35.2698,
            address: 'Eldoret, Kenya',
            radius: 30
          }
        });
      }
    } catch (error) {
      console.error('Error fetching school settings:', error);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('location_attendance')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Attendance fetch error:', error);
      }

      if (data) {
        setTodayAttendance(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!schoolSettings) {
      toast.error('School location not configured');
      return;
    }

    try {
      setVerifying(true);
      const result = await geolocationService.checkInAttendance(
        user.id,
        user.role,
        schoolSettings.school_location
      );

      if (result.verification.withinRadius) {
        toast.success(`✅ Checked in successfully! You are ${result.verification.distanceInMeters}m from school.`);
      } else {
        toast.warning(`⚠️ Check-in recorded but you are ${result.verification.distanceInMeters}m from school (required: within ${schoolSettings.school_location.radius}m)`);
      }

      setTodayAttendance(result.data);
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.message || 'Failed to check in. Please enable location services.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setVerifying(true);
      const today = new Date().toISOString().split('T')[0];
      const result = await geolocationService.checkOutAttendance(user.id, today);

      toast.success('✅ Checked out successfully!');
      setTodayAttendance(result.data);
    } catch (error) {
      console.error('Check-out error:', error);
      toast.error('Failed to check out');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location-Based Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schoolSettings && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <MapPin className="h-4 w-4 inline mr-2" />
              <strong>School Location:</strong> {schoolSettings.school_location.address}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Verification radius: {schoolSettings.school_location.radius}m
            </p>
          </div>
        )}

        {todayAttendance ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  todayAttendance.check_in_verified ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {todayAttendance.check_in_verified ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <AlertTriangle className="h-6 w-6 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Checked In</p>
                  <p className="text-sm text-gray-600">
                    {new Date(todayAttendance.check_in_time).toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Distance: {Math.round(todayAttendance.check_in_distance)}m
                    {todayAttendance.check_in_verified ? ' ✓ Verified' : ' ⚠️ Out of range'}
                  </p>
                </div>
              </div>
              <Badge variant={todayAttendance.check_in_verified ? 'success' : 'warning'}>
                {todayAttendance.status}
              </Badge>
            </div>

            {todayAttendance.check_out_time ? (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gray-500 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Checked Out</p>
                    <p className="text-sm text-gray-600">
                      {new Date(todayAttendance.check_out_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleCheckOut}
                disabled={verifying}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                {verifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Verifying Location...
                  </>
                ) : (
                  <>
                    <X className="mr-2 h-5 w-5" />
                    Check Out
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <Button
            onClick={handleCheckIn}
            disabled={verifying || !schoolSettings}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {verifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Verifying Location...
              </>
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
                Check In to School
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">📍 How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your location is verified against the school location</li>
            <li>Admin can view all check-ins and check-outs</li>
            <li>Automatic verification within {schoolSettings?.school_location.radius || 30}m radius</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
