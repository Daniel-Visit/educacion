import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/evaluaciones - listar todas las evaluaciones
export async function GET() {
  try {
    // @ts-ignore - Prisma client sync issue
    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        archivo: true,
        matriz: true,
        preguntas: {
          include: {
            alternativas: true
          }
        }
      }
    })
    return NextResponse.json(evaluaciones)
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST /api/evaluaciones - crear una nueva evaluación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { archivoId, matrizId, contenido, preguntas, respuestasCorrectas } = body
    if (!archivoId || !matrizId || !contenido || !preguntas) {
      return NextResponse.json({ error: 'archivoId, matrizId, contenido y preguntas son requeridos' }, { status: 400 })
    }
    // Crear la evaluación y sus preguntas/alternativas según lo enviado
    // @ts-ignore - Prisma client sync issue
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