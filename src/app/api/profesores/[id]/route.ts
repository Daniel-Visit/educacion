import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Interfaces para tipar los datos de actualización
interface ProfesorUpdateData {
  rut?: string;
  nombre?: string;
  email?: string | null;
  telefono?: string | null;
  asignaturas?: {
    create: Array<{
      asignaturaId: number;
    }>;
  };
  niveles?: {
    create: Array<{
      nivelId: number;
    }>;
  };
}

// GET /api/profesores/[id] - Obtener profesor por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const includeRelations = searchParams.get('include') === 'true';

    const includeOptions = includeRelations
      ? {
          asignaturas: {
            include: {
              asignatura: true,
            },
          },
          niveles: {
            include: {
              nivel: true,
            },
          },
          horario: {
            include: {
              asignatura: true,
              nivel: true,
            },
          },
          modulos: {
            include: {
              moduloHorario: {
                include: {
                  horario: {
                    include: {
                      asignatura: true,
                      nivel: true,
                    },
                  },
                },
              },
            },
          },
        }
      : {};

    const profesor = await db.profesor.findUnique({
      where: { id: parseInt(params.id) },
      include: includeOptions,
    });

    if (!profesor) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: profesor,
      message: 'Profesor obtenido correctamente',
    });
  } catch (error) {
    console.error('Error al obtener profesor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/profesores/[id] - Actualizar profesor completo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rut, nombre, email, telefono, asignaturas, niveles } = body;

    // Validaciones básicas
    if (!rut || !nombre) {
      return NextResponse.json(
        { error: 'RUT y nombre son obligatorios' },
        { status: 400 }
      );
    }

    // Verificar si el profesor existe
    const profesorExistente = await db.profesor.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!profesorExistente) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el RUT ya existe en otro profesor
    const rutExistente = await db.profesor.findFirst({
      where: {
        rut,
        id: { not: parseInt(params.id) },
      },
    });

    if (rutExistente) {
      return NextResponse.json(
        { error: 'Ya existe otro profesor con este RUT' },
        { status: 400 }
      );
    }

    // Actualizar el profesor
    const data: ProfesorUpdateData = {
      rut,
      nombre,
      email: email || null,
      telefono: telefono || null,
    };

    // Actualizar asignaturas si se proporcionan
    if (asignaturas && Array.isArray(asignaturas)) {
      // Eliminar asignaturas existentes
      await db.profesorAsignatura.deleteMany({
        where: { profesorId: parseInt(params.id) },
      });

      // Crear nuevas asignaturas
      if (asignaturas.length > 0) {
        data.asignaturas = {
          create: asignaturas.map((asignaturaId: number) => ({
            asignaturaId: parseInt(asignaturaId.toString()),
          })),
        };
      }
    }

    // Actualizar niveles si se proporcionan
    if (niveles && Array.isArray(niveles)) {
      // Eliminar asignaturas existentes
      await db.profesorNivel.deleteMany({
        where: { profesorId: parseInt(params.id) },
      });

      // Crear nuevos niveles
      if (niveles.length > 0) {
        data.niveles = {
          create: niveles.map((nivelId: number) => ({
            nivelId: parseInt(nivelId.toString()),
          })),
        };
      }
    }

    const profesor = await db.profesor.update({
      where: { id: parseInt(params.id) },
      data,
      include: {
        asignaturas: {
          include: {
            asignatura: true,
          },
        },
        niveles: {
          include: {
            nivel: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: profesor,
      message: 'Profesor actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar profesor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/profesores/[id] - Actualizar profesor parcialmente
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rut, nombre, email, telefono, asignaturas, niveles } = body;

    // Verificar si el profesor existe
    const profesorExistente = await db.profesor.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!profesorExistente) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    // Construir datos de actualización
    const data: ProfesorUpdateData = {};

    if (rut !== undefined) {
      // Verificar si el RUT ya existe en otro profesor
      const rutExistente = await db.profesor.findFirst({
        where: {
          rut,
          id: { not: parseInt(params.id) },
        },
      });

      if (rutExistente) {
        return NextResponse.json(
          { error: 'Ya existe otro profesor con este RUT' },
          { status: 400 }
        );
      }
      data.rut = rut;
    }

    if (nombre !== undefined) data.nombre = nombre;
    if (email !== undefined) data.email = email;
    if (telefono !== undefined) data.telefono = telefono;

    // Actualizar asignaturas si se proporcionan
    if (asignaturas && Array.isArray(asignaturas)) {
      await db.profesorAsignatura.deleteMany({
        where: { profesorId: parseInt(params.id) },
      });

      if (asignaturas.length > 0) {
        data.asignaturas = {
          create: asignaturas.map((asignaturaId: number) => ({
            asignaturaId: parseInt(asignaturaId.toString()),
          })),
        };
      }
    }

    // Actualizar niveles si se proporcionan
    if (niveles && Array.isArray(niveles)) {
      await db.profesorNivel.deleteMany({
        where: { profesorId: parseInt(params.id) },
      });

      if (niveles.length > 0) {
        data.niveles = {
          create: niveles.map((nivelId: number) => ({
            nivelId: parseInt(nivelId.toString()),
          })),
        };
      }
    }

    const profesor = await db.profesor.update({
      where: { id: parseInt(params.id) },
      data,
      include: {
        asignaturas: {
          include: {
            asignatura: true,
          },
        },
        niveles: {
          include: {
            nivel: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: profesor,
      message: 'Profesor actualizado correctamente',
    });
  } catch (error) {
    console.error('Error al actualizar profesor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/profesores/[id] - Eliminar profesor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el profesor existe
    const profesor = await db.profesor.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        horario: true,
        modulos: true,
      },
    });

    if (!profesor) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el profesor tiene horarios asignados
    if (profesor.horario.length > 0) {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar el profesor porque tiene horarios asignados',
        },
        { status: 400 }
      );
    }

    // Verificar si el profesor tiene módulos asignados
    if (profesor.modulos.length > 0) {
      return NextResponse.json(
        {
          error:
            'No se puede eliminar el profesor porque tiene módulos asignados',
        },
        { status: 400 }
      );
    }

    // Eliminar el profesor (las relaciones se eliminan automáticamente por CASCADE)
    await db.profesor.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({
      message: 'Profesor eliminado correctamente',
    });
  } catch (error) {
    console.error('Error al eliminar profesor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
