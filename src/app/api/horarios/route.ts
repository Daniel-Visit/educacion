import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/horarios - Listar horarios
export async function GET() {
  try {
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
    const {
      nombre,
      docenteId,
      asignaturaId,
      nivelId,
      fechaPrimeraClase,
      modulos,
    } = body;

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

    // Validar conflictos de horarios (mismo profesor, mismo día/hora)
    const conflictos = await validarConflictosHorarios(
      parseInt(docenteId),
      modulos,
      null // No hay horario existente en creación
    );

    if (conflictos.length > 0) {
      const mensajeError = conflictos
        .map(
          conflicto =>
            `El profesor ya está asignado a ${conflicto.horarioNombre} (${conflicto.asignaturaNombre} - ${conflicto.nivelNombre}) el ${conflicto.dia} de ${conflicto.horaInicio} a ${conflicto.horaFin}`
        )
        .join('; ');

      return NextResponse.json(
        { error: `Conflictos de horario detectados: ${mensajeError}` },
        { status: 400 }
      );
    }

    // Validar que el docente existe
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
    const horario = await prisma.$transaction(async tx => {
      // Crear el horario
      const nuevoHorario = await tx.horario.create({
        data: {
          nombre: nombre.trim(),
          docenteId: parseInt(docenteId),
          asignaturaId: parseInt(asignaturaId),
          nivelId: parseInt(nivelId),
          fechaPrimeraClase: new Date(fechaPrimeraClase),
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
        await tx.moduloHorarioProfesor.create({
          data: {
            moduloHorarioId: nuevoModulo.id,
            profesorId: parseInt(docenteId),
            rol: 'titular',
          },
        });
      }

      // Retornar el horario con sus módulos
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

// Función para validar conflictos de horarios
async function validarConflictosHorarios(
  docenteId: number,
  modulos: Array<{ dia: string; horaInicio: string; duracion: number }>,
  horarioExcluirId: number | null
) {
  const conflictos: Array<{
    horarioNombre: string;
    asignaturaNombre: string;
    nivelNombre: string;
    dia: string;
    horaInicio: string;
    horaFin: string;
  }> = [];

  try {
    // Obtener todos los horarios del profesor
    const horariosProfesor = await prisma.horario.findMany({
      where: {
        docenteId,
        ...(horarioExcluirId && { id: { not: horarioExcluirId } }),
      },
      include: {
        asignatura: true,
        nivel: true,
        modulos: true,
      },
    });

    // Verificar conflictos para cada módulo nuevo
    for (const modulo of modulos) {
      const moduloStart = parseTime(modulo.horaInicio);
      const moduloEnd = moduloStart + modulo.duracion;

      // Verificar contra cada horario existente del profesor
      for (const horario of horariosProfesor) {
        for (const moduloExistente of horario.modulos) {
          if (moduloExistente.dia === modulo.dia) {
            const existenteStart = parseTime(moduloExistente.horaInicio);
            const existenteEnd = existenteStart + moduloExistente.duracion;

            // Si hay solapamiento, hay conflicto
            if (moduloStart < existenteEnd && existenteStart < moduloEnd) {
              conflictos.push({
                horarioNombre: horario.nombre,
                asignaturaNombre: horario.asignatura.nombre,
                nivelNombre: horario.nivel.nombre,
                dia: modulo.dia,
                horaInicio: modulo.horaInicio,
                horaFin: formatTime(moduloStart + modulo.duracion),
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error al validar conflictos de horarios:', error);
  }

  return conflictos;
}

// Función auxiliar para parsear tiempo
function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Función auxiliar para formatear tiempo
function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
