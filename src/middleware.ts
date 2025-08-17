import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '../auth';

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo verificar en rutas protegidas (no en auth, api, etc.)
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  console.log('🔍 MIDDLEWARE - Pathname:', pathname);

  try {
    // Obtener la sesión usando auth()
    const session = await auth();

    console.log('🔍 MIDDLEWARE - Session:', session ? 'SÍ' : 'NO');
    console.log('🔍 MIDDLEWARE - User:', session?.user?.email);
    console.log(
      '🔍 MIDDLEWARE - forcePasswordChange:',
      session?.user?.forcePasswordChange
    );

    // Verificar forcePasswordChange y redirigir si es necesario
    if (
      session?.user?.forcePasswordChange === true &&
      pathname !== '/auth/change-password'
    ) {
      console.log('🔍 MIDDLEWARE - REDIRIGIENDO a change-password');
      const url = req.nextUrl.clone();
      url.pathname = '/auth/change-password';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('Error en middleware:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
