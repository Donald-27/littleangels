import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Bus, 
  BookOpen, 
  Shield, 
  DollarSign,
  Heart,
  Star,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Activity,
  Bell
} from 'lucide-react';
import { BeautifulCard, BeautifulCardHeader, BeautifulCardTitle, BeautifulCardContent } from '../components/ui/beautiful-card';
import { BeautifulButton } from '../components/ui/beautiful-button';
import { BeautifulBadge } from '../components/ui/beautiful-badge';

const DashboardSelector = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboards = [
    {
      role: 'admin',
      title: 'Admin Dashboard',
      description: 'Complete system management and oversight',
      icon: Shield,
      gradient: 'danger',
      features: ['Student Management', 'Staff Management', 'Transport Control', 'Analytics', 'Reports', 'Settings'],
      color: 'red',
      glow: true
    },
    {
      role: 'teacher',
      title: 'Teacher Dashboard',
      description: 'Class management and student tracking',
      icon: BookOpen,
      gradient: 'blue',
      features: ['Student Records', 'Attendance Tracking', 'Grade Management', 'Parent Communication'],
      color: 'blue'
    },
    {
      role: 'parent',
      title: 'Parent Portal',
      description: 'Track your child\'s journey and activities',
      icon: Heart,
      gradient: 'success',
      features: ['Child Tracking', 'Attendance View', 'Transport Info', 'Notifications'],
      color: 'green'
    },
    {
      role: 'driver',
      title: 'Driver Dashboard',
      description: 'Route management and student transport',
      icon: Bus,
      gradient: 'warning',
      features: ['Route Navigation', 'Student Pickup', 'Trip Management', 'Vehicle Status'],
      color: 'yellow'
    },
    {
      role: 'accounts',
      title: 'Accounts Dashboard',
      description: 'Financial management and billing',
      icon: DollarSign,
      gradient: 'purple',
      features: ['Payment Tracking', 'Financial Reports', 'Billing Management', 'Revenue Analytics'],
      color: 'purple'
    }
  ];

  const currentDashboard = dashboards.find(d => d.role === user?.role);

  const handleDashboardSelect = (role) => {
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Little Angels Academy</h1>
                  <p className="text-white/80">Transport Management System</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <BeautifulBadge variant="success" className="text-sm">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {user?.role?.toUpperCase()}
                </BeautifulBadge>
                <div className="text-right">
                  <p className="text-white font-medium">{user?.name}</p>
                  <p className="text-white/70 text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome to Your Dashboard
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
              Choose Your Role
            </span>
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Select the appropriate dashboard based on your role to access the features and tools you need.
          </p>
        </div>

        {/* Current Role Highlight */}
        {currentDashboard && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Your Current Role</h3>
            <div className="max-w-4xl mx-auto">
              <BeautifulCard gradient={currentDashboard.gradient} glow={currentDashboard.glow} className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      <currentDashboard.icon className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">{currentDashboard.title}</h4>
                      <p className="text-white/80 text-lg mb-4">{currentDashboard.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {currentDashboard.features.map((feature, index) => (
                          <BeautifulBadge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </BeautifulBadge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <BeautifulButton
                    onClick={() => handleDashboardSelect(currentDashboard.role)}
                    variant="success"
                    size="lg"
                    glow
                  >
                    Access Dashboard
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </BeautifulButton>
                </div>
              </BeautifulCard>
            </div>
          </div>
        )}

        {/* All Dashboards */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Available Dashboards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dashboards.map((dashboard) => (
              <BeautifulCard
                key={dashboard.role}
                gradient={dashboard.gradient}
                glow={dashboard.glow}
                className="p-6 cursor-pointer hover:scale-105 transition-all duration-300"
                onClick={() => handleDashboardSelect(dashboard.role)}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                    <dashboard.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{dashboard.title}</h4>
                  <p className="text-white/80 mb-4">{dashboard.description}</p>
                  
                  <div className="space-y-2 mb-6">
                    {dashboard.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center text-white/90 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-300 mr-2" />
                        {feature}
                      </div>
                    ))}
                    {dashboard.features.length > 3 && (
                      <div className="text-white/70 text-sm">
                        +{dashboard.features.length - 3} more features
                      </div>
                    )}
                  </div>

                  <BeautifulButton
                    variant={dashboard.role === user?.role ? 'success' : 'ghost'}
                    className="w-full"
                  >
                    {dashboard.role === user?.role ? 'Current Role' : 'Access Dashboard'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </BeautifulButton>
                </div>
              </BeautifulCard>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-white/80">Students</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Bus className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">25+</div>
            <div className="text-white/80">Vehicles</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">98%</div>
            <div className="text-white/80">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <div className="text-white/80">Monitoring</div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Why Choose Our System?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Lightning Fast</h4>
              <p className="text-white/80">Real-time updates and instant notifications for all stakeholders.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Secure & Reliable</h4>
              <p className="text-white/80">Enterprise-grade security with 99.9% uptime guarantee.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Beautiful Design</h4>
              <p className="text-white/80">Intuitive interface designed for the best user experience.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-5 w-5 text-yellow-300" />
            <span className="text-white/80">Powered by Supabase & React</span>
            <Sparkles className="h-5 w-5 text-yellow-300" />
          </div>
          <p className="text-white/60 text-sm">
            © 2024 Little Angels Academy. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector;