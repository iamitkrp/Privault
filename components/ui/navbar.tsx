'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
// import { Shield, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { ROUTES, APP_NAME } from '@/constants';
import ThemeToggle from './theme-toggle';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const navRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Scroll effect removed since scrolled state is not used

  useEffect(() => {
    if (!navRef.current) return;

    // Navbar entrance animation
    gsap.fromTo(navRef.current, 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
    );

    // Logo animation
    if (logoRef.current) {
      gsap.fromTo(logoRef.current, 
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 1.2, ease: "back.out(1.7)", delay: 0.2 }
      );
    }

    // Menu items stagger animation
    if (menuRef.current) {
      const menuItems = menuRef.current.querySelectorAll('.nav-item');
      gsap.fromTo(menuItems, 
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.4 }
      );
    }
  }, []);

  // Mobile menu animation removed since isMenuOpen state is not used

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // const isActive = (path: string) => pathname === path;

  // const navigationItems = user ? [
  //   { href: ROUTES.DASHBOARD, label: 'Dashboard' },
  //   { href: ROUTES.VAULT, label: 'Vault' },
  // ] : [
  //   { href: '#features', label: 'Features' },
  //   { href: '#security', label: 'Security' },
  //   { href: '#about', label: 'About' },
  // ];

  return (
    <nav className="relative bg-white border-b-2 border-black shadow-brutal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-500 border-2 border-black shadow-brutal flex items-center justify-center group-hover:animate-wiggle">
              <span className="text-white font-black text-lg">🔒</span>
            </div>
            <span className="text-2xl font-black text-black tracking-tight">{APP_NAME}</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="text-black font-bold hover:text-blue-500 transition-colors"
                >
                  DASHBOARD
                </Link>
                <Link
                  href={ROUTES.VAULT}
                  className="text-black font-bold hover:text-blue-500 transition-colors"
                >
                  VAULT
                </Link>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  className="text-black font-bold hover:text-blue-500 transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="text-black font-bold hover:text-blue-500 transition-colors"
                >
                  SIGN UP
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* User Menu / Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-yellow-400 border-2 border-black shadow-brutal"></div>
                  <span className="text-sm font-bold text-black">
                    {user.email?.split('@')[0] || 'USER'}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-destructive text-sm"
                >
                  SIGN OUT
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href={ROUTES.LOGIN}
                  className="btn btn-ghost text-sm"
                >
                  SIGN IN
                </Link>
                <Link
                  href={ROUTES.SIGNUP}
                  className="btn btn-primary text-sm"
                >
                  GET STARTED
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 right-4">
        <button className="w-10 h-10 bg-black border-2 border-black shadow-brutal flex items-center justify-center">
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white mb-1"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 