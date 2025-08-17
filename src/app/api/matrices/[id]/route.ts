import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Interfaces para reemplazar tipos 'any'
interface IndicadorInput {
  descripcion: string;
  preguntas: number;
}

interface OAInput {
  oaId: number;
  indicadores: IndicadorInput[];
}

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const matrizId = parseInt(id);

    if (isNaN(matrizId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const matriz = await prisma.matrizEspecificacion.findUnique({
      where: { id: matrizId },
      include: {
        oas: {
          include: {
            indicadores: true,
          },
        },
        asignatura: true,
        nivel: true,
      },
    });

    if (!matriz) {
      return NextResponse.json(
        { error: 'Matriz no encontrada' },
        { status: 404 }
      );
    }

    // Obtener los OAs relacionados manualmente
    const oasWithDetails = await Promise.all(
      matriz.oas.map(async matrizOA => {
        const oa = await prisma.oa.findUnique({
          where: { id: matrizOA.oaId },
        });

        let nivel = null;
        let asignatura = null;
        if (oa) {
          nivel = await prisma.nivel.findUnique({
            where: { id: oa.nivel_id },
          });
          asignatura = await prisma.asignatura.findUnique({
            where: { id: oa.asignatura_id },
          });
        }

        return {
          ...matrizOA,
          oa: oa ? { ...oa, nivel, asignatura } : null,
        };
      })
    );

    return NextResponse.json({
      ...matriz,
      oas: oasWithDetails,
    });
  } catch (error) {
    console.error('Error al obtener matriz:', error);
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
    const matrizId = parseInt(id);

    if (isNaN(matrizId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { nombre, total_preguntas, asignatura_id, nivel_id, oas } = body;

    if (
      !nombre ||
      !total_preguntas ||
      !asignatura_id ||
      !nivel_id ||
      !oas ||
      !Array.isArray(oas)
    ) {
      return NextResponse.json(
        {
          error:
            'Datos incompletos o inválidos. Se requiere nombre, total_preguntas, asignatura_id, nivel_id y oas',
        },
        { status: 400 }
      );
    }

    // 1. Buscar todos los MatrizOA de la matriz
    const matrizOAs = await prisma.matrizOA.findMany({ where: { matrizId } });
    const matrizOAIds = matrizOAs.map(oa => oa.id);

    // 2. Eliminar todos los Indicadores de esos MatrizOA
    if (matrizOAIds.length > 0) {
      await prisma.indicador.deleteMany({
        where: { matrizOAId: { in: matrizOAIds } },
      });
    }

    // 3. Eliminar los MatrizOA
    await prisma.matrizOA.deleteMany({ where: { matrizId } });

    // 4. Actualizar matriz y crear nuevos OAs
    const matriz = await prisma.matrizEspecificacion.update({
      where: { id: matrizId },
      data: {
        nombre,
        total_preguntas,
        asignatura_id,
        nivel_id,
        oas: {
          create: oas.map((oa: OAInput) => ({
            oaId: oa.oaId,
            indicadores: {
              create: oa.indicadores.map((indicador: IndicadorInput) => ({
                descripcion: indicador.descripcion,
                preguntas: indicador.preguntas,
              })),
            },
          })),
        },
      },
      include: {
        oas: {
          include: {
            indicadores: true,
          },
        },
        asignatura: true,
        nivel: true,
      },
    });

    return NextResponse.json(matriz);
  } catch (error) {
    console.error('Error al actualizar matriz:', error);
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
    const matrizId = parseInt(id);

    if (isNaN(matrizId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // 1. Buscar todos los MatrizOA de la matriz
    const matrizOAs = await prisma.matrizOA.findMany({ where: { matrizId } });
    const matrizOAIds = matrizOAs.map(oa => oa.id);

    // 2. Eliminar todos los Indicadores de esos MatrizOA
    if (matrizOAIds.length > 0) {
      await prisma.indicador.deleteMany({
        where: { matrizOAId: { in: matrizOAIds } },
      });
    }

    // 3. Eliminar los MatrizOA
    await prisma.matrizOA.deleteMany({ where: { matrizId } });

    // 4. Eliminar la MatrizEspecificacion
    await prisma.matrizEspecificacion.delete({ where: { id: matrizId } });

    return NextResponse.json({ message: 'Matriz eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar matriz:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
