import { NextResponse } from 'next/server';

export async function middleware(request) {
  const token = request.cookies.get('firebase-token');
  const path = request.nextUrl.pathname;

  // Protected routes
  const protectedPaths = [
    '/pages/live-classes',
    '/pages/live-classes/',
    '/pages/notes-books',
    '/pages/notes-books/',
  ];

  if (protectedPaths.some(route => path.startsWith(route)) && !token) {
    return NextResponse.redirect(new URL('/pages/account/login', request.url));
  }

  return NextResponse.next();
}