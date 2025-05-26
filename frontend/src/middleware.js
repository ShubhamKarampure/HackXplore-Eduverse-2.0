import { NextResponse } from 'next/server';

export function middleware(request) {
  // Get token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  
  // Explicitly compare with string 'true' since cookies store strings
  const onboardingRequired = request.cookies.get('onboarding-required')?.value === 'true';
  
  // Define path types
  const pathname = request.nextUrl.pathname;
  const isAuthPath = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/profile');
  const isOnboardingPath = pathname.startsWith('/onboarding');
  
  // Case 1: Unauthenticated user trying to access protected routes
  if (!authToken && isProtectedPath) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  // Case 2: Authenticated user trying to access auth pages (signin/signup)
  if (authToken && isAuthPath) {
    // This is the problematic redirect - ensure we're correctly checking onboardingRequired
    const redirectUrl = onboardingRequired ? '/onboarding' : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // Case 3: Authenticated user with pending onboarding trying to access protected pages
  if (authToken && onboardingRequired && !isOnboardingPath && isProtectedPath) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

   if (!onboardingRequired && isOnboardingPath) {
    const redirectUrl = '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }
  
  // Allow the request to proceed normally
  return NextResponse.next();
}

// Specify which paths this middleware should run on
export const config = {
  matcher: ['/signin', '/signup', '/dashboard/:path*', '/profile/:path*', '/onboarding'],
};