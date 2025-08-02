import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asignaturaId = searchParams.get('asignaturaId');
    const nivelId = searchParams.get('nivelId');
    const asignaturaIds = searchParams.get('asignaturaIds'); // Para múltiples asignaturas

    // Construir filtros
    const where: any = {};
    if (asignaturaIds) {
      // Si se proporcionan múltiples asignaturas
      const ids = asignaturaIds.split(',').map(id => parseInt(id));
      where.asignatura_id = { in: ids };
    } else if (asignaturaId) {
      // Si se proporciona una sola asignatura
      where.asignatura_id = parseInt(asignaturaId);
    }
    if (nivelId) {
      where.nivel_id = parseInt(nivelId);
    }

    // Obtener OAs con filtros
    const oas = await prisma.oa.findMany({
      where,
      orderBy: [{ eje_id: 'asc' }, { oas_id: 'asc' }],
    });

    // Agrupar OAs por eje_id y eje_descripcion
    const ejesMap = new Map();
    for (const oa of oas) {
      const ejeKey = `${oa.eje_id}||${oa.eje_descripcion}`;
      if (!ejesMap.has(ejeKey)) {
        ejesMap.set(ejeKey, {
          id: ejeKey, // Usar ejeKey como id único
          ejeId: oa.eje_id,
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
