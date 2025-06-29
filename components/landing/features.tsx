'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  Shield, 
  Lock, 
  Eye, 
  Smartphone, 
  Globe, 
  Zap, 
  UserCheck, 
  Database,
  CheckCircle,
  ArrowRight 
} from 'lucide-react';

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Features grid animation
      const featureCards = featuresRef.current?.querySelectorAll('.feature-card');
      if (featureCards) {
        gsap.fromTo(featureCards,
          { y: 80, opacity: 0, scale: 0.8 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: featuresRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      }

      // CTA section animation
      gsap.fromTo(ctaRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: Lock,
      title: "Zero-Knowledge Architecture",
      description: "Your data is encrypted before it leaves your device. Even we can't see your passwords.",
      color: "from-indigo-500/20 to-purple-500/20",
      iconColor: "text-indigo-400"
    },
    {
      icon: Shield,
      title: "Military-Grade Encryption",
      description: "AES-256 encryption with PBKDF2 key derivation ensures maximum security.",
      color: "from-emerald-500/20 to-teal-500/20",
      iconColor: "text-emerald-400"
    },
    {
      icon: Eye,
      title: "Privacy by Design",
      description: "No tracking, no analytics, no data collection. Your privacy is guaranteed.",
      color: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-400"
    },
    {
      icon: Smartphone,
      title: "Cross-Platform Sync",
      description: "Access your passwords securely across all devices with end-to-end encryption.",
      color: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-400"
    },
    {
      icon: Globe,
      title: "Open Source",
      description: "Transparent code means verifiable security. Audit our encryption anytime.",
      color: "from-orange-500/20 to-yellow-500/20",
      iconColor: "text-orange-400"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant access to your passwords with optimized local encryption.",
      color: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400"
    }
  ];

  const securityFeatures = [
    "End-to-end encryption",
    "Zero-knowledge architecture", 
    "PBKDF2 key derivation",
    "AES-256 encryption",
    "Local password generation",
    "Secure password sharing"
  ];

  return (
    <section ref={sectionRef} className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div ref={titleRef} className="text-center mb-20">
          <h2 className="text-heading-2 font-bold bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent mb-6">
            Built for Maximum Security & Privacy
          </h2>
          <p className="text-body-large text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Experience the future of password management with cutting-edge encryption and 
            zero-knowledge architecture that puts you in complete control.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card group card card-hover p-8 relative overflow-hidden"
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 mb-6 rounded-xl bg-gradient-to-r ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor} group-hover:rotate-12 transition-transform duration-300`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-indigo-200 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-300 text-body leading-relaxed">
                {feature.description}
              </p>

              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}></div>
            </div>
          ))}
        </div>

        {/* Security Checklist */}
        <div className="glass p-8 rounded-2xl mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-heading-3 font-semibold text-white mb-6">
                Security You Can Trust
              </h3>
              <p className="text-slate-300 text-body leading-relaxed mb-8">
                Every feature is designed with security first. Our zero-knowledge architecture 
                ensures that only you have access to your passwords.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="glass p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <Database className="w-6 h-6 text-indigo-400" />
                  <span className="text-white font-medium">Your Data</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Encryption Level</span>
                    <span className="text-emerald-400 text-sm font-medium">AES-256</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Knowledge Level</span>
                    <span className="text-emerald-400 text-sm font-medium">Zero</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Data Access</span>
                    <span className="text-emerald-400 text-sm font-medium">You Only</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Privacy Level</span>
                    <span className="text-emerald-400 text-sm font-medium">Maximum</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div ref={ctaRef} className="text-center">
          <div className="glass p-12 rounded-2xl relative overflow-hidden">
            <h3 className="text-heading-3 font-semibold text-white mb-6">
              Ready to Secure Your Digital Life?
            </h3>
            <p className="text-slate-300 text-body leading-relaxed mb-8 max-w-2xl mx-auto">
              Join thousands of privacy-conscious users who trust their passwords to our 
              zero-knowledge architecture. Start your secure journey today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="btn-primary text-lg px-8 py-4 flex items-center gap-3 group">
                <UserCheck className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Create Your Vault
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              
              <button className="btn-secondary text-lg px-8 py-4 flex items-center gap-3 group">
                <Globe className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                Learn More
              </button>
            </div>

            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full filter blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full filter blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 