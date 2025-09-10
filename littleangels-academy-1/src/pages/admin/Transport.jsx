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
  Navigation
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
  const [activeTab, setActiveTab] = useState('vehicles');
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('vehicle');
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    totalTrips: 0,
    activeTrips: 0,
    maintenanceDue: 0
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
    insurance: { provider: '', policyNumber: '', expiryDate: '' },
    licenses: { drivingLicense: '', roadworthyCertificate: '', inspectionDate: '', expiryDate: '' },
    maintenance_info: { lastService: '', nextService: '', mileage: 0, serviceInterval: 5000 },
    features: []
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
    schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
    fuel_consumption: 0,
    toll_fees: 0,
    is_active: true
  });

  const vehicleTypes = [
    { value: 'bus', label: 'Bus', icon: Bus },
    { value: 'van', label: 'Van', icon: Car },
    { value: 'minibus', label: 'Minibus', icon: Car }
  ];

  const vehicleStatuses = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'maintenance', label: 'Maintenance', color: 'yellow' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'out_of_service', label: 'Out of Service', color: 'red' }
  ];

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, routesRes, tripsRes] = await Promise.all([
        supabase
          .from('vehicles')
          .select(`
            *,
            driver:users!vehicles_driver_id_fkey(name, phone),
            conductor:users!vehicles_conductor_id_fkey(name, phone),
            routes(name, description)
          `)
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('routes')
          .select(`
            *,
            vehicle:vehicles(plate_number, make, model, capacity),
            driver:users!routes_driver_id_fkey(name, phone),
            conductor:users!routes_conductor_id_fkey(name, phone)
          `)
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('trips')
          .select(`
            *,
            route:routes(name),
            vehicle:vehicles(plate_number),
            driver:users!trips_driver_id_fkey(name)
          `)
          .eq('school_id', user?.school_id)
          .order('created_at', { ascending: false })
          .limit(50)
      ]);

      if (vehiclesRes.error) throw vehiclesRes.error;
      if (routesRes.error) throw routesRes.error;
      if (tripsRes.error) throw tripsRes.error;

      setVehicles(vehiclesRes.data || []);
      setRoutes(routesRes.data || []);
      setTrips(tripsRes.data || []);
    } catch (error) {
      console.error('Error fetching transport data:', error);
      toast.error('Failed to fetch transport data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [vehiclesCount, activeVehiclesCount, routesCount, activeRoutesCount, tripsCount, activeTripsCount] = await Promise.all([
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('school_id', user?.school_id),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('school_id', user?.school_id).eq('status', 'active'),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('school_id', user?.school_id),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('school_id', user?.school_id).eq('is_active', true),
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('school_id', user?.school_id),
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('school_id', user?.school_id).eq('status', 'in_progress')
      ]);

      const { data: maintenanceData } = await supabase
        .from('vehicles')
        .select('maintenance_info')
        .eq('school_id', user?.school_id);

      const maintenanceDue = maintenanceData?.filter(v => {
        const maintenance = typeof v.maintenance_info === 'string' ? JSON.parse(v.maintenance_info) : v.maintenance_info;
        const nextService = new Date(maintenance.nextService);
        const today = new Date();
        return nextService <= today;
      }).length || 0;

      setStats({
        totalVehicles: vehiclesCount.count || 0,
        activeVehicles: activeVehiclesCount.count || 0,
        totalRoutes: routesCount.count || 0,
        activeRoutes: activeRoutesCount.count || 0,
        totalTrips: tripsCount.count || 0,
        activeTrips: activeTripsCount.count || 0,
        maintenanceDue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([{
          ...vehicleForm,
          insurance: JSON.stringify(vehicleForm.insurance),
          licenses: JSON.stringify(vehicleForm.licenses),
          maintenance_info: JSON.stringify(vehicleForm.maintenance_info),
          school_id: user?.school_id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Vehicle added successfully');
      setShowAddModal(false);
      resetVehicleForm();
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle');
    }
  };

  const handleAddRoute = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('routes')
        .insert([{
          ...routeForm,
          stops: JSON.stringify(routeForm.stops),
          schedule: JSON.stringify(routeForm.schedule),
          school_id: user?.school_id
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Route added successfully');
      setShowAddModal(false);
      resetRouteForm();
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error adding route:', error);
      toast.error('Failed to add route');
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);

      if (error) throw error;
      
      toast.success('Vehicle deleted successfully');
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast.error('Failed to delete vehicle');
    }
  };

  const handleDeleteRoute = async (routeId) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    try {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;
      
      toast.success('Route deleted successfully');
      fetchData();
      fetchStats();
    } catch (error) {
      console.error('Error deleting route:', error);
      toast.error('Failed to delete route');
    }
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
      insurance: { provider: '', policyNumber: '', expiryDate: '' },
      licenses: { drivingLicense: '', roadworthyCertificate: '', inspectionDate: '', expiryDate: '' },
      maintenance_info: { lastService: '', nextService: '', mileage: 0, serviceInterval: 5000 },
      features: []
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
      schedule: { monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
      fuel_consumption: 0,
      toll_fees: 0,
      is_active: true
    });
  };

  const openAddModal = (type) => {
    setModalType(type);
    setShowAddModal(true);
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plate_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || vehicle.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.vehicle?.plate_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' && route.is_active) || (filterStatus === 'inactive' && !route.is_active);
    
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, color = "blue", trend }) => (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}% from last month
            </p>
          )}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const getStatusColor = (status) => {
    const statusInfo = vehicleStatuses.find(s => s.value === status);
    return statusInfo ? statusInfo.color : 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transport data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Transport Management</h1>
                <p className="text-gray-600 mt-1">Manage vehicles, routes, and trips</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => openAddModal('vehicle')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Button>
                <Button
                  onClick={() => openAddModal('route')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Route
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Vehicles" 
            value={stats.totalVehicles} 
            icon={Bus} 
            color="blue"
          />
          <StatCard 
            title="Active Vehicles" 
            value={stats.activeVehicles} 
            icon={CheckCircle} 
            color="green"
          />
          <StatCard 
            title="Active Routes" 
            value={stats.activeRoutes} 
            icon={Route} 
            color="purple"
          />
          <StatCard 
            title="Maintenance Due" 
            value={stats.maintenanceDue} 
            icon={Wrench} 
            color="yellow"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="trips">Recent Trips</TabsTrigger>
          </TabsList>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search vehicles by plate, make, model, or driver..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    {vehicleStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Vehicles Table */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicles ({filteredVehicles.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Maintenance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredVehicles.map((vehicle) => {
                        const maintenance = typeof vehicle.maintenance_info === 'string' ? 
                          JSON.parse(vehicle.maintenance_info) : vehicle.maintenance_info;
                        const nextService = new Date(maintenance.nextService);
                        const today = new Date();
                        const isMaintenanceDue = nextService <= today;
                        
                        return (
                          <tr key={vehicle.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Bus className="h-5 w-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{vehicle.plate_number}</div>
                                  <div className="text-sm text-gray-500">{vehicle.make} {vehicle.model} ({vehicle.year})</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{vehicle.driver?.name || 'Unassigned'}</div>
                              <div className="text-sm text-gray-500">{vehicle.driver?.phone || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{vehicle.capacity} seats</div>
                              <div className="text-sm text-gray-500 capitalize">{vehicle.type}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={getStatusColor(vehicle.status)}>
                                {vehicle.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {isMaintenanceDue ? (
                                  <span className="text-red-600 font-medium">Due</span>
                                ) : (
                                  <span className="text-green-600">Up to date</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                Next: {new Date(maintenance.nextService).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem(vehicle);
                                    setModalType('vehicle');
                                    setShowEditModal(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            {/* Routes Table */}
            <Card>
              <CardHeader>
                <CardTitle>Routes ({filteredRoutes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRoutes.map((route) => (
                        <tr key={route.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <Route className="h-5 w-5 text-green-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{route.name}</div>
                                <div className="text-sm text-gray-500">{route.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{route.vehicle?.plate_number || 'Unassigned'}</div>
                            <div className="text-sm text-gray-500">{route.vehicle?.make} {route.vehicle?.model}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{route.driver?.name || 'Unassigned'}</div>
                            <div className="text-sm text-gray-500">{route.driver?.phone || ''}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{route.distance} km</div>
                            <div className="text-sm text-gray-500">{route.estimated_duration} min</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={route.is_active ? "default" : "secondary"}>
                              {route.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedItem(route);
                                  setModalType('route');
                                  setShowEditModal(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRoute(route.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trips ({trips.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trips.map((trip) => (
                        <tr key={trip.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">Trip #{trip.id.slice(-8)}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(trip.start_time).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trip.route?.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trip.vehicle?.plate_number}</div>
                            <div className="text-sm text-gray-500">{trip.driver?.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(trip.date).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={trip.status === 'completed' ? 'default' : trip.status === 'in_progress' ? 'secondary' : 'outline'}>
                              {trip.status.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{trip.students_transported?.length || 0}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && modalType === 'vehicle' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plate Number</label>
                  <Input
                    value={vehicleForm.plate_number}
                    onChange={(e) => setVehicleForm({...vehicleForm, plate_number: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={vehicleForm.type}
                    onChange={(e) => setVehicleForm({...vehicleForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {vehicleTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Make</label>
                  <Input
                    value={vehicleForm.make}
                    onChange={(e) => setVehicleForm({...vehicleForm, make: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <Input
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({...vehicleForm, model: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <Input
                    type="number"
                    value={vehicleForm.year}
                    onChange={(e) => setVehicleForm({...vehicleForm, year: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Capacity</label>
                  <Input
                    type="number"
                    value={vehicleForm.capacity}
                    onChange={(e) => setVehicleForm({...vehicleForm, capacity: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color</label>
                  <Input
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({...vehicleForm, color: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Add Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Route Modal */}
      {showAddModal && modalType === 'route' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Add New Route</h2>
            <form onSubmit={handleAddRoute} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route Name</label>
                  <Input
                    value={routeForm.name}
                    onChange={(e) => setRouteForm({...routeForm, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={routeForm.distance}
                    onChange={(e) => setRouteForm({...routeForm, distance: parseFloat(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={routeForm.description}
                  onChange={(e) => setRouteForm({...routeForm, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Duration (min)</label>
                  <Input
                    type="number"
                    value={routeForm.estimated_duration}
                    onChange={(e) => setRouteForm({...routeForm, estimated_duration: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fuel Consumption (L)</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={routeForm.fuel_consumption}
                    onChange={(e) => setRouteForm({...routeForm, fuel_consumption: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Add Route
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
