import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Resolver usuario real desde BD y validar rol admin
    const currentUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...(session.user.id ? [{ id: session.user.id }] : []),
          ...(session.user.email ? [{ email: session.user.email }] : []),
        ],
      },
      select: { id: true, email: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Verificar que el usuario a eliminar existe
    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, email: true, role: true },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'Usuario a eliminar no encontrado' },
        { status: 404 }
      );
    }

    // No permitir que un admin se elimine a sí mismo
    if (userToDelete.id === currentUser.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    // Eliminar el usuario (esto también eliminará sus cuentas y sesiones por CASCADE)
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Usuario eliminado correctamente',
      deletedUser: {
        id: userToDelete.id,
        email: userToDelete.email,
        role: userToDelete.role,
      },
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
