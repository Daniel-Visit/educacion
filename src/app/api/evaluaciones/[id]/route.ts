// NOTA: Los modelos Prisma se acceden en minúscula y singular: prisma.evaluacion, prisma.pregunta, prisma.alternativa
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/evaluaciones/[id] - obtener una evaluación específica con todos sus datos
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
        preguntas: {
          include: {
            alternativas: true
          }
        }
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

// PUT /api/evaluaciones/[id] - actualizar una evaluación
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PUT /api/evaluaciones/[id] - Iniciando actualización')
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    const body = await request.json()
    const { contenido, preguntas, respuestasCorrectas, matrizId } = body
    console.log('Datos recibidos:', { id, contenido: !!contenido, preguntas: preguntas?.length, respuestasCorrectas: !!respuestasCorrectas, matrizId })

    // Verificar que la evaluación existe
    // @ts-ignore - Prisma client sync issue
    const evaluacionExistente = await prisma.evaluacion.findUnique({
      where: { id },
      include: {
        preguntas: {
          include: {
            alternativas: true
          }
        }
      }
    })

    if (!evaluacionExistente) {
      return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
    }

    // Actualizar el archivo con el nuevo contenido
    if (contenido) {
      // @ts-ignore - Prisma client sync issue
      await prisma.archivo.update({
        where: { id: evaluacionExistente.archivoId },
        data: { contenido: contenido }
      })
    }

    // Actualizar la matriz si se proporciona
    if (matrizId) {
      // @ts-ignore - Prisma client sync issue
      await prisma.evaluacion.update({
        where: { id },
        data: { matrizId: matrizId }
      })
    }

    // Actualizar preguntas y alternativas solo si realmente han cambiado
    if (preguntas && respuestasCorrectas) {
      // Comparar si las preguntas han cambiado realmente
      const preguntasExistentes = evaluacionExistente.preguntas || []
      const hanCambiado = preguntas.length !== preguntasExistentes.length ||
        preguntas.some((p: any, index: number) => {
          const existente = preguntasExistentes[index]
          if (!existente || p.numero !== existente.numero || p.texto !== existente.texto) {
            return true
          }
          // Comparar alternativas
          if (p.alternativas.length !== existente.alternativas.length) {
            return true
          }
          return p.alternativas.some((a: any, altIndex: number) => {
            const altExistente = existente.alternativas[altIndex]
            return !altExistente || 
                   a.letra !== altExistente.letra || 
                   a.texto !== altExistente.texto ||
                   (respuestasCorrectas[p.numero] === a.letra) !== altExistente.esCorrecta
          })
        })

      if (hanCambiado) {
        console.log('Las preguntas han cambiado, actualizando...')
        // Usar una transacción para asegurar consistencia
        await prisma.$transaction(async (tx) => {
          // Eliminar en orden correcto: RespuestaAlumno → Alternativa → Pregunta
          
          // 1. Eliminar respuestas de alumnos que referencian las preguntas
          // @ts-ignore - Prisma client sync issue
          await tx.respuestaAlumno.deleteMany({
            where: { pregunta: { evaluacionId: id } }
          })
          
          // 2. Eliminar alternativas
          // @ts-ignore - Prisma client sync issue
          await tx.alternativa.deleteMany({
            where: { pregunta: { evaluacionId: id } }
          })
          
          // 3. Luego eliminar preguntas
          // @ts-ignore - Prisma client sync issue
          await tx.pregunta.deleteMany({
            where: { evaluacionId: id }
          })

          // Crear nuevas preguntas y alternativas
          for (const pregunta of preguntas) {
            // @ts-ignore - Prisma client sync issue
            const nuevaPregunta = await tx.pregunta.create({
              data: {
                numero: pregunta.numero,
                texto: pregunta.texto,
                evaluacionId: id
              }
            })

            // Crear alternativas para esta pregunta
            for (const alternativa of pregunta.alternativas) {
              // @ts-ignore - Prisma client sync issue
              await tx.alternativa.create({
                data: {
                  letra: alternativa.letra,
                  texto: alternativa.texto,
                  esCorrecta: respuestasCorrectas[pregunta.numero] === alternativa.letra,
                  preguntaId: nuevaPregunta.id
                }
              })
            }
          }
        })
      } else {
        console.log('Las preguntas no han cambiado, saltando actualización de preguntas')
      }
    }

    // Obtener la evaluación actualizada
    // @ts-ignore - Prisma client sync issue
    const evaluacionActualizada = await prisma.evaluacion.findUnique({
      where: { id },
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

    console.log('Evaluación actualizada exitosamente')
    return NextResponse.json(evaluacionActualizada)
  } catch (error) {
    console.error('Error al actualizar evaluación:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available')
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE /api/evaluaciones/[id] - eliminar una evaluación
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 })
    }

    // Eliminar en orden: alternativas -> preguntas -> evaluación
    // @ts-ignore - Prisma client sync issue
    await prisma.alternativa.deleteMany({
      where: { pregunta: { evaluacionId: id } }
    })
    
    // @ts-ignore - Prisma client sync issue
    await prisma.pregunta.deleteMany({
      where: { evaluacionId: id }
    })
    
    // @ts-ignore - Prisma client sync issue
    await prisma.evaluacion.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error al eliminar evaluación:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 