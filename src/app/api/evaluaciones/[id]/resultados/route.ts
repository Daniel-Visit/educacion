import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evaluacionId = parseInt(params.id);

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
                pregunta: true
              }
            }
          }
        }
      },
      orderBy: {
        fechaCarga: 'desc'
      }
    });

    // Si no hay resultados, devolver array vacío
    if (resultados.length === 0) {
      return NextResponse.json([]);
    }

    // Tomar el resultado más reciente
    const resultadoMasReciente = resultados[0];
    
    // Transformar los datos para el frontend
    const resultadosFormateados = resultadoMasReciente.resultados.map(resultado => ({
      id: resultado.id,
      alumno: {
        rut: resultado.alumno.rut,
        nombre: resultado.alumno.nombre,
        apellido: resultado.alumno.apellido
      },
      puntajeTotal: resultado.puntajeTotal,
      puntajeMaximo: resultado.puntajeMaximo,
      porcentaje: resultado.porcentaje,
      nota: resultado.nota,
      respuestas: resultado.respuestas.map(respuesta => ({
        id: respuesta.id,
        preguntaId: respuesta.pregunta.numero,
        alternativaDada: respuesta.alternativaDada,
        esCorrecta: respuesta.esCorrecta,
        puntajeObtenido: respuesta.puntajeObtenido
      }))
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