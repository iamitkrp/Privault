"use client";
import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="block">
        <div className="relative">
          {/* Left Static Panel (copied from homepage) */}
          <div className="hidden lg:block fixed left-0 top-0 w-2/5 h-screen bg-[#212529] text-white overflow-hidden z-10 px-16 py-12 flex flex-col justify-center items-start">
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{backgroundImage:`linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),linear-gradient(180deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,backgroundSize:'100px 100px'}} />
            <h2 className="text-4xl font-light leading-snug mb-8 z-10">Your passwords,<br/> <span className="font-medium text-white/90">encrypted</span> on your device</h2>
            <p className="text-white/70 max-w-xs z-10">Even we can't see them. Sign&nbsp;up or log&nbsp;in to experience truly private password management.</p>
            <div className="mt-10 z-10 flex space-x-4">
              <Link href={ROUTES.SIGNUP} className="px-5 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">Sign&nbsp;Up</Link>
              <Link href={ROUTES.LOGIN} className="px-5 py-2 rounded-md bg-white/10 text-white text-sm font-medium hover:bg-white/20 backdrop-blur transition-colors">Log&nbsp;In</Link>
            </div>
          </div>

          {/* Right Panel with auth content */}
          <div className="relative w-full lg:ml-[40%] bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen flex items-center justify-center p-6 lg:p-20 overflow-y-auto">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 