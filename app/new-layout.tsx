import React from 'react';
import '../app/globals.css';
import NewMenu from '../components/ui/new-menu';

export default function NewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-white text-black font-sans overflow-x-hidden">
      <NewMenu />
      <main className="flex flex-col items-center justify-center w-full min-h-screen">
        {children}
      </main>
    </div>
  );
} 