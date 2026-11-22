import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths
  const publicPaths = ['/login', '/_next', '/favicon.ico', '/images'];
  const isPublic = publicPaths.some(p => pathname.startsWith(p));

  if (isPublic) {
    return NextResponse.next();
  }

  // Check admin session cookie
  const sessionCookie = request.cookies.get('ifaqa_admin_session');

  if (!sessionCookie || !sessionCookie.value) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
};
