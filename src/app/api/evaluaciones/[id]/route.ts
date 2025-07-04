// NOTA: Los modelos Prisma se acceden en minúscula y singular: prisma.evaluacion, prisma.pregunta, prisma.alternativa
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/evaluaciones/[id] - obtener una evaluación
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    // @ts-ignore - Prisma client sync issue
    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id },
      include: {
        archivo: true,
        matriz: true,
        preguntas: { include: { alternativas: true } }
      }
    })
    if (!evaluacion) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }
    return NextResponse.json(evaluacion)
  } catch (error) {
    console.error('Error al obtener evaluación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// PUT /api/evaluaciones/[id] - actualizar una evaluación (y sus preguntas/alternativas)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    const body = await request.json()
    const { contenido, preguntas, respuestasCorrectas } = body
    if (!contenido || !preguntas) {
      return NextResponse.json({ error: 'contenido y preguntas son requeridos' }, { status: 400 })
    }
    // Actualizar preguntas y alternativas (borrar y recrear)
    // Primero, borrar preguntas/alternativas existentes
    // @ts-ignore - Prisma client sync issue
    await prisma.alternativa.deleteMany({ where: { pregunta: { evaluacionId: id } } })
    // @ts-ignore - Prisma client sync issue
    await prisma.pregunta.deleteMany({ where: { evaluacionId: id } })
    // Crear nuevas preguntas/alternativas según lo enviado
    for (const p of preguntas) {
      // @ts-ignore - Prisma client sync issue
      const pregunta = await prisma.pregunta.create({
        data: {
          evaluacionId: id,
          numero: p.numero,
          texto: p.texto
        }
      })
      for (const a of p.alternativas) {
        // @ts-ignore - Prisma client sync issue
        await prisma.alternativa.create({
          data: {
            preguntaId: pregunta.id,
            letra: a.letra,
            texto: a.texto,
            esCorrecta: respuestasCorrectas?.[p.numero] === a.letra
          }
        })
      }
    }
    // @ts-ignore - Prisma client sync issue
    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id },
      include: {
        archivo: true,
        matriz: true,
        preguntas: { include: { alternativas: true } }
      }
    })
    return NextResponse.json(evaluacion)
  } catch (error) {
    console.error('Error al actualizar evaluación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/evaluaciones/[id] - eliminar una evaluación
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }
    // Borrar preguntas y alternativas asociadas
    // @ts-ignore - Prisma client sync issue
    await prisma.alternativa.deleteMany({ where: { pregunta: { evaluacionId: id } } })
    // @ts-ignore - Prisma client sync issue
    await prisma.pregunta.deleteMany({ where: { evaluacionId: id } })
    // Borrar la evaluación
    // @ts-ignore - Prisma client sync issue
    await prisma.evaluacion.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al eliminar evaluación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 