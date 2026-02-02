import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Cookies se user data lein
  const userId = request.cookies.get('userId')?.value;
  const role = request.cookies.get('role')?.value;

  // 1. Agar user login NAHI hai aur woh protected pages pe jana chahta hai
  if (!userId && (pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Role-based Protection: User ko uske sahi dashboard se bahar na nikalne dein
  
  // Agar student Admin ya Teacher page kholne ki koshish kare
  if (role === 'student' && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
    return NextResponse.redirect(new URL(`/dashboard/student/${userId}`, request.url));
  }

  // Agar Teacher Admin page kholne ki koshish kare
  if (role === 'teacher' && pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/teacher', request.url));
  }

  // Agar Admin student dashboard pe jaye (optional, lekin cleanliness ke liye)
  if (role === 'admin' && pathname.startsWith('/dashboard/student')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Ensure karein ke matcher mein saare protected paths shamil hain
export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/teacher/:path*'],
};