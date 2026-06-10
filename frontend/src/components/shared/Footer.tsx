'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const quickLinks = [
    { name: 'Shop All Products', path: '/shop' },
    { name: 'About Our Story', path: '/about' },
    { name: 'Vedic Wellness Blog', path: '/blog' },
    { name: 'Frequently Asked Questions', path: '/faq' },
    { name: 'Contact Our Support', path: '/contact' },
  ];

  const policyLinks = [
    { name: 'Privacy Policy', path: '/policies/privacy' },
    { name: 'Terms & Conditions', path: '/policies/terms' },
    { name: 'Shipping Policy', path: '/policies/shipping' },
    { name: 'Return & Refund Policy', path: '/policies/returns' },
  ];

  return (
    <footer className="bg-[#2D5A27] text-[#FAF8F2] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Footer Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <span className="text-3xl font-serif font-bold tracking-wider text-[#C9A227] flex items-center gap-1.5">
                DVYUG
                <Sparkles className="w-5 h-5 animate-pulse text-[#FAF8F2]" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#F5EFE2] opacity-80 mt-1">
                Divine Essentials
              </span>
            </div>
            <p className="text-sm text-[#F5EFE2]/80 leading-relaxed font-light">
              Promoting healthy, sustainable, and spiritually aligned living through authentic organic, Ayurvedic, herbal, and Vedic products.
            </p>
            <div className="space-y-3 pt-2 text-xs font-light text-[#F5EFE2]/95">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C9A227]" />
                <span>+91 99999 99999</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C9A227]" />
                <span>support@dvyug.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                <span>Shanti Kunj, Ganges View Road, Rishikesh, UK</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-semibold text-[#C9A227] tracking-wider">Explore</h3>
            <ul className="space-y-3 text-sm font-light">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-[#F5EFE2]/80 hover:text-[#C9A227] hover:pl-1 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-semibold text-[#C9A227] tracking-wider">Our Policies</h3>
            <ul className="space-y-3 text-sm font-light">
              {policyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-[#F5EFE2]/80 hover:text-[#C9A227] hover:pl-1 transition-all duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-serif font-semibold text-[#C9A227] tracking-wider">Divine Newsletter</h3>
            <p className="text-sm text-[#F5EFE2]/80 leading-relaxed font-light">
              Subscribe to receive weekly Ayurvedic health insights, ritual recipes, and private sales.
            </p>
            {subscribed ? (
              <div className="bg-[#FAF8F2]/10 border border-[#C9A227]/30 rounded-lg p-4 text-center text-xs text-[#FAF8F2] animate-fade-in font-medium">
                Greetings! You are now subscribed to DVYUG wisdom.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF8F2]/10 text-white placeholder-[#F5EFE2]/50 text-xs px-4 py-3 rounded-md focus:outline-none focus:ring-1 focus:ring-[#C9A227] border border-[#F5EFE2]/20 font-light"
                  />
                  <button
                    type="submit"
                    className="absolute right-2.5 top-2.5 text-[#C9A227] hover:text-[#FAF8F2] transition-colors"
                    aria-label="Subscribe"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-[#F5EFE2]/20 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-[#F5EFE2]/60">
          <div>
            &copy; {new Date().getFullYear()} DVYUG Organic Private Limited. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span>Authentic Ayurveda</span>
            <span>&bull;</span>
            <span>100% Cruelty Free</span>
            <span>&bull;</span>
            <span>Made in India</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
