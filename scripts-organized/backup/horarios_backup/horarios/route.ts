import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/horarios - Listar horarios
export async function GET(request: NextRequest) {
  try {
    // @ts-ignore - Prisma client sync issue
    const horarios = await prisma.horario.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      data: horarios,
      message: 'Horarios obtenidos correctamente',
    });
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/horarios - Crear nuevo horario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, docenteId, asignaturaId, nivelId, modulos } = body;

    // Validaciones básicas
    if (!nombre || !docenteId || !asignaturaId || !nivelId) {
      return NextResponse.json(
        { error: 'Nombre, docente, asignatura y nivel son obligatorios' },
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

    // Crear horario con módulos en una transacción
    // @ts-ignore - Prisma client sync issue
    const horario = await prisma.$transaction(async tx => {
      // Crear el horario
      // @ts-ignore - Prisma client sync issue
      const nuevoHorario = await tx.horario.create({
        data: {
          nombre: nombre.trim(),
          docenteId: parseInt(docenteId),
          asignaturaId: parseInt(asignaturaId),
          nivelId: parseInt(nivelId),
        },
      });

      // Crear los módulos
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
            horarioId: nuevoHorario.id,
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

      // Retornar el horario con sus módulos
      // @ts-ignore - Prisma client sync issue
      return await tx.horario.findUnique({
        where: { id: nuevoHorario.id },
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

    return NextResponse.json(
      {
        data: horario,
        message: 'Horario creado correctamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear horario:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
