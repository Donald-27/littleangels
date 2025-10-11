import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Eye,
  Shield,
  Save,
  Upload,
  Trash2,
  RefreshCw,
  Database,
  Globe,
  Mail,
  Phone,
  CreditCard,
  Zap,
  Code,
  Package,
  Plus,
  X,
  Check,
  AlertCircle,
  Download,
  UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  
  const [settings, setSettings] = useState({
    profile: {
      name: user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: '',
      position: '',
      department: '',
      employee_id: '',
      bio: '',
      address: '',
      emergency_contact: '',
      avatar: '',
      signature: ''
    },
    notifications: {
      email: true,
      sms: true,
      push: true,
      updates: true
    },
    appearance: {
      theme: 'light',
      language: 'en'
    },
    privacy: {
      profile_visible: true,
      show_email: false
    },
    school: {
      name: 'Little Angels School',
      logo: '',
      favicon: '',
      address: '',
      phone: '',
      email: ''
    },
    communication: {
      smtp_host: '',
      smtp_port: '',
      smtp_user: '',
      smtp_pass: ''
    },
    payment: {
      mpesa_consumer_key: '',
      mpesa_consumer_secret: '',
      mpesa_passkey: '',
      mpesa_shortcode: ''
    },
    advertisements: {
      enabled: false,
      rotation_interval: 30,
      max_ads_per_page: 3,
      targeting: {
        location_based: false,
        interest_based: false,
        behavior_based: false
      },
      ads: []
    },
    integrations: {
      google_analytics: '',
      facebook_pixel: '',
      maps_api_key: ''
    },
    system: {
      maintenance_mode: false,
      debug_mode: false,
      cache_enabled: true
    },
    advanced: {
      api_rate_limit: 100,
      max_upload_size: 10,
      session_timeout: 30
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    image: null,
    target_url: '',
    start_date: '',
    end_date: '',
    budget: 0,
    category: 'transport'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profile) {
        setSettings(prev => ({
          ...prev,
          profile: { ...prev.profile, ...profile }
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (section) => {
    try {
      setSaving(true);
      
      if (section === 'profile') {
        const { error } = await supabase
          .from('users')
          .update(settings.profile)
          .eq('id', user?.id);

        if (error) throw error;
      }

      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.new_password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSaving(true);
      
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
      setSaving(false);
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
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
      } else if (type === 'favicon') {
        setSettings(prev => ({
          ...prev,
          school: { ...prev.school, favicon: publicUrl }
        }));
      } else if (type === 'advertisements') {
        setNewAd(prev => ({ ...prev, image: publicUrl }));
      }

      toast.success('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const createBackup = async () => {
    try {
      setSaving(true);
      setBackupProgress(0);
      
      // Simulate backup process
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      toast.success('Backup created successfully!');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setSaving(false);
    }
  };

  const addAdvertisement = async () => {
    try {
      const newAdWithId = {
        ...newAd,
        id: `new-${Date.now()}`,
        active: true,
        impressions: 0,
        clicks: 0,
        spent: 0
      };

      setSettings(prev => ({
        ...prev,
        advertisements: {
          ...prev.advertisements,
          ads: [...prev.advertisements.ads, newAdWithId]
        }
      }));

      setNewAd({
        title: '',
        description: '',
        image: null,
        target_url: '',
        start_date: '',
        end_date: '',
        budget: 0,
        category: 'transport'
      });

      toast.success('Advertisement added successfully!');
    } catch (error) {
      console.error('Error adding advertisement:', error);
      toast.error('Failed to add advertisement');
    }
  };

  const deleteAdvertisement = async (adId) => {
    try {
      setSettings(prev => ({
        ...prev,
        advertisements: {
          ...prev.advertisements,
          ads: prev.advertisements.ads.filter(ad => ad.id !== adId)
        }
      }));

      if (!adId.startsWith('new-')) {
        await supabase
          .from('advertisements')
          .delete()
          .eq('id', adId);
      }

      toast.success('Advertisement deleted successfully!');
    } catch (error) {
      console.error('Error deleting advertisement:', error);
      toast.error('Failed to delete advertisement');
    }
  };

  // Enhanced render functions for each settings section
  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="text"
              value={settings.profile.position}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, position: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <input
              type="text"
              value={settings.profile.department}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, department: e.target.value }
              }))}
              className="input-modern"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <input
              type="text"
              value={settings.profile.employee_id}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, employee_id: e.target.value }
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <textarea
            value={settings.profile.address}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, address: e.target.value }
            }))}
            rows={2}
            className="input-modern"
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
            disabled={saving}
            className="btn-modern"
          >
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile
          </button>
        </div>
      </div>

      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
            {settings.profile.avatar ? (
              <img src={settings.profile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              settings.profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
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
            <div className="flex space-x-3">
              <label htmlFor="avatar-upload" className="btn-modern cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Photo'}
              </label>
              {settings.profile.avatar && (
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    profile: { ...prev.profile, avatar: '' }
                  }))}
                  className="btn-modern btn-danger"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 5MB. Recommended: 500x500px</p>
          </div>
        </div>
      </div>

      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Digital Signature</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Signature</label>
            <textarea
              value={settings.profile.signature}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                profile: { ...prev.profile, signature: e.target.value }
              }))}
              rows={2}
              className="input-modern"
              placeholder="Your digital signature for official documents"
            />
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600 mb-2">Signature Preview:</p>
            <div className="border-t border-gray-300 pt-4">
              <p className="font-semibold">{settings.profile.name}</p>
              <p className="text-sm text-gray-600">{settings.profile.position}</p>
              <p className="text-sm text-gray-500 italic">{settings.profile.signature}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvertisementSettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advertisement Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Advertisements Enabled</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSettings(prev => ({
                  ...prev,
                  advertisements: { ...prev.advertisements, enabled: !prev.advertisements.enabled }
                }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.advertisements.enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.advertisements.enabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className="text-sm text-gray-600">
                {settings.advertisements.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rotation Interval (seconds)</label>
            <input
              type="number"
              value={settings.advertisements.rotation_interval}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advertisements: { ...prev.advertisements, rotation_interval: parseInt(e.target.value) }
              }))}
              className="input-modern"
              min="10"
              max="300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Ads Per Page</label>
            <input
              type="number"
              value={settings.advertisements.max_ads_per_page}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                advertisements: { ...prev.advertisements, max_ads_per_page: parseInt(e.target.value) }
              }))}
              className="input-modern"
              min="1"
              max="10"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Targeting Options</label>
          <div className="space-y-3">
            {Object.entries(settings.advertisements.targeting).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {key.replace(/_/g, ' ')} Targeting
                  </h4>
                  <p className="text-sm text-gray-500">
                    {key === 'location_based' && 'Show ads based on user location'}
                    {key === 'interest_based' && 'Show ads based on user interests'}
                    {key === 'behavior_based' && 'Show ads based on user behavior'}
                  </p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    advertisements: {
                      ...prev.advertisements,
                      targeting: { ...prev.advertisements.targeting, [key]: !value }
                    }
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
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => saveSettings('advertisements')}
            disabled={saving}
            className="btn-modern"
          >
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Ad Settings
          </button>
        </div>
      </div>

      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Advertisements</h3>
        
        {/* Add New Ad Form */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Create New Advertisement</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newAd.title}
                onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                className="input-modern"
                placeholder="Ad title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={newAd.category}
                onChange={(e) => setNewAd(prev => ({ ...prev, category: e.target.value }))}
                className="input-modern"
              >
                <option value="transport">Transport</option>
                <option value="education">Education</option>
                <option value="events">Events</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newAd.description}
                onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="input-modern"
                placeholder="Ad description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target URL</label>
              <input
                type="url"
                value={newAd.target_url}
                onChange={(e) => setNewAd(prev => ({ ...prev, target_url: e.target.value }))}
                className="input-modern"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (KES)</label>
              <input
                type="number"
                value={newAd.budget}
                onChange={(e) => setNewAd(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                className="input-modern"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={newAd.start_date}
                onChange={(e) => setNewAd(prev => ({ ...prev, start_date: e.target.value }))}
                className="input-modern"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={newAd.end_date}
                onChange={(e) => setNewAd(prev => ({ ...prev, end_date: e.target.value }))}
                className="input-modern"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Image</label>
              <div className="flex items-center space-x-4">
                {newAd.image && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={newAd.image} alt="Ad preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        handleFileUpload(e.target.files[0], 'advertisements');
                      }
                    }}
                    className="hidden"
                    id="ad-image-upload"
                  />
                  <label htmlFor="ad-image-upload" className="btn-modern cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </label>
                  <p className="text-sm text-gray-500 mt-1">Recommended: 1200x600px</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={addAdvertisement}
              disabled={!newAd.title || !newAd.description}
              className="btn-modern"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Advertisement
            </button>
          </div>
        </div>

        {/* Existing Ads List */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Active Advertisements</h4>
          {settings.advertisements.ads.map((ad) => (
            <div key={ad.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {ad.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                      <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{ad.title}</h5>
                      <Badge variant={ad.active ? 'success' : 'secondary'}>
                        {ad.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ad.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Impressions: {ad.impressions}</span>
                      <span>Clicks: {ad.clicks}</span>
                      <span>Spent: KES {ad.spent}</span>
                      <span>Budget: KES {ad.budget}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {ad.start_date} to {ad.end_date}
                      </span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {ad.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {/* Edit ad */}}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteAdvertisement(ad.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      {/* System Status */}
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(systemStatus).map(([key, status]) => (
            <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                status === 'connected' || status === 'healthy' || status === 'operational' || status === 'excellent' 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}></div>
              <p className="text-sm font-medium text-gray-900 capitalize">{key}</p>
              <p className="text-xs text-gray-500 capitalize">{status}</p>
            </div>
          ))}
        </div>

        {/* System Metrics */}
        <h4 className="font-semibold text-gray-900 mb-4">System Metrics</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(systemMetrics).map(([key, value]) => (
            <div key={key} className="text-center p-3 bg-white border rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* System Configuration */}
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Mode</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, maintenance_mode: !prev.system.maintenance_mode }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.system.maintenance_mode ? 'bg-yellow-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.system.maintenance_mode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-sm text-gray-600">
                  {settings.system.maintenance_mode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Auto Backup</label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSettings(prev => ({
                    ...prev,
                    system: { ...prev.system, auto_backup: !prev.system.auto_backup }
                  }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.system.auto_backup ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.system.auto_backup ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
                <span className="text-sm text-gray-600">
                  {settings.system.auto_backup ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
              <select
                value={settings.system.backup_frequency}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, backup_frequency: e.target.value }
                }))}
                className="input-modern"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Backup Retention (days)</label>
              <input
                type="number"
                value={settings.system.backup_retention}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, backup_retention: parseInt(e.target.value) }
                }))}
                className="input-modern"
                min="1"
                max="365"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">API Rate Limit</label>
              <input
                type="number"
                value={settings.system.api_rate_limit}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, api_rate_limit: parseInt(e.target.value) }
                }))}
                className="input-modern"
                min="100"
                max="10000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Size Limit (MB)</label>
              <input
                type="number"
                value={settings.system.file_size_limit}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  system: { ...prev.system, file_size_limit: parseInt(e.target.value) }
                }))}
                className="input-modern"
                min="1"
                max="100"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => saveSettings('system')}
            disabled={saving}
            className="btn-modern"
          >
            {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save System Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="card-modern">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup & Restore</h3>
        
        {/* Backup Progress */}
        {backupProgress > 0 && backupProgress < 100 && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Creating backup...</span>
              <span>{backupProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${backupProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
            <DatabaseBackup className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">Create Backup</h4>
            <p className="text-sm text-gray-600 mb-4">Create a complete backup of your system data</p>
            <button
              onClick={createBackup}
              disabled={saving}
              className="btn-modern w-full"
            >
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <DownloadCloud className="h-4 w-4 mr-2" />}
              Create Backup
            </button>
          </div>

          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <RotateCcw className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h4 className="font-semibold text-gray-900 mb-2">Restore Backup</h4>
            <p className="text-sm text-gray-600 mb-4">Restore your system from a previous backup</p>
            <button
              onClick={() => {/* Restore backup logic */}}
              className="btn-modern btn-success w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Restore Backup
            </button>
          </div>
        </div>

        {/* Backup History */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-4">Recent Backups</h4>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Backup {i}</p>
                  <p className="text-sm text-gray-500">2 days ago • 45.2 MB</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Download
                  </button>
                  <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Group tabs by category
  const groupedTabs = tabs.reduce((acc, tab) => {
    if (!acc[tab.category]) {
      acc[tab.category] = [];
    }
    acc[tab.category].push(tab);
    return acc;
  }, {});

  const categoryLabels = {
    personal: 'Personal',
    security: 'Security & Privacy',
    organization: 'Organization',
    marketing: 'Marketing',
    advanced: 'Advanced'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">System Settings</h1>
          <p className="text-gray-600">Manage your account, organization, and system preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar with Categories */}
          <div className="lg:col-span-1">
            <div className="card-modern sticky top-8">
              <nav className="space-y-6">
                {Object.entries(groupedTabs).map(([category, categoryTabs]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {categoryLabels[category]}
                    </h3>
                    <div className="space-y-1">
                      {categoryTabs.map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                            activeTab === tab.id
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <tab.icon className="h-5 w-5" />
                          <span className="font-medium">{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
            {activeTab === 'privacy' && renderPrivacySettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'school' && renderSchoolSettings()}
            {activeTab === 'communication' && renderCommunicationSettings()}
            {activeTab === 'payment' && renderPaymentSettings()}
            {activeTab === 'advertisements' && renderAdvertisementSettings()}
            {activeTab === 'integrations' && renderIntegrationSettings()}
            {activeTab === 'system' && renderSystemSettings()}
            {activeTab === 'advanced' && renderAdvancedSettings()}
            {activeTab === 'backup' && renderBackupSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Additional render functions for other tabs (placeholders)
const renderNotificationSettings = () => <div>Notification Settings</div>;
const renderAppearanceSettings = () => <div>Appearance Settings</div>;
const renderPrivacySettings = () => <div>Privacy Settings</div>;
const renderSecuritySettings = () => <div>Security Settings</div>;
const renderSchoolSettings = () => <div>School Settings</div>;
const renderCommunicationSettings = () => <div>Communication Settings</div>;
const renderPaymentSettings = () => <div>Payment Settings</div>;
const renderIntegrationSettings = () => <div>Integration Settings</div>;
const renderAdvancedSettings = () => <div>Advanced Settings</div>;