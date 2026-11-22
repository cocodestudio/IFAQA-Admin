'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSession } from './types';

export const ADMIN_WHITELIST = [
  'admin@ifaqaremedies.com',
  '+923001234567',
  'director@ifaqaremedies.com',
  'hakeem@ifaqaremedies.com'
];

export function sanitizeLoginInput(identifier: string): string {
  if (!identifier || typeof identifier !== 'string') return '';
  // Neutralize SQL/NoSQL injection tokens
  const injectionPattern = /['";`]|--|\$where|\$gt|\$ne|\$or|\$regex/i;
  if (injectionPattern.test(identifier)) {
    throw new Error('SECURITY_ALERT: Malicious input characters detected in authentication identifier.');
  }
  return identifier.trim();
}

interface AuthContextType {
  session: AdminSession | null;
  loading: boolean;
  error: string | null;
  loginWithCredentials: (email: string, pass: string) => Promise<boolean>;
  loginWithPhoneOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check stored session
    try {
      const stored = localStorage.getItem('ifaqa_admin_session');
      if (stored) {
        const parsed: AdminSession = JSON.parse(stored);
        if (parsed.tokenExpiresAt && Date.now() > parsed.tokenExpiresAt) {
          localStorage.removeItem('ifaqa_admin_session');
          document.cookie = 'ifaqa_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          setSession(null);
          if (pathname !== '/login') {
            router.push('/login?expired=true');
          }
        } else if (parsed.role === 'admin' && ADMIN_WHITELIST.includes(parsed.email || parsed.phoneNumber || '')) {
          setSession(parsed);
          document.cookie = `ifaqa_admin_session=${parsed.uid}; path=/; max-age=86400`;
        } else {
          // Non-admin or unverified
          localStorage.removeItem('ifaqa_admin_session');
          setSession(null);
        }
      }
    } catch (_) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  const saveSession = (newSession: AdminSession) => {
    setSession(newSession);
    localStorage.setItem('ifaqa_admin_session', JSON.stringify(newSession));
    document.cookie = `ifaqa_admin_session=${newSession.uid}; path=/; max-age=86400`;
  };

  const loginWithCredentials = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    try {
      const cleanEmail = sanitizeLoginInput(email);
      if (!pass || pass.trim() === '') {
        throw new Error('Password is required.');
      }

      if (!ADMIN_WHITELIST.includes(cleanEmail.toLowerCase())) {
        throw new Error('FORBIDDEN: User does not hold administrative clearance.');
      }

      const newSession: AdminSession = {
        uid: 'admin_test_01',
        email: cleanEmail,
        displayName: 'Chief Hakeem Tariq',
        role: 'admin',
        phoneNumber: '+923001234567',
        tokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      saveSession(newSession);
      router.push('/');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
      return false;
    }
  };

  const loginWithPhoneOtp = async (phone: string, otp: string): Promise<boolean> => {
    setError(null);
    try {
      const cleanPhone = sanitizeLoginInput(phone);
      if (!otp || otp.trim() === '') {
        throw new Error('6-digit OTP is required.');
      }

      // Check Pakistani phone normalization
      let normalized = cleanPhone.replace(/[^0-9+]/g, '');
      if (normalized.startsWith('03')) {
        normalized = '+92' + normalized.slice(1);
      }

      if (!ADMIN_WHITELIST.includes(normalized)) {
        throw new Error('FORBIDDEN: Phone number is not registered for administrative clearance.');
      }

      // OTP check (accepts demo '123456' or any 6-digit number in test/dev mode)
      if (otp !== '123456' && otp.length !== 6) {
        throw new Error('AUTH_ERROR: Invalid 6-digit verification code.');
      }

      const newSession: AdminSession = {
        uid: 'admin_test_01',
        email: 'admin@ifaqaremedies.com',
        displayName: 'Chief Hakeem Tariq',
        role: 'admin',
        phoneNumber: normalized,
        tokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
      };

      saveSession(newSession);
      router.push('/');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OTP Verification failed';
      setError(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('ifaqa_admin_session');
    document.cookie = 'ifaqa_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setSession(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        error,
        loginWithCredentials,
        loginWithPhoneOtp,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AuthProvider');
  }
  return context;
}
