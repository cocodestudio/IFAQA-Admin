'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/admin-auth';
import { triggerNavigationProgress } from '@/lib/nav-progress';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useAdminAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ifaqa_admin_sidebar_collapsed');
      if (saved === 'true') setSidebarCollapsed(true);
    } catch {}
  }, []);

  const handleToggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ifaqa_admin_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!loading && !session && !isLoginPage) {
      triggerNavigationProgress('/login');
      router.push('/login');
    }
  }, [loading, session, isLoginPage, router]);

  if (isLoginPage) {
    return <main className="min-h-screen bg-ifaqa-linen text-ifaqa-plum">{children}</main>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ifaqa-linen flex flex-col items-center justify-center p-6 text-ifaqa-plum">
        <div className="w-8 h-8 rounded-full border-2 border-ifaqa-plum/15 border-t-ifaqa-plum animate-spin mb-4" />
        <span className="font-sans text-sm text-[#5A6962]">
          Verifying administrative access
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-ifaqa-linen flex flex-col items-center justify-center p-6 text-ifaqa-plum">
        <span className="font-sans text-sm text-[#5A6962]">
          Redirecting to sign in
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ifaqa-linen text-ifaqa-plum flex w-full">
      <AdminSidebar
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6">
          <div key={pathname} className="admin-enter w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
