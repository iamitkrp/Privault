import React from 'react';
import NewHero from '../../components/landing/new-hero';

export default function NewHomePage() {
  return (
    <>
      <NewHero />
      {/* Add more modular sections here */}
      <section className="w-full flex flex-col items-center py-24">
        <div className="max-w-3xl text-center">
          <h2 className="text-4xl font-bold mb-4">Modular Design, Infinite Possibilities</h2>
          <p className="text-xl text-black/70 mb-8">Build your site with beautiful, reusable modules. Every section is crafted for clarity and impact.</p>
        </div>
      </section>
    </>
  );
} 