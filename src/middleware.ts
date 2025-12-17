import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Token type with custom properties
interface ExtendedToken {
  sub?: string;
  email?: string;
  role?: string;
  forcePasswordChange?: boolean;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/set-password',
  '/auth/change-password',
  '/403',
  '/500',
];

// Role-based route protection
const ADMIN_ROUTES = ['/admin/'];
const MANAGER_ROUTES = ['/gestion/', '/config/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip NextAuth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Production domain redirect (Vercel to custom domain)
  if (process.env.VERCEL_ENV === 'production') {
    const url = request.nextUrl.clone();
    if (url.hostname.endsWith('.vercel.app')) {
      url.hostname = 'www.goodly.cl';
      return NextResponse.redirect(url, 308);
    }
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  try {
    // Get JWT token
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    console.log('[Middleware] Path:', pathname);
    console.log('[Middleware] AUTH_SECRET exists:', !!process.env.AUTH_SECRET);
    console.log(
      '[Middleware] NEXTAUTH_SECRET exists:',
      !!process.env.NEXTAUTH_SECRET
    );

    const token = (await getToken({
      req: request,
      secret,
    })) as ExtendedToken | null;

    console.log('[Middleware] Token result:', token ? 'valid' : 'null');
    if (token) {
      console.log('[Middleware] Token email:', token.email);
    }

    // No token = redirect to login
    if (!token) {
      console.log('[Middleware] Redirecting to login - no valid token');
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // Force password change if required
    if (token.forcePasswordChange && pathname !== '/auth/change-password') {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/change-password';
      return NextResponse.redirect(url);
    }

    // Role-based access control
    const userRole = token.role || 'user';

    // Admin routes require admin role
    if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
      if (userRole !== 'admin') {
        const url = request.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }
    }

    // Manager routes require admin or manager role
    if (MANAGER_ROUTES.some(route => pathname.startsWith(route))) {
      if (!['admin', 'manager'].includes(userRole)) {
        const url = request.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
