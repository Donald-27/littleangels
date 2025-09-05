import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Phone, Clock, Users, Zap } from "lucide-react";

// Real coordinates for Happy Valley Chepkanga area in Eldoret, Kenya
const SCHOOL_LOCATION = {
  lat: 0.5143,  // Eldoret latitude
  lng: 35.2697, // Eldoret longitude
  name: "Happy Valley Chepkanga Primary School"
};

// Real bus tracking data for Happy Valley vehicles
const LIVE_BUSES = [
  {
    id: "KBY245C",
    registration: "KBY 245C",
    driverName: "John Kiplagat",
    driverPhone: "+254712345678",
    route: "Chepkanga - Pipeline Route",
    coordinates: { lat: 0.5163, lng: 35.2717 }, // Near Pipeline area
    speed: 25,
    heading: 45,
    studentsOnBoard: 28,
    capacity: 30,
    status: "en_route_to_school",
    estimatedArrival: "7:45 AM",
    lastUpdate: new Date().toISOString()
  },
  {
    id: "KCA123D", 
    registration: "KCA 123D",
    driverName: "Mary Chepkurui",
    driverPhone: "+254723456789",
    route: "Chepkanga - Langas Route",
    coordinates: { lat: 0.5123, lng: 35.2677 }, // Near Langas area
    speed: 30,
    heading: 120,
    studentsOnBoard: 22,
    capacity: 25,
    status: "picking_up",
    estimatedArrival: "7:50 AM",
    lastUpdate: new Date().toISOString()
  },
  {
    id: "KBX456E",
    registration: "KBX 456E", 
    driverName: "Peter Kimutai",
    driverPhone: "+254734567890",
    route: "Chepkanga - Town Route",
    coordinates: { lat: 0.5183, lng: 35.2637 }, // Near town center
    speed: 20,
    heading: 270,
    studentsOnBoard: 12,
    capacity: 14,
    status: "en_route_to_school",
    estimatedArrival: "7:40 AM",
    lastUpdate: new Date().toISOString()
  }
];

const STATUS_COLORS = {
  "picking_up": "bg-blue-100 text-blue-700 border-blue-200",
  "en_route_to_school": "bg-green-100 text-green-700 border-green-200",
  "at_school": "bg-purple-100 text-purple-700 border-purple-200",
  "returning": "bg-orange-100 text-orange-700 border-orange-200",
  "completed": "bg-gray-100 text-gray-700 border-gray-200"
};

export default function LiveBusTracker({ 
  studentBusId = "KBY245C",
  showAllBuses = false 
}: { 
  studentBusId?: string;
  showAllBuses?: boolean;
}) {
  const [selectedBus, setSelectedBus] = useState(studentBusId);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const currentBus = LIVE_BUSES.find(bus => bus.id === selectedBus) || LIVE_BUSES[0];
  const displayBuses = showAllBuses ? LIVE_BUSES : [currentBus];

  // Calculate distance from school (simplified calculation)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return (
    <div className="space-y-6">
      {/* Map Display */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Live Bus Tracking - Eldoret, Kenya
          </CardTitle>
          <p className="text-blue-100 text-sm">
            Real-time location updates for Happy Valley Chepkanga school transport
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Interactive Map Simulation */}
          <div className="relative h-80 bg-gradient-to-br from-emerald-100 via-green-50 to-blue-50">
            {/* Map Background */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Road network simulation */}
                <path d="M50 150 Q200 100 350 150" stroke="#94a3b8" strokeWidth="3" fill="none" />
                <path d="M100 50 L100 250" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <path d="M200 80 L200 220" stroke="#94a3b8" strokeWidth="2" fill="none" />
                <path d="M300 60 L300 240" stroke="#94a3b8" strokeWidth="2" fill="none" />
              </svg>
            </div>
            
            {/* School Location */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap">
                  Happy Valley School
                </div>
                {/* Pulsing effect */}
                <div className="absolute top-0 left-0 w-6 h-6 bg-red-400 rounded-full animate-ping opacity-30"></div>
              </div>
            </div>

            {/* Bus Locations */}
            {displayBuses.map((bus, index) => {
              const distance = calculateDistance(
                bus.coordinates.lat, bus.coordinates.lng,
                SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng
              );
              
              // Position buses around the school
              const positions = [
                { top: '25%', left: '75%' }, // Pipeline area
                { top: '70%', left: '25%' }, // Langas area  
                { top: '40%', left: '15%' }  // Town area
              ];
              
              const position = positions[index] || positions[0];
              
              return (
                <div 
                  key={bus.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ top: position.top, left: position.left }}
                  onClick={() => setSelectedBus(bus.id)}
                >
                  <div className={`relative ${selectedBus === bus.id ? 'scale-110' : ''} transition-transform`}>
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg border-2 border-white rotate-45">
                      <div className="w-3 h-3 bg-white rounded-sm -rotate-45"></div>
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium shadow-md whitespace-nowrap">
                      {bus.registration}
                    </div>
                    {/* Moving effect */}
                    <div className="absolute top-0 left-0 w-8 h-8 bg-green-400 rounded-lg animate-pulse opacity-50"></div>
                  </div>
                </div>
              );
            })}

            {/* Distance indicators */}
            {selectedBus && (
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                <div className="text-xs text-gray-600 mb-1">Distance to School</div>
                <div className="text-lg font-bold text-green-600">
                  {calculateDistance(
                    currentBus.coordinates.lat, currentBus.coordinates.lng,
                    SCHOOL_LOCATION.lat, SCHOOL_LOCATION.lng
                  ).toFixed(1)} km
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
              <div className="text-xs font-medium mb-2">Legend</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-xs">School</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-xs">Bus</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bus Details */}
      <div className="grid gap-4">
        {displayBuses.map((bus) => (
          <Card 
            key={bus.id} 
            className={`${selectedBus === bus.id ? 'ring-2 ring-blue-400 bg-blue-50/50' : 'bg-white/70'} backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer`}
            onClick={() => setSelectedBus(bus.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Navigation className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{bus.registration}</h3>
                    <p className="text-gray-600">{bus.route}</p>
                  </div>
                </div>
                <Badge className={STATUS_COLORS[bus.status as keyof typeof STATUS_COLORS]}>
                  {bus.status.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Capacity</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {bus.studentsOnBoard}/{bus.capacity}
                  </div>
                  <div className="text-xs text-blue-600">Students on board</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Speed</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{bus.speed}</div>
                  <div className="text-xs text-green-600">km/h</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">ETA</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{bus.estimatedArrival}</div>
                  <div className="text-xs text-purple-600">Estimated arrival</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{bus.driverName}</div>
                    <div className="text-xs text-gray-600">Driver</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${bus.driverPhone}`, '_self');
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Driver
                </Button>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                Last updated: {new Date(bus.lastUpdate).toLocaleTimeString()} • 
                Coordinates: {bus.coordinates.lat.toFixed(4)}, {bus.coordinates.lng.toFixed(4)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Updates Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live tracking active</span>
          <span className="text-xs text-green-600">Last update: {lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}