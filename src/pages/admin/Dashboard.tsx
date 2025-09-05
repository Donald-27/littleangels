import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Users, Bus, BarChart3, Settings, 
  Bell, MapPin, Calendar, Award, TrendingUp,
  AlertTriangle, CheckCircle, Clock
} from "lucide-react";

export default function AdminDashboard() {
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
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-600">Smart School Transport Management</p>
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
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-600">200</div>
              <p className="text-sm text-gray-600">Total Students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-green-600">7</div>
              <p className="text-sm text-gray-600">Active Vehicles</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-purple-600">12</div>
              <p className="text-sm text-gray-600">Active Routes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-orange-600">98.5%</div>
              <p className="text-sm text-gray-600">On-Time Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Message */}
        <Card className="shadow-2xl border-2 border-indigo-200 bg-gradient-to-br from-white to-indigo-50/50">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Settings className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Admin Dashboard Coming Soon!
            </h2>
            
            <div className="max-w-2xl mx-auto mb-8">
              <p className="text-lg text-gray-600 mb-6">
                We're building an incredible admin experience with comprehensive school transport management tools.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h3 className="font-semibold text-indigo-700 mb-3">📊 Analytics & Reports</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time attendance tracking</li>
                    <li>• Route efficiency analysis</li>
                    <li>• Safety incident reports</li>
                    <li>• Parent satisfaction metrics</li>
                  </ul>
                </div>
                
                <div className="text-left">
                  <h3 className="font-semibold text-green-700 mb-3">🚌 Fleet Management</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Live vehicle tracking</li>
                    <li>• Driver assignment & scheduling</li>
                    <li>• Maintenance tracking</li>
                    <li>• Route optimization</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-xl shadow-lg">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Demo
              </Button>
              <Button variant="outline" className="border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 px-8 py-3 rounded-xl">
                <Bell className="w-4 h-4 mr-2" />
                Get Notified
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-indigo-200">
              <p className="text-sm text-gray-500">
                For now, enjoy the fully functional <strong>Parent Portal</strong> and see how parents track their children safely!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}