import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, Users, Bus, BarChart3, Settings, 
  Bell, MapPin, Calendar, Award, TrendingUp,
  AlertTriangle, CheckCircle, Clock, UserPlus,
  Car, Route, Phone, MessageSquare, Download,
  Upload, FileText, DollarSign, Leaf, Monitor,
  PlusCircle, Edit, Trash2, Eye, Search
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";

export default function AdminDashboard() {
  const { name, isLoading } = useUser({ shouldRedirect: true });
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for Happy Valley Chepkanga - will be replaced with real Convex data
  const stats = {
    totalStudents: 284,
    activeVehicles: 3,
    activeRoutes: 3,
    onTimeRate: 98.5,
    studentsToday: 284
  };
  
  const students = [
    { _id: "1", name: "Abigail Chepkemoi", grade: "Grade 5", student_id: "HV2024001", class_name: "5A", status: "active" },
    { _id: "2", name: "Brian Kiprotich", grade: "Grade 4", student_id: "HV2024002", class_name: "4B", status: "active" },
    { _id: "3", name: "Catherine Jerotich", grade: "Grade 6", student_id: "HV2024003", class_name: "6A", status: "active" },
    { _id: "4", name: "Daniel Kipchoge", grade: "Grade 3", student_id: "HV2024004", class_name: "3C", status: "active" },
    { _id: "5", name: "Faith Chepngetich", grade: "Grade 7", student_id: "HV2024005", class_name: "7A", status: "active" }
  ];
  
  const vehicles = [
    { _id: "1", registration: "KBY 245C", model: "Isuzu NQR", year: 2020, capacity: 30, status: "active", type: "bus", driver: { name: "John Kiplagat" } },
    { _id: "2", registration: "KCA 123D", model: "Nissan Civilian", year: 2019, capacity: 25, status: "active", type: "bus", driver: { name: "Mary Chepkurui" } },
    { _id: "3", registration: "KBX 456E", model: "Toyota Hiace", year: 2021, capacity: 14, status: "active", type: "nissan", driver: { name: "Peter Kimutai" } }
  ];

  const handleSeedDatabase = async () => {
    alert("Database seeding functionality will be implemented once Convex is properly configured!");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-indigo-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Happy Valley Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {name || "Administrator"}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Systems Online
              </Badge>
              <Button variant="outline" size="sm" className="bg-white/50 border-indigo-200">
                <Bell className="w-4 h-4 mr-2" />
                Alerts (3)
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid grid-cols-6 lg:grid-cols-8 gap-2 h-auto p-2 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex-col h-16 gap-1">
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex-col h-16 gap-1">
              <Users className="w-5 h-5" />
              <span className="text-xs">Students</span>
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="flex-col h-16 gap-1">
              <Bus className="w-5 h-5" />
              <span className="text-xs">Vehicles</span>
            </TabsTrigger>
            <TabsTrigger value="routes" className="flex-col h-16 gap-1">
              <Route className="w-5 h-5" />
              <span className="text-xs">Routes</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex-col h-16 gap-1">
              <MapPin className="w-5 h-5" />
              <span className="text-xs">Live Track</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-col h-16 gap-1">
              <FileText className="w-5 h-5" />
              <span className="text-xs">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex-col h-16 gap-1">
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Comms</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-col h-16 gap-1">
              <Settings className="w-5 h-5" />
              <span className="text-xs">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalStudents || 0}</div>
                  <p className="text-sm text-gray-600">Total Students</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">{stats?.activeVehicles || 0}</div>
                  <p className="text-sm text-gray-600">Active Vehicles</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{stats?.activeRoutes || 0}</div>
                  <p className="text-sm text-gray-600">Active Routes</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-xl">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{stats?.onTimeRate || 0}%</div>
                  <p className="text-sm text-gray-600">On-Time Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                onClick={() => setActiveTab("students")}
                className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 flex-col gap-2"
              >
                <UserPlus className="w-6 h-6" />
                Add Student
              </Button>
              <Button 
                onClick={() => setActiveTab("vehicles")}
                variant="outline"
                className="h-20 border-2 border-green-300 text-green-700 hover:bg-green-50 flex-col gap-2"
              >
                <Car className="w-6 h-6" />
                Add Vehicle
              </Button>
              <Button 
                onClick={() => setActiveTab("routes")}
                variant="outline"
                className="h-20 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 flex-col gap-2"
              >
                <Route className="w-6 h-6" />
                Add Route
              </Button>
              <Button 
                onClick={handleSeedDatabase}
                variant="outline"
                className="h-20 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 flex-col gap-2"
              >
                <Upload className="w-6 h-6" />
                Seed Database
              </Button>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">New student registered</p>
                        <p className="text-sm text-gray-600">Abigail Chepkemoi added to Grade 5A</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <Bus className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Vehicle maintenance completed</p>
                        <p className="text-sm text-gray-600">KBY 245C back in service</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">1 hour ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
                <p className="text-gray-600">Manage student registrations and information</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="Search students..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {students?.slice(0, 10).map((student: any) => (
                <Card key={student._id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center text-white font-bold">
                          {student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{student.name}</h3>
                          <div className="flex gap-2 text-sm text-gray-600">
                            <span>{student.grade}</span>
                            <span>•</span>
                            <span>{student.student_id}</span>
                            <span>•</span>
                            <span>{student.class_name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => alert("Delete functionality will be implemented with Convex integration")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Additional tabs would be implemented similarly... */}
          <TabsContent value="vehicles" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Vehicle Fleet Management</h2>
                <p className="text-gray-600">Manage school buses and transportation vehicles</p>
              </div>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500">
                <Car className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles?.map((vehicle: any) => (
                <Card key={vehicle._id} className="bg-white/70 backdrop-blur-sm hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                        <Bus className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant={vehicle.status === "active" ? "default" : "secondary"}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">{vehicle.registration}</h3>
                    <p className="text-gray-600 mb-2">{vehicle.model} ({vehicle.year})</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Capacity:</span>
                        <span className="font-medium">{vehicle.capacity} students</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium capitalize">{vehicle.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Driver:</span>
                        <span className="font-medium">{vehicle.driver?.name || "Unassigned"}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => alert("Delete functionality will be implemented with Convex integration")}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Continue with other tabs... */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
              <p className="text-gray-600">Configure system preferences and data management</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Database Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleSeedDatabase}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Seed Happy Valley Data
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full text-red-600 border-red-300">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>School Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>School Name</Label>
                    <Input value="Happy Valley Chepkanga Primary School" />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input value="Chepkanga, Eldoret" />
                  </div>
                  <div>
                    <Label>Contact Phone</Label>
                    <Input value="+254712345678" />
                  </div>
                  <Button className="w-full">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}