import { NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validar parámetros
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Parámetros de paginación inválidos' },
        { status: 400 }
      );
    }

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

    // Obtener total de usuarios para paginación
    const totalUsers = await prisma.user.count();
    const totalPages = Math.ceil(totalUsers / limit);
    const offset = (page - 1) * limit;

    // Obtener usuarios con paginación
    const users = await prisma.user.findMany({
      include: {
        accounts: {
          select: { provider: true, providerAccountId: true },
        },
        sessions: {
          select: { expires: true },
          orderBy: { expires: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    return NextResponse.json({
      users,
      total: totalUsers,
      totalPages,
      currentPage: page,
      limit,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
