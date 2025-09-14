import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Key,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  School,
  Save,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
  Upload,
  Download,
  Trash2,
  Plus,
  Edit,
  Lock,
  Unlock,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: '',
      email: '',
      phone: '',
      avatar: '',
      bio: '',
      address: '',
      emergency_contact: ''
    },
    notifications: {
      email_notifications: true,
      sms_notifications: true,
      push_notifications: true,
      whatsapp_notifications: false,
      bus_arrival_alerts: true,
      payment_reminders: true,
      emergency_alerts: true,
      weekly_reports: false
    },
    appearance: {
      theme: 'light',
      language: 'en',
      font_size: 'medium',
      color_scheme: 'blue',
      sidebar_collapsed: false,
      animations_enabled: true
    },
    privacy: {
      profile_visibility: 'school_only',
      location_sharing: true,
      contact_sharing: false,
      data_analytics: true,
      marketing_emails: false
    },
    security: {
      two_factor_auth: false,
      session_timeout: 30,
      login_notifications: true,
      password_change_required: false
    },
    school: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      logo: '',
      timezone: 'Africa/Nairobi',
      currency: 'KES',
      academic_year: '2024',
      term: 'Term 1'
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Load school settings
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', user.school_id)
        .single();

      if (schoolError) throw schoolError;

      // Load app settings
      const { data: appSettings, error: settingsError } = await supabase
        .from('settings')
        .select('*')
        .eq('school_id', user.school_id);

      if (settingsError) throw settingsError;

      // Merge settings
      const mergedSettings = {
        profile: {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          avatar: userData.avatar || '',
          bio: userData.bio || '',
          address: userData.address || '',
          emergency_contact: userData.emergency_contact || ''
        },
        school: {
          name: schoolData.name || '',
          address: schoolData.address || '',
          phone: schoolData.phone || '',
          email: schoolData.email || '',
          website: schoolData.website || '',
          logo: schoolData.logo || '',
          timezone: schoolData.settings?.timezone || 'Africa/Nairobi',
          currency: schoolData.settings?.currency || 'KES',
          academic_year: schoolData.settings?.academic_year || '2024',
          term: schoolData.settings?.term || 'Term 1'
        },
        notifications: {
          email_notifications: userData.preferences?.notifications?.email ?? true,
          sms_notifications: userData.preferences?.notifications?.sms ?? true,
          push_notifications: userData.preferences?.notifications?.push ?? true,
          whatsapp_notifications: userData.preferences?.notifications?.whatsapp ?? false,
          bus_arrival_alerts: true,
          payment_reminders: true,
          emergency_alerts: true,
          weekly_reports: false
        },
        appearance: {
          theme: userData.preferences?.theme || 'light',
          language: userData.preferences?.language || 'en',
          font_size: 'medium',
          color_scheme: 'blue',
          sidebar_collapsed: false,
          animations_enabled: true
        },
        privacy: {
          profile_visibility: 'school_only',
          location_sharing: true,
          contact_sharing: false,
          data_analytics: true,
          marketing_emails: false
        },
        security: {
          two_factor_auth: false,
          session_timeout: 30,
          login_notifications: true,
          password_change_required: false
        }
      };

      setSettings(mergedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section) => {
    try {
      setLoading(true);

      if (section === 'profile') {
        const { error } = await supabase
          .from('users')
          .update({
            name: settings.profile.name,
            phone: settings.profile.phone,
            bio: settings.profile.bio,
            address: settings.profile.address,
            emergency_contact: settings.profile.emergency_contact,
            preferences: {
              ...user.preferences,
              notifications: settings.notifications,
              theme: settings.appearance.theme,
              language: settings.appearance.language
            }
          })
          .eq('id', user.id);

        if (error) throw error;
      } else if (section === 'school') {
        const { error } = await supabase
          .from('schools')
          .update({
            name: settings.school.name,
            address: settings.school.address,
            phone: settings.school.phone,
            email: settings.school.email,
            website: settings.school.website,
            settings: {
              timezone: settings.school.timezone,
              currency: settings.school.currency,
              academic_year: settings.school.academic_year,
              term: settings.school.term
            }
          })
          .eq('id', user.school_id);

        if (error) throw error;
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.new_password
      });

      if (error) throw error;

      toast.success('Password changed successfully!');
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (type === 'avatar') {
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, avatar: publicUrl }
        }));
      } else if (type === 'logo') {
        setSettings(prev => ({
          ...prev,
          school: { ...prev.school, logo: publicUrl }
        }));
      }

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'school', label: 'School', icon: School }
  ];

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, name: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={settings.profile.email}
              disabled
              className="input-modern bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.profile.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, phone: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={settings.profile.address}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, address: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          <textarea
            value={settings.profile.bio}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, bio: e.target.value }
            }))}
            rows={3}
            className="input-modern"
            placeholder="Tell us about yourself..."
          />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
          <input
            type="text"
            value={settings.profile.emergency_contact}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, emergency_contact: e.target.value }
            }))}
            className="input-modern"
            placeholder="Emergency contact information"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => saveSettings('profile')}
            disabled={loading}
            className="btn-modern"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile
          </button>
        </div>
      </div>

      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
            {settings.profile.avatar ? (
              <img src={settings.profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              settings.profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleFileUpload(e.target.files[0], 'avatar');
                }
              }}
              className="hidden"
              id="avatar-upload"
            />
            <label htmlFor="avatar-upload" className="btn-modern cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Photo
            </label>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 capitalize">
                  {key.replace(/_/g, ' ')}
                </h4>
                <p className="text-sm text-gray-500">
                  {key.includes('email') && 'Receive notifications via email'}
                  {key.includes('sms') && 'Receive notifications via SMS'}
                  {key.includes('push') && 'Receive push notifications'}
                  {key.includes('whatsapp') && 'Receive WhatsApp notifications'}
                  {key.includes('bus') && 'Get alerts when bus arrives'}
                  {key.includes('payment') && 'Get payment reminders'}
                  {key.includes('emergency') && 'Get emergency alerts'}
                  {key.includes('weekly') && 'Get weekly reports'}
                </p>
              </div>
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  notifications: { ...prev.notifications, [key]: !value }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => saveSettings('notifications')}
            disabled={loading}
            className="btn-modern"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Notifications
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme & Appearance</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'auto', label: 'Auto', icon: Monitor }
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, theme: theme.id }
                  }))}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.appearance.theme === theme.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <theme.icon className="h-6 w-6 mx-auto mb-2" />
                  <span className="text-sm font-medium">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
            <select
              value={settings.appearance.language}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                appearance: { ...prev.appearance, language: e.target.value }
              }))}
              className="input-modern"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Color Scheme</label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
                { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
                { id: 'green', name: 'Green', color: 'bg-green-500' },
                { id: 'red', name: 'Red', color: 'bg-red-500' }
              ].map(scheme => (
                <button
                  key={scheme.id}
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    appearance: { ...prev.appearance, color_scheme: scheme.id }
                  }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.appearance.color_scheme === scheme.id
                      ? 'border-blue-500'
                      : 'border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 ${scheme.color} rounded-full mx-auto mb-2`}></div>
                  <span className="text-xs font-medium">{scheme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => saveSettings('appearance')}
            disabled={loading}
            className="btn-modern"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Appearance
          </button>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword.current ? 'text' : 'password'}
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                className="input-modern pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword.new ? 'text' : 'password'}
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                className="input-modern pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                className="input-modern pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={changePassword}
            disabled={loading || !passwordForm.new_password || !passwordForm.confirm_password}
            className="btn-modern"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Key className="h-4 w-4 mr-2" />}
            Change Password
          </button>
        </div>
      </div>

      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, two_factor_auth: !prev.security.two_factor_auth }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.two_factor_auth ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.two_factor_auth ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Login Notifications</h4>
              <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, login_notifications: !prev.security.login_notifications }
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.security.login_notifications ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.security.login_notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSchoolSettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">School Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
            <input
              type="text"
              value={settings.school.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, name: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={settings.school.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, phone: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={settings.school.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, email: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              value={settings.school.website}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                school: { ...prev.school, website: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={settings.school.address}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              school: { ...prev.school, address: e.target.value }
            }))}
            rows={3}
            className="input-modern"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => saveSettings('school')}
            disabled={loading}
            className="btn-modern"
          >
            {loading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save School Info
          </button>
        </div>
      </div>

      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">School Logo</h3>
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl font-semibold">
            {settings.school.logo ? (
              <img src={settings.school.logo} alt="School Logo" className="w-full h-full rounded-lg object-cover" />
            ) : (
              settings.school.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleFileUpload(e.target.files[0], 'logo');
                }
              }}
              className="hidden"
              id="logo-upload"
            />
            <label htmlFor="logo-upload" className="btn-modern cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload Logo
            </label>
            <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and application preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-modern">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
            {activeTab === 'privacy' && (
              <div className="card-modern">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                <p className="text-gray-600">Privacy settings coming soon...</p>
              </div>
            )}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'school' && renderSchoolSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;