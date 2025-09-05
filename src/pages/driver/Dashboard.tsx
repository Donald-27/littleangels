import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, QrCode, Navigation, Users, 
  PlayCircle, Square, MapPin, Clock,
  CheckCircle, AlertTriangle, Camera, Phone
} from "lucide-react";

export default function DriverDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-green-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Driver Mobile App
                </h1>
                <p className="text-sm text-gray-600">Quick & Easy Student Check-in</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ready to Drive
              </Badge>
              <Button variant="outline" size="sm" className="bg-white/50 border-green-200">
                <Phone className="w-4 h-4 mr-2" />
                Emergency
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-green-800 mb-2">Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">Check students in/out instantly</p>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-full">
                <QrCode className="w-4 h-4 mr-2" />
                Start Scanner
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlayCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-blue-800 mb-2">Start Trip</h3>
              <p className="text-sm text-gray-600 mb-4">Begin route tracking</p>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-full">
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Route
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-orange-800 mb-2">Report Issue</h3>
              <p className="text-sm text-gray-600 mb-4">Log incidents quickly</p>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 text-white w-full">
                <Camera className="w-4 h-4 mr-2" />
                Report Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Message */}
        <Card className="shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Smartphone className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Driver Mobile App Coming Soon!
            </h2>
            
            <div className="max-w-2xl mx-auto mb-8">
              <p className="text-lg text-gray-600 mb-6">
                We're developing a simple, powerful mobile-first interface designed specifically for drivers and conductors.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-left">
                  <h3 className="font-semibold text-green-700 mb-3">📱 Simple Interface</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Large, touch-friendly buttons</li>
                    <li>• Works offline when needed</li>
                    <li>• Voice commands support</li>
                    <li>• Works in bright sunlight</li>
                  </ul>
                </div>
                
                <div className="text-left">
                  <h3 className="font-semibold text-blue-700 mb-3">🚌 Core Features</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• QR code scanner for boarding</li>
                    <li>• One-tap incident reporting</li>
                    <li>• GPS route tracking</li>
                    <li>• Emergency contact buttons</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl shadow-lg">
                <Smartphone className="w-4 h-4 mr-2" />
                Download Beta
              </Button>
              <Button variant="outline" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-3 rounded-xl">
                <Navigation className="w-4 h-4 mr-2" />
                View Demo
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t border-blue-200">
              <p className="text-sm text-gray-500">
                Experience the complete system from the <strong>Parent Portal</strong> perspective while we finish the driver interface!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mock Driver Stats */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">32</div>
              <p className="text-sm text-gray-600">Students Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <p className="text-sm text-gray-600">On-Time Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">4.9⭐</div>
              <p className="text-sm text-gray-600">Safety Rating</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-sm text-gray-600">Incidents</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}