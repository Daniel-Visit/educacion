import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resultadoId = parseInt(id);

    if (isNaN(resultadoId)) {
      return NextResponse.json(
        { error: 'ID de resultado inválido' },
        { status: 400 }
      );
    }

    // Eliminar el resultado y todas sus relaciones (cascade)
    await prisma.resultadoEvaluacion.delete({
      where: {
        id: resultadoId
      }
    });

    return NextResponse.json(
      { message: 'Resultado eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error eliminando resultado:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 