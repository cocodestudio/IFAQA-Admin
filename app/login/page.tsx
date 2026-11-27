'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { AlertCircle, KeyRound, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const { loginWithCredentials, loginWithPhoneOtp, error: authError } = useAdminAuth();

  const [activeTab, setActiveTab] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('admin@ifaqaremedies.com');
  const [password, setPassword] = useState('ImperialDawakhana2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('+919729840336');
  const [otp, setOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isExpired) {
      setLocalError('Your session expired. Sign in again to continue.');
    }
  }, [isExpired]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);
    try {
      await loginWithCredentials(email, password);
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Sign in failed');
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
      setLocalError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const fillChiefHakeemDemo = () => {
    setActiveTab('credentials');
    setEmail('admin@ifaqaremedies.com');
    setPassword('ImperialDawakhana2026!');
    setLocalError(null);
  };

  return (
    <div className="min-h-screen bg-ifaqa-linen flex items-center justify-center p-4 sm:p-6 lg:p-10">
      <div className="w-full max-w-[1120px] bg-white rounded-2xl border border-ifaqa-plum/10 shadow-luxury-lifted overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Botanical World Panel */}
        <div className="lg:col-span-6 relative bg-ifaqa-cashmere p-7 sm:p-10 flex flex-col justify-between min-h-[260px] lg:min-h-[600px] border-b lg:border-b-0 lg:border-e border-ifaqa-plum/10 overflow-hidden">
          {/* Calm blended background photograph */}
          <img
            src="/images/hero-botanical.jpg"
            alt="Amber apothecary jar with green lid, cardamom, saffron, dried herbal roots, and brass spoon"
            className="hidden sm:block absolute inset-0 w-full h-full object-cover object-center opacity-25 pointer-events-none"
          />
          <div
            className="hidden sm:block absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(245,240,230,0.92) 0%, rgba(245,240,230,0.68) 55%, rgba(245,240,230,0.94) 100%)',
            }}
          />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-ifaqa-plum/10">
              <img
                src="/images/logo-framed.jpg"
                alt="IFAQA Herbal Remedies"
                className="h-9 w-auto object-contain"
              />
            </div>

            <div className="space-y-2 max-w-md">
              <p className="text-xs font-medium text-[#5A6962]">
                Saharanpur botanical house
              </p>
              <h1 className="font-serif font-normal text-3xl sm:text-4xl text-ifaqa-plum leading-[1.15]">
                Dispensary operations portal
              </h1>
              <p className="text-sm text-[#3E524A] leading-relaxed">
                Manage formulations, health categories, storefront banners, customer orders, product reviews, and support tickets in one place.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-6 grid grid-cols-3 gap-4 border-t border-ifaqa-plum/10 text-xs">
            <div>
              <div className="font-serif text-lg text-ifaqa-plum tabular-nums">31</div>
              <div className="text-[#5A6962]">Remedies</div>
            </div>
            <div>
              <div className="font-serif text-lg text-ifaqa-plum tabular-nums">6</div>
              <div className="text-[#5A6962]">Categories</div>
            </div>
            <div>
              <div className="font-serif text-lg text-ifaqa-plum tabular-nums">INR ₹</div>
              <div className="text-[#5A6962]">Dispatch currency</div>
            </div>
          </div>
        </div>

        {/* Right Sign-in Form */}
        <div className="lg:col-span-6 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-6">
            <div>
              <h2 className="font-serif font-normal text-2xl sm:text-3xl text-ifaqa-plum">
                Sign in to admin
              </h2>
              <p className="text-sm text-[#5A6962] mt-1">
                Use your staff email or verified mobile number
              </p>
            </div>

            {(localError || authError) && (
              <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-red-900 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>{localError || authError}</span>
              </div>
            )}

            {/* Segmented Control */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-ifaqa-cashmere border border-ifaqa-plum/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('credentials');
                  setLocalError(null);
                }}
                className={`h-9 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'credentials'
                    ? 'bg-white text-ifaqa-plum shadow-luxury-card'
                    : 'text-[#5A6962] hover:text-ifaqa-plum'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Email & password</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('otp');
                  setLocalError(null);
                }}
                className={`h-9 rounded-md transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'otp'
                    ? 'bg-white text-ifaqa-plum shadow-luxury-card'
                    : 'text-[#5A6962] hover:text-ifaqa-plum'
                }`}
              >
                <Phone className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Phone OTP</span>
              </button>
            </div>

            {activeTab === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ifaqa-plum">
                    Staff email address
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ifaqaremedies.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ifaqa-plum/15 text-sm text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum focus:ring-2 focus:ring-ifaqa-plum/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ifaqa-plum">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white border border-ifaqa-plum/15 text-sm text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum focus:ring-2 focus:ring-ifaqa-plum/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#5A6962] hover:text-ifaqa-plum"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                      ) : (
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" strokeWidth={1.5} />
                  <span>{loading ? 'Signing in...' : 'Sign in to workspace'}</span>
                </button>
              </form>
            )}

            {activeTab === 'otp' && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ifaqa-plum">
                    Registered staff mobile
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919729840336"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ifaqa-plum/15 text-sm font-mono tabular-nums text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum focus:ring-2 focus:ring-ifaqa-plum/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-ifaqa-plum">
                    6-digit verification code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ifaqa-plum/15 text-sm font-mono tracking-widest tabular-nums text-ifaqa-plum focus:outline-none focus:border-ifaqa-plum focus:ring-2 focus:ring-ifaqa-plum/15"
                  />
                  <p className="text-xs text-[#5A6962]">
                    Local test code: <span className="font-mono text-ifaqa-plum">123456</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & sign in'}</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-ifaqa-plum/10 flex items-center justify-between text-xs">
              <span className="text-[#5A6962]">Demo access</span>
              <button
                type="button"
                onClick={fillChiefHakeemDemo}
                className="text-ifaqa-plum font-medium hover:text-[#165A45] underline"
              >
                Use staff test credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ifaqa-linen flex items-center justify-center p-6">
          <span className="text-sm text-[#5A6962]">Loading sign in</span>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
