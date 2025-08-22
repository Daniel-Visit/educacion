import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import {
  isTokenRevoked,
  isTokenVersionValid,
  updateSessionActivity,
} from './lib/auth-redis';

// Extender el tipo del token para incluir nuestras propiedades personalizadas
interface ExtendedToken {
  sub?: string;
  email?: string;
  role?: string;
  jti?: string;
  ver?: number;
  forcePasswordChange?: boolean;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/change-password',
    '/403',
    '/500',
  ];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  try {
    // Logs de debug para diagnosticar el problema en Vercel
    console.log(
      '🔍 MIDDLEWARE - Headers:',
      Object.fromEntries(request.headers)
    );
    console.log('🔍 MIDDLEWARE - Cookies:', request.cookies.getAll());

    // Obtener el token usando getToken (más eficiente que auth())
    let token: ExtendedToken | null = null;
    try {
      token = (await getToken({
        req: request,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      })) as ExtendedToken | null;

      console.log('🔍 MIDDLEWARE - getToken resultado:', token ? 'SÍ' : 'NO');
      console.log(
        '🔍 MIDDLEWARE - Secret usado:',
        process.env.AUTH_SECRET ? 'AUTH_SECRET' : 'NEXTAUTH_SECRET'
      );
    } catch (error) {
      console.error('❌ MIDDLEWARE - Error en getToken:', error);
      token = null;
    }

    console.log('🔍 MIDDLEWARE - Token:', token ? 'SÍ' : 'NO');
    console.log('🔍 MIDDLEWARE - User:', token?.email);
    console.log('🔍 MIDDLEWARE - Role:', token?.role);
    console.log('🔍 MIDDLEWARE - JTI:', token?.jti);
    console.log('🔍 MIDDLEWARE - Version:', token?.ver);

    // Si no hay token, redirigir a login
    if (!token) {
      console.log('🔍 MIDDLEWARE - No hay token, redirigiendo a login');
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }

    // Verificar si el token está revocado en Redis
    const jti = token.jti;
    if (jti) {
      const isRevoked = await isTokenRevoked(jti);
      if (isRevoked) {
        console.log('🔍 MIDDLEWARE - Token revocado, redirigiendo a login');
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
      }

      // Actualizar actividad de la sesión (última vez que se usó)
      await updateSessionActivity(jti);
    }

    // Verificar versión del token vs versión del usuario en Redis
    const tokenVersion = token.ver;
    const userId = token.sub;
    if (tokenVersion && userId) {
      const isVersionValid = await isTokenVersionValid(userId, tokenVersion);
      if (!isVersionValid) {
        console.log(
          '🔍 MIDDLEWARE - Versión de token inválida, redirigiendo a login'
        );
        const url = request.nextUrl.clone();
        url.pathname = '/auth/login';
        return NextResponse.redirect(url);
      }
    }

    // Verificar forcePasswordChange y redirigir si es necesario
    if (
      token.forcePasswordChange === true &&
      pathname !== '/auth/change-password'
    ) {
      console.log('🔍 MIDDLEWARE - REDIRIGIENDO a change-password');
      const url = request.nextUrl.clone();
      url.pathname = '/auth/change-password';
      return NextResponse.redirect(url);
    }

    // Protección por roles
    const userRole = token.role || 'user';

    // Rutas de administración requieren rol ADMIN
    if (pathname.startsWith('/admin/')) {
      if (userRole !== 'admin') {
        console.log('🔍 MIDDLEWARE - Acceso denegado a admin, rol:', userRole);
        const url = request.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }
    }

    // Rutas de gestión requieren rol ADMIN o MANAGER
    if (pathname.startsWith('/gestion/') || pathname.startsWith('/config/')) {
      if (!['admin', 'manager'].includes(userRole)) {
        console.log(
          '🔍 MIDDLEWARE - Acceso denegado a gestión, rol:',
          userRole
        );
        const url = request.nextUrl.clone();
        url.pathname = '/403';
        return NextResponse.redirect(url);
      }
    }

    console.log('🔍 MIDDLEWARE - Acceso permitido, rol:', userRole);
  } catch (error) {
    console.error('❌ Error en middleware:', error);

    // En caso de error, redirigir a login por seguridad
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
