'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Sparkles, Send, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  const contactCards = [
    { title: 'Customer Support', info: '+91 99999 99999', desc: 'Mon - Sat: 9:00 AM - 6:00 PM', icon: Phone },
    { title: 'Email Enquiries', info: 'support@dvyug.com', desc: 'Typical response within 24 hours', icon: Mail },
    { title: 'Wellness Headquarters', info: 'Shanti Kunj, Rishikesh', desc: 'Uttarakhand, India - 249201', icon: MapPin }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16 font-sans">
      
      {/* Header Info */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[10px] font-bold text-[#C9A227] tracking-widest uppercase flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Reach Out
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D5A27]">Contact DVYUG</h1>
        <div className="h-0.5 w-16 bg-[#C9A227] mx-auto" />
        <p className="text-xs text-[#2B2B2B]/60 font-light leading-relaxed">
          Have queries about botanical properties, orders, or custom hampers? Our wellness team is here to assist.
        </p>
      </div>

      {/* Sourcing Info Grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactCards.map((card, i) => {
          const IconComp = card.icon;
          return (
            <div key={i} className="bg-[#F5EFE2] rounded-2xl p-6 border border-[#e2dccf] text-center space-y-2">
              <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center text-[#C9A227] mx-auto border border-[#ded8c9]">
                <IconComp className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-[#2D5A27] uppercase tracking-wider">{card.title}</h3>
              <p className="text-sm font-bold text-[#2B2B2B]">{card.info}</p>
              <p className="text-[10px] text-[#2B2B2B]/60 font-light">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Main split: form and WhatsApp + map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
        
        {/* Form panel */}
        <div className="bg-white border border-[#F5EFE2] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          <h3 className="text-lg font-serif font-bold text-[#2D5A27] border-b border-[#F5EFE2] pb-3">Send a Message</h3>
          
          {success && (
            <div className="bg-[#FAF8F2] border border-[#2D5A27]/30 text-[#2D5A27] text-xs font-semibold rounded-xl p-4">
              Dhanyavaad! Your message has been received. Our wellness experts will contact you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#2B2B2B] uppercase">Message</label>
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-[#2B2B2B]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              Send Message
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* WhatsApp & Map Panel */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* WhatsApp Direct link */}
          <div className="bg-[#FAF8F2] border border-[#2D5A27]/25 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-serif font-bold text-[#2D5A27]">Instant Support via WhatsApp</h3>
            <p className="text-xs text-[#2B2B2B]/75 leading-relaxed font-light">
              Chat directly with our Ayurvedic coaches to get real-time advice on product pairings, bulk orders, or shipping statuses.
            </p>
            <a 
              href="https://wa.me/919999999999?text=Namaste%20DVYUG%20I%20have%20a%20wellness%20enquiry" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-md transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Map placeholder */}
          <div className="h-64 rounded-3xl border border-[#F5EFE2] overflow-hidden bg-[#F5EFE2] relative flex items-center justify-center text-center shadow-sm">
            {/* Styled background to simulate Map */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F2] via-transparent to-transparent" />
            <div className="relative z-10 p-4 space-y-2">
              <MapPin className="w-8 h-8 text-[#C9A227] mx-auto animate-bounce" />
              <h4 className="text-xs font-serif font-bold text-[#2D5A27] uppercase tracking-widest">Rishikesh Ganga Ashram</h4>
              <p className="text-[10px] text-[#2B2B2B]/70 max-w-[240px] font-light leading-normal">
                Visit our physical wellness display room near Ganga Path, Rishikesh, India.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
