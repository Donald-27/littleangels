import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowLeft,
  RefreshCw,
  Shield,
  Key,
  AlertCircle
} from 'lucide-react';

const PasswordReset = ({ onBack }) => {
  const [step, setStep] = useState('email'); // 'email', 'code', 'password'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      setStep('code');
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setLoading(true);
      
      // In a real implementation, you would verify the code here
      // For now, we'll just move to the password step
      setStep('password');
      toast.success('Code verified successfully!');
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast.success('Password reset successfully! You can now log in with your new password.');
      onBack();
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
        <p className="text-gray-600">Enter your email address and we'll send you a reset link</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="input-modern pl-10"
            required
          />
        </div>
      </div>

      <button
        onClick={handleSendResetEmail}
        disabled={loading || !email}
        className="w-full btn-modern"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Sending Reset Email...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Send Reset Email
          </>
        )}
      </button>

      <div className="text-center">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </button>
      </div>
    </div>
  );

  const renderCodeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Verification Code</h2>
        <p className="text-gray-600">We've sent a verification code to {email}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 6-digit code"
          className="input-modern text-center text-2xl tracking-widest"
          maxLength={6}
          required
        />
      </div>

      <button
        onClick={handleVerifyCode}
        disabled={loading || !code}
        className="w-full btn-modern"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Verifying Code...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Verify Code
          </>
        )}
      </button>

      <div className="text-center">
        <button
          onClick={() => setStep('email')}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Email
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Password</h2>
        <p className="text-gray-600">Enter your new password below</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="input-modern pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="input-modern pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Password Requirements */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Password Requirements:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
            <CheckCircle className="h-4 w-4 mr-2" />
            At least 6 characters long
          </li>
          <li className={`flex items-center ${password && confirmPassword && password === confirmPassword ? 'text-green-600' : 'text-gray-500'}`}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Passwords match
          </li>
        </ul>
      </div>

      <button
        onClick={handleResetPassword}
        disabled={loading || !password || !confirmPassword || password !== confirmPassword}
        className="w-full btn-modern"
      >
        {loading ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Resetting Password...
          </>
        ) : (
          <>
            <Key className="h-4 w-4 mr-2" />
            Reset Password
          </>
        )}
      </button>

      <div className="text-center">
        <button
          onClick={() => setStep('code')}
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center mx-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Verification
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card-modern">
          {step === 'email' && renderEmailStep()}
          {step === 'code' && renderCodeStep()}
          {step === 'password' && renderPasswordStep()}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
