import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log(
      '🔍 API SET-PASSWORD - Iniciando establecimiento de contraseña'
    );

    const { token, name, password } = await request.json();

    console.log('🔍 API SET-PASSWORD - Datos recibidos:', {
      token: token ? 'presente' : 'ausente',
      name: name ? 'presente' : 'ausente',
      password: password ? 'presente' : 'ausente',
    });

    if (!token || !name || !password) {
      console.log('❌ API SET-PASSWORD - Token, nombre o contraseña faltantes');
      return NextResponse.json(
        { error: 'Token, nombre y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el token existe y no ha expirado
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      console.log('❌ API SET-PASSWORD - Token no encontrado');
      return NextResponse.json(
        { error: 'Token de verificación no válido' },
        { status: 400 }
      );
    }

    console.log('🔍 API SET-PASSWORD - Token encontrado:', {
      identifier: verificationToken.identifier,
      expires: verificationToken.expires,
      isExpired: verificationToken.expires < new Date(),
    });

    if (verificationToken.expires < new Date()) {
      console.log('❌ API SET-PASSWORD - Token expirado');
      return NextResponse.json(
        { error: 'El enlace de invitación ha expirado' },
        { status: 400 }
      );
    }

    // Buscar el usuario por email (identifier)
    const user = await db.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      console.log('❌ API SET-PASSWORD - Usuario no encontrado');
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el usuario necesita establecer contraseña
    if (!user.forcePasswordChange) {
      console.log(
        '❌ API SET-PASSWORD - Usuario no necesita establecer contraseña'
      );
      return NextResponse.json(
        { error: 'Este enlace ya no es válido' },
        { status: 400 }
      );
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar usuario: establecer nombre, contraseña y marcar que ya no necesita cambiar
    await db.user.update({
      where: { id: user.id },
      data: {
        name: name,
        password: hashedPassword,
        forcePasswordChange: false, // Ya no necesita cambiar contraseña
      },
    });

    // Eliminar el token de verificación usado
    await db.verificationToken.delete({
      where: { token },
    });

    console.log(
      '✅ API SET-PASSWORD - Contraseña establecida exitosamente para usuario:',
      user.email
    );

    return NextResponse.json({
      success: true,
      message: 'Contraseña establecida exitosamente',
    });
  } catch (error) {
    console.error('❌ API SET-PASSWORD - Error general:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
