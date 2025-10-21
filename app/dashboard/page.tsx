'use client';

// Disable prerendering / pre-export because this page relies on client-only libraries (e.g., Supabase)
export const dynamic = 'force-dynamic';

import { useAuth } from '@/lib/auth/auth-context';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES, APP_NAME } from '@/constants';
import Link from 'next/link';
import SecurityDashboard from '@/components/security/security-dashboard';
import { LoadingOverlay } from '@/components/ui';

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Redirect if not authenticated (but not during sign out process)
  useEffect(() => {
    if (!loading && !user) {
      const isSignOutRedirect = sessionStorage.getItem('signing-out') === 'true';
      if (!isSignOutRedirect) {
        router.push(ROUTES.LOGIN);
      } else {
        sessionStorage.removeItem('signing-out');
        router.push(ROUTES.HOME);
      }
    }
  }, [user, loading, router]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      sessionStorage.setItem('signing-out', 'true');
      await signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Sign out error:', err);
      window.location.href = '/';
    }
  };

  // Loading state
  if (loading) {
    return <LoadingOverlay message="Loading Your Space" submessage="Preparing your secure dashboard..." size="xl" />;
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Show performance dashboard if requested
  if (showPerformanceDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        {/* Cuberto-style Abstract Geometric Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-500/15 to-orange-500/10 transform rotate-45 rounded-3xl"></div>
          <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-yellow-400/12 to-orange-400/8 transform -rotate-12 rounded-full"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-yellow-200/30 transform rotate-45"></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-orange-300/20 to-transparent transform rotate-45 rounded-lg"></div>
          <div className="absolute bottom-0 right-0 w-96 h-72 bg-gradient-to-tl from-yellow-500/8 via-orange-500/5 to-transparent transform skew-x-12 rounded-tl-[100px]"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-yellow-500/15 transform -rotate-45 rounded-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col p-8 lg:p-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <button
              onClick={() => setShowPerformanceDashboard(false)}
              className="group flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div className="w-10 h-10 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/90 transition-colors border border-white/50">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-light text-lg">Back to Dashboard</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 transition-colors"
            >
              Sign out
            </button>
          </div>

                     <div className="flex-1">
             {/* Header Section */}
             <div className="text-center mb-16">
               <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                 <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                 </svg>
               </div>
               <h1 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
                 Performance
                 <span className="block font-medium text-orange-600">Monitor</span>
               </h1>
               <p className="text-xl text-gray-600 font-neuemontreal-medium max-w-2xl mx-auto leading-relaxed">
                 Track application performance, load times, and optimization metrics. 
                 <span className="block mt-2 text-gray-500 font-light">Advanced analytics coming soon...</span>
               </p>
             </div>

             {/* Performance Content Grid */}
             <div className="max-w-6xl mx-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 
                 {/* Recent Activity Card */}
                 <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 p-6 lg:p-8">
                   <h3 className="text-2xl font-light text-gray-900 mb-6">Recent Activity</h3>
                   <div className="space-y-3">
                     <div className="flex items-start justify-between p-4 bg-yellow-50 rounded-2xl">
                       <div className="flex-1">
                         <p className="font-medium text-gray-900 text-sm">Performance Scan</p>
                         <p className="text-xs text-gray-600">Completed system performance audit</p>
                       </div>
                       <span className="text-xs text-gray-500 whitespace-nowrap ml-2">1h ago</span>
                     </div>
                     <div className="flex items-start justify-between p-4 bg-yellow-50 rounded-2xl">
                       <div className="flex-1">
                         <p className="font-medium text-gray-900 text-sm">Load Time Analysis</p>
                         <p className="text-xs text-gray-600">Analyzed page load metrics</p>
                       </div>
                       <span className="text-xs text-gray-500 whitespace-nowrap ml-2">3h ago</span>
                     </div>
                     <div className="flex items-start justify-between p-4 bg-yellow-50 rounded-2xl">
                       <div className="flex-1">
                         <p className="font-medium text-gray-900 text-sm">Memory Optimization</p>
                         <p className="text-xs text-gray-600">Cleared unused cache data</p>
                       </div>
                       <span className="text-xs text-gray-500 whitespace-nowrap ml-2">6h ago</span>
                     </div>
                     <div className="flex items-start justify-between p-4 bg-yellow-50 rounded-2xl">
                       <div className="flex-1">
                         <p className="font-medium text-gray-900 text-sm">Database Query</p>
                         <p className="text-xs text-gray-600">Optimized slow database queries</p>
                       </div>
                       <span className="text-xs text-gray-500 whitespace-nowrap ml-2">12h ago</span>
                     </div>
                   </div>
                 </div>

                 {/* Performance Tips Card */}
                 <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 p-6 lg:p-8">
                   <h3 className="text-2xl font-light text-gray-900 mb-6">Performance Tips</h3>
                   <div className="space-y-4">
                     <div className="p-4 bg-blue-50 rounded-2xl">
                       <h4 className="font-medium text-gray-900 mb-1 text-sm">Cache Management</h4>
                       <p className="text-xs text-gray-600">Regularly clear browser cache for optimal speed</p>
                     </div>
                     <div className="p-4 bg-green-50 rounded-2xl">
                       <h4 className="font-medium text-gray-900 mb-1 text-sm">Image Optimization</h4>
                       <p className="text-xs text-gray-600">Compress images to reduce load times</p>
                     </div>
                     <div className="p-4 bg-purple-50 rounded-2xl">
                       <h4 className="font-medium text-gray-900 mb-1 text-sm">Network Monitoring</h4>
                       <p className="text-xs text-gray-600">Monitor network requests and API calls</p>
                     </div>
                     <div className="p-4 bg-orange-50 rounded-2xl">
                       <h4 className="font-medium text-gray-900 mb-1 text-sm">Resource Minification</h4>
                       <p className="text-xs text-gray-600">Minify CSS and JavaScript files</p>
                     </div>
                   </div>
                 </div>

               </div>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // Show security dashboard if requested
  if (showSecurityDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        {/* Cuberto-style Abstract Geometric Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/15 to-pink-500/10 transform rotate-45 rounded-3xl"></div>
          <div className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-red-400/12 to-pink-400/8 transform -rotate-12 rounded-full"></div>
          <div className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-red-200/30 transform rotate-45"></div>
          <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-pink-300/20 to-transparent transform rotate-45 rounded-lg"></div>
          <div className="absolute bottom-0 right-0 w-96 h-72 bg-gradient-to-tl from-red-500/8 via-pink-500/5 to-transparent transform skew-x-12 rounded-tl-[100px]"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-500/10 to-red-500/15 transform -rotate-45 rounded-3xl"></div>
        </div>

        <div className="relative z-10 min-h-screen flex flex-col p-8 lg:p-16">
          {/* Header */}
          <div className="flex items-center justify-between mb-16">
            <button
              onClick={() => setShowSecurityDashboard(false)}
              className="group flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <div className="w-10 h-10 bg-white/70 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-white/90 transition-colors border border-white/50">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-light text-lg">Back to Dashboard</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 transition-colors"
            >
              Sign out
            </button>
          </div>

          <div className="flex-1">
            <SecurityDashboard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Fixed Background with Parallax */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Large abstract geometric shapes */}
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-purple-500/10 transform rotate-45 rounded-3xl transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px) rotate(45deg)`
            }}
          ></div>
          <div 
            className="absolute top-1/3 -right-20 w-64 h-64 bg-gradient-to-tl from-indigo-400/12 to-blue-400/8 transform -rotate-12 rounded-full transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px) rotate(-12deg)`
            }}
          ></div>
          
          {/* Corner geometric elements */}
          <div 
            className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-blue-200/30 transform rotate-45 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px) rotate(45deg)`
            }}
          ></div>
          <div 
            className="absolute bottom-0 left-0 w-24 h-24 border-r-2 border-t-2 border-purple-200/30 transform -rotate-45 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px) rotate(-45deg)`
            }}
          ></div>
          
          {/* Abstract floating shapes */}
          <div 
            className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-tr from-blue-300/20 to-transparent transform rotate-45 rounded-lg transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 1.2}px, ${mousePosition.y * 1.2}px) rotate(45deg)`
            }}
          ></div>
          <div 
            className="absolute top-2/3 right-1/6 w-12 h-32 bg-gradient-to-b from-purple-300/15 to-transparent transform -rotate-12 rounded-full transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.6}px, ${mousePosition.y * 0.6}px) rotate(-12deg)`
            }}
          ></div>
          
          {/* Large background accent */}
          <div 
            className="absolute bottom-0 right-0 w-96 h-72 bg-gradient-to-tl from-blue-500/8 via-purple-500/5 to-transparent transform skew-x-12 rounded-tl-[100px] transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px) skewX(12deg)`
            }}
          ></div>
          
          {/* Bottom abstract geometric shapes */}
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-blue-500/15 transform -rotate-45 rounded-3xl transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * -0.5}px, ${mousePosition.y * -0.5}px) rotate(-45deg)`
            }}
          ></div>
          <div 
            className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-bl from-indigo-400/12 to-blue-400/8 transform rotate-12 rounded-full transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * -0.8}px, ${mousePosition.y * -0.8}px) rotate(12deg)`
            }}
          ></div>
          <div 
            className="absolute bottom-8 left-1/6 w-16 h-16 bg-gradient-to-tr from-purple-300/20 to-transparent transform -rotate-12 rounded-lg transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${mousePosition.x * -1.2}px, ${mousePosition.y * -1.2}px) rotate(-12deg)`
            }}
          ></div>
        </div>
        
        {/* Scrollable Content Overlay */}
        <div className="relative z-10 min-h-screen flex flex-col p-8 lg:p-16 bg-transparent">
        {/* Top Section - User Info and Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-16">
          <div className="mb-8 lg:mb-0">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-light text-gray-900">{APP_NAME}</h1>
                <p className="text-sm text-gray-500 font-light">Personal Dashboard</p>
              </div>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/50 inline-block">
              <p className="text-sm text-gray-600">Welcome back, <span className="font-medium text-gray-900">{user.email}</span></p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 hover:bg-white/90 transition-colors self-start lg:self-auto"
          >
            Sign out
          </button>
        </div>

                 {/* Welcome Section */}
         <div className="text-center mb-20">
           <h2 className="text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-relaxed">
             Your Personal
             <span className="block font-bold italic bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent py-2 pb-4 text-7xl lg:text-8xl">Digital Space</span>
           </h2>
           <p className="text-xl text-gray-600 font-neuemontreal-medium max-w-2xl mx-auto leading-relaxed">
             Manage your digital life securely and efficiently
             <span className="block mt-2 text-gray-500">Everything encrypted, everything private</span>
           </p>
         </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-20">
          {/* Vault Card */}
          <Link 
            href={ROUTES.VAULT} 
            onClick={() => {
              sessionStorage.setItem('vault-access-allowed', 'true');
            }}
            className="group"
          >
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl hover:bg-white/90 transition-all duration-500 border border-white/50 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Active
                  </span>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Password Vault</h3>
                <p className="text-gray-600 leading-relaxed">
                  Access your encrypted password vault with zero-knowledge security. Your data, your control.
                </p>
              </div>
            </div>
          </Link>

          {/* Security Center Card */}
          <div 
            onClick={() => setShowSecurityDashboard(true)}
            className="group cursor-pointer"
          >
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl hover:bg-white/90 transition-all duration-500 border border-white/50 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    Active
                  </span>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-3 group-hover:text-red-600 transition-colors">Security Center</h3>
                <p className="text-gray-600 leading-relaxed">
                  Monitor account security, manage sessions, and configure advanced security settings.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Monitor Card */}
          <div 
            onClick={() => setShowPerformanceDashboard(true)}
            className="group cursor-pointer"
          >
            <div className="bg-white/70 backdrop-blur-sm overflow-hidden rounded-3xl hover:bg-white/90 transition-all duration-500 border border-white/50 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    New
                  </span>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">Performance Monitor</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track application performance, load times, and optimization metrics in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Cards */}
          <div className="group opacity-75">
            <div className="bg-white/50 backdrop-blur-sm overflow-hidden rounded-3xl border border-white/50">
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-3">Secure Notes</h3>
                <p className="text-gray-600 leading-relaxed">
                  Store sensitive notes and documents with end-to-end encryption and seamless sync.
                </p>
              </div>
            </div>
          </div>

          <div className="group opacity-75">
            <div className="bg-white/50 backdrop-blur-sm overflow-hidden rounded-3xl border border-white/50">
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-3">Watchlists</h3>
                <p className="text-gray-600 leading-relaxed">
                  Keep track of stocks, cryptocurrency, and other important financial investments.
                </p>
              </div>
            </div>
          </div>

          <div className="group opacity-75">
            <div className="bg-white/50 backdrop-blur-sm overflow-hidden rounded-3xl border border-white/50">
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
                    <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-2xl font-light text-gray-900 mb-3">Task Manager</h3>
                <p className="text-gray-600 leading-relaxed">
                  Organize tasks, projects, and deadlines with advanced filtering and collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>

                 {/* Account Overview Section */}
         <div className="max-w-4xl mx-auto mb-20">
           <h3 className="text-3xl font-light text-gray-900 mb-8 text-center">Account Overview</h3>
           <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/50 p-8 lg:p-12">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div>
                   <h4 className="text-lg font-medium text-gray-900 mb-2">Email Address</h4>
                   <p className="text-gray-600 text-lg">{user.email}</p>
                 </div>
                 
                 <div>
                   <h4 className="text-lg font-medium text-gray-900 mb-2">Account Created</h4>
                   <p className="text-gray-600 text-lg">
                     {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                       year: 'numeric',
                       month: 'long',
                       day: 'numeric'
                     }) : 'Unknown'}
                   </p>
                 </div>
               </div>
               
               <div className="space-y-4">
                 <Link
                   href="/manage-email"
                   className="block w-full px-6 py-4 text-left bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-200 transition-colors group"
                 >
                   <h4 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-blue-600">Manage Email</h4>
                   <p className="text-gray-600">Change your account email address or delete profile</p>
                 </Link>
                 
                 <Link
                   href={ROUTES.VAULT}
                   onClick={() => {
                     sessionStorage.setItem('vault-access-allowed', 'true');
                     sessionStorage.setItem('vault-action', 'change-password');
                   }}
                   className="block w-full px-6 py-4 text-left bg-purple-50 hover:bg-purple-100 rounded-2xl border border-purple-200 transition-colors group"
                 >
                   <h4 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-purple-600">Change Master Password</h4>
                   <p className="text-gray-600">Update your vault encryption password</p>
                 </Link>
               </div>
             </div>
           </div>
         </div>

         {/* Footer Section */}
         <div className="max-w-4xl mx-auto mb-20">
           <div className="text-center py-12">
             <p className="text-gray-500 font-light">© 2024 {APP_NAME}. Your digital security companion.</p>
           </div>
         </div>
        </div>
    </div>
  );
} 