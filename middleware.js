import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request) {
  // Get the user's session token from cookies
  const token = request.cookies.get('session');

  // Protected routes
  const protectedPaths = [
    '/pages/live-classes',
    '/pages/live-classes/',
  ];

  if (protectedPaths.includes(request.nextUrl.pathname) && !token) {
    return NextResponse.redirect(new URL('/pages/account/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/pages/live-classes/:path*',
  ],
};