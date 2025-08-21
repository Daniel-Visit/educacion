import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth.config';
import { prisma } from '@/lib/prisma';
import { incrementUserVersion } from '@/lib/auth-redis';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { userId, newRole } = await request.json();

    if (!userId || !newRole) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (!['admin', 'profesor', 'user'].includes(newRole)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (existingUser.role === newRole) {
      return NextResponse.json(
        { error: 'El usuario ya tiene ese rol' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
      },
    });

    // Incrementar versión del usuario para invalidar tokens activos
    try {
      const newVersion = await incrementUserVersion(userId);
      console.log(
        `🔄 Versión de usuario incrementada a ${newVersion} para invalidar tokens`
      );
    } catch (redisError) {
      console.error('❌ Error incrementando versión de usuario:', redisError);
      // No fallar la operación si Redis falla
    }

    return NextResponse.json({
      message: 'Rol actualizado correctamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
