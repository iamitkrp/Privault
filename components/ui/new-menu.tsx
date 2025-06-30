'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'Contact', href: '/contact' },
];

const socialLinks = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Twitter', href: '#' },
  { label: 'GitHub', href: '#' },
];

export default function NewMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed z-50 bottom-8 right-8 w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-lg focus:outline-none"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
      >
        <span className="text-2xl">≡</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              className="absolute top-8 right-8 text-3xl text-black focus:outline-none"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
            <nav className="flex flex-col gap-8 mb-16">
              {menuItems.map((item) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="text-5xl font-bold tracking-tight hover:scale-105 transition-transform"
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <div className="flex gap-6">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-lg underline hover:text-black/60 transition-colors">
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 