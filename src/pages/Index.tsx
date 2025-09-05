import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, Shield, Users, MapPin, Bell, QrCode, Calendar, Award } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Smart School Transport
              </h1>
              <p className="text-xs text-gray-600">Student Safety System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Shield className="w-3 h-3 mr-1" />
              Secure
            </Badge>
            <Link to="/parent">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-orange-200/50">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Live Tracking • Real-time Safety • 200+ Students Protected</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Modern School
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transport Safety
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Revolutionary student safety system with live tracking, QR boarding, and eco-friendly metrics. 
            Built for parents, admins, and drivers across 3 school branches.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/parent">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Users className="w-5 h-5 mr-2" />
                Parent Portal
              </Button>
            </Link>
            <Link to="/admin">
              <Button size="lg" variant="outline" className="border-2 border-orange-300 text-orange-700 hover:bg-orange-50 px-8 py-3 text-lg rounded-xl">
                <Shield className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Everything Parents & Schools Need
          </h2>
          <p className="text-gray-600 text-lg">Modern features designed for safety, transparency, and peace of mind</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Live Tracking */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200/50 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Live Bus Tracking</h3>
              <p className="text-sm text-gray-600 mb-3">Real-time GPS location with ETA updates using free OpenStreetMap</p>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">GPS Enabled</Badge>
            </CardContent>
          </Card>

          {/* QR System */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">QR Boarding System</h3>
              <p className="text-sm text-gray-600 mb-3">Instant check-in/out with automatic parent notifications</p>
              <Badge variant="secondary" className="bg-green-100 text-green-700">Contactless</Badge>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Smart Notifications</h3>
              <p className="text-sm text-gray-600 mb-3">Instant alerts for pickup, drop-off, and school events</p>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">Real-time</Badge>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Rewards & Eco Stats</h3>
              <p className="text-sm text-gray-600 mb-3">Attendance badges and CO₂ savings tracking</p>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">Gamified</Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10"></div>
          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-400 mb-2">200+</div>
                <div className="text-gray-300">Students Protected</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">3</div>
                <div className="text-gray-300">School Branches</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">100%</div>
                <div className="text-gray-300">Free to Run</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">24/7</div>
                <div className="text-gray-300">Live Monitoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Ready to Transform School Transport?
          </h2>
          <p className="text-gray-600 text-lg mb-8">Join the revolution in student safety and parent peace of mind</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/parent">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 px-8 py-3 rounded-xl shadow-lg">
                Start Free Trial
              </Button>
            </Link>
            <Link to="/driver">
              <Button size="lg" variant="outline" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-xl">
                Driver App
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Bus className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-800">Smart School Transport</span>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Built with ❤️ for student safety
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}