import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { revokeToken, closeUserSession } from '@/lib/auth-redis';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API LOGOUT - Iniciando logout completo');

    // Obtener el token actual
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      console.log('❌ API LOGOUT - No hay token válido');
      return NextResponse.json(
        { error: 'No hay sesión activa' },
        { status: 401 }
      );
    }

    console.log('🔍 API LOGOUT - Token encontrado:', {
      email: token.email,
      role: token.role,
      jti: token.jti,
      sub: token.sub,
    });

    // Revocar token y cerrar sesión en Redis
    if (token.jti && token.sub) {
      try {
        // Revocar el token (agregarlo a la denylist)
        await revokeToken(token.jti as string);
        console.log('✅ API LOGOUT - Token revocado en Redis');

        // Cerrar la sesión específica
        await closeUserSession(token.sub as string, token.jti as string);
        console.log('✅ API LOGOUT - Sesión cerrada en Redis');
      } catch (redisError) {
        console.error('❌ API LOGOUT - Error con Redis:', redisError);
        // Continuar con el logout aunque Redis falle
      }
    }

    // Limpiar cookies de sesión
    const response = NextResponse.json({
      success: true,
      message: 'Logout completado exitosamente',
    });

    // Eliminar cookies de NextAuth
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('next-auth.csrf-token');
    response.cookies.delete('next-auth.callback-url');

    console.log('✅ API LOGOUT - Logout completado exitosamente');

    return response;
  } catch (error) {
    console.error('❌ API LOGOUT - Error general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
