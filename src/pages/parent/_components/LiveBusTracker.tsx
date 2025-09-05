import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Navigation, Clock, Users, Phone, AlertCircle,
  Zap, RefreshCw, Volume2, VolumeX, Settings, Maximize
} from "lucide-react";

export default function LiveBusTracker() {
  const [isTracking, setIsTracking] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock real-time data
  const busData = {
    vehicle: "KBY 245C",
    driver: "Moses Kiprop Rono",
    route: "Route 1 - Main Campus",
    status: "picking_up",
    coordinates: { lat: 0.5143, lng: 35.2697 },
    speed: 25,
    heading: 135,
    studentsOnBoard: 18,
    capacity: 32,
    nextStop: "Pioneer Estate Stage",
    eta: "8 minutes",
    estimatedPickupTime: "7:15 AM",
    actualPickupTime: null
  };

  const routeStops = [
    { name: "School Departure", time: "06:30", status: "completed", students: 0 },
    { name: "Kimumu Shopping", time: "06:45", status: "completed", students: 5 },
    { name: "West Indies Junction", time: "07:00", status: "completed", students: 8 },
    { name: "Pioneer Estate Stage", time: "07:15", status: "current", students: 3 },
    { name: "Langas Market", time: "07:30", status: "pending", students: 4 },
    { name: "Hospital Roundabout", time: "07:45", status: "pending", students: 2 }
  ];

  const statusConfig = {
    not_started: { color: "bg-gray-500", label: "Not Started", icon: "⏸️" },
    picking_up: { color: "bg-blue-500 animate-pulse", label: "Picking Up Students", icon: "🚌" },
    en_route_to_school: { color: "bg-green-500", label: "En Route to School", icon: "🏫" },
    at_school: { color: "bg-purple-500", label: "At School", icon: "📍" },
    returning: { color: "bg-orange-500", label: "Returning Home", icon: "🏠" },
    completed: { color: "bg-gray-400", label: "Trip Completed", icon: "✅" }
  };

  const currentStatus = statusConfig[busData.status as keyof typeof statusConfig];

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate real-time updates
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Live Bus Tracking</h2>
              <p className="text-blue-100">Real-time location and status updates</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{busData.vehicle}</div>
              <p className="text-sm text-blue-100">Bus Number</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{busData.studentsOnBoard}/{busData.capacity}</div>
              <p className="text-sm text-blue-100">Students On Board</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{busData.speed} km/h</div>
              <p className="text-sm text-blue-100">Current Speed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{busData.eta}</div>
              <p className="text-sm text-blue-100">ETA to Your Stop</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2 space-y-6">
          {/* Interactive Map */}
          <Card className="shadow-xl border-2 border-blue-200/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  <span>Live Map View</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className={`${currentStatus.color} text-white`}>
                    {currentStatus.icon} {currentStatus.label}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Mock Map Interface */}
              <div className="w-full h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center relative overflow-hidden">
                {/* Map Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Bus Icon */}
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-white text-xl">🚌</span>
                  </div>
                  <div className="mt-2 bg-white rounded-full px-3 py-1 shadow-md text-center">
                    <p className="text-xs font-bold text-gray-700">{busData.vehicle}</p>
                  </div>
                </div>

                {/* Route Markers */}
                <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="absolute top-2/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full"></div>

                {/* Center Content */}
                <div className="text-center z-10">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-blue-200">
                    <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Interactive Map</h3>
                    <p className="text-gray-600 mb-4">OpenStreetMap integration with real-time GPS tracking</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Navigation className="w-4 h-4 mr-2" />
                      Open Full Map
                    </Button>
                  </div>
                </div>
              </div>

              {/* Map Controls */}
              <div className="flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                  <div className="text-sm text-gray-600">
                    Last updated: {lastUpdate.toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Auto-refresh:</span>
                  <select 
                    value={refreshInterval} 
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value={10}>10s</option>
                    <option value={30}>30s</option>
                    <option value={60}>1min</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Progress */}
          <Card className="shadow-xl border-2 border-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Navigation className="w-6 h-6 text-purple-600" />
                <span>Trip Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routeStops.map((stop, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      stop.status === 'completed' ? 'bg-green-500' :
                      stop.status === 'current' ? 'bg-blue-500 animate-pulse' :
                      'bg-gray-300'
                    }`}>
                      {stop.status === 'completed' ? '✓' :
                       stop.status === 'current' ? '🚌' : index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{stop.name}</p>
                          <p className="text-sm text-gray-600">
                            {stop.status === 'current' ? 'Arriving in ' + busData.eta :
                             stop.status === 'completed' ? 'Completed' : 
                             'Scheduled for ' + stop.time}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            stop.status === 'completed' ? 'default' :
                            stop.status === 'current' ? 'destructive' :
                            'secondary'
                          }>
                            {stop.students} students
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Driver Info */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-green-800">
                <Users className="w-6 h-6" />
                <span>Driver Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-2">
                  MK
                </div>
                <h3 className="font-bold text-gray-800">{busData.driver}</h3>
                <p className="text-sm text-gray-600">Professional Driver</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">License</span>
                  <span className="font-semibold">DL7834567</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Experience</span>
                  <span className="font-semibold">8 years</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">4.9</span>
                    <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                <Phone className="w-4 h-4 mr-2" />
                Call Driver
              </Button>
            </CardContent>
          </Card>

          {/* Safety Alerts */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-orange-800">
                <AlertCircle className="w-6 h-6" />
                <span>Safety Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-600 mt-0.5">✅</span>
                    <div>
                      <p className="text-sm font-semibold text-green-800">All Safety Checks Passed</p>
                      <p className="text-xs text-green-700">Vehicle inspected this morning</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-600 mt-0.5">ℹ️</span>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Traffic Update</p>
                      <p className="text-xs text-blue-700">Light traffic on Uganda Road</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-600 mt-0.5">🌟</span>
                    <div>
                      <p className="text-sm font-semibold text-purple-800">Perfect Record</p>
                      <p className="text-xs text-purple-700">30 days accident-free</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather & Conditions */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-blue-800">
                <Zap className="w-6 h-6" />
                <span>Current Conditions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">☀️</div>
                <p className="font-bold text-blue-800">Sunny & Clear</p>
                <p className="text-sm text-gray-600">Perfect driving conditions</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-lg font-bold text-blue-600">24°C</p>
                  <p className="text-xs text-gray-600">Temperature</p>
                </div>
                <div className="text-center p-2 bg-white rounded-lg">
                  <p className="text-lg font-bold text-green-600">Good</p>
                  <p className="text-xs text-gray-600">Visibility</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contacts */}
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-red-800">
                <Phone className="w-6 h-6" />
                <span>Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-red-300 text-red-700 hover:bg-red-50">
                <Phone className="w-4 h-4 mr-2" />
                School Office: +254701234567
              </Button>
              <Button variant="outline" className="w-full justify-start border-orange-300 text-orange-700 hover:bg-orange-50">
                <Phone className="w-4 h-4 mr-2" />
                Transport Manager: +254702345678
              </Button>
              <Button variant="outline" className="w-full justify-start border-blue-300 text-blue-700 hover:bg-blue-50">
                <Phone className="w-4 h-4 mr-2" />
                Emergency: 999
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}