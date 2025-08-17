import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/resultados-evaluaciones/[id] - eliminar un archivo de resultados específico
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

    // Verificar que el resultado existe
    const resultado = await prisma.resultadoEvaluacion.findUnique({
      where: { id: resultadoId },
    });

    if (!resultado) {
      return NextResponse.json(
        { error: 'Resultado no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar en orden: respuestas de alumnos -> resultados de alumnos -> archivo de resultados
    await prisma.respuestaAlumno.deleteMany({
      where: {
        resultadoAlumno: {
          resultadoEvaluacionId: resultadoId,
        },
      },
    });

    await prisma.resultadoAlumno.deleteMany({
      where: { resultadoEvaluacionId: resultadoId },
    });

    await prisma.resultadoEvaluacion.delete({
      where: { id: resultadoId },
    });

    return NextResponse.json({ success: true });
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
            matriz: true,
          },
        },
      },
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
        matrizNombre: resultado.evaluacion.matriz.nombre,
      },
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
