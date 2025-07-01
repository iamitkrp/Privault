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
  const [currentSection, setCurrentSection] = useState('home');
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
    { name: 'About', section: 'about' },
    { name: 'Security', section: 'security' },
    { name: 'Contact', section: 'contact' },
    { name: 'Help', section: 'help' },
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

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
    // Scroll to top of right panel when changing sections
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    closeMenu(); // Close mobile menu if open
  };

  const renderRightPanelContent = () => {
    switch (currentSection) {
      case 'about':
        return (
          <>
            {/* About Section */}
            <div className="mb-24 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-4xl lg:text-5xl font-light text-gray-900 mb-8 leading-tight max-w-xl">
                About 
                <span className="text-blue-600 font-medium"> Privault</span>
              </h3>
              
              <p className="text-xl text-gray-600 font-light leading-relaxed max-w-lg mb-4">
                Born from the need for truly private password management, Privault represents the future of digital security.
              </p>
              <p className="text-lg text-gray-900 font-medium">
                Your data belongs to you, and only you.
              </p>
            </div>

            {/* About Features */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Privacy by Design
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Every feature is built with privacy as the foundation. We can&apos;t access your data because we designed it that way.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Transparent Security
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Our encryption methods are open source and auditable. No hidden backdoors, no proprietary algorithms.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    User-Centric Approach
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Built by security professionals who understand that usability and security aren&apos;t mutually exclusive.
                  </p>
                </div>
              </div>
            </div>

            {/* Mission Statement */}
            <div className="mt-24 space-y-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="border-t border-gray-200 pt-16">
                <h4 className="text-3xl font-light text-gray-900 mb-12">Our Mission</h4>
                
                <div className="space-y-12">
                  <div className="flex items-start space-x-8">
                    <div className="text-4xl font-light text-blue-500">01</div>
                    <div>
                      <h5 className="text-xl font-medium text-gray-900 mb-3">Democratize Privacy</h5>
                      <p className="text-gray-600 leading-relaxed max-w-md">Make enterprise-grade security accessible to everyone, not just large corporations.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-8">
                    <div className="text-4xl font-light text-purple-500">02</div>
                    <div>
                      <h5 className="text-xl font-medium text-gray-900 mb-3">Rebuild Trust</h5>
                      <p className="text-gray-600 leading-relaxed max-w-md">Restore confidence in digital security through transparency and proven technology.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-8">
                    <div className="text-4xl font-light text-indigo-500">03</div>
                    <div>
                      <h5 className="text-xl font-medium text-gray-900 mb-3">Protect Freedom</h5>
                      <p className="text-gray-600 leading-relaxed max-w-md">Preserve digital privacy as a fundamental right in an increasingly connected world.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'security':
        return (
          <>
            {/* Security Section */}
            <div className="mb-24 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-4xl lg:text-5xl font-light text-gray-900 mb-8 leading-tight max-w-xl">
                Military-grade
                <span className="text-blue-600 font-medium"> security</span>
              </h3>
              
              <p className="text-xl text-gray-600 font-light leading-relaxed max-w-lg mb-4">
                Your passwords are protected by the same encryption used by governments and financial institutions worldwide.
              </p>
              <p className="text-lg text-gray-900 font-medium">
                Security you can verify and trust.
              </p>
            </div>

            {/* Security Features */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    AES-256 Encryption
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    The gold standard in encryption. Used by the NSA for top secret information and trusted globally.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    PBKDF2 Key Derivation
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Your master password is strengthened using 100,000+ iterations, making brute force attacks computationally impossible.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Client-Side Encryption
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Your data is encrypted on your device before it ever leaves. Even we can&apos;t decrypt your passwords.
                  </p>
                </div>
              </div>
            </div>

            {/* Security Details */}
            <div className="mt-24 space-y-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="border-t border-gray-200 pt-16">
                <h4 className="text-3xl font-light text-gray-900 mb-12">Security Architecture</h4>
                
                <div className="space-y-12">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Zero-Knowledge Architecture</h5>
                    <p className="text-gray-500 leading-relaxed">Your master password never leaves your device. All encryption and decryption happens locally, ensuring complete privacy.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Secure Remote Password Protocol</h5>
                    <p className="text-gray-500 leading-relaxed">Even our authentication system follows zero-knowledge principles. We never see your password, not even during login.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">End-to-End Encrypted Sync</h5>
                    <p className="text-gray-500 leading-relaxed">Data synchronization across devices maintains the same security standards. Your encrypted vault is the only thing that travels.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Regular Security Audits</h5>
                    <p className="text-gray-500 leading-relaxed">Our codebase undergoes regular third-party security audits to ensure the highest standards are maintained.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            {/* Contact Section */}
            <div className="mb-24 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-4xl lg:text-5xl font-light text-gray-900 mb-8 leading-tight max-w-xl">
                Get in
                <span className="text-blue-600 font-medium"> touch</span>
              </h3>
              
              <p className="text-xl text-gray-600 font-light leading-relaxed max-w-lg mb-4">
                We&apos;re here to help with any questions about Privault, security, or privacy.
              </p>
              <p className="text-lg text-gray-900 font-medium">
                Your privacy is our priority, even in communication.
              </p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Email Support
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md mb-2">
                    Get help with your account, security questions, or technical issues.
                  </p>
                  <a href="mailto:support@privault.security" className="text-blue-600 hover:text-blue-700 font-medium">
                    support@privault.security
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Security Reports
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md mb-2">
                    Found a security vulnerability? We take all reports seriously and respond quickly.
                  </p>
                  <a href="mailto:security@privault.security" className="text-purple-600 hover:text-purple-700 font-medium">
                    security@privault.security
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Business Inquiries
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md mb-2">
                    Enterprise solutions, partnerships, or press inquiries.
                  </p>
                  <a href="mailto:business@privault.security" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    business@privault.security
                  </a>
                </div>
              </div>
            </div>

            {/* Response Times & Policies */}
            <div className="mt-24 space-y-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="border-t border-gray-200 pt-16">
                <h4 className="text-3xl font-light text-gray-900 mb-12">Response Times</h4>
                
                <div className="space-y-12">
                  <div className="flex items-start space-x-8">
                    <div className="text-4xl font-light text-blue-500">24h</div>
                    <div>
                      <h5 className="text-xl font-medium text-gray-900 mb-3">General Support</h5>
                      <p className="text-gray-600 leading-relaxed max-w-md">Account issues, billing questions, and general inquiries.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-8">
                    <div className="text-4xl font-light text-purple-500">4h</div>
                    <div>
                      <h5 className="text-xl font-medium text-gray-900 mb-3">Security Reports</h5>
                      <p className="text-gray-600 leading-relaxed max-w-md">Critical security vulnerabilities get immediate attention.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-8">
                    <div className="text-4xl font-light text-indigo-500">48h</div>
                    <div>
                      <h5 className="text-xl font-medium text-gray-900 mb-3">Business Inquiries</h5>
                      <p className="text-gray-600 leading-relaxed max-w-md">Partnership and enterprise solution discussions.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-16">
                <h4 className="text-2xl font-light text-gray-900 mb-8">Privacy Notice</h4>
                <div className="space-y-6">
                  <p className="text-gray-500 leading-relaxed">
                    All communication is treated with the same privacy standards as our product. We use encrypted email when possible and never share your information with third parties.
                  </p>
                  <p className="text-gray-500 leading-relaxed">
                    For sensitive security reports, we recommend using PGP encryption. Our public key is available upon request.
                  </p>
                </div>
              </div>
            </div>
          </>
        );

      case 'help':
        return (
          <>
            {/* Help Section */}
            <div className="mb-24 animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <h3 className="text-4xl lg:text-5xl font-light text-gray-900 mb-8 leading-tight max-w-xl">
                Help &
                <span className="text-blue-600 font-medium"> support</span>
              </h3>
              
              <p className="text-xl text-gray-600 font-light leading-relaxed max-w-lg mb-4">
                Everything you need to get started with Privault and manage your passwords securely.
              </p>
              <p className="text-lg text-gray-900 font-medium">
                Security made simple.
              </p>
            </div>

            {/* Help Categories */}
            <div className="space-y-8 animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Getting Started
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Step-by-step guides to create your account, set up your master password, and import existing passwords.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Managing Passwords
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Learn how to add, edit, organize, and generate strong passwords for all your accounts.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <h4 className="text-xl font-medium text-gray-900 mb-2">
                    Security Best Practices
                  </h4>
                  <p className="text-gray-600 leading-relaxed max-w-md">
                    Tips and recommendations for maintaining maximum security with your password vault.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-24 space-y-16 animate-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="border-t border-gray-200 pt-16">
                <h4 className="text-3xl font-light text-gray-900 mb-12">Frequently Asked Questions</h4>
                
                <div className="space-y-12">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">What if I forget my master password?</h5>
                    <p className="text-gray-500 leading-relaxed">Unfortunately, due to our zero-knowledge architecture, we cannot recover your master password. However, this is by design - it ensures that only you can access your data. We recommend using account recovery hints and storing a secure backup of your master password.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">How does sync work across devices?</h5>
                    <p className="text-gray-500 leading-relaxed">Your encrypted vault syncs across all your devices in real-time. The encryption happens locally on each device using your master password, so the data traveling between devices is always encrypted.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Can I import passwords from other managers?</h5>
                    <p className="text-gray-500 leading-relaxed">Yes! Privault supports importing from most popular password managers including LastPass, 1Password, Bitwarden, and others. The import process maintains security by encrypting your data immediately.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Is my data backed up?</h5>
                    <p className="text-gray-500 leading-relaxed">Your encrypted vault is automatically backed up to our secure servers. However, since it&apos;s encrypted with your master password, it&apos;s only useful if you remember your master password. We also recommend keeping local backups.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-16">
                <h4 className="text-2xl font-light text-gray-900 mb-8">Need More Help?</h4>
                <div className="space-y-6">
                  <p className="text-gray-500 leading-relaxed">
                    Check our comprehensive documentation or reach out to our support team. We&apos;re committed to helping you maintain the highest level of security.
                  </p>
                  <div className="flex space-x-4">
                    <a href="mailto:support@privault.security" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</a>
                    <span className="text-gray-300">|</span>
                    <a href="#security" onClick={() => handleSectionChange('security')} className="text-purple-600 hover:text-purple-700 font-medium">Security Details</a>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default: // home
        return (
          <>
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
          </>
        );
    }
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
            {/* Interactive Subtle Background Elements */}
            <div className="absolute inset-0">
              {/* Interactive elegant gradient orb */}
              <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse-slow transition-all duration-1000 hover:scale-110 hover:from-blue-500/20 hover:via-purple-500/15 cursor-pointer"></div>
              
              {/* Hoverable floating orbs */}
              <div className="absolute top-1/6 left-1/6 w-32 h-32 bg-gradient-to-br from-cyan-500/8 to-transparent rounded-full blur-2xl transition-all duration-700 hover:scale-150 hover:from-cyan-500/16 cursor-pointer animate-drift-slow"></div>
              <div className="absolute bottom-1/3 right-1/6 w-24 h-24 bg-gradient-to-tr from-purple-500/8 to-transparent rounded-full blur-xl transition-all duration-500 hover:scale-125 hover:from-purple-500/16 cursor-pointer animate-float-elegant"></div>
              
              {/* Interactive minimal grid pattern */}
              <div className="absolute inset-0 opacity-[0.02] transition-opacity duration-500 hover:opacity-[0.04]"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(180deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '100px 100px'
                }}
              ></div>

              {/* Interactive diagonal dotted overlay for desktop */}
              <div className="hidden lg:block absolute inset-0 opacity-20 transition-all duration-700 hover:opacity-30"
                style={{
                  backgroundImage: `repeating-linear-gradient(135deg, rgba(241,250,238,0.25) 0 2px, transparent 2px 24px)`
                }}
              />
              
              {/* New floating geometric elements */}
              <div className="absolute top-2/3 left-1/4 w-16 h-16 border border-white/10 rounded-full transition-all duration-500 hover:scale-125 hover:border-white/20 hover:rotate-45 cursor-pointer animate-particle-orbit"></div>
              <div className="absolute bottom-1/4 right-1/8 w-12 h-20 border border-white/8 rounded-lg transform rotate-12 transition-all duration-600 hover:scale-110 hover:border-white/16 hover:-rotate-12 cursor-pointer animate-drift-reverse"></div>
              
              {/* Subtle hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 opacity-0 transition-opacity duration-1000 hover:opacity-10 pointer-events-none"></div>
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
            {/* Interactive Cuberto-style Abstract Geometric Background */}
            <div className="absolute inset-0 lg:fixed lg:inset-0 overflow-hidden">
              {/* Large abstract geometric shapes with hover effects */}
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-purple-500/10 transform rotate-45 rounded-3xl transition-all duration-1000 hover:scale-110 hover:rotate-90 hover:from-blue-500/25 hover:to-purple-500/20 cursor-pointer animate-float-gentle"></div>
              <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-indigo-400/12 to-blue-400/8 transform -rotate-12 rounded-full transition-all duration-700 hover:scale-125 hover:-rotate-45 hover:from-indigo-400/22 hover:to-blue-400/18 cursor-pointer animate-drift-slow"></div>
              
              {/* Corner geometric elements with interactive borders */}
              <div className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-blue-200/30 transform rotate-45 transition-all duration-500 hover:border-blue-400/60 hover:scale-110 hover:rotate-90 cursor-pointer"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 border-r-2 border-t-2 border-purple-200/30 transform -rotate-45 transition-all duration-500 hover:border-purple-400/60 hover:scale-110 hover:-rotate-90 cursor-pointer"></div>
              
              {/* Abstract floating shapes with hover animations */}
              <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-blue-300/20 to-transparent transform rotate-45 rounded-lg transition-all duration-500 hover:scale-150 hover:rotate-180 hover:from-blue-400/40 cursor-pointer animate-pulse-slow"></div>
              <div className="absolute top-2/3 right-1/6 w-12 h-32 bg-gradient-to-b from-purple-300/15 to-transparent transform -rotate-12 rounded-full transition-all duration-600 hover:scale-125 hover:rotate-12 hover:from-purple-400/30 cursor-pointer animate-drift-reverse"></div>
              
              {/* Large background accent with parallax hover */}
              <div className="absolute bottom-0 right-0 w-96 h-72 bg-gradient-to-tl from-blue-500/8 via-purple-500/5 to-transparent transform skew-x-12 rounded-tl-[100px] transition-all duration-1000 hover:scale-105 hover:skew-x-6 hover:from-blue-500/16 hover:via-purple-500/12 cursor-pointer"></div>
              
              {/* Bottom abstract geometric shapes */}
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/15 transform -rotate-45 rounded-3xl transition-all duration-1000 hover:scale-110 hover:-rotate-90 hover:from-purple-500/20 hover:to-blue-500/25 cursor-pointer animate-rotate-slow"></div>
              <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-bl from-indigo-400/12 to-blue-400/8 transform rotate-12 rounded-full transition-all duration-800 hover:scale-115 hover:rotate-45 hover:from-indigo-400/22 hover:to-blue-400/18 cursor-pointer animate-float-elegant"></div>
              <div className="absolute bottom-8 left-1/6 w-16 h-16 bg-gradient-to-tr from-purple-300/20 to-transparent transform -rotate-12 rounded-lg transition-all duration-500 hover:scale-140 hover:-rotate-45 hover:from-purple-400/35 cursor-pointer animate-particle-float"></div>
              
              {/* New interactive particles */}
              <div className="absolute top-1/4 left-1/3 w-8 h-8 bg-gradient-to-br from-cyan-400/25 to-transparent rounded-full transition-all duration-400 hover:scale-200 hover:from-cyan-500/50 cursor-pointer animate-particle-orbit"></div>
              <div className="absolute bottom-1/3 right-1/3 w-6 h-6 bg-gradient-to-tr from-pink-400/30 to-transparent rounded-full transition-all duration-300 hover:scale-250 hover:from-pink-500/60 cursor-pointer animate-particle-orbit-reverse"></div>
              
              {/* Hover-triggered overlay effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 transition-opacity duration-1000 hover:opacity-100 pointer-events-none"></div>
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col justify-between p-6 lg:p-20" style={{ minHeight: '100vh' }}>
              {/* Mobile/Desktop Nav */}
              <div className="flex items-center justify-between lg:justify-end animate-fade-in" style={{ animationDelay: '0.6s' }}>
                {/* Hamburger - mobile only */}
                <button className="hidden" aria-hidden="true" />

                {/* Desktop links */}
                <nav className="hidden lg:flex items-center space-x-10">
                  <button
                    onClick={() => handleSectionChange('home')}
                    className={`desktop-nav-link inline-block relative text-sm font-medium transition-colors duration-300 ${
                      currentSection === 'home' ? 'text-[#219EBC]' : 'text-gray-700 hover:text-[#219EBC]'
                    }`}
                  >
                    Home
                  </button>
                  {menuItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleSectionChange(item.section)}
                      className={`desktop-nav-link inline-block relative text-sm font-medium transition-colors duration-300 ${
                        currentSection === item.section ? 'text-[#219EBC]' : 'text-gray-700 hover:text-[#219EBC]'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Center - Main Content */}
              <div className="flex-1 flex flex-col justify-center py-16">
                {renderRightPanelContent()}
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
                  <span className="text-lg font-medium text-white">Get Started</span>
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
                    href={`#${item.section}`}
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
              <button
                onClick={() => handleSectionChange('home')}
                className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/20 transition-colors text-left ${
                  currentSection === 'home' ? 'bg-white/20' : ''
                }`}
              >
                Home
              </button>
              {menuItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleSectionChange(item.section)}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/20 transition-colors text-left ${
                    currentSection === item.section ? 'bg-white/20' : ''
                  }`}
                >
                  {item.name}
                </button>
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

        /* New gentle floating animation for background elements */
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
            opacity: 0.8;
          }
          25% {
            transform: translateY(-8px) translateX(4px) scale(1.02);
            opacity: 0.9;
          }
          50% {
            transform: translateY(-15px) translateX(-2px) scale(1.05);
            opacity: 1;
          }
          75% {
            transform: translateY(-5px) translateX(-6px) scale(1.02);
            opacity: 0.9;
          }
        }

        .animate-float-gentle {
          animation: float-gentle 12s ease-in-out infinite;
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
