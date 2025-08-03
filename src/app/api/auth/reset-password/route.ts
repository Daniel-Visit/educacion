import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y nueva contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Buscar token válido
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    // Verificar que no haya expirado
    if (verificationToken.expires < new Date()) {
      // Eliminar token expirado
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar contraseña del usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        forcePasswordChange: false, // Ya no necesita cambiar contraseña
      },
    });

    // Eliminar token usado
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json(
      { message: 'Contraseña actualizada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 