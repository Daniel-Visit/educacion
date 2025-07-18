import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { archivoId, matrizId, preguntas, respuestasCorrectas } = body
    if (!archivoId || !matrizId || !preguntas) {
      return NextResponse.json({ error: 'archivoId, matrizId y preguntas son requeridos' }, { status: 400 })
    }
    
    const evaluacion = await prisma.evaluacion.create({
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
        preguntas: { include: { alternativas: true } }
      }
    })
    return NextResponse.json(evaluacion, { status: 201 })
  } catch (error) {
    console.error('Error al crear evaluación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 