import React, { useState } from 'react';
import CosmicBackground from '../components/CosmicBackground';
import Navigation from '../components/Navigation';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNavigation from '../components/BottomNavigation';
import { motion } from 'framer-motion';

export default function Profile() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    initialData: null
  });

  const theme = user?.theme || 'cosmic';

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="relative w-full min-h-screen overflow-y-auto pb-32">
      <CosmicBackground theme={theme} />
      <Navigation currentPage="Profile" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-24">
        <h1 
          className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
          style={{ textShadow: '0 0 30px rgba(255, 220, 168, 0.5)' }}
        >
          Profile
        </h1>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-white/20 mb-4">
              <span className="text-4xl font-bold text-white">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{user?.full_name || 'User'}</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <Mail className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-sm text-white/60 mb-1">Email</div>
                <div className="text-white font-medium">{user?.email || 'Not available'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <Shield className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-sm text-white/60 mb-1">Role</div>
                <div className="text-white font-medium capitalize">{user?.role || 'User'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg">
              <User className="w-5 h-5 text-white/60" />
              <div>
                <div className="text-sm text-white/60 mb-1">Theme</div>
                <div className="text-white font-medium capitalize">{user?.theme || 'Cosmic'}</div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation currentPage="Profile" />
    </div>
  );
}