import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const oas = await prisma.oa.findMany({
      orderBy: [
        { nivel_id: 'asc' },
        { asignatura_id: 'asc' },
        { eje_id: 'asc' },
      ],
    });

    // Obtener los datos de nivel y asignatura manualmente
    const oasWithDetails = await Promise.all(
      oas.map(async oa => {
        const nivel = await prisma.nivel.findUnique({
          where: { id: oa.nivel_id },
        });
        const asignatura = await prisma.asignatura.findUnique({
          where: { id: oa.asignatura_id },
        });

        return {
          ...oa,
          nivel,
          asignatura,
        };
      })
    );

    return NextResponse.json(oasWithDetails);
  } catch (error) {
    console.error('Error al obtener OAs:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
