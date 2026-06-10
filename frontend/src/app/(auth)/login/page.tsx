'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Mail, Lock, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sendOtp, verifyOtp, user } = useAuth();

  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  // Redirect if user already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user]);

  // UI Modes
  const [authMode, setAuthMode] = useState<'password' | 'otp'>('password');
  
  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // Execution states
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendOtp(email);
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(email, otp);
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4 font-sans space-y-6">
      <div className="bg-white border border-[#F5EFE2] rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold text-[#C9A227] tracking-widest uppercase">Sign In</span>
          <h1 className="text-2xl font-serif font-bold text-[#2D5A27] flex items-center justify-center gap-1">
            DVYUG Wellness Portal
            <Sparkles className="w-4 h-4 text-[#C9A227]" />
          </h1>
          <p className="text-xs text-[#2B2B2B]/60 font-light">Access your order history, subscriptions, and loyalty points.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex bg-[#F5EFE2] p-1 rounded-lg border border-[#e2dccf]">
          <button
            onClick={() => { setAuthMode('password'); setError(''); setOtpSent(false); }}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${authMode === 'password' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]'}`}
          >
            Password
          </button>
          <button
            onClick={() => { setAuthMode('otp'); setError(''); }}
            className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${authMode === 'otp' ? 'bg-[#2D5A27] text-white' : 'text-[#2B2B2B]'}`}
          >
            OTP Code
          </button>
        </div>

        {/* --- FORM 1: CREDENTIALS LOGIN --- */}
        {authMode === 'password' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Password</label>
                <span className="text-[9px] text-[#2B2B2B]/60 cursor-not-allowed">Forgot Password?</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] pl-8 text-[#2B2B2B]"
                />
                <Lock className="w-4 h-4 text-[#2B2B2B]/40 absolute left-2.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-1"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        )}

        {/* --- FORM 2: OTP SIGN IN --- */}
        {authMode === 'otp' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
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
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-1"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send OTP Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="bg-[#F5EFE2] p-4 rounded-xl text-[11px] text-[#2B2B2B]/75 leading-relaxed font-light border border-[#e2dccf]">
                  We have simulated sending a 6-digit OTP verification code to <strong>{email}</strong>. 
                  <br />
                  <span className="text-[#2D5A27] font-semibold mt-1 block">Check Express console logs OR type '123456' for immediate bypass.</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#2B2B2B] uppercase block">Enter OTP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#FAF8F2] text-xs px-3 py-2.5 rounded-lg border border-[#c3bdad] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] text-center font-bold tracking-widest text-[#2B2B2B]"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button type="button" onClick={() => setOtpSent(false)} className="text-[10px] font-semibold text-[#2D5A27] hover:underline">
                    Change Email
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#2D5A27] hover:bg-[#C9A227] text-white font-bold uppercase tracking-wider text-xs rounded-full shadow-md transition-colors flex items-center justify-center gap-1"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify Code & Login'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Simulated Google SSO Auth */}
        <div className="relative border-t border-[#F5EFE2] pt-4 mt-6">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[10px] text-[#2B2B2B]/40 font-light uppercase">
            or connect with
          </div>
          <button
            onClick={async () => {
              setLoading(true);
              try {
                // Simulate OAuth callback success login
                await login('user@dvyug.com', 'user123');
                router.push(redirectUrl);
              } catch (err) {
                setError('Simulated OAuth failed');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full border border-[#FAF8F2] hover:bg-[#FAF8F2] py-2.5 rounded-full text-xs font-semibold text-[#2B2B2B] shadow-sm transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-4.5 h-4.5 text-[#C9A227]" />
            Sign In with Google Account
          </button>
        </div>

      </div>

      <div className="text-center text-xs text-[#2B2B2B]/70 font-light">
        New to DVYUG?{' '}
        <Link href={`/signup?redirect=${encodeURIComponent(redirectUrl)}`} className="text-[#2D5A27] font-semibold hover:underline">
          Create a wellness profile
        </Link>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="max-w-md mx-auto my-16 px-4 font-sans text-center text-xs text-[#2B2B2B]/60">
        Loading login form...
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
