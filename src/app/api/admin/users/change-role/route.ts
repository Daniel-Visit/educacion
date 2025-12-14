import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { db } from '@/lib/db';

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

    const existingUser = await db.user.findUnique({
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

    const updatedUser = await db.user.update({
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
