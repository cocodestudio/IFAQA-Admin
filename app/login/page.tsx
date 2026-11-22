'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { AlertCircle, Shield, KeyRound, Phone, Lock } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const { loginWithCredentials, loginWithPhoneOtp, error: authError } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('admin@ifaqaremedies.com');
  const [password, setPassword] = useState('ImperialDawakhana2026!');
  const [phone, setPhone] = useState('+923001234567');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpired) {
      setLocalError('Your administrative session has expired. Please re-authenticate.');
    }
  }, [isExpired]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithCredentials(email, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithPhoneOtp(phone, otp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OTP Verification failed';
      setLocalError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillChiefHakeemDemo = () => {
    setActiveTab('credentials');
    setEmail('admin@ifaqaremedies.com');
    setPassword('ImperialDawakhana2026!');
  };

  return (
    <div className="w-full max-w-md bg-[#F7EFE7] border border-[#C7A9A3] shadow-2xl relative z-10 overflow-hidden">
      {/* Brand Card Header */}
      <div className="p-8 text-center bg-[#3E3239] text-[#F7EFE7] border-b border-[#6B5560]/40">
        <div className="mx-auto w-36 h-16 flex items-center justify-center mb-3">
          <img
            src="/images/logo.png"
            alt="IFAQA Herbal Remedies"
            className="max-h-full max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
          />
        </div>
        <h1 className="font-serif text-lg font-bold tracking-[0.2em] uppercase">
          IFAQA HERBAL REMEDIES
        </h1>
        <p className="text-xs font-mono tracking-widest text-[#C7A9A3] uppercase mt-1">
          Administrative Management Portal
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 border border-[#C7A9A3]/30 bg-[#6B5560]/30 text-[10px] font-mono text-[#C7A9A3]">
          <Shield className="w-3 h-3 text-emerald-400" />
          <span>PORT 3001 &bull; RESTRICTED ACCESS</span>
        </div>
      </div>

      {/* Alerts */}
      {(localError || authError) && (
        <div className="p-4 bg-red-50 border-b border-red-200 text-red-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0 mt-0.5" />
          <span className="font-medium">{localError || authError}</span>
        </div>
      )}

      {/* Tab Switcher (Sharp rectangular tabs, ZERO PILLS) */}
      <div className="grid grid-cols-2 border-b border-[#C7A9A3]/40 bg-[#E8D2C4]/20 text-xs font-serif uppercase tracking-wider">
        <button
          type="button"
          onClick={() => { setActiveTab('credentials'); setLocalError(null); }}
          className={`py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'credentials'
              ? 'bg-[#F7EFE7] text-[#3E3239] border-b-2 border-[#3E3239]'
              : 'text-[#6B5560] hover:text-[#3E3239]'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Credentials</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('otp'); setLocalError(null); }}
          className={`py-3 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'otp'
              ? 'bg-[#F7EFE7] text-[#3E3239] border-b-2 border-[#3E3239]'
              : 'text-[#6B5560] hover:text-[#3E3239]'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Phone OTP</span>
        </button>
      </div>

      {/* Tab 1: Credentials Form */}
      {activeTab === 'credentials' && (
        <form onSubmit={handleCredentialsSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
              Admin Email / Whitelist Identifier
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@ifaqaremedies.com"
              className="w-full px-3.5 py-2.5 bg-[#F7EFE7] border border-[#C7A9A3] text-sm text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-[#F7EFE7] border border-[#C7A9A3] text-sm text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-widest font-bold hover:bg-[#6B5560] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Enter Dispensary Governance'}</span>
          </button>
        </form>
      )}

      {/* Tab 2: Phone OTP Form */}
      {activeTab === 'otp' && (
        <form onSubmit={handleOtpSubmit} className="p-8 space-y-5">
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
              Registered Admin Phone (e.g. +923001234567)
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+923001234567 or 03001234567"
              className="w-full px-3.5 py-2.5 bg-[#F7EFE7] border border-[#C7A9A3] text-sm text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#3E3239]">
              6-Digit Security Code (OTP)
            </label>
            <input
              type="text"
              maxLength={6}
              required
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full px-3.5 py-2.5 bg-[#F7EFE7] border border-[#C7A9A3] text-sm font-mono tracking-widest text-[#3E3239] focus:outline-none focus:border-[#3E3239]"
            />
            <p className="text-[11px] text-[#9E8189]">
              Demo verification code: <code className="font-mono font-bold text-[#3E3239]">123456</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 border border-[#3E3239] bg-[#3E3239] text-[#F7EFE7] text-xs font-serif uppercase tracking-widest font-bold hover:bg-[#6B5560] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>{loading ? 'Verifying OTP...' : 'Verify & Authorize'}</span>
          </button>
        </form>
      )}

      {/* Quick Demo Credentials Footer */}
      <div className="p-4 border-t border-[#C7A9A3]/40 bg-[#E8D2C4]/20 text-center">
        <button
          type="button"
          onClick={fillChiefHakeemDemo}
          className="text-xs font-serif text-[#6B5560] hover:text-[#3E3239] underline tracking-wider"
        >
          Pre-fill Chief Hakeem Tariq Demo Credentials
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7EFE7] flex flex-col justify-center items-center p-6 relative">
      <div className="absolute inset-0 bg-gradient-mauve-reserve opacity-5 pointer-events-none" />
      <Suspense fallback={
        <div className="w-full max-w-md bg-[#F7EFE7] border border-[#C7A9A3] p-12 text-center text-[#3E3239]">
          <div className="w-8 h-8 border-2 border-[#C7A9A3] border-t-[#3E3239] animate-spin mx-auto mb-4" />
          <span className="font-serif text-sm tracking-wider uppercase">Loading Portal Access...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
