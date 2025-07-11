import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/evaluaciones - listar todas las evaluaciones
export async function GET() {
  try {
    const evaluaciones = await prisma.evaluacion.findMany({
      include: {
        archivo: true,
        matriz: true,
        preguntas: true
      }
    })
    // Mapear para devolver solo los campos necesarios
    const data = evaluaciones.map(ev => ({
      id: ev.id,
      titulo: ev.archivo?.titulo || '',
      matrizId: ev.matrizId,
      matrizNombre: ev.matriz?.nombre || '',
      preguntasCount: ev.preguntas?.length || 0,
      createdAt: ev.createdAt
    }))
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error al obtener evaluaciones:', error)
    // Devuelve SIEMPRE un array, aunque esté vacío, para evitar romper el frontend
    return NextResponse.json([])
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