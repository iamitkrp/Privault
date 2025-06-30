'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { ROUTES, APP_NAME } from '@/constants';


// Import crypto testing utilities in development
// Temporarily disabled for build stability
// if (process.env.NODE_ENV === 'development') {
//   import('@/lib/test-crypto');
// }

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Redirect authenticated users to vault
  useEffect(() => {
    if (user && !loading) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [user, loading, router]);

  // Sync right-panel scrolling when wheel events occur anywhere (desktop only)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth >= 1024 && rightPanelRef.current) {
        // Check if the scroll event is happening on the right panel itself
        // If so, let it handle its own scrolling naturally
        const isScrollingRightPanel = rightPanelRef.current.contains(e.target as Node);
        
        if (!isScrollingRightPanel) {
          // If scrolling anywhere else (including left panel), sync to right panel
          e.preventDefault();
          rightPanelRef.current.scrollBy({ top: e.deltaY, behavior: 'auto' });
        }
      }
    };

    // Add event listener to the entire window to capture all scroll events
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't show landing page (redirect in progress)
  if (user) {
    return null;
  }

  const menuItems = [
    { name: 'About', href: '/about' },
    { name: 'Security', href: '/security' },
    { name: 'Contact', href: '/contact' },
    { name: 'Help', href: '/help' },
  ];

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsMenuClosing(false);
    }, 250); // match exit animation
  };

  const toggleMenu = () => {
    if (isMenuOpen) closeMenu();
    else openMenu();
  };

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-white">
      {/* Desktop Layout - Hidden on mobile */}
      <div className="block">
        {/* Main Container */}
        <div className="relative">
          {/* Left Side - Modern Minimal Design */}
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
                <div className="flex items-center space-x-4">
                  {/* Simple, clean icon */}
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  {/* Clean brand name */}
                  <span className="text-xl font-light tracking-wider text-white/90 ml-3 flex-1">{APP_NAME}</span>
                  {/* Hamburger for mobile */}
                  <button
                    className="lg:hidden relative w-20 px-3 py-1.5 rounded-md text-sm font-medium text-white/90 bg-white/10 hover:bg-white/20 backdrop-blur overflow-hidden focus:outline-none focus:ring-2 focus:ring-white transition-all duration-300"
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                  >
                    <span className={`block transition-all duration-300 ${isMenuOpen && !isMenuClosing ? '-translate-y-5 opacity-0' : 'translate-y-0 opacity-100'}`}>Menu</span>
                    <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${isMenuOpen && !isMenuClosing ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>Close</span>
                  </button>
                </div>
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
                                      <span className="text-white/90">Even we can&apos;t see them.</span>
                </p>
              </div>

              {/* Clean CTA */}
              <div className="mb-16 animate-fade-in" style={{ animationDelay: '0.9s' }}>
                <Link
                  href={ROUTES.SIGNUP}
                  className="group inline-flex items-center space-x-3 bg-white text-black px-6 py-3 rounded-xl transition-colors duration-300 hover:bg-[#219EBC] hover:text-white"
                >
                  <span className="text-base font-medium">Get Started</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
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

          {/* Right Side - Scrollable Content */}
          <div ref={rightPanelRef} className="relative w-full h-auto bg-gradient-to-br from-gray-50 to-blue-50 overflow-x-hidden lg:fixed lg:right-0 lg:top-0 lg:w-3/5 lg:h-screen lg:overflow-y-auto">
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
              {/* Bottom abstract geometric shapes */}
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/15 transform -rotate-45 rounded-3xl"></div>
              <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-bl from-indigo-400/12 to-blue-400/8 transform rotate-12 rounded-full"></div>
              <div className="absolute bottom-8 left-1/6 w-16 h-16 bg-gradient-to-tr from-purple-300/20 to-transparent transform -rotate-12 rounded-lg"></div>
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col justify-between p-6 lg:p-20" style={{ minHeight: '100vh' }}>
              {/* Mobile/Desktop Nav */}
              <div className="flex items-center justify-between lg:justify-end animate-fade-in" style={{ animationDelay: '0.6s' }}>
                {/* Hamburger - mobile only */}
                <button className="hidden" aria-hidden="true" />

                {/* Desktop links */}
                <nav className="hidden lg:flex items-center space-x-10">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="desktop-nav-link inline-block relative text-sm font-medium text-gray-700 hover:text-[#219EBC] transition-colors duration-300"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Center - Main Content */}
              <div className="flex-1 flex flex-col justify-center py-16">
                {/* Description */}
                <div className="mb-24 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                  <h3 className="text-4xl lg:text-5xl font-light text-gray-900 mb-8 leading-tight max-w-xl">
                    The password manager that 
                    <span className="text-blue-600 font-medium"> actually</span> protects you
                  </h3>
                  
                  <p className="text-xl text-gray-600 font-light leading-relaxed max-w-lg mb-4">
                    Stop worrying about data breaches. Your passwords are encrypted on your device before they ever reach our servers.
                  </p>
                  <p className="text-lg text-gray-900 font-medium">
                    Even we can&apos;t see them.
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-8 animate-fade-in" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center space-x-6">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 className="text-xl font-medium text-gray-900 mb-2">
                        Zero-Knowledge Security
                      </h4>
                      <p className="text-gray-600 leading-relaxed max-w-md">
                        Your master password never leaves your device. We can&apos;t read your data, even if we wanted to.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <h4 className="text-xl font-medium text-gray-900 mb-2">
                        Bank-Grade Encryption
                      </h4>
                      <p className="text-gray-600 leading-relaxed max-w-md">
                        The same encryption used by banks and governments to protect their most sensitive data.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <div>
                      <h4 className="text-xl font-medium text-gray-900 mb-2">
                        No Tracking, Ever
                      </h4>
                      <p className="text-gray-600 leading-relaxed max-w-md">
                        We don&apos;t track you, sell your data, or show ads. Your privacy is not our product.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Content for Scroll Demo */}
                <div className="mt-24 space-y-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
                  <div className="border-t border-gray-200 pt-16">
                    <h4 className="text-3xl font-light text-gray-900 mb-12">How It Works</h4>
                    
                    <div className="space-y-12">
                      <div className="flex items-start space-x-8">
                        <div className="text-4xl font-light text-blue-500">01</div>
                        <div>
                          <h5 className="text-xl font-medium text-gray-900 mb-3">Create Your Master Password</h5>
                          <p className="text-gray-600 leading-relaxed max-w-md">Choose a strong password that only you know. This becomes your key to everything.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-8">
                        <div className="text-4xl font-light text-purple-500">02</div>
                        <div>
                          <h5 className="text-xl font-medium text-gray-900 mb-3">Add Your Passwords</h5>
                          <p className="text-gray-600 leading-relaxed max-w-md">Store all your passwords securely. They&apos;re encrypted before leaving your device.</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-8">
                        <div className="text-4xl font-light text-indigo-500">03</div>
                        <div>
                          <h5 className="text-xl font-medium text-gray-900 mb-3">Access Anywhere</h5>
                          <p className="text-gray-600 leading-relaxed max-w-md">Use your passwords on any device. Your data syncs securely across all platforms.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* More Content for Better Scroll Experience */}
                  <div className="border-t border-gray-100 pt-16">
                    <h4 className="text-2xl font-light text-gray-900 mb-8">Why Choose Privault?</h4>
                    <div className="space-y-8">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Complete Privacy</h5>
                        <p className="text-gray-500 leading-relaxed">Unlike other password managers, we use true zero-knowledge architecture. Your data is completely invisible to us.</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Open Source Security</h5>
                        <p className="text-gray-500 leading-relaxed">Our encryption methods are transparent and auditable. No hidden backdoors or proprietary algorithms.</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Cross-Platform Sync</h5>
                        <p className="text-gray-500 leading-relaxed">Access your passwords on any device, anywhere. Seamless synchronization across all platforms.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom - Trust Indicators */}
              <div className="pt-20 border-t border-gray-200 animate-fade-in" style={{ animationDelay: '1.4s' }}>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-3xl font-light text-gray-900 mb-1">Military</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">Grade</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-light text-gray-900 mb-1">Local</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">Encryption</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-light text-gray-900 mb-1">Zero</div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide">Knowledge</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="hidden">
        {/* Mobile Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white p-8 relative overflow-hidden min-h-screen flex flex-col justify-center">
          {/* Enhanced Mobile Background Pattern */}
          <div className="absolute inset-0">
            {/* Mobile grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, rgba(255,255,255,0.5) 1px, transparent 1px),
                  linear-gradient(-45deg, rgba(255,255,255,0.5) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            ></div>
            
            {/* Mobile geometric shapes */}
            <div className="absolute top-10 right-10 w-48 h-48 rounded-2xl border border-white/8 transform rotate-12"></div>
            <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full border-2 border-white/12"></div>
            
            {/* Mobile corner accents */}
            <div className="absolute top-0 left-0 w-24 h-24 border-r-3 border-b-3 border-white/15"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 border-l-3 border-t-3 border-white/15"></div>
            
            {/* Mobile floating elements */}
            <div className="absolute top-1/4 right-1/4 w-4 h-32 bg-gradient-to-b from-white/25 to-transparent transform rotate-45 rounded-full"></div>
            <div className="absolute bottom-1/3 left-1/6 w-3 h-24 bg-gradient-to-t from-white/20 to-transparent transform -rotate-12 rounded-full"></div>
          </div>

                    <div className="text-center relative z-10">
            <div className="mb-16">
              {/* Enhanced Mobile Icon */}
              <div className="relative group mb-8">
                <div className="absolute inset-0 w-20 h-20 rounded-xl border border-white/10 mx-auto transform group-hover:scale-110 transition-all duration-500"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-100 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-2xl relative z-10">
                  <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
              </div>
              
              <div className="relative">
                <h1 className="text-xl font-medium tracking-[0.3em] text-white mb-3 uppercase relative">
                  {APP_NAME}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                </h1>
                
                <div className="flex items-center justify-center space-x-3 mb-6">
                  <div className="w-4 h-px bg-gradient-to-r from-transparent to-white/30"></div>
                  <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                  <div className="w-4 h-px bg-gradient-to-l from-transparent to-white/30"></div>
                </div>
              </div>
            </div>

            <h2 className="text-6xl font-light leading-tight mb-8 tracking-tight relative">
              <span className="block relative">
                Zero
                <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-white/25 rounded-full"></div>
              </span>
              <span className="block italic text-gray-300 relative">
                Knowledge
                <div className="absolute -top-1 -right-2 w-2 h-2 border border-white/15 rounded-full"></div>
              </span>
              <span className="block font-medium text-white relative">
                Security
                <div className="absolute -bottom-2 right-0 w-16 h-1 bg-gradient-to-l from-white/30 to-transparent rounded-full"></div>
              </span>
            </h2>

            <div className="relative mt-12">
              <Link
                href={ROUTES.SIGNUP}
                className="inline-flex items-center group"
              >
                <div className="relative mr-6">
                  <span className="text-lg font-medium text-white group-hover:text-gray-200 transition-colors duration-300">Get Started</span>
                  <div className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-white/0 group-hover:bg-white/25 transition-colors duration-400"></div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 w-14 h-14 border border-white/10 rounded-xl transform group-hover:scale-110 transition-all duration-500"></div>
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-xl flex items-center justify-center relative z-10 group-hover:shadow-lg transform group-hover:scale-105 transition-all duration-300">
                    <svg className="w-5 h-5 text-gray-900 transform group-hover:translate-x-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="bg-white p-8 relative">
          {/* Animated CSS Background for Mobile */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="floating-shapes mobile">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>

          {/* Mobile Content Overlay */}
          <div className="relative z-10 bg-white/90 backdrop-blur-sm rounded-lg p-6">
            <div className="mb-8">
              <nav className="flex flex-wrap gap-4 justify-center">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="text-center mb-12">
              <h3 className="text-2xl font-light text-gray-900 mb-6">
                The password manager that actually protects you
              </h3>
              <p className="text-gray-500 leading-relaxed mb-4">
                Stop worrying about data breaches. Your passwords are encrypted on your device before they reach our servers.
              </p>
                              <p className="text-gray-400">Even we can&apos;t see them.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-light text-gray-900 mb-1">Military</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Grade</div>
          </div>
              <div>
                <div className="text-xl font-light text-gray-900 mb-1">Local</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Encryption</div>
        </div>
              <div>
                <div className="text-xl font-light text-gray-900 mb-1">Zero</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">Knowledge</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      {isMenuOpen || isMenuClosing ? (
        <>
          {/* Click-away area */}
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={closeMenu}
          />

          {/* Glassmorphic popup */}
          <div className="fixed top-24 right-4 z-50 lg:hidden">
            <div className={`w-48 rounded-xl bg-white/10 backdrop-blur-lg shadow-lg ring-1 ring-white/20 p-3 flex flex-col space-y-1 origin-top-right ${isMenuClosing ? 'animate-menu-exit' : 'animate-menu-pop'}`}
            >
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/20 transition-colors ${
                    item.name === 'Sign In' ? 'border border-white text-white hover:bg-white/30' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}

      <style jsx>{`
        /* Premium Entry Animations */
        @keyframes brand-entrance {
          from {
            opacity: 0;
            transform: translateY(40px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes brand-text-entrance {
          from {
            opacity: 0;
            transform: translateY(20px);
            letter-spacing: 0.8em;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            letter-spacing: 0.4em;
          }
        }

        @keyframes hero-slide-up {
          from {
            opacity: 0;
            transform: translateY(60px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes cta-entrance {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Sophisticated Ring Animations */
        @keyframes ring-orbit {
          0% {
            transform: rotate(0deg) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: rotate(180deg) scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: rotate(360deg) scale(1);
            opacity: 0.6;
          }
        }

        @keyframes ring-orbit-reverse {
          0% {
            transform: rotate(360deg) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: rotate(180deg) scale(1.03);
            opacity: 0.6;
          }
          100% {
            transform: rotate(0deg) scale(1);
            opacity: 0.4;
          }
        }

        /* Elegant Background Animations */
        @keyframes float-elegant {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.6;
          }
          33% {
            transform: translateY(-15px) rotate(120deg);
            opacity: 0.8;
          }
          66% {
            transform: translateY(10px) rotate(240deg);
            opacity: 0.4;
          }
        }

        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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

        @keyframes drift-slow {
          0%, 100% {
            transform: translateX(0px) translateY(0px) scale(1);
          }
          25% {
            transform: translateX(10px) translateY(-5px) scale(1.01);
          }
          50% {
            transform: translateX(5px) translateY(10px) scale(0.99);
          }
          75% {
            transform: translateX(-5px) translateY(5px) scale(1.01);
          }
        }

        @keyframes drift-reverse {
          0%, 100% {
            transform: translateX(0px) translateY(0px) skewX(6deg);
          }
          25% {
            transform: translateX(-8px) translateY(4px) skewX(8deg);
          }
          50% {
            transform: translateX(-3px) translateY(-8px) skewX(4deg);
          }
          75% {
            transform: translateX(4px) translateY(-3px) skewX(10deg);
          }
        }

        /* Premium Glow Effects */
        @keyframes icon-glow {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(255,255,255,0.1);
          }
          50% {
            box-shadow: 0 15px 40px rgba(255,255,255,0.2);
          }
        }

        @keyframes text-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(255,255,255,0.1);
          }
          50% {
            text-shadow: 0 0 20px rgba(255,255,255,0.2);
          }
        }

        @keyframes border-glow {
          0%, 100% {
            border-color: rgba(255,255,255,0.25);
            box-shadow: 0 0 10px rgba(255,255,255,0.1);
          }
          50% {
            border-color: rgba(255,255,255,0.4);
            box-shadow: 0 0 20px rgba(255,255,255,0.2);
          }
        }

        @keyframes border-glow-reverse {
          0%, 100% {
            border-color: rgba(255,255,255,0.25);
            box-shadow: 0 0 10px rgba(255,255,255,0.1);
          }
          50% {
            border-color: rgba(255,255,255,0.4);
            box-shadow: 0 0 20px rgba(255,255,255,0.2);
          }
        }

        /* Particle Animations */
        @keyframes particle-orbit {
          0% {
            transform: rotate(0deg) translateX(30px) rotate(0deg);
            opacity: 0.5;
          }
          100% {
            transform: rotate(360deg) translateX(30px) rotate(-360deg);
            opacity: 0.5;
          }
        }

        @keyframes particle-orbit-reverse {
          0% {
            transform: rotate(360deg) translateX(25px) rotate(360deg);
            opacity: 0.3;
          }
          100% {
            transform: rotate(0deg) translateX(25px) rotate(0deg);
            opacity: 0.3;
          }
        }

        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-10px);
            opacity: 0.4;
          }
        }

        @keyframes particle-float-gentle {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-8px) scale(1.1);
            opacity: 0.6;
          }
        }

        /* Typography Enhancement Animations */
        @keyframes word-accent-flow {
          0%, 100% {
            transform: scaleX(1);
            opacity: 0.4;
          }
          50% {
            transform: scaleX(1.1);
            opacity: 0.7;
          }
        }

        @keyframes text-aura {
          0%, 100% {
            opacity: 0.05;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.02);
          }
        }

        @keyframes text-aura-delayed {
          0%, 100% {
            opacity: 0.03;
            transform: scale(1);
          }
          50% {
            opacity: 0.08;
            transform: scale(1.01);
          }
        }

        @keyframes text-aura-strong {
          0%, 100% {
            opacity: 0.08;
            transform: scale(1);
          }
          50% {
            opacity: 0.15;
            transform: scale(1.03);
          }
        }

        /* CTA Premium Animations */
        @keyframes cta-glow {
          0%, 100% {
            box-shadow: 0 10px 30px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,0.05);
          }
          50% {
            box-shadow: 0 15px 40px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.1);
          }
        }

        @keyframes cta-frame-float {
          0%, 100% {
            transform: rotate(2deg) translateY(0px);
          }
          50% {
            transform: rotate(3deg) translateY(-2px);
          }
        }

        @keyframes cta-frame-float-reverse {
          0%, 100% {
            transform: rotate(-1deg) translateY(0px);
          }
          50% {
            transform: rotate(-2deg) translateY(2px);
          }
        }

        @keyframes cta-ring-orbit {
          0% {
            transform: rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: rotate(360deg);
            opacity: 0.8;
          }
        }

        /* Constellation Effects */
        @keyframes constellation-star {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes constellation-star-center {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.3) rotate(180deg);
          }
        }

        /* Grid and Line Animations */
        @keyframes grid-drift {
          0% {
            transform: translateX(0px) translateY(0px);
          }
          100% {
            transform: translateX(120px) translateY(120px);
          }
        }

        @keyframes glow-vertical {
          0%, 100% {
            opacity: 0.2;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.4;
            transform: scaleY(1.1);
          }
        }

        @keyframes glow-vertical-delayed {
          0%, 100% {
            opacity: 0.15;
            transform: scaleY(1);
          }
          50% {
            opacity: 0.3;
            transform: scaleY(1.05);
          }
        }

        /* Applied Animation Classes */
        .animate-brand-entrance {
          animation: brand-entrance 1.2s ease-out forwards;
          opacity: 0;
        }

        .animate-brand-text-entrance {
          animation: brand-text-entrance 1s ease-out forwards 0.3s;
          opacity: 0;
        }

        .animate-hero-slide-up {
          animation: hero-slide-up 1s ease-out forwards;
          opacity: 0;
        }

        .animate-cta-entrance {
          animation: cta-entrance 1s ease-out forwards 1s;
          opacity: 0;
        }

        .animate-ring-orbit {
          animation: ring-orbit 20s linear infinite;
        }

        .animate-ring-orbit-reverse {
          animation: ring-orbit-reverse 25s linear infinite;
        }

        .animate-float-elegant {
          animation: float-elegant 15s ease-in-out infinite;
        }

        .animate-rotate-slow {
          animation: rotate-slow 30s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-drift-slow {
          animation: drift-slow 20s ease-in-out infinite;
        }

        .animate-drift-reverse {
          animation: drift-reverse 25s ease-in-out infinite;
        }

        .animate-icon-glow {
          animation: icon-glow 3s ease-in-out infinite;
        }

        .animate-text-glow {
          animation: text-glow 4s ease-in-out infinite;
        }

        .animate-border-glow {
          animation: border-glow 3s ease-in-out infinite;
        }

        .animate-border-glow-reverse {
          animation: border-glow-reverse 3.5s ease-in-out infinite;
        }

        .animate-particle-orbit {
          animation: particle-orbit 15s linear infinite;
        }

        .animate-particle-orbit-reverse {
          animation: particle-orbit-reverse 18s linear infinite;
        }

        .animate-particle-float {
          animation: particle-float 6s ease-in-out infinite;
        }

        .animate-particle-float-gentle {
          animation: particle-float-gentle 8s ease-in-out infinite;
        }

        .animate-word-accent-flow {
          animation: word-accent-flow 5s ease-in-out infinite;
        }

        .animate-text-aura {
          animation: text-aura 6s ease-in-out infinite;
        }

        .animate-text-aura-delayed {
          animation: text-aura-delayed 7s ease-in-out infinite 1s;
        }

        .animate-text-aura-strong {
          animation: text-aura-strong 5s ease-in-out infinite 0.5s;
        }

        .animate-cta-glow {
          animation: cta-glow 4s ease-in-out infinite;
        }

        .animate-cta-frame-float {
          animation: cta-frame-float 8s ease-in-out infinite;
        }

        .animate-cta-frame-float-reverse {
          animation: cta-frame-float-reverse 10s ease-in-out infinite;
        }

        .animate-cta-ring-orbit {
          animation: cta-ring-orbit 12s linear infinite;
        }

        .animate-constellation-star {
          animation: constellation-star 3s ease-in-out infinite;
        }

        .animate-constellation-star-center {
          animation: constellation-star-center 4s ease-in-out infinite;
        }

        .animate-glow-vertical {
          animation: glow-vertical 8s ease-in-out infinite;
        }

        .animate-glow-vertical-delayed {
          animation: glow-vertical-delayed 10s ease-in-out infinite 2s;
        }

        /* Refined Mobile & Shared Animations */
        .animate-fade-in {
          animation: brand-entrance 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-slide-up {
          animation: hero-slide-up 0.6s ease-out forwards;
          opacity: 0;
        }

        @keyframes menu-pop {
          0% { opacity: 0; transform: scale(0.9) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-menu-pop { animation: menu-pop 0.25s cubic-bezier(.22,1,.36,1) forwards; }

        /* Custom scrollbar for webkit browsers */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }

        @keyframes menu-exit {
          0% { opacity:1; transform: translateY(0) scale(1) rotateX(0deg); }
          100% { opacity:0; transform: translateY(-12px) scale(.92) rotateX(-10deg); }
        }
        .animate-menu-exit { animation: menu-exit 0.25s ease-in forwards; }

        /* Desktop nav underline hover */
        .desktop-nav-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 2px;
          background-color: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .desktop-nav-link:hover::after {
          transform: scaleX(1);
        }
      `}</style>
    </div>
  );
}
