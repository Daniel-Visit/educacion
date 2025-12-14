import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE-MULTIPLE - Endpoint llamado');

    // Verificar autenticación
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Resolver usuario real desde BD y validar rol admin
    const currentUser = await db.user.findFirst({
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

    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de usuarios requeridos' },
        { status: 400 }
      );
    }

    // Verificar que no se intente eliminar al usuario actual
    if (userIds.includes(currentUser.id)) {
      return NextResponse.json(
        {
          error: 'No puedes eliminar tu propia cuenta',
        },
        { status: 400 }
      );
    }

    // Verificar que todos los usuarios existen
    const existingUsers = await db.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: { id: true, email: true, role: true },
    });

    if (existingUsers.length !== userIds.length) {
      return NextResponse.json(
        {
          error: 'Algunos usuarios no existen',
        },
        { status: 404 }
      );
    }

    // Eliminar usuarios en transacción
    const result = await db.$transaction(async tx => {
      // Eliminar tokens de verificación
      await tx.verificationToken.deleteMany({
        where: {
          identifier: {
            in: existingUsers
              .map(user => user.email)
              .filter(Boolean) as string[],
          },
        },
      });

      // Eliminar sesiones
      await tx.session.deleteMany({
        where: {
          userId: { in: userIds },
        },
      });

      // Eliminar cuentas de proveedores
      await tx.account.deleteMany({
        where: {
          userId: { in: userIds },
        },
      });

      // Eliminar usuarios
      const deletedUsers = await tx.user.deleteMany({
        where: {
          id: { in: userIds },
        },
      });

      return deletedUsers;
    });

    console.log(
      `✅ DELETE-MULTIPLE - ${result.count} usuarios eliminados exitosamente`
    );

    return NextResponse.json({
      message: `${result.count} usuarios eliminados exitosamente`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error al eliminar usuarios múltiples:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
