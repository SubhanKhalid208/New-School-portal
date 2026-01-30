import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Cookies se session aur role check karna
  const userId = request.cookies.get('userId')?.value;
  const role = request.cookies.get('role')?.value;

  // 1. Agar user login nahi hai aur dashboard pe jaane ki koshish kare
  if (!userId && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Role-based protection (Maslan: Student Admin page na khol sakay)
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Ye define karta hai ke middleware kin pages pe chalay ga
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/teacher/:path*'],
};