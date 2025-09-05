import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Bus, MapPin, Bell, Calendar, QrCode, Leaf, Star, 
  Phone, Clock, User, Shield, Award, Home, Navigation,
  CreditCard, BookOpen, Heart, MessageCircle, Camera,
  Zap, Sparkles, Gift
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@/hooks/use-auth";
import LiveBusTracker from "@/components/LiveBusTracker";
import StudentProfile from "./_components/StudentProfile.tsx";
import NotificationsPanel from "./_components/NotificationsPanel.tsx";
import DigitalID from "./_components/DigitalID.tsx";
import EcoMetrics from "./_components/EcoMetrics.tsx";
import RewardsPanel from "./_components/RewardsPanel.tsx";

export default function ParentDashboard() {
  const { name, isLoading } = useUser({ shouldRedirect: true });
  const [activeTab, setActiveTab] = useState("home");

  // Real data for Happy Valley Chepkanga Primary School
  const studentData = {
    name: "Abigail Jepchumba Chepkemoi",
    grade: "Grade 5",
    studentId: "HV2024015",
    class: "Grade 5A",
    branch: "Happy Valley Chepkanga Primary School",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    qrCode: "HV2024015ABC",
    route: "Chepkanga - Pipeline Route",
    bus: "KBY 245C",
    driver: "John Kiplagat",
    driverPhone: "+254712345678",
    pickupTime: "07:15 AM",
    dropoffTime: "04:30 PM",
    pickupLocation: "Pipeline Estate - Stage"
  };

  const busStatus = {
    isActive: true,
    currentLocation: "Pipeline Shopping Center",
    eta: "8 minutes",
    studentsOnBoard: 28,
    nextStop: "Pipeline Estate",
    status: "en_route_to_school",
    coordinates: { lat: 0.5163, lng: 35.2717 },
    speed: 25,
    distanceToSchool: "2.3 km"
  };

  const notifications = [
    {
      id: 1,
      title: "Bus Arriving Soon! 🚌",
      message: "Abigail's bus KBY 245C will arrive at Pipeline Estate in 8 minutes",
      time: "1 min ago",
      type: "pickup",
      priority: "high",
      read: false,
      color: "text-orange-600 bg-orange-50"
    },
    {
      id: 2,
      title: "Perfect Attendance Reward! ⭐",
      message: "Abigail earned a Perfect Attendance badge for February 2025",
      time: "2 hours ago",
      type: "achievement",
      priority: "medium",
      read: false,
      color: "text-purple-600 bg-purple-50"
    },
    {
      id: 3,
      title: "Parent-Teacher Meeting 📚",
      message: "Scheduled for Feb 15th at 2:00 PM - Main Hall",
      time: "3 hours ago",
      type: "announcement",
      priority: "medium", 
      read: true,
      color: "text-blue-600 bg-blue-50"
    }
  ];

  const ecoStats = {
    monthlyTrips: 42,
    co2Saved: 15.8,
    fuelSaved: 6.2,
    treesEquivalent: 3,
    rank: 15
  };

  const rewards = [
    {
      id: 1,
      title: "Perfect Attendance",
      description: "30 consecutive school days",
      points: 50,
      color: "from-yellow-400 to-orange-500",
      icon: "⭐",
      earned: true,
      date: "Jan 2024"
    },
    {
      id: 2,
      title: "Eco Champion",
      description: "Top 20 in CO₂ savings",
      points: 35,
      color: "from-green-400 to-emerald-500",
      icon: "🌱",
      earned: true,
      date: "Jan 2024"
    },
    {
      id: 3,
      title: "Safety Star",
      description: "Always wears seatbelt",
      points: 25,
      color: "from-blue-400 to-cyan-500",
      icon: "🛡️",
      earned: false,
      progress: 80
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 animate-pulse mx-auto">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <p className="text-lg font-medium text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-purple-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Parent Portal
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {name || "Parent"}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="outline" size="sm" className="relative bg-white/50 border-purple-200 hover:bg-purple-50">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                    2
                  </span>
                </Button>
              </div>
              <Avatar className="w-10 h-10 border-2 border-purple-200">
                <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700 font-semibold">
                  {name?.charAt(0) || "P"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-2 bg-white/60 backdrop-blur-sm p-2 rounded-2xl border border-purple-200/50">
          {[
            { id: "home", label: "Home", icon: Home, color: "from-purple-500 to-pink-500" },
            { id: "tracking", label: "Live Tracking", icon: Navigation, color: "from-blue-500 to-cyan-500" },
            { id: "student", label: "Student Profile", icon: User, color: "from-green-500 to-emerald-500" },
            { id: "notifications", label: "Notifications", icon: Bell, color: "from-orange-500 to-red-500" },
            { id: "rewards", label: "Rewards", icon: Award, color: "from-yellow-500 to-orange-500" },
            { id: "digital-id", label: "Digital ID", icon: QrCode, color: "from-indigo-500 to-purple-500" }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg hover:shadow-xl`
                    : "text-gray-700 hover:bg-white/50"
                } transition-all duration-300`}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-8">
        {activeTab === "home" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Student Quick Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Student Card */}
              <Card className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-purple-200/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        AJ
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800">{studentData.name}</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {studentData.grade}
                        </Badge>
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          {studentData.studentId}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                          ✓ Active Transport
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Class</p>
                          <p className="font-semibold text-gray-800">{studentData.class}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Branch</p>
                          <p className="font-semibold text-gray-800">{studentData.branch}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Bus className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Bus & Route</p>
                          <p className="font-semibold text-gray-800">{studentData.bus} - {studentData.route}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Driver</p>
                          <p className="font-semibold text-gray-800">{studentData.driver}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Bus Status */}
              <Card className="bg-gradient-to-br from-blue-50 via-cyan-50/50 to-teal-50/50 border-blue-200/50 shadow-xl overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3 text-blue-800">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <Navigation className="w-5 h-5 text-white" />
                      </div>
                      <span>Live Bus Tracking</span>
                    </CardTitle>
                    <Badge className={`${
                      busStatus.isActive 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse" 
                        : "bg-gray-400"
                    } text-white`}>
                      {busStatus.isActive ? "🟢 LIVE" : "🔴 OFFLINE"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/60 rounded-xl border border-blue-200/50">
                      <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Current Location</p>
                      <p className="font-bold text-blue-800">{busStatus.currentLocation}</p>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl border border-cyan-200/50">
                      <Clock className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">ETA to Pickup</p>
                      <p className="font-bold text-cyan-800">{busStatus.eta}</p>
                    </div>
                    <div className="text-center p-3 bg-white/60 rounded-xl border border-teal-200/50">
                      <User className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Students On Board</p>
                      <p className="font-bold text-teal-800">{busStatus.studentsOnBoard}/32</p>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg">
                    <Navigation className="w-4 h-4 mr-2" />
                    View Full Map
                  </Button>
                </CardContent>
              </Card>

              {/* Schedule & Times */}
              <Card className="bg-gradient-to-br from-orange-50 via-amber-50/50 to-yellow-50/50 border-orange-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-orange-800">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span>Today's Schedule</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/60 rounded-xl border border-orange-200/50">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">↑</span>
                        </div>
                        <div>
                          <p className="font-semibold text-orange-800">Morning Pickup</p>
                          <p className="text-sm text-gray-600">{studentData.pickupLocation}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{studentData.pickupTime}</p>
                    </div>
                    
                    <div className="p-4 bg-white/60 rounded-xl border border-orange-200/50">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">↓</span>
                        </div>
                        <div>
                          <p className="font-semibold text-orange-800">Evening Dropoff</p>
                          <p className="text-sm text-gray-600">{studentData.pickupLocation}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-red-600">{studentData.dropoffTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/50 border-green-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-green-800">
                    <Zap className="w-5 h-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white justify-start">
                    <QrCode className="w-4 h-4 mr-2" />
                    Show Digital ID
                  </Button>
                  <Button variant="outline" className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50 justify-start">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Driver
                  </Button>
                  <Button variant="outline" className="w-full border-2 border-green-300 text-green-700 hover:bg-green-50 justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full border-2 border-orange-300 text-orange-700 hover:bg-orange-50 justify-start">
                    <Camera className="w-4 h-4 mr-2" />
                    Report Issue
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Notifications */}
              <Card className="bg-gradient-to-br from-purple-50 via-pink-50/50 to-rose-50/50 border-purple-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-purple-800">
                    <Bell className="w-5 h-5" />
                    <span>Recent Updates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg border ${notification.color} ${!notification.read ? 'border-2' : 'border'}`}>
                      <div className="flex items-start space-x-2">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-current animate-pulse' : 'bg-gray-400'}`}></div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          <p className="text-xs opacity-80 mt-1">{notification.message}</p>
                          <p className="text-xs opacity-60 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full text-purple-700 border-purple-300 hover:bg-purple-50">
                    View All Notifications
                  </Button>
                </CardContent>
              </Card>

              {/* Eco Stats */}
              <Card className="bg-gradient-to-br from-green-50 via-emerald-50/50 to-teal-50/50 border-green-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-green-800">
                    <Leaf className="w-5 h-5" />
                    <span>Eco Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-green-600 mb-1">{ecoStats.co2Saved} kg</div>
                    <p className="text-sm text-gray-600">CO₂ Saved This Month</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-lg font-bold text-emerald-600">{ecoStats.monthlyTrips}</div>
                      <p className="text-xs text-gray-600">Bus Trips</p>
                    </div>
                    <div className="text-center p-2 bg-white/60 rounded-lg">
                      <div className="text-lg font-bold text-teal-600">{ecoStats.treesEquivalent}</div>
                      <p className="text-xs text-gray-600">Trees Saved</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-100 rounded-lg">
                    <span className="text-sm font-semibold text-green-800">School Rank</span>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      #{ecoStats.rank}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Achievements Preview */}
              <Card className="bg-gradient-to-br from-yellow-50 via-orange-50/50 to-red-50/50 border-yellow-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-yellow-800">
                    <Award className="w-5 h-5" />
                    <span>Latest Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rewards.filter(r => r.earned).slice(0, 2).map((reward) => (
                    <div key={reward.id} className={`p-3 bg-gradient-to-r ${reward.color} rounded-lg text-white`}>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{reward.icon}</span>
                        <div>
                          <p className="font-semibold">{reward.title}</p>
                          <p className="text-sm opacity-90">{reward.points} points • {reward.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full text-yellow-700 border-yellow-300 hover:bg-yellow-50">
                    <Gift className="w-4 h-4 mr-2" />
                    View All Rewards
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "tracking" && <LiveBusTracker />}
        {activeTab === "student" && <StudentProfile />}
        {activeTab === "notifications" && <NotificationsPanel />}
        {activeTab === "rewards" && <RewardsPanel />}
        {activeTab === "digital-id" && <DigitalID />}
      </div>
    </div>
  );
}