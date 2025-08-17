// NOTA: Los modelos Prisma se acceden en minúscula y singular: prisma.evaluacion, prisma.pregunta, prisma.alternativa
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calcularEstadoEvaluacion } from '@/lib/evaluacion-utils';
import { MatrizEspecificacion } from '@/types/evaluacion';

// Interfaces para reemplazar tipos 'any'
interface Pregunta {
  numero: number;
  texto: string;
  alternativas: Alternativa[];
}

interface Alternativa {
  letra: string;
  texto: string;
}

interface UpdateData {
  contenido?: string;
  titulo?: string;
}

// GET /api/evaluaciones/[id] - obtener una evaluación específica con todos sus datos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id },
      include: {
        archivo: true,
        matriz: {
          include: {
            oas: {
              include: {
                oa: {
                  include: {
                    nivel: true,
                    asignatura: true,
                  },
                },
                indicadores: true,
              },
            },
          },
        },
        preguntas: {
          include: {
            alternativas: true,
            indicadores: true,
          },
        },
      },
    });

    if (!evaluacion) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluacion);
  } catch {
    console.error('Error al obtener evaluación');
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/evaluaciones/[id] - actualizar una evaluación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('PUT /api/evaluaciones/[id] - Iniciando actualización');
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const {
      contenido,
      titulo,
      preguntas,
      respuestasCorrectas,
      matrizId,
      indicadoresAsignados,
    } = body;
    console.log('🔍 [API] Datos recibidos:', {
      id,
      titulo: !!titulo,
      contenido: !!contenido,
      contenidoLength: contenido?.length,
      preguntas: preguntas?.length,
      respuestasCorrectas: !!respuestasCorrectas,
      respuestasCount: Object.keys(respuestasCorrectas || {}).length,
      matrizId,
      indicadoresAsignados: !!indicadoresAsignados,
      indicadoresCount: Object.keys(indicadoresAsignados || {}).length,
    });

    // Verificar que la evaluación existe
    console.log('🔍 [API] Buscando evaluación existente con ID:', id);
    const evaluacionExistente = await prisma.evaluacion.findUnique({
      where: { id },
      include: {
        preguntas: {
          include: {
            alternativas: true,
          },
        },
      },
    });
    console.log('🔍 [API] Evaluación encontrada:', !!evaluacionExistente);

    if (!evaluacionExistente) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar el archivo con el nuevo contenido y/o título
    if (contenido || titulo) {
      console.log(
        '🔍 [API] Actualizando archivo con ID:',
        evaluacionExistente.archivoId
      );
      const updateData: UpdateData = {};
      if (contenido) updateData.contenido = contenido;
      if (titulo) updateData.titulo = titulo;

      await prisma.archivo.update({
        where: { id: evaluacionExistente.archivoId },
        data: updateData,
      });
      console.log('🔍 [API] Archivo actualizado correctamente');
    }

    // Actualizar la matriz si se proporciona
    if (matrizId) {
      console.log('🔍 [API] Actualizando matriz con ID:', matrizId);
      await prisma.evaluacion.update({
        where: { id },
        data: { matrizId: matrizId },
      });
      console.log('🔍 [API] Matriz actualizada correctamente');
    }

    // Actualizar preguntas y alternativas solo si realmente han cambiado
    if (preguntas && respuestasCorrectas) {
      console.log('🔍 [API] Procesando preguntas y respuestas...');
      // Comparar si las preguntas han cambiado realmente
      const preguntasExistentes = evaluacionExistente.preguntas || [];
      console.log('🔍 [API] Preguntas existentes:', preguntasExistentes.length);
      console.log('🔍 [API] Preguntas nuevas:', preguntas.length);

      const hanCambiado =
        preguntas.length !== preguntasExistentes.length ||
        preguntas.some((p: Pregunta, index: number) => {
          const existente = preguntasExistentes[index];
          if (
            !existente ||
            p.numero !== existente.numero ||
            p.texto !== existente.texto
          ) {
            return true;
          }
          // Comparar alternativas
          if (p.alternativas.length !== existente.alternativas.length) {
            return true;
          }
          return p.alternativas.some((a: Alternativa, altIndex: number) => {
            const altExistente = existente.alternativas[altIndex];
            return (
              !altExistente ||
              a.letra !== altExistente.letra ||
              a.texto !== altExistente.texto ||
              (respuestasCorrectas[p.numero] === a.letra) !==
                altExistente.esCorrecta
            );
          });
        });

      if (hanCambiado) {
        console.log('🔍 [API] Las preguntas han cambiado, actualizando...');
        // Usar una transacción para asegurar consistencia
        await prisma.$transaction(async tx => {
          // Eliminar en orden correcto: RespuestaAlumno → Alternativa → PreguntaIndicador → Pregunta

          // 1. Eliminar respuestas de alumnos que referencian las preguntas
          await tx.respuestaAlumno.deleteMany({
            where: { pregunta: { evaluacionId: id } },
          });

          // 2. Eliminar alternativas
          await tx.alternativa.deleteMany({
            where: { pregunta: { evaluacionId: id } },
          });

          // 3. Eliminar indicadores de preguntas
          await tx.preguntaIndicador.deleteMany({
            where: { pregunta: { evaluacionId: id } },
          });

          // 4. Luego eliminar preguntas
          await tx.pregunta.deleteMany({
            where: { evaluacionId: id },
          });

          // Crear todas las preguntas de una vez
          const preguntasToCreate = preguntas.map((pregunta: Pregunta) => ({
            numero: pregunta.numero,
            texto: pregunta.texto,
            evaluacionId: id,
          }));

          await tx.pregunta.createMany({
            data: preguntasToCreate,
          });

          // Obtener las preguntas creadas para mapear números a IDs
          const preguntasConIds = await tx.pregunta.findMany({
            where: { evaluacionId: id },
            select: { id: true, numero: true },
          });

          // Crear todas las alternativas de una vez
          const alternativasToCreate: Array<{
            letra: string;
            texto: string;
            esCorrecta: boolean;
            preguntaId: number;
          }> = [];
          for (const pregunta of preguntas) {
            const preguntaConId = preguntasConIds.find(
              p => p.numero === pregunta.numero
            );
            if (preguntaConId) {
              for (const alternativa of pregunta.alternativas) {
                alternativasToCreate.push({
                  letra: alternativa.letra,
                  texto: alternativa.texto,
                  esCorrecta:
                    respuestasCorrectas[pregunta.numero] === alternativa.letra,
                  preguntaId: preguntaConId.id,
                });
              }
            }
          }

          if (alternativasToCreate.length > 0) {
            await tx.alternativa.createMany({
              data: alternativasToCreate,
            });
          }
        });
      } else {
        console.log(
          'Las preguntas no han cambiado, saltando actualización de preguntas'
        );
      }
    }

    // Actualizar indicadores asignados si se proporcionan
    if (indicadoresAsignados) {
      console.log('🔍 [API] Actualizando indicadores asignados...');
      console.log('🔍 [API] Indicadores recibidos:', indicadoresAsignados);

      // Eliminar indicadores existentes
      console.log('🔍 [API] Eliminando indicadores existentes...');
      await prisma.preguntaIndicador.deleteMany({
        where: {
          pregunta: {
            evaluacionId: id,
          },
        },
      });
      console.log('🔍 [API] Indicadores existentes eliminados');

      // Obtener las preguntas actuales para mapear números a IDs
      console.log('🔍 [API] Obteniendo preguntas actuales...');
      const preguntasActuales = await prisma.pregunta.findMany({
        where: { evaluacionId: id },
        select: { id: true, numero: true },
      });
      console.log(
        '🔍 [API] Preguntas actuales encontradas:',
        preguntasActuales.length
      );

      // Crear nuevos indicadores asignados
      const indicadoresToCreate: Array<{
        preguntaId: number;
        indicadorId: number;
        tipo: string;
      }> = [];

      console.log('🔍 [API] Procesando indicadores asignados...');
      console.log(
        '🔍 [API] Preguntas actuales:',
        preguntasActuales.map(p => ({ id: p.id, numero: p.numero }))
      );

      for (const [preguntaNumero, asignacion] of Object.entries(
        indicadoresAsignados
      )) {
        console.log(
          '🔍 [API] Procesando pregunta:',
          preguntaNumero,
          'asignación:',
          asignacion
        );

        const pregunta = preguntasActuales.find(
          p => p.numero === parseInt(preguntaNumero)
        );

        if (pregunta) {
          console.log('🔍 [API] Pregunta encontrada:', pregunta.id);
          const asignacionTyped = asignacion as {
            contenido?: number;
            habilidad?: number;
          };
          if (asignacionTyped.contenido) {
            console.log(
              '🔍 [API] Agregando indicador contenido:',
              asignacionTyped.contenido
            );
            indicadoresToCreate.push({
              preguntaId: pregunta.id,
              indicadorId: asignacionTyped.contenido,
              tipo: 'Contenido',
            });
          }
          if (asignacionTyped.habilidad) {
            console.log(
              '🔍 [API] Agregando indicador habilidad:',
              asignacionTyped.habilidad
            );
            indicadoresToCreate.push({
              preguntaId: pregunta.id,
              indicadorId: asignacionTyped.habilidad,
              tipo: 'Habilidad',
            });
          }
        } else {
          console.log(
            '🔍 [API] Pregunta NO encontrada para número:',
            preguntaNumero
          );
        }
      }

      console.log('🔍 [API] Indicadores a crear:', indicadoresToCreate);

      if (indicadoresToCreate.length > 0) {
        console.log('🔍 [API] Creando indicadores en BD...');
        await prisma.preguntaIndicador.createMany({
          data: indicadoresToCreate,
        });
        console.log('🔍 [API] Indicadores creados exitosamente');
      } else {
        console.log('🔍 [API] No hay indicadores para crear');
      }

      console.log('🔍 [API] Indicadores asignados actualizados');
    }

    // Calcular y actualizar el estado de la evaluación
    console.log('Calculando estado de la evaluación...');

    // Obtener la evaluación con todos los datos necesarios para calcular el estado
    const evaluacionParaEstado = await prisma.evaluacion.findUnique({
      where: { id },
      include: {
        matriz: {
          include: {
            oas: {
              include: {
                oa: {
                  include: {
                    nivel: true,
                    asignatura: true,
                  },
                },
                indicadores: true,
              },
            },
          },
        },
        preguntas: {
          include: {
            alternativas: true,
            indicadores: true,
          },
        },
      },
    });

    if (evaluacionParaEstado) {
      const estadoCalculado = calcularEstadoEvaluacion({
        preguntas: evaluacionParaEstado.preguntas,
        matriz: {
          id: evaluacionParaEstado.matriz.id,
          nombre: evaluacionParaEstado.matriz.nombre,
          total_preguntas: evaluacionParaEstado.matriz.total_preguntas,
          oas: evaluacionParaEstado.matriz.oas,
        } as MatrizEspecificacion,
      });

      await prisma.evaluacion.update({
        where: { id },
        data: { estado: estadoCalculado },
      });

      console.log('Estado de evaluación actualizado:', estadoCalculado);
    }

    // Obtener la evaluación actualizada
    const evaluacionActualizada = await prisma.evaluacion.findUnique({
      where: { id },
      include: {
        archivo: true,
        matriz: {
          include: {
            oas: {
              include: {
                oa: {
                  include: {
                    nivel: true,
                    asignatura: true,
                  },
                },
                indicadores: true,
              },
            },
          },
        },
        preguntas: {
          include: {
            alternativas: true,
            indicadores: true,
          },
        },
      },
    });

    console.log('Evaluación actualizada exitosamente');
    return NextResponse.json(evaluacionActualizada);
  } catch {
    console.error('Error al actualizar evaluación');
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/evaluaciones/[id] - eliminar una evaluación
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Eliminar en orden: alternativas -> preguntas -> evaluación
    await prisma.alternativa.deleteMany({
      where: { pregunta: { evaluacionId: id } },
    });

    await prisma.pregunta.deleteMany({
      where: { evaluacionId: id },
    });

    await prisma.evaluacion.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch {
    console.error('Error al eliminar evaluación');
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
