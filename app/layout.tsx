import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/admin-auth';
import { AdminLayoutShell } from '@/components/layout/AdminLayoutShell';

export const metadata: Metadata = {
  title: 'IFAQA Herbal Remedies — Dispensary Governance Portal',
  description: 'Administrative portal for classical Unani formulation compounding, inventory management, and fulfillment.',
  icons: {
    icon: '/images/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F7EFE7] text-[#3E3239] antialiased selection:bg-[#C7A9A3] selection:text-[#3E3239]">
        <AuthProvider>
          <AdminLayoutShell>
            {children}
          </AdminLayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
