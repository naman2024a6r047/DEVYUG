'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ShieldCheck, Truck, RotateCcw, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PolicyData {
  title: string;
  desc: string;
  icon: any;
  sections: { h: string; p: string }[];
}

const POLICY_DATABASES: Record<string, PolicyData> = {
  'privacy': {
    title: 'Privacy Policy',
    desc: 'How DVYUG safeguards and handles your personal profile data.',
    icon: ShieldCheck,
    sections: [
      { h: '1. Information We Collect', p: 'We collect your name, email, contact phone, and shipping coordinates when registering a profile or placing orders. This data is strictly used for order validation and delivery.' },
      { h: '2. Cookies & Analytics', p: 'We utilize tracking cookies to preserve your shopping cart items, manage active login sessions, and track AI recommender choices to improve catalog presentation.' },
      { h: '3. Data Security', p: 'Your credentials password is encrypted using bcrypt hashing algorithms on our Express databases. We do not sell or share customer contact records with third-party advertising companies.' }
    ]
  },
  'terms': {
    title: 'Terms & Conditions',
    desc: 'Trading guidelines and user profile agreements for the DVYUG platform.',
    icon: ShieldCheck,
    sections: [
      { h: '1. User Account Responsibility', p: 'Upon registering, you agree to safeguard your credentials. Admin accounts reserve the right to revoke user sessions if fraudulent behavior or referral loop spamming is detected.' },
      { h: '2. Sourcing Variations', p: 'As our products are organic and handcrafted in seasonal gaushalas, minor variations in color, aroma, and granularity (especially in Bilona Ghee) are natural and expected.' },
      { h: '3. Liability & Health Disclaimer', p: 'Ayurvedic descriptions are for educational purposes. Consult a certified Vaidya (Ayurvedic doctor) before starting any concentrated capsules if you have chronic ailments.' }
    ]
  },
  'shipping': {
    title: 'Shipping Policy',
    desc: 'Timelines, charges, and packaging standards for deliveries.',
    icon: Truck,
    sections: [
      { h: '1. Shipping Fee Structure', p: 'Orders with subtotals equal to or exceeding ₹499 qualify for Free Standard Delivery all over India. Orders below ₹499 carry a flat shipping surcharge of ₹60.' },
      { h: '2. Delivery Timelines', p: 'Deliveries to Tier 1 and Tier 2 cities take 3 to 5 business days after payment confirmation. Remote mountain and rural regions may take 5 to 7 days.' },
      { h: '3. Eco-friendly Packaging Promise', p: 'We completely reject single-use bubble wraps. All products are shipped in post-consumer cardboard containers insulated with biodegradable natural wood shavings and sealed with water-activated starch paper tape.' }
    ]
  },
  'returns': {
    title: 'Return & Refund Policy',
    desc: 'Guidelines for product replacements, damages, and refunds.',
    icon: RotateCcw,
    sections: [
      { h: '1. Return Checkpoints', p: 'We support a 7-day return policy. To qualify, items must remain completely sealed, unopened, and in their original packaging wrappers.' },
      { h: '2. Damaged or Incorrect Deliveries', p: 'If a jar or ceramic bottle arrives broken, please email a snapshot of the package box to support@dvyug.com within 48 hours of delivery for free replacement.' },
      { h: '3. Refund Timeframes', p: 'Verified refunds are credited back to your original payment source (Razorpay, card, or UPI bank account) within 5 to 7 business days from receiving the returned parcel at our Rishikesh center.' }
    ]
  }
};

export default function PolicyPage() {
  const params = useParams();
  const slug = params.slug as string;

  const data = POLICY_DATABASES[slug];

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-sans space-y-4">
        <h2 className="text-xl font-bold text-[#2D5A27]">Policy Page Not Found</h2>
        <Link href="/" className="text-xs font-semibold text-[#C9A227] underline">Return Home</Link>
      </div>
    );
  }

  const IconComp = data.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-sans">
      
      {/* Return link */}
      <div>
        <Link href="/" className="text-xs font-semibold text-[#2D5A27] hover:text-[#C9A227] flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center gap-3 border-b border-[#F5EFE2] pb-6">
          <div className="h-12 w-12 bg-[#F5EFE2] rounded-full flex items-center justify-center text-[#2D5A27] border border-[#ded8c9]">
            <IconComp className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D5A27]">{data.title}</h1>
            <p className="text-xs text-[#2B2B2B]/60 font-light">{data.desc}</p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 pt-4">
          {data.sections.map((sec, i) => (
            <div key={i} className="space-y-2">
              <h3 className="text-sm font-bold text-[#2D5A27] uppercase tracking-wider">{sec.h}</h3>
              <p className="text-xs sm:text-sm text-[#2B2B2B]/85 leading-relaxed font-light">{sec.p}</p>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
