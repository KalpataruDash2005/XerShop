import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MAINTENANCE_MODE = true;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname === '/maintenance') {
    return NextResponse.next();
  }

  if (MAINTENANCE_MODE) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>PrintHub - Maintenance</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f8fafc; }
    .container { text-align: center; padding: 2rem; max-width: 480px; }
    .logo { font-size: 2rem; font-weight: 800; color: #2F6FED; margin-bottom: 1.5rem; }
    h1 { font-size: 1.5rem; color: #1a2740; margin-bottom: 0.75rem; }
    p { color: #64748b; line-height: 1.6; margin-bottom: 0.5rem; }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">PrintHub</div>
    <h1>Under Maintenance</h1>
    <p>We're making some improvements to serve you better.</p>
    <p>Please check back soon!</p>
  </div>
</body>
</html>`,
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/_not-found'];

  const isPublic = publicRoutes.some(route => pathname === route);

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
