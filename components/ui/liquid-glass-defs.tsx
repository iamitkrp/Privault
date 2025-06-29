'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const LiquidGlassDefs = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Create liquid morphing animation
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    // Animate the liquid blob path morphing
    const paths = [
      "M100,200 C100,100 200,0 300,100 C400,200 300,300 200,300 C100,300 100,200 100,200",
      "M150,250 C50,150 250,50 350,150 C450,250 350,350 250,350 C150,350 150,250 150,250",
      "M120,180 C120,80 220,20 320,120 C420,220 320,320 220,320 C120,320 120,180 120,180"
    ];

    // Get all the morphing elements
    const morphElements = svgRef.current.querySelectorAll('.morph-blob');
    
    morphElements.forEach((element, index) => {
      tl.to(element, {
        attr: { d: paths[(index + 1) % paths.length] },
        duration: 4 + index,
        ease: "power2.inOut"
      }, index * 0.5);
    });

    // Add floating animation to the entire SVG
    gsap.to(svgRef.current, {
      y: "20px",
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: "power2.inOut"
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="liquid-bg fixed inset-0 overflow-hidden pointer-events-none">
      {/* Animated blobs */}
      <div className="blob-1 liquid-blob"></div>
      <div className="blob-2 liquid-blob"></div>
      <div className="blob-3 liquid-blob"></div>
      
      {/* SVG Liquid Effects */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Gradient definitions */}
          <radialGradient id="liquidGrad1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="liquidGrad2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="liquidGrad3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ec4899" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Blur filters for the liquid effect */}
          <filter id="liquidBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feMorphology operator="dilate" radius="4"/>
            <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>

          <filter id="liquidGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>

          {/* Noise texture for added depth */}
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
            <feComponentTransfer>
              <feFuncA type="discrete" tableValues="0 .5 .5 .7 .7 .8 .9 1"/>
            </feComponentTransfer>
            <feComposite in="SourceGraphic" operator="multiply"/>
          </filter>
        </defs>

        {/* Liquid morphing shapes */}
        <path
          className="morph-blob"
          d="M100,200 C100,100 200,0 300,100 C400,200 300,300 200,300 C100,300 100,200 100,200"
          fill="url(#liquidGrad1)"
          filter="url(#liquidBlur)"
          opacity="0.6"
        />
        
        <path
          className="morph-blob"
          d="M400,150 C350,50 450,80 550,150 C650,220 550,320 450,300 C350,280 400,150 400,150"
          fill="url(#liquidGrad2)"
          filter="url(#liquidGlow)"
          opacity="0.5"
        />
        
        <path
          className="morph-blob"
          d="M200,400 C150,350 250,300 350,350 C450,400 400,500 300,480 C200,460 200,400 200,400"
          fill="url(#liquidGrad3)"
          filter="url(#liquidBlur)"
          opacity="0.4"
        />

        {/* Ambient particles */}
        <g opacity="0.3">
          {Array.from({ length: 20 }).map((_, i) => (
            <circle
              key={i}
              cx={Math.random() * 800}
              cy={Math.random() * 600}
              r={Math.random() * 3 + 1}
              fill="#6366f1"
              opacity={Math.random() * 0.5 + 0.2}
            >
              <animate
                attributeName="cy"
                values={`${Math.random() * 600};${Math.random() * 600};${Math.random() * 600}`}
                dur={`${Math.random() * 10 + 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.2;0.7;0.2"
                dur={`${Math.random() * 5 + 3}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>
        
        {/* Grid pattern overlay for tech feeling */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(99, 102, 241, 0.1)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3" />
      </svg>
    </div>
  );
};

export default LiquidGlassDefs; 