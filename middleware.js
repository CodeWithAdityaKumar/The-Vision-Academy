import { NextResponse } from 'next/server';

export async function middleware(request) {
  // Get the Firebase auth token from cookies
  const token = request.cookies.get('firebase-token');
  const path = request.nextUrl.pathname;

  // Protected routes
  const protectedPaths = [
    '/pages/live-classes',
    '/pages/live-classes/',
  ];

  if (protectedPaths.some(route => path.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/pages/account/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/pages/live-classes/:path*',
  ],
};