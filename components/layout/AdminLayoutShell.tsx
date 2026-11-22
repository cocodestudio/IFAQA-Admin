'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useAdminAuth();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!loading && !session && !isLoginPage) {
      router.push('/login');
    }
  }, [loading, session, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#F7EFE7]">{children}</main>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7EFE7] flex flex-col items-center justify-center p-6 text-[#3E3239]">
        <div className="w-12 h-12 border-2 border-[#C7A9A3] border-t-[#3E3239] animate-spin mb-4" />
        <span className="font-serif tracking-widest text-sm uppercase font-semibold">
          Verifying Dispensary Clearance...
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F7EFE7] flex flex-col items-center justify-center p-6 text-[#3E3239]">
        <span className="font-serif tracking-widest text-sm uppercase">
          Redirecting to Authentication...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7EFE7] flex text-[#3E3239]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
