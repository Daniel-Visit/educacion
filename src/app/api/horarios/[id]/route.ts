import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/horarios/[id] - Obtener horario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt((await params).id);
    const horario = await db.horario.findUnique({
      where: { id },
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
    const id = parseInt((await params).id);
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
    const horarioExistente = await db.horario.findUnique({
      where: { id },
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
    const docente = await db.profesor.findUnique({
      where: { id: parseInt(docenteId) },
    });

    if (!docente) {
      return NextResponse.json(
        { error: 'El docente especificado no existe' },
        { status: 400 }
      );
    }

    // Validar que la asignatura existe
    const asignatura = await db.asignatura.findUnique({
      where: { id: parseInt(asignaturaId) },
    });

    if (!asignatura) {
      return NextResponse.json(
        { error: 'La asignatura especificada no existe' },
        { status: 400 }
      );
    }

    // Validar que el nivel existe
    const nivel = await db.nivel.findUnique({
      where: { id: parseInt(nivelId) },
    });

    if (!nivel) {
      return NextResponse.json(
        { error: 'El nivel especificado no existe' },
        { status: 400 }
      );
    }

    // Actualizar horario con módulos en una transacción
    const horario = await db.$transaction(
      async tx => {
        // Actualizar el horario
        await tx.horario.update({
          where: { id },
          data: {
            nombre: nombre.trim(),
            docenteId: parseInt(docenteId),
            asignaturaId: parseInt(asignaturaId),
            nivelId: parseInt(nivelId),
            fechaPrimeraClase: new Date(fechaPrimeraClase),
          },
        });

        // Eliminar módulos existentes
        await tx.moduloHorarioProfesor.deleteMany({
          where: {
            moduloHorario: {
              horarioId: id,
            },
          },
        });

        await tx.moduloHorario.deleteMany({
          where: { horarioId: id },
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
          const nuevoModulo = await tx.moduloHorario.create({
            data: {
              horarioId: id,
              dia: modulo.dia,
              horaInicio: modulo.horaInicio,
              duracion: modulo.duracion,
              orden: i + 1,
            },
          });

          // Asignar el profesor titular al módulo
          await tx.moduloHorarioProfesor.create({
            data: {
              moduloHorarioId: nuevoModulo.id,
              profesorId: parseInt(docenteId),
              rol: 'titular',
            },
          });
        }

        // Retornar el horario actualizado con sus módulos
        return await tx.horario.findUnique({
          where: { id },
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
      },
      {
        timeout: 10000, // Aumentar timeout a 10 segundos
        maxWait: 10000, // Máximo tiempo de espera
      }
    );

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
    const id = parseInt((await params).id);
    // Verificar si el horario existe
    const horario = await db.horario.findUnique({
      where: { id },
    });

    if (!horario) {
      return NextResponse.json(
        { error: 'Horario no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar horario y sus módulos en una transacción
    await db.$transaction(
      async tx => {
        // Eliminar profesores de módulos
        await tx.moduloHorarioProfesor.deleteMany({
          where: {
            moduloHorario: {
              horarioId: id,
            },
          },
        });

        // Eliminar módulos
        await tx.moduloHorario.deleteMany({
          where: { horarioId: id },
        });

        // Eliminar horario
        await tx.horario.delete({
          where: { id },
        });
      },
      {
        timeout: 10000, // Aumentar timeout a 10 segundos
        maxWait: 10000, // Máximo tiempo de espera
      }
    );

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
