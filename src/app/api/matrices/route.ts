import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // @ts-ignore - Prisma client sync issue
    const matrices = await prisma.matrizEspecificacion.findMany({
      include: {
        oas: {
          include: {
            indicadores: true,
          },
        },
      },
    });

    // Obtener los OAs relacionados manualmente
    const matricesWithOAs = await Promise.all(
      matrices.map(async (matriz) => {
        const oasWithDetails = await Promise.all(
          matriz.oas.map(async (matrizOA) => {
            // @ts-ignore - Prisma client sync issue
            const oa = await prisma.oa.findUnique({
              where: { id: matrizOA.oaId },
            });
            
            let nivel = null;
            let asignatura = null;
            if (oa) {
              // @ts-ignore - Prisma client sync issue
              nivel = await prisma.nivel.findUnique({
                where: { id: oa.nivel_id },
              });
              // @ts-ignore - Prisma client sync issue
              asignatura = await prisma.asignatura.findUnique({
                where: { id: oa.asignatura_id },
              });
            }
            
            return {
              ...matrizOA,
              oa: oa
                ? { ...oa, nivel, asignatura }
                : null,
            };
          })
        );
        return {
          ...matriz,
          oas: oasWithDetails,
        };
      })
    );

    return NextResponse.json(matricesWithOAs);
  } catch (error) {
    console.error('Error al obtener matrices:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, total_preguntas, oas } = body;

    if (!nombre || !total_preguntas || !oas || !Array.isArray(oas)) {
      return NextResponse.json(
        { error: 'Datos incompletos o inválidos' },
        { status: 400 }
      );
    }

    // @ts-ignore - Prisma client sync issue
    const matriz = await prisma.matrizEspecificacion.create({
      data: {
        nombre,
        total_preguntas,
        oas: {
          create: oas.map((oa: any) => ({
            oaId: oa.oaId,
            indicadores: {
              create: oa.indicadores.map((indicador: any) => ({
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
      },
    });

    return NextResponse.json(matriz, { status: 201 });
  } catch (error) {
    console.error('Error al crear matriz:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message, stack: error.stack },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 