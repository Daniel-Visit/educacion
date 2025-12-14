import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const niveles = await db.nivel.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json(niveles);
  } catch (error) {
    console.error('Error al obtener niveles:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar datos de entrada
    if (
      !body.nombre ||
      typeof body.nombre !== 'string' ||
      body.nombre.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (body.nombre.length > 100) {
      return NextResponse.json(
        { error: 'El nombre es muy largo' },
        { status: 400 }
      );
    }

    // Verificar si ya existe un nivel con ese nombre
    const existingNivel = await db.nivel.findUnique({
      where: {
        nombre: body.nombre.trim(),
      },
    });

    if (existingNivel) {
      return NextResponse.json(
        { error: 'Ya existe un nivel con ese nombre' },
        { status: 400 }
      );
    }

    // Crear el nuevo nivel
    const nuevoNivel = await db.nivel.create({
      data: {
        nombre: body.nombre.trim(),
      },
    });

    return NextResponse.json(nuevoNivel, { status: 201 });
  } catch (error) {
    console.error('Error al crear nivel:', error);

    if (error && typeof error === 'object' && 'errors' in error) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: (error as { errors: unknown }).errors,
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
