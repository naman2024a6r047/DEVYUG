'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, User as UserIcon, Phone, Tag, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, user } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // Redirect if user already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user]);

  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email, password, phone || undefined, referredBy || undefined);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 font-sans space-y-6">
      <div className="bg-white border border-[#F5EFE2] rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold text-[#C9A227] tracking-widest uppercase">Create Profile</span>
          <h1 className="text-2xl font-serif font-bold text-[#2D5A27] flex items-center justify-center gap-1">
            Join DVYUG Circle
            <Sparkles className="w-4 h-4 text-[#C9A227]" />
          </h1>
          <p className="text-xs text-[#2B2B2B]/60 font-light">Join for a spiritually aligned, healthy, organic lifestyle.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Rohan Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pl-8 text-[#2B2B2B]"
              />
              <UserIcon className="w-4 h-4 text-[#2B2B2B]/40 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pl-8 text-[#2B2B2B]"
              />
              <Mail className="w-4 h-4 text-[#2B2B2B]/40 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Choose a strong password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pl-8 text-[#2B2B2B]"
              />
              <Lock className="w-4 h-4 text-[#2B2B2B]/40 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Phone Number (Optional)</label>
            <div className="relative">
              <input
                type="tel"
                placeholder="+91 99999 99999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pl-8 text-[#2B2B2B]"
              />
              <Phone className="w-4 h-4 text-[#2B2B2B]/40 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Referral */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Referral Code (Optional)</label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. ROHAN100"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pl-8 text-[#2B2B2B] uppercase"
              />
              <Tag className="w-4 h-4 text-[#2B2B2B]/40 absolute left-2.5 top-3" />
            </div>
            <span className="text-[9px] text-[#2D5A27] font-medium block pl-1">
              Entering a valid referral code awards +50 points welcome bonus!
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-1"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Create Account'}
          </button>
        </form>

      </div>

      <div className="text-center text-xs text-[#2B2B2B]/70 font-light">
        Already have a profile?{' '}
        <Link href={`/login?redirect=${encodeURIComponent(redirectUrl)}`} className="text-[#2D5A27] font-semibold hover:underline">
          Sign In here
        </Link>
      </div>

    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto my-16 px-4 font-sans text-center text-xs text-[#2B2B2B]/60">
        Loading signup form...
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
