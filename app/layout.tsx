import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import { Newsreader, Plus_Jakarta_Sans, IBM_Plex_Mono, Noto_Nastaliq_Urdu } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/admin-auth';
import { AdminLayoutShell } from '@/components/layout/AdminLayoutShell';
import { LuxuryPageLoader } from '@/components/ui/LuxuryPageLoader';

const displaySerif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const interfaceSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
});

const metaMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

const urduNastaliq = Noto_Nastaliq_Urdu({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-urdu',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'IFAQA Herbal Remedies | Dispensary Admin',
  description:
    'Administrative workspace for IFAQA Herbal Remedies formulations, catalog categories, customer orders, reviews, and support.',
  icons: {
    icon: '/images/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${displaySerif.variable} ${interfaceSans.variable} ${metaMono.variable} ${urduNastaliq.variable}`}
    >
      <body className="bg-ifaqa-linen text-ifaqa-plum font-sans antialiased select-none selection:bg-ifaqa-plum selection:text-ifaqa-linen overflow-x-clip">
        <AuthProvider>
          <Suspense fallback={null}>
            <LuxuryPageLoader />
          </Suspense>
          <AdminLayoutShell>{children}</AdminLayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
