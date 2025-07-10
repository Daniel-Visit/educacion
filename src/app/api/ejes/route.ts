import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Obtener todos los OAs ordenados por eje_id y oas_id
    const oas = await prisma.oa.findMany({
      orderBy: [
        { eje_id: 'asc' },
        { oas_id: 'asc' },
      ],
    });

    // Agrupar OAs por eje_id y eje_descripcion
    const ejesMap = new Map();
    for (const oa of oas) {
      const ejeKey = `${oa.eje_id}||${oa.eje_descripcion}`;
      if (!ejesMap.has(ejeKey)) {
        ejesMap.set(ejeKey, {
          id: oa.eje_id,
          descripcion: oa.eje_descripcion,
          oas: [],
        });
      }
      ejesMap.get(ejeKey).oas.push(oa);
    }
    const ejes = Array.from(ejesMap.values());
    return NextResponse.json(ejes);
  } catch (error) {
    console.error('Error al obtener ejes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 