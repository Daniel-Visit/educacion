import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planificacionId = parseInt(id);

    if (isNaN(planificacionId)) {
      return NextResponse.json(
        { error: 'ID de planificación inválido' },
        { status: 400 }
      );
    }

    const planificacion = await db.planificacionAnual.findUnique({
      where: { id: planificacionId },
      include: {
        horario: {
          include: {
            asignatura: true,
            nivel: true,
            profesor: true,
            modulos: true,
          },
        },
        asignaciones: {
          include: {
            oa: {
              include: {
                asignatura: true,
                nivel: true,
              },
            },
          },
        },
      },
    });

    if (!planificacion) {
      return NextResponse.json(
        { error: 'Planificación no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(planificacion);
  } catch (error) {
    console.error('Error al obtener planificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planificacionId = parseInt(id);

    if (isNaN(planificacionId)) {
      return NextResponse.json(
        { error: 'ID de planificación inválido' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nombre, asignaciones } = body;

    // Verificar que la planificación existe
    const planificacionExistente = await db.planificacionAnual.findUnique({
      where: { id: planificacionId },
    });

    if (!planificacionExistente) {
      return NextResponse.json(
        { error: 'Planificación no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar la planificación
    const planificacionActualizada = await db.planificacionAnual.update({
      where: { id: planificacionId },
      data: {
        nombre,
        updatedAt: new Date(),
      },
      include: {
        horario: {
          include: {
            asignatura: true,
            nivel: true,
            profesor: true,
            modulos: true,
          },
        },
        asignaciones: {
          include: {
            oa: {
              include: {
                asignatura: true,
                nivel: true,
              },
            },
          },
        },
      },
    });

    // Si se proporcionan asignaciones, actualizarlas
    if (asignaciones && Array.isArray(asignaciones)) {
      // Eliminar asignaciones existentes
      await db.asignacionOA.deleteMany({
        where: { planificacionId },
      });

      // Crear nuevas asignaciones
      if (asignaciones.length > 0) {
        await db.asignacionOA.createMany({
          data: asignaciones.map(
            (asignacion: { oaId: number; cantidadClases: number }) => ({
              planificacionId: planificacionId,
              oaId: asignacion.oaId,
              cantidadClases: asignacion.cantidadClases,
            })
          ),
        });
      }
    }

    return NextResponse.json(planificacionActualizada);
  } catch (error) {
    console.error('Error al actualizar planificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planificacionId = parseInt(id);

    if (isNaN(planificacionId)) {
      return NextResponse.json(
        { error: 'ID de planificación inválido' },
        { status: 400 }
      );
    }

    // Verificar que la planificación existe
    const planificacionExistente = await db.planificacionAnual.findUnique({
      where: { id: planificacionId },
    });

    if (!planificacionExistente) {
      return NextResponse.json(
        { error: 'Planificación no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar las asignaciones primero
    await db.asignacionOA.deleteMany({
      where: { planificacionId: planificacionId },
    });

    // Luego eliminar la planificación
    await db.planificacionAnual.delete({
      where: { id: planificacionId },
    });

    return NextResponse.json({
      message: 'Planificación eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error al eliminar planificación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
