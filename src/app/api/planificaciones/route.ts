import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const planificaciones = await prisma.planificacionAnual.findMany({
      include: {
        horario: {
          include: {
            asignatura: true,
            nivel: true,
            profesor: true,
          },
        },
        asignaciones: {
          include: {
            oa: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(planificaciones);
  } catch (error) {
    console.error("Error al obtener planificaciones:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, horarioId, ano, asignaciones } = body;

    // Validar datos requeridos
    if (!nombre || !horarioId || !ano) {
      return NextResponse.json(
        { error: "Nombre, horarioId y año son requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el horario existe
    const horario = await prisma.horario.findUnique({
      where: { id: parseInt(horarioId) },
    });

    if (!horario) {
      return NextResponse.json(
        { error: "Horario no encontrado" },
        { status: 404 }
      );
    }

    // Crear la planificación
    const planificacion = await prisma.planificacionAnual.create({
      data: {
        nombre,
        horarioId: parseInt(horarioId),
        ano: parseInt(ano),
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

    // Si se proporcionan asignaciones, crearlas
    if (asignaciones && Array.isArray(asignaciones) && asignaciones.length > 0) {
      await prisma.asignacionOA.createMany({
        data: asignaciones.map((asignacion: any) => ({
          planificacionId: planificacion.id,
          oaId: asignacion.oaId,
          cantidadClases: asignacion.cantidadClases,
        })),
      });

      // Recargar la planificación con las asignaciones
      const planificacionConAsignaciones = await prisma.planificacionAnual.findUnique({
        where: { id: planificacion.id },
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

      return NextResponse.json(planificacionConAsignaciones, { status: 201 });
    }

    return NextResponse.json(planificacion, { status: 201 });
  } catch (error) {
    console.error("Error al crear planificación:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
} 