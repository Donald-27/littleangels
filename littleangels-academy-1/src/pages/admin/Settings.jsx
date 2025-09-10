import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Settings as SettingsIcon, 
  Save, 
  Upload, 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Bell,
  Palette,
  Shield,
  Database,
  Users,
  Bus,
  DollarSign,
  Clock,
  Languages,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const SettingsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    established: '',
    motto: '',
    settings: {}
  });
  const [settings, setSettings] = useState({
    timeZone: 'Africa/Nairobi',
    academicYear: new Date().getFullYear().toString(),
    termDates: {
      term1: { start: '', end: '' },
      term2: { start: '', end: '' },
      term3: { start: '', end: '' }
    },
    currencies: ['KES', 'USD'],
    defaultCurrency: 'KES',
    languages: ['English', 'Swahili'],
    defaultLanguage: 'English',
    theme: 'light',
    notifications: {
      email: true,
      sms: true,
      push: true,
      whatsapp: false
    },
    transport: {
      defaultPickupTime: '06:30',
      defaultDropoffTime: '16:30',
      maxLateMinutes: 15,
      requireParentConfirmation: true
    },
    attendance: {
      markAbsentAfterMinutes: 30,
      sendAbsentNotifications: true,
      requireReasonForAbsence: true
    },
    fees: {
      transportFeePerTerm: 5000,
      latePaymentFee: 500,
      paymentMethods: ['mpesa', 'bank_transfer', 'cash'],
      dueDateDays: 30
    }
  });

  useEffect(() => {
    fetchSchoolData();
    fetchSettings();
  }, [user]);

  const fetchSchoolData = async () => {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', user?.school_id)
        .single();

      if (error) throw error;
      
      if (data) {
        setSchoolData({
          ...data,
          settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings
        });
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
      toast.error('Failed to fetch school data');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('school_id', user?.school_id);

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsObj = {};
        data.forEach(setting => {
          settingsObj[setting.key] = setting.value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    }
  };

  const saveSchoolData = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('schools')
        .upsert({
          id: user?.school_id,
          ...schoolData,
          settings: JSON.stringify(schoolData.settings)
        });

      if (error) throw error;
      
      toast.success('School information saved successfully');
    } catch (error) {
      console.error('Error saving school data:', error);
      toast.error('Failed to save school information');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const settingsToSave = Object.entries(settings).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value,
        category: getCategoryForKey(key),
        school_id: user?.school_id
      }));

      // Delete existing settings
      await supabase
        .from('settings')
        .delete()
        .eq('school_id', user?.school_id);

      // Insert new settings
      const { error } = await supabase
        .from('settings')
        .insert(settingsToSave);

      if (error) throw error;
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryForKey = (key) => {
    if (['timeZone', 'academicYear', 'termDates'].includes(key)) return 'academic';
    if (['currencies', 'defaultCurrency', 'fees'].includes(key)) return 'financial';
    if (['languages', 'defaultLanguage', 'theme'].includes(key)) return 'appearance';
    if (['notifications'].includes(key)) return 'notifications';
    if (['transport', 'attendance'].includes(key)) return 'operations';
    return 'general';
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('school-assets')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('school-assets')
        .getPublicUrl(fileName);

      setSchoolData(prev => ({ ...prev, logo: publicUrl }));
      toast.success('Logo uploaded successfully');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "blue", description }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings & Configuration</h1>
                <p className="text-gray-600 mt-1">Manage school information and system settings</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={activeTab === 'general' ? saveSchoolData : saveSettings}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="School Status" 
            value="Active" 
            icon={CheckCircle} 
            color="green"
            description="All systems operational"
          />
          <StatCard 
            title="Academic Year" 
            value={settings.academicYear} 
            icon={Calendar} 
            color="blue"
            description="Current academic year"
          />
          <StatCard 
            title="Default Currency" 
            value={settings.defaultCurrency} 
            icon={DollarSign} 
            color="yellow"
            description="Primary currency for fees"
          />
          <StatCard 
            title="Time Zone" 
            value={settings.timeZone} 
            icon={Clock} 
            color="purple"
            description="School time zone"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="transport">Transport</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <School className="h-5 w-5 mr-2" />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
                    <Input
                      value={schoolData.name}
                      onChange={(e) => setSchoolData({...schoolData, name: e.target.value})}
                      placeholder="Enter school name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
                    <Input
                      type="number"
                      value={schoolData.established}
                      onChange={(e) => setSchoolData({...schoolData, established: e.target.value})}
                      placeholder="e.g., 2010"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <Input
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                    placeholder="Enter school address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <Input
                      value={schoolData.phone}
                      onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                      placeholder="+254 712 345 678"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input
                      type="email"
                      value={schoolData.email}
                      onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                      placeholder="info@school.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <Input
                      value={schoolData.website}
                      onChange={(e) => setSchoolData({...schoolData, website: e.target.value})}
                      placeholder="https://school.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Motto</label>
                  <Input
                    value={schoolData.motto}
                    onChange={(e) => setSchoolData({...schoolData, motto: e.target.value})}
                    placeholder="Enter school motto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Logo</label>
                  <div className="flex items-center space-x-4">
                    {schoolData.logo && (
                      <img src={schoolData.logo} alt="School Logo" className="h-20 w-20 object-contain border rounded" />
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Settings */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Academic Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                    <Input
                      value={settings.academicYear}
                      onChange={(e) => setSettings({...settings, academicYear: e.target.value})}
                      placeholder="2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                    <select
                      value={settings.timeZone}
                      onChange={(e) => setSettings({...settings, timeZone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Africa/Nairobi">Africa/Nairobi</option>
                      <option value="Africa/Kampala">Africa/Kampala</option>
                      <option value="Africa/Dar_es_Salaam">Africa/Dar_es_Salaam</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Term Dates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(settings.termDates).map(([term, dates]) => (
                      <div key={term} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 capitalize">{term.replace('term', 'Term ')}</label>
                        <div className="space-y-2">
                          <Input
                            type="date"
                            value={dates.start}
                            onChange={(e) => setSettings({
                              ...settings,
                              termDates: {
                                ...settings.termDates,
                                [term]: { ...dates, start: e.target.value }
                              }
                            })}
                            placeholder="Start date"
                          />
                          <Input
                            type="date"
                            value={dates.end}
                            onChange={(e) => setSettings({
                              ...settings,
                              termDates: {
                                ...settings.termDates,
                                [term]: { ...dates, end: e.target.value }
                              }
                            })}
                            placeholder="End date"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Settings */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                    <select
                      value={settings.defaultCurrency}
                      onChange={(e) => setSettings({...settings, defaultCurrency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="KES">Kenyan Shilling (KES)</option>
                      <option value="USD">US Dollar (USD)</option>
                      <option value="UGX">Ugandan Shilling (UGX)</option>
                      <option value="TZS">Tanzanian Shilling (TZS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transport Fee per Term</label>
                    <Input
                      type="number"
                      value={settings.fees?.transportFeePerTerm || 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        fees: { ...settings.fees, transportFeePerTerm: parseInt(e.target.value) }
                      })}
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Late Payment Fee</label>
                    <Input
                      type="number"
                      value={settings.fees?.latePaymentFee || 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        fees: { ...settings.fees, latePaymentFee: parseInt(e.target.value) }
                      })}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Due Days</label>
                    <Input
                      type="number"
                      value={settings.fees?.dueDateDays || 30}
                      onChange={(e) => setSettings({
                        ...settings,
                        fees: { ...settings.fees, dueDateDays: parseInt(e.target.value) }
                      })}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Methods</label>
                  <div className="space-y-2">
                    {['mpesa', 'bank_transfer', 'cash', 'cheque', 'card'].map(method => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.fees?.paymentMethods?.includes(method) || false}
                          onChange={(e) => {
                            const methods = settings.fees?.paymentMethods || [];
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                fees: { ...settings.fees, paymentMethods: [...methods, method] }
                              });
                            } else {
                              setSettings({
                                ...settings,
                                fees: { ...settings.fees, paymentMethods: methods.filter(m => m !== method) }
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="capitalize">{method.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transport Settings */}
          <TabsContent value="transport" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bus className="h-5 w-5 mr-2" />
                  Transport Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Pickup Time</label>
                    <Input
                      type="time"
                      value={settings.transport?.defaultPickupTime || '06:30'}
                      onChange={(e) => setSettings({
                        ...settings,
                        transport: { ...settings.transport, defaultPickupTime: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Dropoff Time</label>
                    <Input
                      type="time"
                      value={settings.transport?.defaultDropoffTime || '16:30'}
                      onChange={(e) => setSettings({
                        ...settings,
                        transport: { ...settings.transport, defaultDropoffTime: e.target.value }
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Late Minutes</label>
                    <Input
                      type="number"
                      value={settings.transport?.maxLateMinutes || 15}
                      onChange={(e) => setSettings({
                        ...settings,
                        transport: { ...settings.transport, maxLateMinutes: parseInt(e.target.value) }
                      })}
                      placeholder="15"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.transport?.requireParentConfirmation || false}
                      onChange={(e) => setSettings({
                        ...settings,
                        transport: { ...settings.transport, requireParentConfirmation: e.target.checked }
                      })}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Require Parent Confirmation</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
                  <div className="space-y-4">
                    {Object.entries(settings.notifications || {}).map(([channel, enabled]) => (
                      <div key={channel} className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700 capitalize">{channel}</label>
                          <p className="text-sm text-gray-500">
                            {channel === 'email' && 'Send notifications via email'}
                            {channel === 'sms' && 'Send notifications via SMS'}
                            {channel === 'push' && 'Send push notifications'}
                            {channel === 'whatsapp' && 'Send notifications via WhatsApp'}
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={(e) => setSettings({
                            ...settings,
                            notifications: { ...settings.notifications, [channel]: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Send Absent Notifications</label>
                        <p className="text-sm text-gray-500">Notify parents when students are marked absent</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.attendance?.sendAbsentNotifications || false}
                        onChange={(e) => setSettings({
                          ...settings,
                          attendance: { ...settings.attendance, sendAbsentNotifications: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Require Reason for Absence</label>
                        <p className="text-sm text-gray-500">Require parents to provide reason for student absence</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.attendance?.requireReasonForAbsence || false}
                        onChange={(e) => setSettings({
                          ...settings,
                          attendance: { ...settings.attendance, requireReasonForAbsence: e.target.checked }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2" />
                  Appearance & Language
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <select
                      value={settings.theme || 'light'}
                      onChange={(e) => setSettings({...settings, theme: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                    <select
                      value={settings.defaultLanguage || 'English'}
                      onChange={(e) => setSettings({...settings, defaultLanguage: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="English">English</option>
                      <option value="Swahili">Swahili</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Languages</label>
                  <div className="space-y-2">
                    {['English', 'Swahili', 'French', 'Spanish', 'Arabic'].map(lang => (
                      <label key={lang} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.languages?.includes(lang) || false}
                          onChange={(e) => {
                            const languages = settings.languages || [];
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                languages: [...languages, lang]
                              });
                            } else {
                              setSettings({
                                ...settings,
                                languages: languages.filter(l => l !== lang)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span>{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsDashboard;
