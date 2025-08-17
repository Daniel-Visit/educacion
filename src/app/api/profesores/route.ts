import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Interfaz para los datos de creación del profesor
interface ProfesorCreateData {
  rut: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
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

// GET /api/profesores - Listar profesores
export async function GET(request: NextRequest) {
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
        }
      : {};

    const profesores = await prisma.profesor.findMany({
      include: includeOptions,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      data: profesores,
      message: 'Profesores obtenidos correctamente',
    });
  } catch (error) {
    console.error('Error al obtener profesores:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/profesores - Crear nuevo profesor
export async function POST(request: NextRequest) {
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

    // Verificar si el RUT ya existe
    const profesorExistente = await prisma.profesor.findUnique({
      where: { rut },
    });

    if (profesorExistente) {
      return NextResponse.json(
        { error: 'Ya existe un profesor con este RUT' },
        { status: 400 }
      );
    }

    // Crear el profesor con sus relaciones
    const data: ProfesorCreateData = {
      rut,
      nombre,
      email: email || null,
      telefono: telefono || null,
    };

    // Agregar asignaturas si se proporcionan
    if (asignaturas && Array.isArray(asignaturas) && asignaturas.length > 0) {
      data.asignaturas = {
        create: asignaturas.map((asignaturaId: number) => ({
          asignaturaId: parseInt(asignaturaId.toString()),
        })),
      };
    }

    // Agregar niveles si se proporcionan
    if (niveles && Array.isArray(niveles) && niveles.length > 0) {
      data.niveles = {
        create: niveles.map((nivelId: number) => ({
          nivelId: parseInt(nivelId.toString()),
        })),
      };
    }

    const profesor = await prisma.profesor.create({
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

    return NextResponse.json(
      {
        data: profesor,
        message: 'Profesor creado correctamente',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear profesor:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
