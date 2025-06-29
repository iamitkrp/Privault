'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Shield, Github, Twitter, Mail, Heart } from 'lucide-react';
import { APP_NAME } from '@/constants';

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tl = gsap.timeline();
            
            // Footer slide up animation
            tl.fromTo(entry.target, 
              { y: 50, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
            );

            // Footer content stagger animation
            const footerItems = entry.target.querySelectorAll('.footer-item');
            tl.fromTo(footerItems,
              { y: 30, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
              "-=0.4"
            );
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <footer 
      ref={footerRef}
      className="relative mt-32 glass border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="footer-item md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl glass-hover">
                <Shield className="h-8 w-8 text-indigo-400" />
              </div>
              <div className="text-heading-3 font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                {APP_NAME}
              </div>
            </div>
            <p className="text-slate-300 text-body leading-relaxed mb-6 max-w-md">
              The most secure password manager with zero-knowledge architecture. 
              Your privacy is our priority, your security is our promise.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-2 rounded-lg glass-hover text-slate-400 hover:text-indigo-400 transition-colors group"
                aria-label="Follow us on Twitter"
              >
                <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg glass-hover text-slate-400 hover:text-indigo-400 transition-colors group"
                aria-label="Check our GitHub"
              >
                <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
              <a 
                href="#" 
                className="p-2 rounded-lg glass-hover text-slate-400 hover:text-indigo-400 transition-colors group"
                aria-label="Contact us"
              >
                <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </a>
            </div>
          </div>

          {/* Security Section */}
          <div className="footer-item">
            <h3 className="text-white font-semibold mb-4">Security</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Zero-Knowledge Architecture
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  AES-256 Encryption
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Security Audit
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div className="footer-item">
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Contact Support
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Status Page
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-item mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center text-slate-400 text-sm mb-4 md:mb-0">
            <span>&copy; 2024 {APP_NAME}. Built with</span>
            <Heart className="h-4 w-4 mx-1 text-red-400" />
            <span>for privacy and security.</span>
          </div>
          
          <div className="flex items-center space-x-6 text-slate-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>

        {/* Security Indicators */}
        <div className="footer-item mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-slate-500 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Zero-Knowledge</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Privacy First</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </footer>
  );
};

export default Footer; 