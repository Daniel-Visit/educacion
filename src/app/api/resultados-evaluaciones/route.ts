import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const resultados = await db.resultadoEvaluacion.findMany({
      include: {
        evaluacion: {
          include: {
            archivo: true,
            matriz: true,
          },
        },
        resultados: {
          include: {
            alumno: true,
          },
        },
      },
      orderBy: {
        fechaCarga: 'desc',
      },
    });

    // Transformar los datos para el frontend
    const resultadosTransformados = resultados.map(resultado => ({
      id: resultado.id,
      evaluacionId: resultado.evaluacionId,
      fechaCarga: resultado.fechaCarga.toISOString(),
      totalAlumnos: resultado.totalAlumnos,
      escalaNota: resultado.escalaNota,
      evaluacion: {
        id: resultado.evaluacion.id,
        titulo: resultado.evaluacion.archivo.titulo,
        matrizNombre: resultado.evaluacion.matriz.nombre,
        preguntasCount: resultado.evaluacion.matriz.total_preguntas,
      },
      resultados: resultado.resultados.map(resultadoAlumno => ({
        id: resultadoAlumno.id,
        puntajeTotal: resultadoAlumno.puntajeTotal,
        puntajeMaximo: resultadoAlumno.puntajeMaximo,
        porcentaje: resultadoAlumno.porcentaje,
        alumno: {
          id: resultadoAlumno.alumno.id,
          nombre: resultadoAlumno.alumno.nombre,
          apellido: resultadoAlumno.alumno.apellido,
        },
      })),
    }));

    return NextResponse.json(resultadosTransformados);
  } catch (error) {
    console.error('Error fetching resultados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
