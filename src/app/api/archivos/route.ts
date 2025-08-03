import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const archivos = await prisma.archivo.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(archivos);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { titulo, tipo, contenido } = body;

    if (!titulo || !tipo || !contenido) {
      return NextResponse.json(
        { error: 'Título, tipo y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el tipo sea válido
    const tiposValidos = ['planificacion', 'material', 'evaluacion'];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo debe ser planificacion, material o evaluacion' },
        { status: 400 }
      );
    }

    // Validar que el contenido sea JSON válido
    try {
      JSON.parse(contenido);
    } catch {
      return NextResponse.json(
        { error: 'El contenido debe ser JSON válido' },
        { status: 400 }
      );
    }

    const archivo = await prisma.archivo.create({
      data: {
        titulo,
        tipo,
        contenido,
      },
    });

    return NextResponse.json(archivo, { status: 201 });
  } catch (error) {
    console.error('Error al crear archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
