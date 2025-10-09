import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PasswordReset from '../components/PasswordReset';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  School, 
  Users, 
  Bus, 
  Shield, 
  Heart,
  ArrowRight,
  Sparkles,
  Orbit,
  Rocket,
  Satellite,
  SatelliteDish,
  MapPin,
  Clock,
  Bell,
  BarChart3,
  Smartphone,
  ShieldCheck,
  Zap,
  Cloud,
  Cpu,
  Wifi,
  Navigation
} from 'lucide-react';
import { BeautifulButton } from '../components/ui/beautiful-button';
import { BeautifulInput } from '../components/ui/beautiful-input';
import { toast } from 'sonner';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [particles, setParticles] = useState([]);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Particle animation for background
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          speed: Math.random() * 2 + 0.5,
          color: `hsl(${Math.random() * 60 + 200}, 70%, 60%)`
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  // Feature carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message || 'Login failed');
        return;
      }

      if (data?.user) {
        toast.success('Welcome back! 🎉');
        // Add login analytics
        logLoginAttempt(data.user.id, 'success');
        navigate(`/${data.user.role}`, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
      logLoginAttempt('unknown', 'error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const logLoginAttempt = (userId, status, error = '') => {
    // In a real app, send this to your analytics service
    console.log('Login attempt:', { userId, status, error, timestamp: new Date().toISOString() });
  };

  const demoCredentials = [
    { 
      role: 'admin', 
      email: 'admin@littleangels.com', 
      password: 'admin123', 
      name: 'System Administrator',
      description: 'Full system access and management',
      permissions: ['All Features', 'User Management', 'Analytics'],
      color: 'from-red-500 to-orange-500',
      icon: Shield
    },
    { 
      role: 'teacher', 
      email: 'teacher@littleangels.com', 
      password: 'teacher123', 
      name: 'Sarah Johnson',
      description: 'Class management and student tracking',
      permissions: ['Student Lists', 'Attendance', 'Reports'],
      color: 'from-blue-500 to-cyan-500',
      icon: Users
    },
    { 
      role: 'parent', 
      email: 'parent@littleangels.com', 
      password: 'parent123', 
      name: 'Michael Chen',
      description: 'Real-time child tracking and communication',
      permissions: ['Live Tracking', 'Notifications', 'Messages'],
      color: 'from-green-500 to-emerald-500',
      icon: Heart
    },
    { 
      role: 'driver', 
      email: 'driver@littleangels.com', 
      password: 'driver123', 
      name: 'David Rodriguez',
      description: 'Route optimization and student management',
      permissions: ['GPS Navigation', 'Student Roster', 'Route Planning'],
      color: 'from-yellow-500 to-amber-500',
      icon: Bus
    }
  ];

  const features = [
    {
      icon: Navigation,
      title: 'Real-Time GPS Tracking',
      description: 'Live vehicle tracking with 30-second updates',
      stats: '99.9% Uptime'
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Instant alerts for arrivals, delays, and emergencies',
      stats: '2s Delivery Time'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive reports and performance insights',
      stats: '15+ Metrics'
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security',
      description: 'Military-grade encryption and compliance',
      stats: 'SOC 2 Certified'
    }
  ];

  const systemStats = [
    { label: 'Active Students', value: '547', change: '+12%' },
    { label: 'Vehicles Online', value: '23', change: '+2' },
    { label: 'Routes Active', value: '18', change: '100%' },
    { label: 'Response Time', value: '<2s', change: '-0.3s' }
  ];

  const handleDemoLogin = async (credential) => {
    setEmail(credential.email);
    setPassword(credential.password);
    
    // Auto-submit after a brief delay
    setTimeout(() => {
      document.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 500);
  };

  const FeatureCard = ({ feature, isActive }) => (
    <div className={`feature-card ${isActive ? 'active' : ''}`}>
      <div className="feature-icon">
        <feature.icon size={24} />
      </div>
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
      <span className="feature-stats">{feature.stats}</span>
    </div>
  );

  if (showPasswordReset) {
    return <PasswordReset onBack={() => setShowPasswordReset(false)} />;
  }

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="animated-background">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDuration: `${particle.speed}s`
            }}
          />
        ))}
        <div className="floating-orbits">
          <div className="orbit orbit-1"></div>
          <div className="orbit orbit-2"></div>
          <div className="orbit orbit-3"></div>
        </div>
      </div>

      <div className="login-content">
        {/* Left Side - Enhanced Branding & Features */}
        <div className="brand-section">
          <div className="brand-header">
            <div className="logo-container">
              <div className="logo-orbital">
                <School className="logo-icon" />
                <div className="orbit-ring"></div>
                <div className="satellite">
                  <Satellite size={12} />
                </div>
              </div>
              <div className="brand-text">
                <h1>Little Angels</h1>
                <p>Smart Academy</p>
              </div>
            </div>
            
            <div className="main-headline">
              <h2>
                Intelligent Transport
                <span className="gradient-text"> Ecosystem</span>
              </h2>
              <p>Next-generation school transportation management powered by AI and real-time analytics</p>
            </div>
          </div>

          {/* Feature Carousel */}
          <div className="features-carousel">
            <div className="carousel-container">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index} 
                  feature={feature} 
                  isActive={index === activeFeature}
                />
              ))}
            </div>
            <div className="carousel-indicators">
              {features.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === activeFeature ? 'active' : ''}`}
                  onClick={() => setActiveFeature(index)}
                />
              ))}
            </div>
          </div>

          {/* System Stats */}
          <div className="system-stats">
            <h3>Live System Status</h3>
            <div className="stats-grid">
              {systemStats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                  <div className="stat-change positive">{stat.change}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Badges */}
          <div className="security-badges">
            <div className="badge">
              <ShieldCheck size={16} />
              <span>GDPR Compliant</span>
            </div>
            <div className="badge">
              <Cloud size={16} />
              <span>AWS Secure</span>
            </div>
            <div className="badge">
              <Wifi size={16} />
              <span>256-bit SSL</span>
            </div>
          </div>
        </div>

        {/* Right Side - Enhanced Login Form */}
        <div className="form-section">
          <div className="login-card">
            {/* Card Header */}
            <div className="card-header">
              <div className="header-content">
                <h3>Welcome Back! 👋</h3>
                <p>Sign in to your dashboard</p>
              </div>
              <div className="connection-status">
                <div className="status-dot connected"></div>
                <span>System Online</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {/* Email Field */}
              <div className="input-group">
                <label className="input-label">
                  <Mail size={16} />
                  Email Address
                </label>
                <BeautifulInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your institutional email"
                  className="modern-input"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label className="input-label">
                  <Lock size={16} />
                  Password
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </label>
                <BeautifulInput
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secure password"
                  className="modern-input"
                  required
                />
                <div className="password-strength">
                  <div className="strength-bar"></div>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember this device
                </label>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="forgot-password"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <BeautifulButton
                type="submit"
                variant="gradient"
                className="login-button"
                glow
                disabled={loading}
              >
                {loading ? (
                  <div className="button-loading">
                    <div className="loading-spinner"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <div className="button-content">
                    <span>Access Dashboard</span>
                    <ArrowRight size={18} />
                  </div>
                )}
              </BeautifulButton>
            </form>

            {/* Demo Accounts Section */}
            <div className="demo-section">
              <div className="demo-header">
                <span>Quick Access Demo</span>
                <div className="demo-badge">Test Accounts</div>
              </div>
              
              <div className="demo-grid">
                {demoCredentials.map((credential, index) => {
                  const IconComponent = credential.icon;
                  return (
                    <button
                      key={credential.role}
                      onClick={() => handleDemoLogin(credential)}
                      className="demo-card"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="demo-card-header">
                        <div className={`icon-container ${credential.color}`}>
                          <IconComponent size={16} />
                        </div>
                        <div className="demo-info">
                          <span className="demo-name">{credential.name}</span>
                          <span className="demo-role">{credential.role}</span>
                        </div>
                        <div className="demo-arrow">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                      <p className="demo-description">{credential.description}</p>
                      <div className="demo-permissions">
                        {credential.permissions.map((perm, idx) => (
                          <span key={idx} className="permission-tag">{perm}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer">
              <div className="footer-content">
                <div className="tech-stack">
                  <span>Powered by:</span>
                  <div className="stack-items">
                    <span>React</span>
                    <span>Supabase</span>
                    <span>WebSockets</span>
                    <span>AI/ML</span>
                  </div>
                </div>
                <div className="copyright">
                  <Sparkles size={14} />
                  <span>© 2024 Little Angels Academy. Secure Access System</span>
                  <Sparkles size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="floating-help">
        <span>?</span>
        <div className="help-tooltip">Need help? Contact support</div>
      </button>
    </div>
  );
};

export default LoginPage;