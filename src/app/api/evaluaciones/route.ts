import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calcularEstadoEvaluacion } from '@/lib/evaluacion-utils';

export async function GET() {
  try {
    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        archivo: true,
        matriz: true,
        preguntas: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transformar los datos para que coincidan con el formato esperado
    const evaluacionesFormateadas = evaluaciones.map(evaluacion => ({
      id: evaluacion.id,
      titulo: evaluacion.archivo.titulo,
      matrizNombre: evaluacion.matriz.nombre,
      preguntasCount: evaluacion.preguntas.length,
      createdAt: evaluacion.createdAt.toISOString(),
      // @ts-ignore - Prisma client sync issue
      estado: evaluacion.estado,
    }));

    return NextResponse.json(evaluacionesFormateadas);
  } catch (error) {
    console.error('Error fetching evaluaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/evaluaciones - crear una nueva evaluación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { archivoId, matrizId, preguntas, respuestasCorrectas, indicadoresAsignados } = body
    if (!archivoId || !matrizId || !preguntas) {
      return NextResponse.json({ error: 'archivoId, matrizId y preguntas son requeridos' }, { status: 400 })
    }
    
    // @ts-ignore - Prisma client sync issue
    const evaluacion = await prisma.evaluacion.create({
      // @ts-ignore - Prisma client sync issue
      data: {
        archivoId,
        matrizId,
        preguntas: {
          create: preguntas.map((p: any) => ({
            numero: p.numero,
            texto: p.texto,
            alternativas: {
              create: p.alternativas.map((a: any) => ({
                letra: a.letra,
                texto: a.texto,
                esCorrecta: respuestasCorrectas?.[p.numero] === a.letra
              }))
            }
          }))
        }
      },
      include: {
        preguntas: { 
          include: { 
            alternativas: true,
            // @ts-ignore - Prisma client sync issue
            indicadores: true
          } 
        },
        matriz: {
          include: {
            oas: {
              include: {
                indicadores: true
              }
            }
          }
        }
      }
    })

    // Guardar indicadores asignados si se proporcionan
    if (indicadoresAsignados) {
      const indicadoresToCreate: any[] = []
      
      for (const [preguntaNumero, asignacion] of Object.entries(indicadoresAsignados)) {
        // @ts-ignore - Prisma client sync issue
        const pregunta = evaluacion.preguntas.find((p: any) => p.numero === parseInt(preguntaNumero))
        if (pregunta) {
          const asignacionTyped = asignacion as { contenido?: number; habilidad?: number }
          if (asignacionTyped.contenido) {
            indicadoresToCreate.push({
              preguntaId: pregunta.id,
              indicadorId: asignacionTyped.contenido,
              tipo: 'Contenido'
            })
          }
          if (asignacionTyped.habilidad) {
            indicadoresToCreate.push({
              preguntaId: pregunta.id,
              indicadorId: asignacionTyped.habilidad,
              tipo: 'Habilidad'
            })
          }
        }
      }

      if (indicadoresToCreate.length > 0) {
        // @ts-ignore - Prisma client sync issue
        await prisma.preguntaIndicador.createMany({
          data: indicadoresToCreate
        })
      }
    }

    // Calcular y actualizar el estado de la evaluación
    const estadoCalculado = calcularEstadoEvaluacion({
      // @ts-ignore - Prisma client sync issue
      preguntas: evaluacion.preguntas,
      // @ts-ignore - Prisma client sync issue
      matriz: evaluacion.matriz
    })

    // @ts-ignore - Prisma client sync issue
    await prisma.evaluacion.update({
      where: { id: evaluacion.id },
      // @ts-ignore - Prisma client sync issue
      data: { estado: estadoCalculado }
    })

    // Obtener la evaluación final con el estado actualizado
    // @ts-ignore - Prisma client sync issue
    const evaluacionFinal = await prisma.evaluacion.findUnique({
      where: { id: evaluacion.id },
      include: {
        preguntas: { 
          include: { 
            alternativas: true,
            // @ts-ignore - Prisma client sync issue
            indicadores: true
          } 
        },
        matriz: {
          include: {
            oas: {
              include: {
                indicadores: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(evaluacionFinal, { status: 201 })
  } catch (error) {
    console.error('Error al crear evaluación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 