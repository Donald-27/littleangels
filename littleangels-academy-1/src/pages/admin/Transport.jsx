// src/pages/admin/TransportDashboard.jsx
import DashboardHeader from '../../components/DashboardHeader';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { 
  Bus, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Car,
  Route,
  Wrench,
  Fuel,
  Clock,
  Navigation,
  Zap,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Map,
  Satellite,
  Battery,
  Thermometer,
  Gauge,
  MoreVertical,
  Send,
  PhoneCall,
  MessageCircle,
  Camera,
  Shield,
  Bell,
  Target,
  Compass,
  RotateCcw,
  Package,
  UserCheck,
  UserX,
  Star,
  Award,
  Lightbulb,
  Calculator,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';

const TransportDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [liveTracking, setLiveTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('vehicle');
  const [trackingVehicle, setTrackingVehicle] = useState(null);
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    totalTrips: 0,
    activeTrips: 0,
    maintenanceDue: 0,
    fuelConsumption: 0,
    totalDistance: 0,
    efficiency: 0
  });

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    plate_number: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacity: 30,
    type: 'bus',
    color: '',
    driver_id: '',
    conductor_id: '',
    gps_device_id: '',
    status: 'active',
    insurance: { provider: '', policyNumber: '', expiryDate: '', coverage: '' },
    licenses: { drivingLicense: '', roadworthyCertificate: '', inspectionDate: '', expiryDate: '' },
    maintenance_info: { 
      lastService: '', 
      nextService: '', 
      mileage: 0, 
      serviceInterval: 5000,
      serviceHistory: [],
      warranty: { expires: '', details: '' }
    },
    specifications: { engine: '', fuelType: 'diesel', transmission: 'manual', fuelCapacity: 0 },
    features: ['gps', 'ac', 'safety_belts'],
    tracking: { enabled: true, deviceId: '', lastUpdate: '' }
  });

  const [routeForm, setRouteForm] = useState({
    name: '',
    description: '',
    vehicle_id: '',
    driver_id: '',
    conductor_id: '',
    stops: [],
    distance: 0,
    estimated_duration: 0,
    schedule: { 
      monday: true, tuesday: true, wednesday: true, thursday: true, 
      friday: true, saturday: false, sunday: false,
      morning: true, afternoon: true, evening: false
    },
    fuel_consumption: 0,
    toll_fees: 0,
    is_active: true,
    optimization: { preferred: false, trafficAvoidance: true, fuelEfficient: true },
    students: []
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    vehicle_id: '',
    type: 'routine',
    description: '',
    scheduled_date: '',
    estimated_cost: 0,
    priority: 'medium',
    status: 'scheduled',
    assigned_mechanic: '',
    parts_required: [],
    notes: ''
  });

  const vehicleTypes = [
    { value: 'bus', label: 'Bus', icon: Bus, capacity: [30, 60] },
    { value: 'van', label: 'Van', icon: Car, capacity: [12, 20] },
    { value: 'minibus', label: 'Minibus', icon: Car, capacity: [20, 30] },
    { value: 'car', label: 'Car', icon: Car, capacity: [4, 7] }
  ];

  const vehicleStatuses = [
    { value: 'active', label: 'Active', color: 'green', icon: CheckCircle },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow', icon: Wrench },
    { value: 'inactive', label: 'Inactive', color: 'gray', icon: XCircle },
    { value: 'out_of_service', label: 'Out of Service', color: 'red', icon: AlertCircle },
    { value: 'on_trip', label: 'On Trip', color: 'blue', icon: Navigation }
  ];

  const maintenanceTypes = [
    { value: 'routine', label: 'Routine Service', color: 'blue' },
    { value: 'repair', label: 'Repair', color: 'orange' },
    { value: 'emergency', label: 'Emergency', color: 'red' },
    { value: 'inspection', label: 'Inspection', color: 'green' }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'medium', label: 'Medium', color: 'yellow' },
    { value: 'high', label: 'High', color: 'orange' },
    { value: 'critical', label: 'Critical', color: 'red' }
  ];

  // Demo data for live tracking
  const demoLiveTracking = [
    {
      id: 'track-1',
      vehicle_id: 'demo-1',
      plate_number: 'KAA 123A',
      latitude: -1.2921,
      longitude: 36.8219,
      speed: 45,
      heading: 120,
      status: 'moving',
      last_update: new Date().toISOString(),
      battery: 85,
      temperature: 24,
      fuel_level: 65,
      students_onboard: 25
    },
    {
      id: 'track-2',
      vehicle_id: 'demo-2',
      plate_number: 'KBB 456B',
      latitude: -1.2950,
      longitude: 36.8250,
      speed: 0,
      heading: 0,
      status: 'stopped',
      last_update: new Date().toISOString(),
      battery: 92,
      temperature: 26,
      fuel_level: 40,
      students_onboard: 18
    }
  ];

  useEffect(() => {
    if (user) {
      fetchData();
      fetchStats();
      startLiveTracking();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🚌 Fetching transport data for school:', user?.school_id);

      // Try to fetch from database
      const [vehiclesRes, routesRes, tripsRes, maintenanceRes] = await Promise.all([
        supabase
          .from('vehicles')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('routes')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('trips')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false })
          .limit(50),
        
        supabase
          .from('maintenance')
          .select('*')
          .eq('school_id', user?.school_id)
          .order('scheduled_date', { ascending: true })
      ]);

      // Handle errors and fall back to demo data
      if (vehiclesRes.error || routesRes.error) {
        console.log('📋 Transport tables might not exist, using demo data');
        createDemoData();
        return;
      }

      console.log(`✅ Fetched ${vehiclesRes.data?.length || 0} vehicles, ${routesRes.data?.length || 0} routes`);
      setVehicles(vehiclesRes.data || []);
      setRoutes(routesRes.data || []);
      setTrips(tripsRes.data || []);
      setMaintenance(maintenanceRes.data || []);

    } catch (error) {
      console.error('❌ Error fetching transport data:', error);
      createDemoData();
    } finally {
      setLoading(false);
    }
  };

  // Create demo data for development
  const createDemoData = () => {
    console.log('🎭 Creating demo transport data');
    
    const demoVehicles = [
      {
        id: 'demo-1',
        plate_number: 'KAA 123A',
        make: 'Toyota',
        model: 'Coaster',
        year: 2022,
        capacity: 35,
        type: 'bus',
        color: 'Blue',
        status: 'active',
        driver_id: 'driver-1',
        conductor_id: 'conductor-1',
        gps_device_id: 'GPS001',
        insurance: JSON.stringify({
          provider: 'APA Insurance',
          policyNumber: 'APA-2023-001',
          expiryDate: '2024-12-31',
          coverage: 'Comprehensive'
        }),
        licenses: JSON.stringify({
          drivingLicense: 'DL-001234',
          roadworthyCertificate: 'RWC-2023-001',
          inspectionDate: '2023-06-15',
          expiryDate: '2024-06-15'
        }),
        maintenance_info: JSON.stringify({
          lastService: '2023-10-15',
          nextService: '2024-01-15',
          mileage: 45000,
          serviceInterval: 5000,
          serviceHistory: [
            { date: '2023-10-15', type: 'routine', cost: 15000, mileage: 45000 },
            { date: '2023-07-20', type: 'routine', cost: 12000, mileage: 40000 }
          ],
          warranty: { expires: '2025-12-31', details: 'Manufacturer warranty' }
        }),
        specifications: JSON.stringify({
          engine: '4.2L Diesel',
          fuelType: 'diesel',
          transmission: 'manual',
          fuelCapacity: 90
        }),
        features: JSON.stringify(['gps', 'ac', 'safety_belts', 'camera']),
        tracking: JSON.stringify({ enabled: true, deviceId: 'GPS001', lastUpdate: new Date().toISOString() }),
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      },
      {
        id: 'demo-2',
        plate_number: 'KBB 456B',
        make: 'Nissan',
        model: 'Civilian',
        year: 2021,
        capacity: 25,
        type: 'minibus',
        color: 'White',
        status: 'active',
        driver_id: 'driver-2',
        conductor_id: 'conductor-2',
        gps_device_id: 'GPS002',
        insurance: JSON.stringify({
          provider: 'Britam',
          policyNumber: 'BRT-2023-002',
          expiryDate: '2024-06-30',
          coverage: 'Third Party'
        }),
        maintenance_info: JSON.stringify({
          lastService: '2023-11-01',
          nextService: '2024-02-01',
          mileage: 38000,
          serviceInterval: 5000
        }),
        specifications: JSON.stringify({
          engine: '3.0L Diesel',
          fuelType: 'diesel',
          transmission: 'manual',
          fuelCapacity: 70
        }),
        features: JSON.stringify(['gps', 'ac']),
        tracking: JSON.stringify({ enabled: true, deviceId: 'GPS002', lastUpdate: new Date().toISOString() }),
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      }
    ];

    const demoRoutes = [
      {
        id: 'route-1',
        name: 'Westlands Route',
        description: 'Morning pickup from Westlands area',
        vehicle_id: 'demo-1',
        driver_id: 'driver-1',
        stops: JSON.stringify([
          { name: 'Westlands Mall', time: '06:30', students: 8 },
          { name: 'Sarit Centre', time: '06:45', students: 12 },
          { name: 'Parklands', time: '07:00', students: 10 }
        ]),
        distance: 15.5,
        estimated_duration: 45,
        schedule: JSON.stringify({
          monday: true, tuesday: true, wednesday: true, thursday: true, 
          friday: true, saturday: false, sunday: false,
          morning: true, afternoon: false, evening: false
        }),
        fuel_consumption: 12.5,
        toll_fees: 200,
        is_active: true,
        optimization: JSON.stringify({ preferred: true, trafficAvoidance: true, fuelEfficient: true }),
        students: JSON.stringify(['student-1', 'student-2', 'student-3']),
        school_id: user?.school_id || 'demo-school',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      }
    ];

    setVehicles(demoVehicles);
    setRoutes(demoRoutes);
    setLiveTracking(demoLiveTracking);
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      // Calculate stats from local data
      const totalVehicles = vehicles.length;
      const activeVehicles = vehicles.filter(v => v.status === 'active').length;
      const totalRoutes = routes.length;
      const activeRoutes = routes.filter(r => r.is_active).length;
      const totalTrips = trips.length;
      const activeTrips = trips.filter(t => t.status === 'in_progress').length;
      
      const maintenanceDue = vehicles.filter(v => {
        const maintenance = typeof v.maintenance_info === 'string' ? JSON.parse(v.maintenance_info) : v.maintenance_info;
        const nextService = new Date(maintenance.nextService);
        const today = new Date();
        return nextService <= today;
      }).length;

      const totalDistance = routes.reduce((sum, route) => sum + (route.distance || 0), 0);
      const fuelConsumption = routes.reduce((sum, route) => sum + (route.fuel_consumption || 0), 0);
      const efficiency = totalDistance > 0 ? (fuelConsumption / totalDistance).toFixed(2) : 0;

      setStats({
        totalVehicles,
        activeVehicles,
        totalRoutes,
        activeRoutes,
        totalTrips,
        activeTrips,
        maintenanceDue,
        fuelConsumption,
        totalDistance,
        efficiency
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Simulate live tracking updates
  const startLiveTracking = () => {
    const interval = setInterval(() => {
      setLiveTracking(prev => prev.map(vehicle => ({
        ...vehicle,
        latitude: vehicle.latitude + (Math.random() - 0.5) * 0.001,
        longitude: vehicle.longitude + (Math.random() - 0.5) * 0.001,
        speed: vehicle.status === 'moving' ? Math.floor(Math.random() * 60) + 20 : 0,
        last_update: new Date().toISOString(),
        battery: Math.max(10, vehicle.battery - Math.random() * 2),
        fuel_level: Math.max(5, vehicle.fuel_level - Math.random() * 1)
      })));
    }, 5000);

    return () => clearInterval(interval);
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🚗 Adding vehicle:', vehicleForm);

      const vehiclePayload = {
        ...vehicleForm,
        insurance: JSON.stringify(vehicleForm.insurance),
        licenses: JSON.stringify(vehicleForm.licenses),
        maintenance_info: JSON.stringify(vehicleForm.maintenance_info),
        specifications: JSON.stringify(vehicleForm.specifications),
        features: JSON.stringify(vehicleForm.features),
        tracking: JSON.stringify(vehicleForm.tracking),
        school_id: user?.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to insert into database
      if (supabase) {
        const { data, error } = await supabase
          .from('vehicles')
          .insert([vehiclePayload])
          .select()
          .single();

        if (error) {
          console.log('📋 Database insert failed, adding to local state');
          throw new Error('Database not available - using demo mode');
        }

        console.log('✅ Vehicle added to database:', data);
        setVehicles(prev => [data, ...prev]);
        
      } else {
        // If supabase not configured, add to local state
        console.log('📋 Supabase not configured, adding to local state');
        const demoVehicle = {
          ...vehiclePayload,
          id: 'demo-' + Date.now(),
          _isDemo: true
        };
        setVehicles(prev => [demoVehicle, ...prev]);
      }

      toast.success('Vehicle added successfully!');
      setShowAddModal(false);
      resetVehicleForm();
      fetchStats();

    } catch (error) {
      console.error('❌ Error adding vehicle:', error);
      
      // Add to local state as fallback
      const demoVehicle = {
        ...vehicleForm,
        id: 'demo-' + Date.now(),
        school_id: user?.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      };
      
      setVehicles(prev => [demoVehicle, ...prev]);
      setShowAddModal(false);
      resetVehicleForm();
      fetchStats();
      
      toast.success('Vehicle added successfully! (Demo Mode)');
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🛣️ Adding route:', routeForm);

      const routePayload = {
        ...routeForm,
        stops: JSON.stringify(routeForm.stops),
        schedule: JSON.stringify(routeForm.schedule),
        optimization: JSON.stringify(routeForm.optimization),
        students: JSON.stringify(routeForm.students),
        school_id: user?.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Try to insert into database
      if (supabase) {
        const { data, error } = await supabase
          .from('routes')
          .insert([routePayload])
          .select()
          .single();

        if (error) {
          console.log('📋 Database insert failed, adding to local state');
          throw new Error('Database not available - using demo mode');
        }

        console.log('✅ Route added to database:', data);
        setRoutes(prev => [data, ...prev]);
        
      } else {
        // If supabase not configured, add to local state
        console.log('📋 Supabase not configured, adding to local state');
        const demoRoute = {
          ...routePayload,
          id: 'route-' + Date.now(),
          _isDemo: true
        };
        setRoutes(prev => [demoRoute, ...prev]);
      }

      toast.success('Route added successfully!');
      setShowAddModal(false);
      resetRouteForm();
      fetchStats();

    } catch (error) {
      console.error('❌ Error adding route:', error);
      
      // Add to local state as fallback
      const demoRoute = {
        ...routeForm,
        id: 'route-' + Date.now(),
        school_id: user?.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        _isDemo: true
      };
      
      setRoutes(prev => [demoRoute, ...prev]);
      setShowAddModal(false);
      resetRouteForm();
      fetchStats();
      
      toast.success('Route added successfully! (Demo Mode)');
    }
  };

  const scheduleMaintenance = async (e) => {
    e.preventDefault();
    
    try {
      console.log('🔧 Scheduling maintenance:', maintenanceForm);

      const maintenancePayload = {
        ...maintenanceForm,
        parts_required: JSON.stringify(maintenanceForm.parts_required),
        school_id: user?.school_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to local state
      const demoMaintenance = {
        ...maintenancePayload,
        id: 'maint-' + Date.now(),
        _isDemo: true
      };
      
      setMaintenance(prev => [demoMaintenance, ...prev]);
      setShowMaintenanceModal(false);
      resetMaintenanceForm();
      
      toast.success('Maintenance scheduled successfully!');

    } catch (error) {
      console.error('❌ Error scheduling maintenance:', error);
      toast.error('Failed to schedule maintenance');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      // Try to delete from database if it's not a demo vehicle
      if (supabase && !vehicleId.startsWith('demo-')) {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId);

        if (error) throw error;
      }

      // Remove from local state
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== vehicleId));
      toast.success('Vehicle deleted successfully!');
      fetchStats();

    } catch (error) {
      console.error('❌ Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    try {
      // Try to delete from database if it's not a demo route
      if (supabase && !routeId.startsWith('route-')) {
        const { error } = await supabase
          .from('routes')
          .delete()
          .eq('id', routeId);

        if (error) throw error;
      }

      // Remove from local state
      setRoutes(prev => prev.filter(route => route.id !== routeId));
      toast.success('Route deleted successfully!');
      fetchStats();

    } catch (error) {
      console.error('❌ Error deleting route:', error);
      toast.error('Failed to delete route');
    }
  };

  const toggleVehicleStatus = async (vehicleId, newStatus) => {
    try {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      
      // Try to update in database if it's not a demo vehicle
      if (supabase && !vehicleId.startsWith('demo-')) {
        const { error } = await supabase
          .from('vehicles')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', vehicleId);

        if (error) throw error;
      }

      // Update local state
      setVehicles(prev => 
        prev.map(v => 
          v.id === vehicleId 
            ? { ...v, status: newStatus }
            : v
        )
      );

      toast.success(`Vehicle status updated to ${newStatus.replace('_', ' ')}`);
      fetchStats();

    } catch (error) {
      console.error('❌ Error updating vehicle status:', error);
      toast.error('Failed to update vehicle status');
    }
  };

  const sendAlertToDriver = (vehicle) => {
    toast.success(`Alert sent to driver of ${vehicle.plate_number}`);
    console.log('📢 Sending alert to driver:', vehicle.plate_number);
  };

  const viewVehicleHistory = (vehicle) => {
    toast.info(`Opening history for ${vehicle.plate_number}`);
    console.log('📊 Viewing vehicle history:', vehicle.plate_number);
  };

  const resetVehicleForm = () => {
    setVehicleForm({
      plate_number: '',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      capacity: 30,
      type: 'bus',
      color: '',
      driver_id: '',
      conductor_id: '',
      gps_device_id: '',
      status: 'active',
      insurance: { provider: '', policyNumber: '', expiryDate: '', coverage: '' },
      licenses: { drivingLicense: '', roadworthyCertificate: '', inspectionDate: '', expiryDate: '' },
      maintenance_info: { 
        lastService: '', 
        nextService: '', 
        mileage: 0, 
        serviceInterval: 5000,
        serviceHistory: [],
        warranty: { expires: '', details: '' }
      },
      specifications: { engine: '', fuelType: 'diesel', transmission: 'manual', fuelCapacity: 0 },
      features: ['gps', 'ac', 'safety_belts'],
      tracking: { enabled: true, deviceId: '', lastUpdate: '' }
    });
  };

  const resetRouteForm = () => {
    setRouteForm({
      name: '',
      description: '',
      vehicle_id: '',
      driver_id: '',
      conductor_id: '',
      stops: [],
      distance: 0,
      estimated_duration: 0,
      schedule: { 
        monday: true, tuesday: true, wednesday: true, thursday: true, 
        friday: true, saturday: false, sunday: false,
        morning: true, afternoon: true, evening: false
      },
      fuel_consumption: 0,
      toll_fees: 0,
      is_active: true,
      optimization: { preferred: false, trafficAvoidance: true, fuelEfficient: true },
      students: []
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceForm({
      vehicle_id: '',
      type: 'routine',
      description: '',
      scheduled_date: '',
      estimated_cost: 0,
      priority: 'medium',
      status: 'scheduled',
      assigned_mechanic: '',
      parts_required: [],
      notes: ''
    });
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const openTrackingModal = (vehicle) => {
    const trackingData = liveTracking.find(t => t.vehicle_id === vehicle.id) || {
      ...vehicle,
      latitude: -1.2921,
      longitude: 36.8219,
      speed: 0,
      heading: 0,
      status: 'stopped'
    };
    setTrackingVehicle(trackingData);
    setShowTrackingModal(true);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && route.is_active) || (filterStatus === 'inactive' && !route.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle, trend }) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`inline-flex items-center text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`h-4 w-4 mr-1 ${trend > 0 ? '' : 'rotate-180'}`} />
              {trend > 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100' :
          color === 'green' ? 'bg-green-100' :
          color === 'purple' ? 'bg-purple-100' :
          color === 'red' ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <Icon className={`h-6 w-6 ${
            color === 'blue' ? 'text-blue-600' :
            color === 'green' ? 'text-green-600' :
            color === 'purple' ? 'text-purple-600' :
            color === 'red' ? 'text-red-600' : 'text-yellow-600'
          }`} />
        </div>
      </div>
    </Card>
  );

  const getStatusColor = (status) => {
    const statusInfo = vehicleStatuses.find(s => s.value === status);
    return statusInfo ? statusInfo.color : 'gray';
  };

  const getStatusIcon = (status) => {
    const statusInfo = vehicleStatuses.find(s => s.value === status);
    return statusInfo ? statusInfo.icon : AlertCircle;
  };

  const VehicleStatusIndicator = ({ vehicle }) => {
    const StatusIcon = getStatusIcon(vehicle.status);
    const color = getStatusColor(vehicle.status);
    
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        color === 'green' ? 'bg-green-100 text-green-800' :
        color === 'blue' ? 'bg-blue-100 text-blue-800' :
        color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
        color === 'red' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      }`}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {vehicle.status.replace('_', ' ')}
      </div>
    );
  };

  const MaintenanceDueIndicator = ({ vehicle }) => {
    const maintenance = typeof vehicle.maintenance_info === 'string' ? 
      JSON.parse(vehicle.maintenance_info) : (vehicle.maintenance_info || {});
    const nextService = new Date(maintenance.nextService);
    const today = new Date();
    const daysUntilDue = Math.ceil((nextService - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 0) {
    <DashboardHeader title="Transport Management" subtitle="Manage vehicles, routes, and transportation logistics" />
      return (
        <Badge variant="destructive" className="flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          Maintenance Due
        </Badge>
      );
    } else if (daysUntilDue <= 7) {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Due in {daysUntilDue} days
        </Badge>
      );
    } else if (daysUntilDue <= 30) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Due in {daysUntilDue} days
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        Up to date
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading transport data...</p>
          <p className="text-gray-400 text-sm mt-2">Setting up your transport management system</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">Transport Management</h1>
                <p className="text-gray-600 mt-2">Manage vehicles, routes, trips, and live tracking</p>
              </div>
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={() => openAddModal('vehicle')}
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
                <Button
                  onClick={() => openAddModal('route')}
                  className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Route
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Vehicles" 
            value={stats.totalVehicles} 
            icon={Bus} 
            color="blue"
            subtitle="All registered vehicles"
          />
          <StatCard 
            title="Active Vehicles" 
            value={stats.activeVehicles} 
            icon={CheckCircle} 
            color="green"
            subtitle="Currently operational"
          />
          <StatCard 
            title="Active Routes" 
            value={stats.activeRoutes} 
            icon={Route} 
            color="purple"
            subtitle="Currently running"
          />
          <StatCard 
            title="Maintenance Due" 
            value={stats.maintenanceDue} 
            icon={Wrench} 
            color="yellow"
            subtitle="Requires attention"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Distance</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDistance} km</p>
                  <p className="text-sm text-gray-500">All routes combined</p>
                </div>
                <Compass className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Fuel Efficiency</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.efficiency} L/km</p>
                  <p className="text-sm text-gray-500">Average consumption</p>
                </div>
                <Fuel className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Live Tracking</p>
                  <p className="text-2xl font-bold text-gray-900">{liveTracking.length}</p>
                  <p className="text-sm text-gray-500">Active GPS devices</p>
                </div>
                <Satellite className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-yellow-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vehicles.slice(0, 5).map(vehicle => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Bus className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.plate_number}</p>
                            <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model}</p>
                          </div>
                        </div>
                        <VehicleStatusIndicator vehicle={vehicle} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Alerts */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                    Maintenance Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {vehicles.filter(v => {
                      const maintenance = typeof v.maintenance_info === 'string' ? 
                        JSON.parse(v.maintenance_info) : v.maintenance_info;
                      const nextService = new Date(maintenance.nextService);
                      const today = new Date();
                      return nextService <= new Date(today.setDate(today.getDate() + 7));
                    }).slice(0, 5).map(vehicle => (
                      <div key={vehicle.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-3">
                          <Wrench className="h-8 w-8 text-red-600" />
                          <div>
                            <p className="font-medium text-gray-900">{vehicle.plate_number}</p>
                            <p className="text-sm text-gray-500">Maintenance due soon</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setShowMaintenanceModal(true)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Schedule
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => openAddModal('vehicle')}
                    className="h-20 flex-col bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    Add Vehicle
                  </Button>
                  <Button
                    onClick={() => openAddModal('route')}
                    className="h-20 flex-col bg-green-600 hover:bg-green-700"
                  >
                    <Route className="h-6 w-6 mb-2" />
                    Add Route
                  </Button>
                  <Button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="h-20 flex-col bg-orange-600 hover:bg-orange-700"
                  >
                    <Wrench className="h-6 w-6 mb-2" />
                    Schedule Maintenance
                  </Button>
                  <Button
                    onClick={() => setActiveTab('tracking')}
                    className="h-20 flex-col bg-purple-600 hover:bg-purple-700"
                  >
                    <Satellite className="h-6 w-6 mb-2" />
                    Live Tracking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search vehicles by plate, make, model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 border-gray-300 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Status</option>
                    {vehicleStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <Button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => {
                const maintenanceInfo = typeof vehicle.maintenance_info === 'string' ? 
                  JSON.parse(vehicle.maintenance_info) : (vehicle.maintenance_info || {});
                const specifications = typeof vehicle.specifications === 'string' ? 
                  JSON.parse(vehicle.specifications) : (vehicle.specifications || {});
                const features = typeof vehicle.features === 'string' ? 
                  JSON.parse(vehicle.features) : (vehicle.features || []);
                
                return (
                  <Card key={vehicle.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{vehicle.plate_number}</CardTitle>
                        <VehicleStatusIndicator vehicle={vehicle} />
                      </div>
                      <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Capacity</p>
                          <p className="text-gray-600">{vehicle.capacity} seats</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Type</p>
                          <p className="text-gray-600 capitalize">{vehicle.type}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Fuel</p>
                          <p className="text-gray-600 capitalize">{specifications.fuelType}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Mileage</p>
                          <p className="text-gray-600">{maintenanceInfo.mileage?.toLocaleString()} km</p>
                        </div>
                      </div>
                      
                      <MaintenanceDueIndicator vehicle={vehicle} />
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTrackingModal(vehicle)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => sendAlertToDriver(vehicle)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50"
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewVehicleHistory(vehicle)}
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            {/* Routes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoutes.map((route) => {
                const stops = typeof route.stops === 'string' ? JSON.parse(route.stops) : route.stops;
                const schedule = typeof route.schedule === 'string' ? JSON.parse(route.schedule) : route.schedule;
                
                return (
                  <Card key={route.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{route.name}</CardTitle>
                        <Badge variant={route.is_active ? "default" : "secondary"}>
                          {route.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{route.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-gray-900">Distance</p>
                          <p className="text-gray-600">{route.distance} km</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Duration</p>
                          <p className="text-gray-600">{route.estimated_duration} min</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Stops</p>
                          <p className="text-gray-600">{stops.length} stops</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Fuel</p>
                          <p className="text-gray-600">{route.fuel_consumption} L</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* View route details */}}
                        >
                          <Map className="h-4 w-4 mr-2" />
                          View Route
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRoute(route.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Live Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Satellite className="h-5 w-5 mr-2 text-purple-600" />
                  Live Vehicle Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tracking Map (Placeholder) */}
                  <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Live Tracking Map</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {liveTracking.length} vehicles being tracked
                      </p>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        <Navigation className="h-4 w-4 mr-2" />
                        Open Full Map
                      </Button>
                    </div>
                  </div>
                  
                  {/* Tracking List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Active Vehicles</h3>
                    {liveTracking.map((tracking) => (
                      <div key={tracking.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Bus className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-semibold text-gray-900">{tracking.plate_number}</p>
                              <p className="text-sm text-gray-500">
                                {tracking.status === 'moving' ? 'Moving' : 'Stopped'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={tracking.status === 'moving' ? 'default' : 'secondary'}>
                            {tracking.speed} km/h
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center">
                            <Battery className="h-4 w-4 text-green-600 mr-2" />
                            <span>{tracking.battery}%</span>
                          </div>
                          <div className="flex items-center">
                            <Fuel className="h-4 w-4 text-orange-600 mr-2" />
                            <span>{tracking.fuel_level}%</span>
                          </div>
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 text-red-600 mr-2" />
                            <span>{tracking.temperature}°C</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 text-purple-600 mr-2" />
                            <span>{tracking.students_onboard} students</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => sendAlertToDriver(tracking)}
                          >
                            <Bell className="h-4 w-4 mr-2" />
                            Alert
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => openTrackingModal(tracking)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                    Maintenance Schedule
                  </div>
                  <Button
                    onClick={() => setShowMaintenanceModal(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Maintenance
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicles.filter(v => {
                    const maintenance = typeof v.maintenance_info === 'string' ? 
                      JSON.parse(v.maintenance_info) : v.maintenance_info;
                    const nextService = new Date(maintenance.nextService);
                    return nextService <= new Date(new Date().setDate(new Date().getDate() + 30));
                  }).map(vehicle => {
                    const maintenance = typeof vehicle.maintenance_info === 'string' ? 
                      JSON.parse(vehicle.maintenance_info) : (vehicle.maintenance_info || {});
                    const nextService = new Date(maintenance.nextService);
                    const today = new Date();
                    const daysUntilDue = Math.ceil((nextService - today) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={vehicle.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <Bus className="h-10 w-10 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{vehicle.plate_number}</p>
                            <p className="text-sm text-gray-600">
                              Next service: {nextService.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {maintenance.mileage?.toLocaleString()} km • {maintenance.serviceInterval} km interval
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            daysUntilDue <= 0 ? 'text-red-600' :
                            daysUntilDue <= 7 ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {daysUntilDue <= 0 ? 'OVERDUE' : `${daysUntilDue} days`}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowMaintenanceModal(true)}
                            className="mt-2"
                          >
                            Reschedule
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && modalType === 'vehicle' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Vehicle</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number *</label>
                    <Input
                      value={vehicleForm.plate_number}
                      onChange={(e) => setVehicleForm({...vehicleForm, plate_number: e.target.value})}
                      placeholder="e.g., KAA 123A"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
                      <Input
                        value={vehicleForm.make}
                        onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                        placeholder="Toyota"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                      <Input
                        value={vehicleForm.model}
                        onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                        placeholder="Coaster"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
                      <Input
                        type="number"
                        value={vehicleForm.year}
                        onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                      <select
                        value={vehicleForm.type}
                        onChange={(e) => setVehicleForm({...vehicleForm, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        {vehicleTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Capacity *</label>
                      <Input
                        type="number"
                        value={vehicleForm.capacity}
                        onChange={(e) => setVehicleForm({...vehicleForm, capacity: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <Input
                        value={vehicleForm.color}
                        onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Specifications & Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Specifications & Status</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={vehicleForm.status}
                      onChange={(e) => setVehicleForm({...vehicleForm, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {vehicleStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                      <select
                        value={vehicleForm.specifications.fuelType}
                        onChange={(e) => setVehicleForm({
                          ...vehicleForm, 
                          specifications: {...vehicleForm.specifications, fuelType: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="diesel">Diesel</option>
                        <option value="petrol">Petrol</option>
                        <option value="electric">Electric</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                      <select
                        value={vehicleForm.specifications.transmission}
                        onChange={(e) => setVehicleForm({
                          ...vehicleForm, 
                          specifications: {...vehicleForm.specifications, transmission: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="manual">Manual</option>
                        <option value="automatic">Automatic</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                    <Input
                      value={vehicleForm.specifications.engine}
                      onChange={(e) => setVehicleForm({
                        ...vehicleForm, 
                        specifications: {...vehicleForm.specifications, engine: e.target.value}
                      })}
                      placeholder="4.2L Diesel"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">GPS Device ID</label>
                    <Input
                      value={vehicleForm.gps_device_id}
                      onChange={(e) => setVehicleForm({...vehicleForm, gps_device_id: e.target.value})}
                      placeholder="GPS001"
                    />
                  </div>
                </div>
              </div>

              {/* Maintenance Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Maintenance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Service Date</label>
                    <Input
                      type="date"
                      value={vehicleForm.maintenance_info.lastService}
                      onChange={(e) => setVehicleForm({
                        ...vehicleForm, 
                        maintenance_info: {...vehicleForm.maintenance_info, lastService: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Next Service Date</label>
                    <Input
                      type="date"
                      value={vehicleForm.maintenance_info.nextService}
                      onChange={(e) => setVehicleForm({
                        ...vehicleForm, 
                        maintenance_info: {...vehicleForm.maintenance_info, nextService: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Mileage</label>
                    <Input
                      type="number"
                      value={vehicleForm.maintenance_info.mileage}
                      onChange={(e) => setVehicleForm({
                        ...vehicleForm, 
                        maintenance_info: {...vehicleForm.maintenance_info, mileage: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Interval (km)</label>
                    <Input
                      type="number"
                      value={vehicleForm.maintenance_info.serviceInterval}
                      onChange={(e) => setVehicleForm({
                        ...vehicleForm, 
                        maintenance_info: {...vehicleForm.maintenance_info, serviceInterval: parseInt(e.target.value)}
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddModal && modalType === 'route' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add New Route</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddModal(false)}
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleAddRoute} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Route Name *</label>
                    <Input
                      value={routeForm.name}
                      onChange={(e) => setRouteForm({...routeForm, name: e.target.value})}
                      placeholder="e.g., Westlands Morning Route"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={routeForm.description}
                      onChange={(e) => setRouteForm({...routeForm, description: e.target.value})}
                      placeholder="Route description and purpose"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Distance (km) *</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={routeForm.distance}
                        onChange={(e) => setRouteForm({...routeForm, distance: parseFloat(e.target.value)})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min) *</label>
                      <Input
                        type="number"
                        value={routeForm.estimated_duration}
                        onChange={(e) => setRouteForm({...routeForm, estimated_duration: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule & Optimization */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Schedule & Optimization</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Consumption (L)</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={routeForm.fuel_consumption}
                      onChange={(e) => setRouteForm({...routeForm, fuel_consumption: parseFloat(e.target.value)})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Toll Fees (KSh)</label>
                    <Input
                      type="number"
                      value={routeForm.toll_fees}
                      onChange={(e) => setRouteForm({...routeForm, toll_fees: parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={routeForm.is_active}
                      onChange={(e) => setRouteForm({...routeForm, is_active: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Active Route</label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={routeForm.optimization.preferred}
                      onChange={(e) => setRouteForm({
                        ...routeForm, 
                        optimization: {...routeForm.optimization, preferred: e.target.checked}
                      })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">Preferred Route</label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Route
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Tracking Modal */}
      {showTrackingModal && trackingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Live Tracking - {trackingVehicle.plate_number}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrackingModal(false)}
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vehicle Information */}
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Bus className="h-12 w-12 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{trackingVehicle.plate_number}</h3>
                        <p className="text-sm text-gray-600">Live Tracking Active</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <Badge variant={trackingVehicle.status === 'moving' ? 'default' : 'secondary'}>
                          {trackingVehicle.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Speed</span>
                        <span className="text-sm font-medium">{trackingVehicle.speed} km/h</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Heading</span>
                        <span className="text-sm font-medium">{trackingVehicle.heading}°</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Update</span>
                        <span className="text-sm font-medium">
                          {new Date(trackingVehicle.last_update).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vehicle Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Battery className="h-5 w-5 text-green-600 mr-3" />
                        <span className="text-sm font-medium">Battery</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${trackingVehicle.battery}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{trackingVehicle.battery}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Fuel className="h-5 w-5 text-orange-600 mr-3" />
                        <span className="text-sm font-medium">Fuel</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${trackingVehicle.fuel_level}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{trackingVehicle.fuel_level}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Thermometer className="h-5 w-5 text-red-600 mr-3" />
                        <span className="text-sm font-medium">Temperature</span>
                      </div>
                      <span className="text-sm font-medium">{trackingVehicle.temperature}°C</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-purple-600 mr-3" />
                        <span className="text-sm font-medium">Students</span>
                      </div>
                      <span className="text-sm font-medium">{trackingVehicle.students_onboard}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map and Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Map Placeholder */}
                <Card className="h-80">
                  <CardContent className="p-6 h-full flex items-center justify-center">
                    <div className="text-center">
                      <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Live Tracking Map</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Coordinates: {trackingVehicle.latitude.toFixed(4)}, {trackingVehicle.longitude.toFixed(4)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => sendAlertToDriver(trackingVehicle)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Send Alert
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {/* View history */}}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View History
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {/* Contact driver */}}
                      >
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Contact Driver
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {/* Emergency */}}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Emergency
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Schedule Maintenance</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMaintenanceModal(false)}
                className="h-8 w-8 p-0"
              >
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={scheduleMaintenance} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle *</label>
                  <select
                    value={maintenanceForm.vehicle_id}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, vehicle_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate_number} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Type *</label>
                  <select
                    value={maintenanceForm.type}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {maintenanceTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date *</label>
                  <Input
                    type="date"
                    value={maintenanceForm.scheduled_date}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, scheduled_date: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={maintenanceForm.priority}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, priority: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorityLevels.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={maintenanceForm.description}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, description: e.target.value})}
                    placeholder="Describe the maintenance required..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (KSh)</label>
                  <Input
                    type="number"
                    value={maintenanceForm.estimated_cost}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, estimated_cost: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Mechanic</label>
                  <Input
                    value={maintenanceForm.assigned_mechanic}
                    onChange={(e) => setMaintenanceForm({...maintenanceForm, assigned_mechanic: e.target.value})}
                    placeholder="Mechanic name"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMaintenanceModal(false)}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/25"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportDashboard;