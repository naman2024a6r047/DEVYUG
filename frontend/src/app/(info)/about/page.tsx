'use client';

import React from 'react';
import { Sparkles, Leaf, Eye, Heart, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { title: 'Absolute Authenticity', desc: 'Every recipe is referenced from classical texts like Astanga Hridaya and Charaka Samhita.', icon: Sparkles },
    { title: 'Organic Cultivation', desc: 'We source herbs from biodynamic farms that respect soil ecosystems and seasonal farming.', icon: Leaf },
    { title: 'Vedic Consciousness', desc: 'Products are packaged and stored under high-vibrational environments to maintain cellular prana.', icon: ShieldCheck },
    { title: 'Universal Goodness', desc: '10% of revenue supports running gaushalas and clean drinking water initiatives in tribal farms.', icon: Heart }
  ];

  const milestones = [
    { year: '2023', title: 'The Sacred Conception', desc: 'Ayurvedic doctors and organic farmers met in Rishikesh to solve chemical-filled consumer products.' },
    { year: '2024', title: 'Gaushala Partnerships', desc: 'Began handcrafting Bilona ghee with grass-fed Gir cow dairies in Gujarat.' },
    { year: '2025', title: 'Launch of DVYUG Platform', desc: 'Bootstrapped direct-to-consumer store providing organic and puja items globally.' },
    { year: '2026', title: 'AI Wellness Launch', desc: 'Integrated digital Ayurvedic dosha recommendation systems to guide consumers online.' }
  ];

  return (
    <div className="space-y-20 pb-20 font-sans">
      
      {/* Hero Header Banner */}
      <section className="relative min-h-[40vh] flex items-center bg-[#2D5A27] text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15 transform scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200')" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 py-16 text-center space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C9A227]">Who We Are</span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#FAF8F2]">Our Vedic Legacy</h1>
          <p className="text-sm sm:text-base text-[#F5EFE2]/85 max-w-xl mx-auto font-light leading-relaxed">
            DVYUG promotes healthy, sustainable, and spiritually aligned living through authentic organic, Ayurvedic, herbal, and Vedic products.
          </p>
        </div>
      </section>

      {/* Vision & Mission Split Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-serif font-bold text-[#2D5A27]">Rooted in Rishikesh</h2>
          <p className="text-sm text-[#2B2B2B]/85 leading-relaxed font-light">
            DVYUG (Divine Essentials for Vedic Yield and Universal Goodness) emerged near the holy banks of the Ganges. We observed how contemporary wellness brands compromised traditional parameters: heating ghee at high temperatures, extracting oils with hexane solvents, or rolling incense sticks in toxic charcoal fuels.
          </p>
          <p className="text-sm text-[#2B2B2B]/85 leading-relaxed font-light">
            We returned to standard Vedic scriptures. By connecting with local tribal harvesters, gaushalas, and Ayurvedic Acharyas, we restore absolute integrity back to items you consume and use in sacred settings.
          </p>
        </div>
        <div 
          className="h-80 rounded-3xl bg-cover bg-center border border-[#F5EFE2] shadow-md"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600')" }}
        />
      </section>

      {/* Core Values grid */}
      <section className="bg-[#FAF8F2] border-y border-[#F5EFE2] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-[#2D5A27]">Our Core Pillars</h2>
            <div className="h-0.5 w-16 bg-[#C9A227] mx-auto" />
            <p className="text-sm text-[#2B2B2B]/70 font-light">
              We coordinate our sourcing and preparing guidelines around four main Vedic pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, i) => {
              const IconComp = val.icon;
              return (
                <div key={i} className="bg-white border border-[#F5EFE2] rounded-2xl p-6 shadow-sm space-y-3">
                  <div className="h-10 w-10 bg-[#FAF8F2] border border-[#F5EFE2] rounded-xl flex items-center justify-center text-[#C9A227]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#2D5A27]">{val.title}</h3>
                  <p className="text-[11px] text-[#2B2B2B]/85 leading-relaxed font-light">{val.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Corporate Timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold text-[#2D5A27]">Our Timeline</h2>
          <div className="h-0.5 w-16 bg-[#C9A227] mx-auto" />
          <p className="text-sm text-[#2B2B2B]/70 font-light">Witness our growth from humble rishis to global wellness partners.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m, i) => (
            <div key={i} className="bg-[#F5EFE2] rounded-2xl p-6 border border-[#e2dccf] relative space-y-2 hover:shadow-md transition-shadow">
              <span className="text-2xl font-bold text-[#C9A227] font-serif block">{m.year}</span>
              <h3 className="text-xs font-serif font-bold text-[#2D5A27]">{m.title}</h3>
              <p className="text-[10px] text-[#2B2B2B]/80 leading-relaxed font-light">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certification symbols */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#F5EFE2] pt-16 flex flex-col items-center justify-center space-y-6 text-center">
        <h3 className="text-lg font-serif font-bold text-[#2D5A27]">Certified Vedic Standards</h3>
        <div className="flex flex-wrap justify-center gap-10 text-xs text-[#2B2B2B]/60 font-semibold tracking-wider uppercase">
          <div className="flex items-center gap-2 bg-[#F5EFE2] px-4 py-2 rounded-full border border-[#ded8c9]">
            <Leaf className="w-4 h-4 text-[#2D5A27]" />
            <span>USDA Organic</span>
          </div>
          <div className="flex items-center gap-2 bg-[#F5EFE2] px-4 py-2 rounded-full border border-[#ded8c9]">
            <ShieldCheck className="w-4 h-4 text-[#2D5A27]" />
            <span>FSSAI Certified</span>
          </div>
          <div className="flex items-center gap-2 bg-[#F5EFE2] px-4 py-2 rounded-full border border-[#ded8c9]">
            <Sparkles className="w-4 h-4 text-[#2D5A27]" />
            <span>GMP Compliant</span>
          </div>
        </div>
      </section>

    </div>
  );
}
