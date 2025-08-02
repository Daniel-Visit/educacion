import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener todas las asignaciones de la planificación 2
    const asignaciones = await prisma.asignacionOA.findMany({
      where: {
        planificacionId: 2,
      },
      include: {
        oa: {
          include: {
            asignatura: true,
            nivel: true,
          },
        },
      },
      orderBy: {
        oaId: 'asc',
      },
    });

    return NextResponse.json({
      total: asignaciones.length,
      asignaciones: asignaciones.map(asignacion => ({
        id: asignacion.id,
        oaId: asignacion.oaId,
        cantidadClases: asignacion.cantidadClases,
        oa: {
          oas_id: asignacion.oa.oas_id,
          descripcion: asignacion.oa.descripcion_oas,
          asignatura: asignacion.oa.asignatura.nombre,
          nivel: asignacion.oa.nivel.nombre,
        },
      })),
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
