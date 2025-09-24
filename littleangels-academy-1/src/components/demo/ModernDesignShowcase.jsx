import React, { useState } from 'react';
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent, ModernStatsCard } from '../ui/modern-card';
import { ModernButton, ModernIconButton, ModernButtonGroup } from '../ui/modern-button';

/**
 * Demo Component showcasing the new Teal→Violet→Coral Design System
 * Features glassmorphism, gradients, micro-interactions, and enhanced UI elements
 */
const ModernDesignShowcase = () => {
  const [activeTab, setActiveTab] = useState('cards');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-violet-50 to-orange-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-500 via-violet-500 to-orange-500 bg-clip-text text-transparent">
            Little Angels Academy
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Modern Teal→Violet→Coral Design System with Enhanced Glassmorphism & Micro-interactions
          </p>
          
          {/* Tab Navigation */}
          <ModernButtonGroup className="mt-6">
            <ModernButton 
              variant={activeTab === 'cards' ? 'primary' : 'glass'}
              onClick={() => setActiveTab('cards')}
            >
              Cards & Stats
            </ModernButton>
            <ModernButton 
              variant={activeTab === 'buttons' ? 'primary' : 'glass'}
              onClick={() => setActiveTab('buttons')}
            >
              Buttons & Interactions
            </ModernButton>
            <ModernButton 
              variant={activeTab === 'gradients' ? 'primary' : 'glass'}
              onClick={() => setActiveTab('gradients')}
            >
              Gradients & Effects
            </ModernButton>
          </ModernButtonGroup>
        </div>

        {/* Cards & Stats Tab */}
        {activeTab === 'cards' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
              Enhanced Glassmorphism Cards
            </h2>
            
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ModernStatsCard
                title="Total Students"
                value="1,247"
                subtitle="Active this semester"
                trend={12.5}
                gradient="teal"
                icon="👥"
              />
              <ModernStatsCard
                title="Bus Routes"
                value="24"
                subtitle="Covering 5 districts"
                trend={8.2}
                gradient="violet"
                icon="🚌"
              />
              <ModernStatsCard
                title="Safety Score"
                value="98.5%"
                subtitle="This month"
                trend={2.1}
                gradient="coral"
                icon="🛡️"
              />
              <ModernStatsCard
                title="Parent Satisfaction"
                value="4.9/5"
                subtitle="Latest survey"
                trend={5.3}
                gradient="primary"
                icon="⭐"
              />
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ModernCard variant="glass" hover={true} glow={true}>
                <ModernCardHeader gradient={true}>
                  <ModernCardTitle gradient={true} gradientType="teal">
                    Real-time GPS Tracking
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Track your child's bus in real-time with precision GPS monitoring and ETA calculations.
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-600 font-medium">Live Tracking Active</span>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="glass" hover={true} glow={true}>
                <ModernCardHeader gradient={true}>
                  <ModernCardTitle gradient={true} gradientType="violet">
                    QR Code Safety System
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Secure QR code scanning for student boarding with offline sync capabilities.
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-violet-600 rounded flex items-center justify-center text-white text-xs font-bold">
                        QR
                      </div>
                      <span className="text-sm text-violet-600 font-medium">Scan to Board</span>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>

              <ModernCard variant="glass" hover={true} glow={true}>
                <ModernCardHeader gradient={true}>
                  <ModernCardTitle gradient={true} gradientType="coral">
                    M-Pesa Integration
                  </ModernCardTitle>
                </ModernCardHeader>
                <ModernCardContent>
                  <div className="space-y-3">
                    <p className="text-gray-600">
                      Seamless mobile payments for transport fees with instant receipt generation.
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl">💳</div>
                      <span className="text-sm text-orange-600 font-medium">KES 3,500/month</span>
                    </div>
                  </div>
                </ModernCardContent>
              </ModernCard>
            </div>
          </div>
        )}

        {/* Buttons & Interactions Tab */}
        {activeTab === 'buttons' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-violet-600 to-orange-600 bg-clip-text text-transparent">
              Interactive Button Components
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gradient Buttons */}
              <ModernCard variant="glass" className="p-8">
                <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
                  Gradient Buttons
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <ModernButton variant="primary" shimmer={true}>
                      Primary Action
                    </ModernButton>
                    <ModernButton variant="teal" shimmer={true}>
                      Teal Variant
                    </ModernButton>
                    <ModernButton variant="violet" shimmer={true}>
                      Violet Variant
                    </ModernButton>
                    <ModernButton variant="coral" shimmer={true}>
                      Coral Variant
                    </ModernButton>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <ModernButton variant="primary" size="sm">
                      Small
                    </ModernButton>
                    <ModernButton variant="violet" size="default">
                      Default
                    </ModernButton>
                    <ModernButton variant="teal" size="lg">
                      Large
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>

              {/* Glass Buttons */}
              <ModernCard variant="glass" className="p-8">
                <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-violet-600 to-orange-600 bg-clip-text text-transparent">
                  Glassmorphism Buttons
                </h3>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <ModernButton variant="glass">
                      Glass Default
                    </ModernButton>
                    <ModernButton variant="glass-teal">
                      Glass Teal
                    </ModernButton>
                    <ModernButton variant="glass-violet">
                      Glass Violet
                    </ModernButton>
                    <ModernButton variant="glass-coral">
                      Glass Coral
                    </ModernButton>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <ModernButton variant="outline-teal">
                      Outline Teal
                    </ModernButton>
                    <ModernButton variant="outline-violet">
                      Outline Violet
                    </ModernButton>
                    <ModernButton variant="outline-coral">
                      Outline Coral
                    </ModernButton>
                  </div>
                </div>
              </ModernCard>
            </div>

            {/* Button States */}
            <ModernCard variant="glass" className="p-8">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                Button States & Loading
              </h3>
              <div className="flex flex-wrap gap-4">
                <ModernButton variant="primary" loading={true}>
                  Loading Button
                </ModernButton>
                <ModernButton variant="teal" disabled>
                  Disabled Button
                </ModernButton>
                <ModernButton variant="destructive">
                  Destructive Action
                </ModernButton>
                <ModernIconButton 
                  variant="glass-violet"
                  icon={<span className="text-lg">🚌</span>}
                />
                <ModernIconButton 
                  variant="glass-coral"
                  icon={<span className="text-lg">📍</span>}
                />
              </div>
            </ModernCard>
          </div>
        )}

        {/* Gradients & Effects Tab */}
        {activeTab === 'gradients' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-teal-600 via-violet-600 to-orange-600 bg-clip-text text-transparent">
              Gradient Backgrounds & Effects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Primary Gradient */}
              <ModernCard variant="gradient" gradient="primary" className="text-white p-8">
                <h3 className="text-xl font-bold mb-4">Primary Gradient</h3>
                <p className="opacity-90">Teal → Violet → Coral</p>
                <div className="mt-4 text-sm opacity-75">
                  Perfect for primary actions and hero sections
                </div>
              </ModernCard>

              {/* Teal-Violet */}
              <ModernCard variant="gradient" gradient="teal-violet" className="text-white p-8">
                <h3 className="text-xl font-bold mb-4">Teal-Violet</h3>
                <p className="opacity-90">Cool & Professional</p>
                <div className="mt-4 text-sm opacity-75">
                  Great for admin interfaces and data
                </div>
              </ModernCard>

              {/* Violet-Coral */}
              <ModernCard variant="gradient" gradient="violet-coral" className="text-white p-8">
                <h3 className="text-xl font-bold mb-4">Violet-Coral</h3>
                <p className="opacity-90">Warm & Energetic</p>
                <div className="mt-4 text-sm opacity-75">
                  Perfect for parent-facing features
                </div>
              </ModernCard>

              {/* Individual Colors */}
              <ModernCard variant="gradient" gradient="teal" className="text-white p-8">
                <h3 className="text-xl font-bold mb-4">Pure Teal</h3>
                <p className="opacity-90">Trustworthy & Stable</p>
                <div className="mt-4 text-sm opacity-75">
                  Financial and safety features
                </div>
              </ModernCard>

              <ModernCard variant="gradient" gradient="violet" className="text-white p-8">
                <h3 className="text-xl font-bold mb-4">Pure Violet</h3>
                <p className="opacity-90">Creative & Modern</p>
                <div className="mt-4 text-sm opacity-75">
                  Technology and innovation
                </div>
              </ModernCard>

              <ModernCard variant="gradient" gradient="coral" className="text-white p-8">
                <h3 className="text-xl font-bold mb-4">Pure Coral</h3>
                <p className="opacity-90">Friendly & Approachable</p>
                <div className="mt-4 text-sm opacity-75">
                  Notifications and alerts
                </div>
              </ModernCard>
            </div>

            {/* Animation Demo */}
            <ModernCard variant="glass" className="p-8">
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
                Micro-interactions & Animations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl hover:scale-110 transition-transform duration-300 cursor-pointer">
                    🚌
                  </div>
                  <p className="text-sm text-gray-600">Hover to Scale</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-400 to-violet-600 rounded-2xl flex items-center justify-center text-white text-2xl animate-pulse cursor-pointer">
                    📍
                  </div>
                  <p className="text-sm text-gray-600">Pulse Animation</p>
                </div>
                
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl hover:rotate-12 transition-transform duration-300 cursor-pointer">
                    💳
                  </div>
                  <p className="text-sm text-gray-600">Hover to Rotate</p>
                </div>
              </div>
            </ModernCard>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-500">
            ✨ Modern Design System by Little Angels Academy ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernDesignShowcase;