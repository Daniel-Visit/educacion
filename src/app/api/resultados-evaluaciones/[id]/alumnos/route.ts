import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resultadoEvaluacionId = parseInt(id);

    if (isNaN(resultadoEvaluacionId)) {
      return NextResponse.json(
        { error: 'ID de resultado inválido' },
        { status: 400 }
      );
    }

    // Obtener los resultados individuales de los alumnos para este archivo de resultados
    const resultadosAlumnos = await prisma.resultadoAlumno.findMany({
      where: { resultadoEvaluacionId },
      include: {
        alumno: true,
        respuestas: {
          include: {
            pregunta: true,
          },
        },
      },
      orderBy: {
        alumno: {
          apellido: 'asc',
        },
      },
    });

    // Transformar los datos para el frontend
    const resultadosFormateados = resultadosAlumnos.map(resultado => ({
      id: resultado.id,
      nota: resultado.nota,
      porcentaje: resultado.porcentaje,
      puntajeTotal: resultado.puntajeTotal,
      puntajeMaximo: resultado.puntajeMaximo,
      alumno: {
        id: resultado.alumno.id,
        nombre: resultado.alumno.nombre,
        apellido: resultado.alumno.apellido,
      },
      respuestas: resultado.respuestas.map(respuesta => ({
        preguntaId: respuesta.pregunta.id,
        alternativaDada: respuesta.alternativaDada,
        esCorrecta: respuesta.esCorrecta,
        puntajeObtenido: respuesta.puntajeObtenido,
      })),
    }));

    return NextResponse.json(resultadosFormateados);
  } catch (error) {
    console.error('Error fetching resultados de alumnos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
