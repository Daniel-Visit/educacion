import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const archivo = await prisma.archivo.findUnique({
      where: { id: idNum },
    });

    if (!archivo) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(archivo);
  } catch (error) {
    console.error('Error al obtener archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

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

    const archivo = await prisma.archivo.update({
      where: { id: idNum },
      data: {
        titulo,
        tipo,
        contenido,
      },
    });

    return NextResponse.json(archivo);
  } catch (error) {
    console.error('Error al actualizar archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const archivo = await prisma.archivo.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
