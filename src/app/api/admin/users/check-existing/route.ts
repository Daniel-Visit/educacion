import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 CHECK-EXISTING - Endpoint llamado');

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

    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails requeridos' }, { status: 400 });
    }

    // Buscar usuarios existentes
    const existingUsers = await db.user.findMany({
      where: {
        email: {
          in: emails.map((email: string) => email.trim()),
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(
      `🔍 CHECK-EXISTING - Usuarios existentes encontrados: ${existingUsers.length}`
    );

    return NextResponse.json({
      existingUsers,
      totalChecked: emails.length,
      existingCount: existingUsers.length,
    });
  } catch (error) {
    console.error('Error verificando usuarios existentes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
