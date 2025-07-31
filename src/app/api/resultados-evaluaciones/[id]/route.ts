import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resultadoId = parseInt(id);

    if (isNaN(resultadoId)) {
      return NextResponse.json(
        { error: 'ID de resultado inválido' },
        { status: 400 }
      );
    }

    // Eliminar el resultado y todas sus relaciones (cascade)
    await prisma.resultadoEvaluacion.delete({
      where: {
        id: resultadoId
      }
    });

    return NextResponse.json(
      { message: 'Resultado eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error eliminando resultado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resultadoId = parseInt(id);

    if (isNaN(resultadoId)) {
      return NextResponse.json(
        { error: 'ID de resultado inválido' },
        { status: 400 }
      );
    }

    // Obtener el resultado con información de la evaluación
    const resultado = await prisma.resultadoEvaluacion.findUnique({
      where: { id: resultadoId },
      include: {
        evaluacion: {
          include: {
            archivo: true,
            matriz: true
          }
        }
      }
    });

    if (!resultado) {
      return NextResponse.json(
        { error: 'Resultado no encontrado' },
        { status: 404 }
      );
    }

    // Transformar los datos para el frontend
    const resultadoFormateado = {
      id: resultado.id,
      nombre: resultado.nombre,
      fechaCarga: resultado.fechaCarga.toISOString(),
      totalAlumnos: resultado.totalAlumnos,
      escalaNota: resultado.escalaNota,
      evaluacionId: resultado.evaluacionId,
      evaluacion: {
        id: resultado.evaluacion.id,
        titulo: resultado.evaluacion.archivo.titulo,
        matrizNombre: resultado.evaluacion.matriz.nombre
      }
    };

    return NextResponse.json(resultadoFormateado);

  } catch (error) {
    console.error('Error fetching resultado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 