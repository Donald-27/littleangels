import React, { useState } from 'react';
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
  Bell,
  MapPin,
  Clock,
  BarChart3,
  Settings,
  MessageCircle
} from 'lucide-react';

// Import new modern components
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernStatsCard } from '../components/ui/modern-card';
import { ModernButton, ModernIconButton } from '../components/ui/modern-button';

/**
 * Modern Dashboard Selector with Teal→Violet→Coral Design System
 * Enhanced with glassmorphism, micro-interactions, and beautiful gradients
 */
const ModernDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [hoveredRole, setHoveredRole] = useState(null);

  const dashboards = [
    {
      role: 'admin',
      title: 'Admin Command Center',
      description: 'Complete system oversight and management',
      icon: Shield,
      gradient: 'violet-coral',
      features: ['Student Management', 'Staff Oversight', 'Transport Control', 'Analytics Hub', 'System Reports', 'Security Settings'],
      color: 'from-violet-500 to-orange-500',
      stats: { users: '1,247', vehicles: '24', efficiency: '98.5%' }
    },
    {
      role: 'teacher',
      title: 'Teacher Hub',
      description: 'Classroom management and student insights',
      icon: BookOpen,
      gradient: 'teal-violet',
      features: ['Student Records', 'Attendance Tracking', 'Performance Analytics', 'Parent Communication', 'Lesson Planning'],
      color: 'from-teal-500 to-violet-500',
      stats: { students: '156', attendance: '94.2%', grades: '8.7/10' }
    },
    {
      role: 'parent',
      title: 'Parent Portal',
      description: 'Your child\'s journey in real-time',
      icon: Heart,
      gradient: 'teal-coral',
      features: ['Live Bus Tracking', 'Attendance Updates', 'Academic Progress', 'Payment History', 'Safety Alerts'],
      color: 'from-teal-500 to-orange-500',
      stats: { children: '2', safety: '100%', payments: 'Current' }
    },
    {
      role: 'driver',
      title: 'Driver Dashboard',
      description: 'Route optimization and safety first',
      icon: Bus,
      gradient: 'violet',
      features: ['GPS Navigation', 'Student Manifest', 'Safety Protocols', 'Trip Reports', 'Vehicle Status'],
      color: 'from-violet-600 to-violet-400',
      stats: { routes: '3', onTime: '96.8%', safety: '5★' }
    },
    {
      role: 'accounts',
      title: 'Finance Center',
      description: 'Financial oversight and billing management',
      icon: DollarSign,
      gradient: 'coral',
      features: ['Revenue Tracking', 'Payment Processing', 'Financial Reports', 'Budget Analysis', 'Invoice Management'],
      color: 'from-orange-600 to-orange-400',
      stats: { revenue: 'KES 2.4M', payments: '99.1%', growth: '+12.5%' }
    }
  ];

  const currentDashboard = dashboards.find(d => d.role === user?.role);
  const availableDashboards = dashboards.filter(d => d.role === user?.role || user?.role === 'admin');

  const handleDashboardSelect = (role) => {
    navigate(`/${role}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-violet-50 to-orange-50">
      {/* Navigation Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 via-violet-500 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              LA
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-violet-600 to-orange-600 bg-clip-text text-transparent">
                Little Angels Academy
              </h1>
              <p className="text-gray-600">Smart School Transport & Safety System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ModernIconButton
              variant="glass-teal"
              icon={<Bell className="w-5 h-5" />}
            />
            <ModernIconButton
              variant="glass-violet"
              icon={<Settings className="w-5 h-5" />}
            />
            <ModernButton variant="outline-coral" onClick={handleSignOut}>
              Sign Out
            </ModernButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-500 via-violet-500 to-orange-500 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Your personalized dashboard is ready. Choose your role to access specialized tools and insights.
          </p>
        </div>

        {/* Quick Stats */}
        {currentDashboard && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {Object.entries(currentDashboard.stats).map(([key, value], index) => (
              <ModernStatsCard
                key={key}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
                value={value}
                gradient={['teal', 'violet', 'coral'][index % 3]}
                trend={Math.random() * 10 + 5} // Random positive trend for demo
                glow={true}
              />
            ))}
          </div>
        )}

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {availableDashboards.map((dashboard) => (
            <ModernCard
              key={dashboard.role}
              variant="glass"
              hover={true}
              glow={hoveredRole === dashboard.role}
              className="relative group cursor-pointer"
              onClick={() => handleDashboardSelect(dashboard.role)}
              onMouseEnter={() => setHoveredRole(dashboard.role)}
              onMouseLeave={() => setHoveredRole(null)}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dashboard.color} opacity-5 rounded-[20px] group-hover:opacity-10 transition-opacity duration-300`} />
              
              <ModernCardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${dashboard.color} rounded-2xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110`}>
                      <dashboard.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <ModernCardTitle gradient={true} gradientType={dashboard.gradient.split('-')[0]}>
                        {dashboard.title}
                      </ModernCardTitle>
                      <p className="text-gray-600 mt-1">{dashboard.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </ModernCardHeader>

              <ModernCardContent className="relative">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Features:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {dashboard.features.slice(0, 4).map((feature, index) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {dashboard.role === user?.role && (
                    <div className="pt-4 border-t border-gray-200/50">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-600">Your Active Dashboard</span>
                      </div>
                    </div>
                  )}
                </div>
              </ModernCardContent>
            </ModernCard>
          ))}
        </div>

        {/* Quick Actions */}
        <ModernCard variant="glass" className="p-8">
          <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernButton variant="glass-teal" className="p-6 h-auto flex-col space-y-2">
              <MapPin className="w-6 h-6" />
              <span>Track Buses</span>
            </ModernButton>
            <ModernButton variant="glass-violet" className="p-6 h-auto flex-col space-y-2">
              <BarChart3 className="w-6 h-6" />
              <span>View Reports</span>
            </ModernButton>
            <ModernButton variant="glass-coral" className="p-6 h-auto flex-col space-y-2">
              <MessageCircle className="w-6 h-6" />
              <span>Messages</span>
            </ModernButton>
            <ModernButton variant="glass" className="p-6 h-auto flex-col space-y-2">
              <Activity className="w-6 h-6" />
              <span>Live Status</span>
            </ModernButton>
          </div>
        </ModernCard>

        {/* System Status */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <ModernCard variant="glass" glow={true} className="text-center p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">System Status</h4>
            <p className="text-green-600 font-medium">All Systems Operational</p>
          </ModernCard>

          <ModernCard variant="glass" glow={true} className="text-center p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Last Updated</h4>
            <p className="text-blue-600 font-medium">Just now</p>
          </ModernCard>

          <ModernCard variant="glass" glow={true} className="text-center p-6">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-bold text-gray-800 mb-2">Performance</h4>
            <p className="text-violet-600 font-medium">Excellent (98.5%)</p>
          </ModernCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500">
        <p>✨ Powered by Modern Design System - Little Angels Academy ✨</p>
      </footer>
    </div>
  );
};

export default ModernDashboard;