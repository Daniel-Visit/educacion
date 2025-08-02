import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/horarios/[id] - Obtener horario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // @ts-ignore - Prisma client sync issue
    const horario = await prisma.horario.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        asignatura: true,
        nivel: true,
        profesor: true,
        modulos: {
          include: {
            profesores: {
              include: {
                profesor: true,
              },
            },
          },
          orderBy: {
            orden: 'asc',
          },
        },
      },
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: horario,
      message: 'Horario obtenido correctamente',
    });
  } catch (error) {
    console.error('Error al obtener horario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/horarios/[id] - Actualizar horario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      nombre,
      docenteId,
      asignaturaId,
      nivelId,
      fechaPrimeraClase,
      modulos,
    } = body;

    // Verificar si el horario existe
    // @ts-ignore - Prisma client sync issue
    const horarioExistente = await prisma.horario.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!horarioExistente) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    // Validaciones básicas
    if (
      !nombre ||
      !docenteId ||
      !asignaturaId ||
      !nivelId ||
      !fechaPrimeraClase
    ) {
      return NextResponse.json(
        {
          error:
            'Nombre, docente, asignatura, nivel y fecha de primera clase son obligatorios',
        },
        { status: 400 }
      );
    }

    if (!modulos || !Array.isArray(modulos) || modulos.length === 0) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un módulo' },
        { status: 400 }
      );
    }

    // Validar que el docente existe
    // @ts-ignore - Prisma client sync issue
    const docente = await prisma.profesor.findUnique({
      where: { id: parseInt(docenteId) },
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'El docente especificado no existe' },
        { status: 400 }
      );
    }

    // Validar que la asignatura existe
    // @ts-ignore - Prisma client sync issue
    const asignatura = await prisma.asignatura.findUnique({
      where: { id: parseInt(asignaturaId) },
    });

    if (!asignatura) {
      return NextResponse.json(
        { error: 'La asignatura especificada no existe' },
        { status: 400 }
      );
    }

    // Validar que el nivel existe
    // @ts-ignore - Prisma client sync issue
    const nivel = await prisma.nivel.findUnique({
      where: { id: parseInt(nivelId) },
    });

    if (!nivel) {
      return NextResponse.json(
        { error: 'El nivel especificado no existe' },
        { status: 400 }
      );
    }

    // Actualizar horario con módulos en una transacción
    // @ts-ignore - Prisma client sync issue
    const horario = await prisma.$transaction(async tx => {
      // Actualizar el horario
      // @ts-ignore - Prisma client sync issue
      await tx.horario.update({
        where: { id: parseInt(params.id) },
        data: {
          nombre: nombre.trim(),
          docenteId: parseInt(docenteId),
          asignaturaId: parseInt(asignaturaId),
          nivelId: parseInt(nivelId),
          fechaPrimeraClase: new Date(fechaPrimeraClase),
        },
      });

      // Eliminar módulos existentes
      // @ts-ignore - Prisma client sync issue
      await tx.moduloHorarioProfesor.deleteMany({
        where: {
          moduloHorario: {
            horarioId: parseInt(params.id),
          },
        },
      });

      // @ts-ignore - Prisma client sync issue
      await tx.moduloHorario.deleteMany({
        where: { horarioId: parseInt(params.id) },
      });

      // Crear los nuevos módulos
      for (let i = 0; i < modulos.length; i++) {
        const modulo = modulos[i];

        // Validar módulo
        if (!modulo.dia || !modulo.horaInicio || !modulo.duracion) {
          throw new Error(
            'Cada módulo debe tener día, hora de inicio y duración'
          );
        }

        // Validar que la duración esté en el rango permitido
        if (modulo.duracion < 30 || modulo.duracion > 240) {
          throw new Error('La duración debe estar entre 30 y 240 minutos');
        }

        // Crear el módulo
        // @ts-ignore - Prisma client sync issue
        const nuevoModulo = await tx.moduloHorario.create({
          data: {
            horarioId: parseInt(params.id),
            dia: modulo.dia,
            horaInicio: modulo.horaInicio,
            duracion: modulo.duracion,
            orden: i + 1,
          },
        });

        // Asignar el profesor titular al módulo
        // @ts-ignore - Prisma client sync issue
        await tx.moduloHorarioProfesor.create({
          data: {
            moduloHorarioId: nuevoModulo.id,
            profesorId: parseInt(docenteId),
            rol: 'titular',
          },
        });
      }

      // Retornar el horario actualizado con sus módulos
      // @ts-ignore - Prisma client sync issue
      return await tx.horario.findUnique({
        where: { id: parseInt(params.id) },
        include: {
          asignatura: true,
          nivel: true,
          profesor: true,
          modulos: {
            include: {
              profesores: {
                include: {
                  profesor: true,
                },
              },
            },
            orderBy: {
              orden: 'asc',
            },
          },
        },
      });
    });

    return NextResponse.json({
      data: horario,
      message: 'Horario actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar horario:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/horarios/[id] - Eliminar horario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el horario existe
    // @ts-ignore - Prisma client sync issue
    const horario = await prisma.horario.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar horario y sus módulos en una transacción
    // @ts-ignore - Prisma client sync issue
    await prisma.$transaction(async tx => {
      // Eliminar profesores de módulos
      // @ts-ignore - Prisma client sync issue
      await tx.moduloHorarioProfesor.deleteMany({
        where: {
          moduloHorario: {
            horarioId: parseInt(params.id),
          },
        },
      });

      // Eliminar módulos
      // @ts-ignore - Prisma client sync issue
      await tx.moduloHorario.deleteMany({
        where: { horarioId: parseInt(params.id) },
      });

      // Eliminar horario
      // @ts-ignore - Prisma client sync issue
      await tx.horario.delete({
        where: { id: parseInt(params.id) },
      });
    });

    return NextResponse.json({
      message: 'Horario eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar horario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
