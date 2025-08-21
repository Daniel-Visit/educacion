import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluacionId = parseInt(id);

    if (isNaN(evaluacionId)) {
      return NextResponse.json(
        { error: 'ID de evaluación inválido' },
        { status: 400 }
      );
    }

    // Obtener todos los resultados de la evaluación
    const resultados = await prisma.resultadoEvaluacion.findMany({
      where: { evaluacionId },
      include: {
        resultados: {
          include: {
            alumno: true,
            respuestas: {
              include: {
                pregunta: true,
              },
            },
          },
        },
      },
      orderBy: {
        fechaCarga: 'desc',
      },
    });

    // Si no hay resultados, devolver array vacío
    if (resultados.length === 0) {
      return NextResponse.json([]);
    }

    // Transformar los datos para el frontend - mostrar archivos de resultados completos
    const resultadosFormateados = resultados.map(resultado => ({
      id: resultado.id,
      nombre: resultado.nombre,
      fechaCarga: resultado.fechaCarga,
      totalAlumnos: resultado.totalAlumnos,
      escalaNota: resultado.escalaNota,
      // Estadísticas resumidas de todos los alumnos
      estadisticas: {
        promedioNota:
          resultado.resultados.length > 0
            ? resultado.resultados.reduce((sum, r) => sum + r.nota, 0) /
              resultado.resultados.length
            : 0,
        aprobados: resultado.resultados.filter(r => r.nota >= 4.0).length,
        totalAlumnos: resultado.resultados.length,
      },
    }));

    return NextResponse.json(resultadosFormateados);
  } catch (error) {
    console.error('Error fetching resultados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/evaluaciones/[id]/resultados - eliminar un archivo de resultados específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluacionId = parseInt(id);

    if (isNaN(evaluacionId)) {
      return NextResponse.json(
        { error: 'ID de evaluación inválido' },
        { status: 400 }
      );
    }

    // Obtener el ID del archivo de resultados a eliminar del body
    const body = await request.json();
    console.log('Body recibido:', body);

    const { resultadoId } = body;

    if (!resultadoId) {
      return NextResponse.json(
        { error: 'ID de resultado requerido' },
        { status: 400 }
      );
    }

    console.log('Eliminando resultado ID:', resultadoId);

    // Eliminar en orden: respuestas -> resultados de alumnos -> archivo de resultados
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
      {
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
