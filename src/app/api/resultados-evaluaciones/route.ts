import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const resultados = await prisma.resultadoEvaluacion.findMany({
      include: {
        evaluacion: {
          select: {
            id: true,
            titulo: true,
            matriz: {
              select: {
                nombre: true
              }
            },
            preguntas: {
              select: {
                id: true
              }
            }
          }
        },
        resultados: {
          select: {
            puntajeTotal: true,
            puntajeMaximo: true,
            nota: true
          }
        }
      },
      orderBy: {
        fechaCarga: 'desc'
      }
    });

    // Transformar los datos para el frontend
    const resultadosTransformados = resultados.map(resultado => {
      // Calcular estadísticas
      const totalAlumnos = resultado.resultados.length;
      const promedioPuntaje = totalAlumnos > 0 
        ? Math.round((resultado.resultados.reduce((sum, r) => sum + (r.puntajeTotal / r.puntajeMaximo * 100), 0) / totalAlumnos))
        : 0;
      
      const aprobados = resultado.resultados.filter(r => r.nota >= 4.0).length;
      const porcentajeAprobacion = totalAlumnos > 0 
        ? Math.round((aprobados / totalAlumnos) * 100)
        : 0;

      return {
        id: resultado.id,
        evaluacionId: resultado.evaluacionId,
        fechaCarga: resultado.fechaCarga.toISOString(),
        totalAlumnos: totalAlumnos,
        promedioPuntaje: promedioPuntaje,
        porcentajeAprobacion: porcentajeAprobacion,
        evaluacion: {
          id: resultado.evaluacion.id,
          titulo: resultado.evaluacion.titulo,
          matrizNombre: resultado.evaluacion.matriz.nombre,
          preguntasCount: resultado.evaluacion.preguntas.length
        }
      };
    });

    return NextResponse.json(resultadosTransformados);
  } catch (error) {
    console.error('Error obteniendo resultados de evaluaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 