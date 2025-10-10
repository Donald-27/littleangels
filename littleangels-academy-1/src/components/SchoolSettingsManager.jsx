import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { MapPin, Flag, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function SchoolLocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function SchoolSettingsManager() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    school_location: { latitude: 0.5143, longitude: 35.2698, address: 'Eldoret, Kenya', radius: 30 },
    motto: '',
    vision: '',
    mission: '',
    flag_url: '',
    logo_url: '',
    primary_color: '#6366f1',
    secondary_color: '#ec4899',
    attendance_radius: 30,
    bus_alert_radius: 800
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [mapPosition, setMapPosition] = useState([0.5143, 35.2698]);

  useEffect(() => {
    fetchSettings();
  }, [user]);

  useEffect(() => {
    if (settings.school_location) {
      setMapPosition([settings.school_location.latitude, settings.school_location.longitude]);
    }
  }, [settings.school_location]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('school_settings')
        .select('*')
        .eq('school_id', user.school_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Settings fetch error:', error);
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('school_settings')
        .upsert({
          school_id: user.school_id,
          ...settings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('✅ School settings saved successfully!');
      setSettings(data);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSelect = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${mapPosition[0]}&lon=${mapPosition[1]}`
      );
      const data = await response.json();
      const address = data.display_name || `${mapPosition[0].toFixed(6)}, ${mapPosition[1].toFixed(6)}`;

      setSettings({
        ...settings,
        school_location: {
          latitude: mapPosition[0],
          longitude: mapPosition[1],
          address: address,
          radius: settings.school_location.radius
        }
      });

      setShowLocationPicker(false);
      toast.success('School location updated');
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            School Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Location</label>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium">{settings.school_location.address}</p>
              <p className="text-xs text-gray-600 mt-1">
                📍 {settings.school_location.latitude.toFixed(6)}, {settings.school_location.longitude.toFixed(6)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Attendance Verification Radius (meters)</label>
            <Input
              type="number"
              value={settings.attendance_radius}
              onChange={(e) => setSettings({ ...settings, attendance_radius: parseInt(e.target.value) })}
              min="10"
              max="200"
            />
            <p className="text-xs text-gray-500 mt-1">
              Teachers/staff must be within this distance to check in
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bus Alert Radius (meters)</label>
            <Input
              type="number"
              value={settings.bus_alert_radius}
              onChange={(e) => setSettings({ ...settings, bus_alert_radius: parseInt(e.target.value) })}
              min="100"
              max="2000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Parents receive alerts when bus is within this distance
            </p>
          </div>

          <Button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            variant="outline"
            className="w-full"
          >
            <MapPin className="mr-2 h-4 w-4" />
            {showLocationPicker ? 'Hide Map' : 'Change School Location'}
          </Button>

          {showLocationPicker && (
            <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <MapContainer
                center={mapPosition}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                <SchoolLocationPicker position={mapPosition} setPosition={setMapPosition} />
              </MapContainer>
              <div className="p-3 bg-white border-t">
                <Button onClick={handleLocationSelect} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Set School Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            School Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">School Motto</label>
            <Input
              value={settings.motto}
              onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
              placeholder="Nurturing Tomorrow's Leaders"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Vision Statement</label>
            <textarea
              value={settings.vision}
              onChange={(e) => setSettings({ ...settings, vision: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="To be the leading institution..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mission Statement</label>
            <textarea
              value={settings.mission}
              onChange={(e) => setSettings({ ...settings, mission: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Providing quality education..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Flag Image URL</label>
              <Input
                value={settings.flag_url}
                onChange={(e) => setSettings({ ...settings, flag_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <Input
                value={settings.logo_url}
                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Primary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary Color</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  placeholder="#ec4899"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSaveSettings}
        disabled={saving}
        className="w-full bg-green-600 hover:bg-green-700"
        size="lg"
      >
        {saving ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-5 w-5" />
            Save All Settings
          </>
        )}
      </Button>
    </div>
  );
}
