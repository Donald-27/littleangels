import React from 'react';
import { School, Sparkles, Heart, Star } from 'lucide-react';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Animated Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center mx-auto animate-pulse">
            <School className="h-12 w-12 text-white animate-bounce" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
          <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse"></div>
        </div>

        {/* School Name */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white animate-pulse">
            Little Angels
          </h1>
          <p className="text-white/80 text-lg">
            Academy Transport System
          </p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Loading Message */}
        <div className="space-y-2">
          <p className="text-white/90 text-lg font-medium">{message}</p>
          <div className="w-64 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-white rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="flex items-center justify-center space-x-4 text-white/60">
          <Sparkles className="h-5 w-5 animate-spin" />
          <Heart className="h-5 w-5 animate-pulse" />
          <Star className="h-5 w-5 animate-bounce" />
        </div>

        {/* Footer */}
        <div className="text-white/60 text-sm">
          <p>Powered by Supabase & React</p>
          <p className="mt-1">Beautiful UI by Little Angels Team</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
