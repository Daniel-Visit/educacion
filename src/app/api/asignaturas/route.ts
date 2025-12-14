import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/asignaturas - Listar asignaturas
export async function GET() {
  try {
    const asignaturas = await db.asignatura.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json({
      data: asignaturas,
      message: 'Asignaturas obtenidas correctamente',
    });
  } catch (error) {
    console.error('Error al obtener asignaturas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/asignaturas - Crear nueva asignatura
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre } = body;

    // Validaciones básicas
    if (!nombre) {
      return NextResponse.json(
        { error: 'Nombre es obligatorio' },
        { status: 400 }
      );
    }

    // Verificar si la asignatura ya existe
    const asignaturaExistente = await db.asignatura.findUnique({
      where: { nombre },
    });

    if (asignaturaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una asignatura con este nombre' },
        { status: 400 }
      );
    }

    const asignatura = await db.asignatura.create({
      data: {
        nombre,
      },
    });

    return NextResponse.json(
      {
        data: asignatura,
        message: 'Asignatura creada correctamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear asignatura:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
