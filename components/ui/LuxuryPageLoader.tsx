'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { NAV_START_EVENT } from '@/lib/nav-progress';

const DATA_HEAVY_ADMIN_PREFIXES = [
  '/remedies',
  '/orders',
  '/customers',
  '/categories',
  '/banners',
  '/reviews',
  '/support',
];

function isDataHeavyAdminRoute(href: string): boolean {
  const path = (href || '').split('?')[0].toLowerCase();
  if (path === '/' || path === '/account' || path === '/login') return false;
  return DATA_HEAVY_ADMIN_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function resolveAdminRouteLabel(href: string): string {
  const path = href.toLowerCase();

  if (path.includes('/remedies/new')) return 'Preparing new formulation form...';
  if (path.includes('/remedies/') && path.includes('/edit')) return 'Opening formulation editor...';
  if (path.includes('/remedies')) return 'Loading herbal remedies...';
  if (path.includes('/categories/') && path.includes('/edit')) return 'Opening category editor...';
  if (path.includes('/categories')) return 'Loading health categories...';
  if (path.includes('/banners/new')) return 'Preparing banner studio...';
  if (path.includes('/banners/') && path.includes('/edit')) return 'Opening banner editor...';
  if (path.includes('/banners')) return 'Loading storefront banners...';
  if (path.includes('/orders/')) return 'Opening order fulfillment...';
  if (path.includes('/orders')) return 'Loading customer orders...';
  if (path.includes('/customers/')) return 'Opening customer dossier...';
  if (path.includes('/customers')) return 'Loading customers directory...';
  if (path.includes('/reviews')) return 'Loading product reviews...';
  if (path.includes('/support/')) return 'Opening support case...';
  if (path.includes('/support')) return 'Loading support tickets...';
  if (path.includes('/account')) return 'Opening admin account...';
  if (path.includes('/login')) return 'Opening admin sign in...';
  return 'Opening dashboard...';
}

/**
 * Smart Admin navigation indicator:
 * - Instant routes (/account, /login, Dashboard) and browser Back/Forward use ONLY top 3px progress bar.
 * - Data routes only show the frosted overlay if transition exceeds 240ms.
 */
export function LuxuryPageLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [barVisible, setBarVisible] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState('Opening dashboard...');

  const isFirstMount = useRef(true);
  const rampTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeNavRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (rampTimerRef.current) clearTimeout(rampTimerRef.current);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
  }, []);

  const finishNavigation = useCallback(() => {
    if (!activeNavRef.current) return;
    if (rampTimerRef.current) clearTimeout(rampTimerRef.current);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    setProgress(100);
    setCompleting(true);
    setOverlayVisible(false);

    hideTimerRef.current = setTimeout(() => {
      activeNavRef.current = false;
      setBarVisible(false);
      setCompleting(false);
      setProgress(0);
    }, 180);
  }, []);

  const startNavigation = useCallback(
    (targetHref: string, allowOverlay = true) => {
      clearTimers();
      activeNavRef.current = true;
      setStatusLabel(resolveAdminRouteLabel(targetHref));
      setCompleting(false);
      setOverlayVisible(false);
      setProgress(32);
      setBarVisible(true);

      rampTimerRef.current = setTimeout(() => {
        setProgress(74);
        rampTimerRef.current = setTimeout(() => {
          setProgress(90);
        }, 380);
      }, 60);

      if (allowOverlay && isDataHeavyAdminRoute(targetHref)) {
        overlayTimerRef.current = setTimeout(() => {
          if (activeNavRef.current) {
            setOverlayVisible(true);
          }
        }, 240);
      }

      safetyTimerRef.current = setTimeout(() => {
        finishNavigation();
      }, 4000);
    },
    [clearTimers, finishNavigation]
  );

  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const rawHref = anchor.getAttribute('href');
      if (
        !rawHref ||
        rawHref.startsWith('#') ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;

        const isSameRoute =
          nextUrl.pathname === window.location.pathname &&
          nextUrl.search === window.location.search;
        if (isSameRoute) return;

        startNavigation(nextUrl.pathname + nextUrl.search, true);
      } catch {
        // Ignore malformed URLs
      }
    };

    const handleCustomNavStart = (e: Event) => {
      const customEv = e as CustomEvent<{ href?: string }>;
      startNavigation(customEv.detail?.href || '', true);
    };

    const handlePopState = () => {
      startNavigation(window.location.pathname + window.location.search, false);
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener(NAV_START_EVENT, handleCustomNavStart);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener(NAV_START_EVENT, handleCustomNavStart);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [startNavigation]);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    if (activeNavRef.current) {
      finishNavigation();
    } else {
      startNavigation(pathname || '/', false);
      setTimeout(() => finishNavigation(), 80);
    }
  }, [pathname, searchParams, startNavigation, finishNavigation]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  if (!barVisible && !overlayVisible) return null;

  return (
    <>
      {barVisible && (
        <div
          aria-hidden="true"
          className={`fixed top-0 inset-x-0 z-[70] h-[3px] bg-ifaqa-plum/10 pointer-events-none transition-opacity duration-150 ${
            completing ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div
            style={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-ifaqa-plum via-ifaqa-blackberry to-ifaqa-mauve transition-[width] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
        </div>
      )}

      {overlayVisible && (
        <div
          role="status"
          aria-live="polite"
          aria-label={statusLabel}
          className="fixed inset-0 z-[65] flex flex-col items-center justify-center backdrop-blur-[4px] bg-ifaqa-linen/50 pointer-events-auto transition-opacity duration-150 select-none"
        >
          <div className="flex flex-col items-center gap-3.5 px-6 text-center select-none">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg
                viewBox="0 0 64 64"
                className="w-12 h-12 animate-[spin_2.2s_linear_infinite]"
                aria-hidden="true"
              >
                <polygon
                  points="32,6 56,48 8,48"
                  fill="none"
                  stroke="#0B2D22"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                viewBox="0 0 64 64"
                className="w-8 h-8 absolute animate-[spin_1.6s_linear_infinite_reverse]"
                aria-hidden="true"
              >
                <polygon
                  points="32,12 50,46 14,46"
                  fill="none"
                  stroke="#C5A059"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="w-2 h-2 rounded-sm rotate-45 bg-ifaqa-plum absolute" />
            </div>

            <p className="font-sans text-xs sm:text-sm font-medium text-ifaqa-plum tracking-wide">
              {statusLabel}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
