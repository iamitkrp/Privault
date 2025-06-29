"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface UnfoldingTextProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
}

const UnfoldingText: React.FC<UnfoldingTextProps> = ({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  duration = 0.8
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const chars = textRef.current.querySelectorAll('.char');
    
    // Set initial state
    gsap.set(chars, {
      y: 100,
      opacity: 0,
      rotationX: -90,
      transformPerspective: 1000,
      transformOrigin: "50% 50% -50px"
    });

    // Create animation timeline
    const tl = gsap.timeline({ delay });

    tl.to(chars, {
      y: 0,
      opacity: 1,
      rotationX: 0,
      duration,
      stagger,
      ease: "back.out(1.7)"
    });

    return () => {
      tl.kill();
    };
  }, [text, delay, stagger, duration]);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className="char inline-block"
        style={{ 
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div ref={textRef} className={className}>
      {splitText(text)}
    </div>
  );
};

export default UnfoldingText; 