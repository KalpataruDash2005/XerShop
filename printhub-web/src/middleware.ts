import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/_not-found',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith('/_next/') || pathname.startsWith('/api/'));

  if (isPublic) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('printhub-auth-token');
  if (!authCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
