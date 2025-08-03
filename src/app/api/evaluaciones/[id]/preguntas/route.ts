import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const evaluacionId = parseInt(id);

    if (isNaN(evaluacionId)) {
      return NextResponse.json(
        { error: 'ID de evaluación inválido' },
        { status: 400 }
      );
    }

    // Obtener las preguntas de la evaluación ordenadas por número
    const preguntas = await prisma.pregunta.findMany({
      where: { evaluacionId },
      select: {
        id: true,
        numero: true,
        texto: true,
      },
      orderBy: {
        numero: 'asc',
      },
    });

    console.log(
      `Preguntas encontradas para evaluación ${evaluacionId}:`,
      preguntas.length
    );

    return NextResponse.json(preguntas);
  } catch (error) {
    console.error('Error obteniendo preguntas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
