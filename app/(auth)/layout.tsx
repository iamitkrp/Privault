"use client";
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { ROUTES, APP_NAME } from '@/constants';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add initial loading state
  useEffect(() => {
    // Short timeout to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Sync right-panel scrolling when wheel events occur over the left panel (desktop only)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth >= 1024 && rightPanelRef.current) {
        e.preventDefault();
        rightPanelRef.current.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    };
    const left = leftPanelRef.current;
    if (left) {
      left.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (left) left.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="block">
        <div className="relative">
          {/* Left Side - Modern Minimal Design (matches homepage) */}
          <div ref={leftPanelRef} className="relative w-full h-auto bg-[#212529] flex flex-col justify-center items-start px-6 py-12 text-white overflow-hidden z-10 lg:fixed lg:left-0 lg:top-0 lg:w-2/5 lg:h-screen lg:px-16 lg:py-12">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0">
              {/* Single elegant gradient orb */}
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
              
              {/* Minimal grid pattern */}
              <div className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(180deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '100px 100px'
                }}
              ></div>

              {/* New diagonal dotted overlay for desktop */}
              <div className="hidden lg:block absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(135deg, rgba(241,250,238,0.25) 0 2px, transparent 2px 24px)`
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl w-full">
              {/* Brand Mark - Minimal */}
              <div className="mb-12 animate-fade-in">
                <Link href="/" className="flex items-center space-x-4">
                  {/* Simple, clean icon */}
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  {/* Clean brand name */}
                  <span className="text-xl font-light tracking-wider text-white/90 ml-3">{APP_NAME}</span>
                </Link>
              </div>

              {/* Hero Typography - Bold & Clean */}
              <div className="mb-16">
                <h1 className="text-6xl lg:text-7xl font-extralight leading-[0.9] mb-6 tracking-tight animate-slide-up">
                  <span className="block text-white">Zero</span>
                  <span className="block text-white/80">Knowledge</span>
                  <span className="block text-white font-medium">Security</span>
                </h1>
                
                {/* Simple accent line */}
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-fade-in" style={{ animationDelay: '0.5s' }}></div>
              </div>

              {/* Minimal Description */}
              <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                <p className="text-lg text-white/70 font-light leading-relaxed max-w-md">
                  Your passwords, encrypted on your device. 
                  <br />
                  <span className="text-white/90">Even we can't see them.</span>
                </p>
              </div>

              {/* Auth Navigation */}
              <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                <div className="flex items-center space-x-4">
                  <Link
                    href={ROUTES.SIGNUP}
                    className="group inline-flex items-center space-x-3 bg-white text-black px-6 py-3 rounded-xl transition-all duration-300 hover:bg-[#219EBC] hover:text-white hover:shadow-lg"
                  >
                    <span className="text-base font-medium">Sign Up</span>
                  </Link>
                  <Link
                    href={ROUTES.LOGIN}
                    className="group inline-flex items-center space-x-3 bg-transparent text-white border border-white/30 px-6 py-3 rounded-xl transition-all duration-300 hover:bg-white/10 hover:border-white/50"
                  >
                    <span className="text-base font-medium">Log In</span>
                  </Link>
                </div>
              </div>

              {/* Minimal Trust Indicators */}
              <div className="pt-6 border-t border-white/10 animate-fade-in" style={{ animationDelay: '1.1s' }}>
                <div className="flex items-center space-x-6 text-white/50">
                  <div className="text-center">
                    <div className="text-xs font-medium text-white/70">AES-256</div>
                    <div className="text-xs uppercase tracking-wide">Encryption</div>
                  </div>
                  <div className="w-px h-6 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-white/70">Open Source</div>
                    <div className="text-xs uppercase tracking-wide">Auditable</div>
                  </div>
                  <div className="w-px h-6 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-white/70">Zero Logs</div>
                    <div className="text-xs uppercase tracking-wide">Privacy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel with auth content */}
          <div ref={rightPanelRef} className="relative w-full h-auto bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden lg:fixed lg:right-0 lg:top-0 lg:w-3/5 lg:h-screen lg:overflow-y-auto animate-slide-in-right">
            <div className="relative z-10 p-6 lg:p-20 min-h-screen flex items-center justify-center">
              <div className="w-full max-w-md">
                {isLoading ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="loading-skeleton h-8 w-3/4"></div>
                      <div className="loading-skeleton h-4 w-1/2"></div>
                    </div>
                    <div className="loading-skeleton h-14 w-full"></div>
                    <div className="loading-skeleton h-14 w-full"></div>
                    <div className="loading-skeleton h-14 w-full"></div>
                  </div>
                ) : (
                  <div className="animate-fade-in">
                    {children}
                  </div>
                )}
              </div>
            </div>

            {/* Cuberto-style Abstract Geometric Background */}
            <div className="absolute inset-0 lg:fixed lg:inset-0 overflow-hidden pointer-events-none">
              {/* Large abstract geometric shapes */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-purple-500/10 transform rotate-45 rounded-3xl"></div>
              <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-indigo-400/12 to-blue-400/8 transform -rotate-12 rounded-full"></div>
              
              {/* Corner geometric elements */}
              <div className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-blue-200/30 transform rotate-45"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 border-r-2 border-t-2 border-purple-200/30 transform -rotate-45"></div>
              
              {/* Abstract floating shapes */}
              <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-blue-300/20 to-transparent transform rotate-45 rounded-lg"></div>
              <div className="absolute top-2/3 right-1/6 w-12 h-32 bg-gradient-to-b from-purple-300/15 to-transparent transform -rotate-12 rounded-full"></div>
              
              {/* Large background accent */}
              <div className="absolute bottom-0 right-0 w-96 h-72 bg-gradient-to-tl from-blue-500/8 via-purple-500/5 to-transparent transform skew-x-12 rounded-tl-[100px]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        :global(.animate-slide-in-right) {
          animation: slide-in-right 0.7s ease-out forwards;
        }

        :global(.animate-fade-in) {
          animation: fade-in 0.8s ease-out forwards;
        }

        :global(.animate-pulse-slow) {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        :global(.animate-slide-up) {
          animation: slide-up 0.9s ease-out forwards;
        }

        :global(.loading-skeleton) {
          background: linear-gradient(90deg, #e0e7ff 25%, #f1f5f9 50%, #e0e7ff 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 0.75rem;
        }
      `}</style>
    </div>
  );
} 