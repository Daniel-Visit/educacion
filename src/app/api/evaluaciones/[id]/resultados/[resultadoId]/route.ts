import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// DELETE /api/evaluaciones/[id]/resultados/[resultadoId] - eliminar un archivo de resultados específico
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; resultadoId: string }> }
) {
  try {
    const { id, resultadoId } = await params;
    const evaluacionId = parseInt(id);
    const resultadoIdNum = parseInt(resultadoId);

    if (isNaN(evaluacionId) || isNaN(resultadoIdNum)) {
      return NextResponse.json({ error: 'IDs inválidos' }, { status: 400 });
    }

    // Verificar que el resultado pertenece a la evaluación
    const resultado = await db.resultadoEvaluacion.findFirst({
      where: {
        id: resultadoIdNum,
        evaluacionId: evaluacionId,
      },
    });

    if (!resultado) {
      return NextResponse.json(
        { error: 'Resultado no encontrado o no pertenece a esta evaluación' },
        { status: 404 }
      );
    }

    // Eliminar en orden: respuestas -> resultados de alumnos -> archivo de resultados
    await db.respuestaAlumno.deleteMany({
      where: {
        resultadoAlumno: {
          resultadoEvaluacionId: resultadoIdNum,
        },
      },
    });

    await db.resultadoAlumno.deleteMany({
      where: { resultadoEvaluacionId: resultadoIdNum },
    });

    await db.resultadoEvaluacion.delete({
      where: { id: resultadoIdNum },
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
