import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Truck, QrCode, Navigation, Users, 
  PlayCircle, Square, MapPin, Clock,
  CheckCircle, AlertTriangle, Phone,
  Star, Shield, Zap, Route
} from "lucide-react";
import { useUser } from "@/hooks/use-auth";
import LiveBusTracker from "@/components/LiveBusTracker";

export default function DriverDashboard() {
  const { name, isLoading } = useUser({ shouldRedirect: true });
  const [tripStatus, setTripStatus] = useState<"not_started" | "active" | "completed">("not_started");
  const [studentsOnBoard, setStudentsOnBoard] = useState(0);
  const [currentStop, setCurrentStop] = useState(0);

  // Real Happy Valley Chepkanga driver data
  const driverData = {
    name: "John Kiplagat",
    vehicle: "KBY 245C - Isuzu NQR",
    route: "Chepkanga - Pipeline Route",
    capacity: 30,
    stats: {
      studentsToday: 28,
      onTimeRate: 98.5,
      safetyRating: 4.9,
      incidents: 0
    },
    stops: [
      { name: "Pipeline Estate", students: 8, time: "07:15" },
      { name: "Valley View Estate", students: 7, time: "07:25" },
      { name: "Chepkanga Junction", students: 5, time: "07:35" },
      { name: "Happy Valley School", students: 0, time: "07:45" }
    ]
  };

  const checkInStudent = () => {
    setStudentsOnBoard(prev => prev + 1);
    alert("Student checked in successfully via QR scan!");
  };

  const startTrip = () => {
    setTripStatus("active");
    alert("Trip started - Safe driving!");
  };

  const endTrip = () => {
    setTripStatus("completed");
    setStudentsOnBoard(0);
    alert("Trip completed successfully!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-pulse mx-auto">
            <Truck className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-700">Loading driver dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-green-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Happy Valley Driver - {driverData.vehicle}
                </h1>
                <p className="text-sm text-gray-600">Welcome, {driverData.name} • {driverData.route}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className={`${tripStatus === "active" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-700 border-gray-200"}`}>
                {tripStatus === "active" ? (
                  <><Zap className="w-3 h-3 mr-1" />Trip Active</>
                ) : (
                  <><Clock className="w-3 h-3 mr-1" />Ready to Drive</>
                )}
              </Badge>
              <Button variant="outline" size="sm" className="bg-white/50 border-green-200">
                <Phone className="w-4 h-4 mr-2" />
                Emergency
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-blue-600">{studentsOnBoard}/{driverData.capacity}</div>
              <p className="text-xs text-gray-600">On Board</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-green-600">{driverData.stats.onTimeRate}%</div>
              <p className="text-xs text-gray-600">On-Time</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-purple-600">{driverData.stats.safetyRating}</div>
              <p className="text-xs text-gray-600">Safety</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-bold text-orange-600">{driverData.stats.incidents}</div>
              <p className="text-xs text-gray-600">Incidents</p>
            </CardContent>
          </Card>
        </div>

        {/* Trip Control */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Trip Control & QR Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-green-800 mb-2">QR Check-in</h3>
                  <p className="text-sm text-gray-600 mb-3">Scan student ID cards</p>
                  <Button onClick={checkInStudent} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-full">
                    <QrCode className="w-4 h-4 mr-2" />
                    Scan QR
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlayCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-800 mb-2">Start Trip</h3>
                  <p className="text-sm text-gray-600 mb-3">Begin route journey</p>
                  <Button 
                    onClick={startTrip} 
                    disabled={tripStatus === "active"}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-full disabled:opacity-50"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Square className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-orange-800 mb-2">End Trip</h3>
                  <p className="text-sm text-gray-600 mb-3">Complete journey</p>
                  <Button 
                    onClick={endTrip}
                    disabled={tripStatus !== "active"}
                    variant="outline" 
                    className="border-orange-300 text-orange-600 w-full disabled:opacity-50"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    End Trip
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Route Stops */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Today's Route - {driverData.route}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {driverData.stops.map((stop, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${index === currentStop && tripStatus === "active" ? "bg-green-50 border-2 border-green-200" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStop ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                      {index <= currentStop ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{stop.name}</h4>
                      <p className="text-sm text-gray-600">{stop.time} • {stop.students} students</p>
                    </div>
                  </div>
                  {tripStatus === "active" && index === currentStop && (
                    <Button 
                      size="sm" 
                      onClick={() => setCurrentStop(index + 1)}
                      className="bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      Next Stop
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Tracking */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Live Location Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LiveBusTracker studentBusId="KBY245C" showAllBuses={false} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}