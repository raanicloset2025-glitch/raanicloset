import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicPath = path === '/login' || path.startsWith('/api/');
  const session = request.cookies.get('admin_session')?.value;

  if (!isPublicPath && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (path === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)'],
};
