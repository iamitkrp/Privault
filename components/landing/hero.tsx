'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { Shield, ArrowRight, Eye } from 'lucide-react';
import { ROUTES } from '@/constants';
import UnfoldingText from '@/components/ui/unfolding-text';

// Register GSAP plugin
gsap.registerPlugin(TextPlugin);

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({ delay: 0.5 });

    // Hero entrance animation
    tl.fromTo(heroRef.current, 
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out" }
    );

    // Title animation with split text effect
    if (titleRef.current) {
      const titleChars = titleRef.current.querySelectorAll('.char');
      tl.fromTo(titleChars, 
        { y: 100, opacity: 0, rotationX: -90 },
        { 
          y: 0, 
          opacity: 1, 
          rotationX: 0,
          duration: 1.2, 
          stagger: 0.02, 
          ease: "back.out(1.7)" 
        },
        "-=0.5"
      );
    }

    // Subtitle fade in
    if (subtitleRef.current) {
      tl.fromTo(subtitleRef.current, 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.3"
      );
    }

    // Buttons slide up
    if (buttonsRef.current) {
      const buttons = buttonsRef.current.querySelectorAll('.hero-button');
      tl.fromTo(buttons, 
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Title with split text animation */}
        <div ref={titleRef} className="mb-8">
          <UnfoldingText
            text="Zero-Knowledge Password Security"
            className="text-heading-1 font-bold bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent"
          />
        </div>

        {/* Subtitle */}
        <p ref={subtitleRef} className="text-body-large text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Secure your passwords with military-grade encryption. Your data is encrypted locally before it ever leaves your device.
          <span className="block mt-2 text-indigo-300 font-medium">Experience true privacy in the digital age.</span>
        </p>

        {/* CTA Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href={ROUTES.SIGNUP}
            className="hero-button group relative px-8 py-4 btn-primary text-lg font-semibold flex items-center gap-3 min-w-[200px] justify-center"
          >
            <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
            Start Securing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
          
          <Link
            href={ROUTES.LOGIN}
            className="hero-button group px-8 py-4 btn-secondary text-lg font-semibold flex items-center gap-3 min-w-[200px] justify-center"
          >
            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            Access Your Vault
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero; 