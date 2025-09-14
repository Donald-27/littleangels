import React, { useState } from 'react';
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
  Star,
  Zap,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { BeautifulButton } from '../components/ui/beautiful-button';
import { BeautifulInput } from '../components/ui/beautiful-input';
import { BeautifulBadge } from '../components/ui/beautiful-badge';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

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
        toast.success('Login successful!');
        navigate(`/${data.user.role}`, { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'admin', email: 'kipropdonald27@gmail.com', password: 'admin123', name: 'Donald Kiprop', color: 'red' },
    { role: 'teacher', email: 'teacher1@school.com', password: 'teacher123', name: 'Sarah Mutai', color: 'blue' },
    { role: 'parent', email: 'weldonkorir305@gmail.com', password: 'parent123', name: 'Weldon Korir', color: 'green' },
    { role: 'driver', email: 'driver1@school.com', password: 'driver123', name: 'John Mwangi', color: 'yellow' }
  ];

  const handleDemoLogin = (credential) => {
    setEmail(credential.email);
    setPassword(credential.password);
  };

  if (showPasswordReset) {
    return <PasswordReset onBack={() => setShowPasswordReset(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-3">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center">
                <School className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Little Angels</h1>
                <p className="text-white/80 text-lg">Academy</p>
              </div>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-white leading-tight">
              Smart Transport Management
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                Made Beautiful
              </span>
            </p>
            <p className="text-white/80 text-lg max-w-md mx-auto lg:mx-0">
              Experience the future of school transportation with our comprehensive, 
              user-friendly management system.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center space-x-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">Real-time Tracking</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">Smart Analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">Parent Portal</span>
            </div>
            <div className="flex items-center space-x-2 text-white/90">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="text-sm">Mobile Ready</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/70 text-sm">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">25+</div>
              <div className="text-white/70 text-sm">Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">15+</div>
              <div className="text-white/70 text-sm">Routes</div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
              <p className="text-white/80">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <BeautifulInput
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
                  <BeautifulInput
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10 bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <BeautifulButton
                type="submit"
                variant="success"
                className="w-full py-3 text-lg font-semibold"
                glow
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-beautiful mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Sign In
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </div>
                )}
              </BeautifulButton>
            </form>

            {/* Password Reset Link */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowPasswordReset(true)}
                className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              >
                Forgot your password?
              </button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-8">
              <div className="text-center mb-4">
                <p className="text-white/80 text-sm">Try with demo accounts:</p>
              </div>
              <div className="space-y-2">
                {demoCredentials.map((credential) => (
                  <button
                    key={credential.role}
                    onClick={() => handleDemoLogin(credential)}
                    className="w-full p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full bg-${credential.color}-500 flex items-center justify-center`}>
                          {credential.role === 'admin' && <Shield className="h-4 w-4 text-white" />}
                          {credential.role === 'teacher' && <Users className="h-4 w-4 text-white" />}
                          {credential.role === 'parent' && <Heart className="h-4 w-4 text-white" />}
                          {credential.role === 'driver' && <Bus className="h-4 w-4 text-white" />}
                        </div>
                        <div>
                          <p className="text-white font-medium capitalize">{credential.name}</p>
                          <p className="text-white/70 text-sm">{credential.email}</p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-white/60 text-sm">
                Secure login powered by Supabase
              </p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Sparkles className="h-4 w-4 text-yellow-300" />
                <span className="text-white/80 text-sm">Beautiful UI by Little Angels Team</span>
                <Sparkles className="h-4 w-4 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 animate-bounce">
        <div className="w-4 h-4 bg-white/20 rounded-full"></div>
      </div>
      <div className="absolute top-40 right-32 animate-pulse">
        <div className="w-6 h-6 bg-white/10 rounded-full"></div>
      </div>
      <div className="absolute bottom-32 left-32 animate-bounce delay-1000">
        <div className="w-3 h-3 bg-white/30 rounded-full"></div>
      </div>
      <div className="absolute bottom-20 right-20 animate-pulse delay-500">
        <div className="w-5 h-5 bg-white/15 rounded-full"></div>
      </div>
    </div>
  );
};

export default LoginPage;
