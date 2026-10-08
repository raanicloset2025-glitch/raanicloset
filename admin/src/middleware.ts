import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path.startsWith('/api/');

  const response = NextResponse.next();
  response.headers.set('x-admin-route', path);

  // If path is protected, ensure downstream proxies or clients do not cache dynamic admin HTML
  if (!isPublicPath) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)'],
};
