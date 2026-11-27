'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminAuth } from '@/lib/admin-auth';
import { getDispensaryKPIs } from '@/lib/data-service';
import { DispensaryKPIs } from '@/lib/types';
import { FormInput, FormSelect } from '@/components/ui/FormInput';
import { NotchedBadge } from '@/components/ui/ArchitecturalBadge';
import {
  ShieldCheck,
  UserCheck,
  Save,
  CheckCircle2,
  LogOut,
  Package,
  FlaskConical,
  Tags,
  LifeBuoy,
  KeyRound,
} from 'lucide-react';

export default function AdminAccountPage() {
  const { session, preferences, updateAdminProfile, logout } = useAdminAuth();

  const [displayName, setDisplayName] = useState(session?.displayName || 'Chief Hakeem Tariq');
  const [designation, setDesignation] = useState(preferences.designation);
  const [phoneNumber, setPhoneNumber] = useState(session?.phoneNumber || '+919729840336');
  const [clinicPhone, setClinicPhone] = useState(preferences.clinicPhone);
  const [clinicLocation, setClinicLocation] = useState(preferences.clinicLocation);
  const [defaultCourier, setDefaultCourier] = useState(preferences.defaultCourier);
  const [lowStockThreshold, setLowStockThreshold] = useState(preferences.lowStockThreshold);

  const [savedBanner, setSavedBanner] = useState(false);
  const [kpis, setKpis] = useState<DispensaryKPIs | null>(null);

  useEffect(() => {
    if (session?.displayName) setDisplayName(session.displayName);
    if (session?.phoneNumber) setPhoneNumber(session.phoneNumber);
  }, [session]);

  useEffect(() => {
    setDesignation(preferences.designation);
    setClinicPhone(preferences.clinicPhone);
    setClinicLocation(preferences.clinicLocation);
    setDefaultCourier(preferences.defaultCourier);
    setLowStockThreshold(preferences.lowStockThreshold);
  }, [preferences]);

  useEffect(() => {
    getDispensaryKPIs().then(setKpis).catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminProfile({
      displayName: displayName.trim() || 'Chief Hakeem Tariq',
      phoneNumber: phoneNumber.trim(),
      designation: designation.trim() || 'Administrator',
      clinicPhone: clinicPhone.trim(),
      clinicLocation: clinicLocation.trim(),
      defaultCourier,
      lowStockThreshold: Math.max(1, Number(lowStockThreshold) || 10),
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2600);
  };

  const sessionExpiry = session?.tokenExpiresAt
    ? new Date(session.tokenExpiresAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '24h active token';

  const initials = (displayName || 'HT')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="space-y-6 w-full">
      {/* Top Profile Banner */}
      <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-ifaqa-plum text-ifaqa-linen flex items-center justify-center font-serif text-xl shrink-0">
            {initials || 'HT'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-serif font-normal text-2xl text-ifaqa-plum">{displayName}</h2>
              <NotchedBadge variant="sand">Super Admin</NotchedBadge>
            </div>
            <p className="text-xs text-[#5A6962] mt-0.5">
              {session?.email || 'admin@ifaqaremedies.com'} • {phoneNumber}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="h-9 px-4 rounded-lg border border-red-200 bg-red-50/70 text-red-900 text-xs font-medium hover:bg-red-100 transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.6} />
          <span>Sign out of portal</span>
        </button>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-xl border border-[#165A45]/25 bg-[#EEF4F1] text-ifaqa-plum text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#165A45] shrink-0" strokeWidth={1.6} />
          <span>Admin profile and dispensary preferences saved</span>
        </div>
      )}

      {/* Main 12-col Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Profile & Operations Preferences Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-5"
        >
          <div className="flex items-center gap-2.5 border-b border-ifaqa-plum/10 pb-3">
            <UserCheck className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
            <div>
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
                Administrator identity & settings
              </h3>
              <p className="text-xs text-[#5A6962]">
                Manage display credentials and default order workflow settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full display name *"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <FormInput
              label="Title / Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Registered admin email"
              disabled
              className="bg-ifaqa-linen/70 text-[#5A6962]"
              value={session?.email || 'admin@ifaqaremedies.com'}
              helperText="Locked to Firebase Admin whitelist"
            />
            <FormInput
              label="Verified mobile number"
              className="font-mono tabular-nums"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-ifaqa-plum/10">
            <FormInput
              label="Dispensary helpline phone"
              className="font-mono tabular-nums"
              value={clinicPhone}
              onChange={(e) => setClinicPhone(e.target.value)}
            />
            <FormInput
              label="Dispensary address / city"
              value={clinicLocation}
              onChange={(e) => setClinicLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Default courier partner"
              value={defaultCourier}
              onChange={(e) => setDefaultCourier(e.target.value)}
            >
              <option value="Delhivery">Delhivery Express</option>
              <option value="BlueDart">BlueDart Surface / Air</option>
              <option value="DTDC">DTDC Courier</option>
              <option value="India Post">India Post Speed Post</option>
              <option value="TCS Express">TCS Express</option>
            </FormSelect>

            <FormInput
              label="Low stock alert threshold"
              type="number"
              min="1"
              max="100"
              className="font-mono tabular-nums"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(parseInt(e.target.value, 10) || 10)}
              helperText="Alerts appear on dashboard below this count"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-ifaqa-plum/10">
            <button
              type="submit"
              className="h-10 px-5 rounded-lg bg-ifaqa-plum text-ifaqa-linen text-sm font-medium hover:bg-[#165A45] transition-colors inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" strokeWidth={1.6} />
              <span>Save profile changes</span>
            </button>
          </div>
        </form>

        {/* Right: Security & Workspace Overview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Security & Session */}
          <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <div className="flex items-center gap-2.5 border-b border-ifaqa-plum/10 pb-3">
              <ShieldCheck className="w-4 h-4 text-[#165A45]" strokeWidth={1.6} />
              <h3 className="font-serif font-normal text-lg text-ifaqa-plum">
                Security & session
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-ifaqa-plum/5">
                <span className="text-[#5A6962]">Session UID</span>
                <span className="font-mono text-ifaqa-plum">{session?.uid || 'admin_test_01'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ifaqa-plum/5">
                <span className="text-[#5A6962]">Access clearance</span>
                <span className="font-medium text-[#165A45]">Full dispensary admin</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-ifaqa-plum/5">
                <span className="text-[#5A6962]">Session valid until</span>
                <span className="font-mono tabular-nums text-ifaqa-plum">{sessionExpiry}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#5A6962]">Firebase project</span>
                <span className="font-mono text-ifaqa-plum">ifaqa-herbal-remedies</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-ifaqa-linen border border-ifaqa-plum/10 flex items-start gap-2.5 text-xs text-[#3E524A]">
              <KeyRound className="w-4 h-4 text-ifaqa-mauve shrink-0 mt-0.5" strokeWidth={1.6} />
              <span>
                Whitelist clearance verifies both session cookies and Firebase administrative tokens across remedies, categories, banners, orders, reviews, and support tickets.
              </span>
            </div>
          </div>

          {/* Quick Module Links */}
          <div className="p-5 sm:p-6 bg-white rounded-xl border border-ifaqa-plum/10 shadow-luxury-card space-y-4">
            <h3 className="font-serif font-normal text-lg text-ifaqa-plum border-b border-ifaqa-plum/10 pb-3">
              Dispensary modules
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/remedies"
                className="p-3.5 rounded-xl bg-ifaqa-linen border border-ifaqa-plum/10 hover:border-ifaqa-plum/25 transition-colors space-y-1.5"
              >
                <FlaskConical className="w-4 h-4 text-[#165A45]" strokeWidth={1.6} />
                <div className="text-sm font-medium text-ifaqa-plum">Remedies</div>
                <div className="text-xs font-mono tabular-nums text-[#5A6962]">
                  {kpis?.totalRemedies ?? 31} listed
                </div>
              </Link>
              <Link
                href="/orders"
                className="p-3.5 rounded-xl bg-ifaqa-linen border border-ifaqa-plum/10 hover:border-ifaqa-plum/25 transition-colors space-y-1.5"
              >
                <Package className="w-4 h-4 text-ifaqa-mauve" strokeWidth={1.6} />
                <div className="text-sm font-medium text-ifaqa-plum">Orders</div>
                <div className="text-xs font-mono tabular-nums text-[#5A6962]">
                  {kpis?.pendingOrders ?? 0} pending
                </div>
              </Link>
              <Link
                href="/categories"
                className="p-3.5 rounded-xl bg-ifaqa-linen border border-ifaqa-plum/10 hover:border-ifaqa-plum/25 transition-colors space-y-1.5"
              >
                <Tags className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
                <div className="text-sm font-medium text-ifaqa-plum">Categories</div>
                <div className="text-xs font-mono tabular-nums text-[#5A6962]">6 active</div>
              </Link>
              <Link
                href="/support"
                className="p-3.5 rounded-xl bg-ifaqa-linen border border-ifaqa-plum/10 hover:border-ifaqa-plum/25 transition-colors space-y-1.5"
              >
                <LifeBuoy className="w-4 h-4 text-[#5A6962]" strokeWidth={1.6} />
                <div className="text-sm font-medium text-ifaqa-plum">Support</div>
                <div className="text-xs font-mono tabular-nums text-[#5A6962]">
                  {kpis?.openTickets ?? 0} open
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
