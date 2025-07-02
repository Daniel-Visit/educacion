import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const metodologias = await prisma.metodologia.findMany({
      orderBy: { nombre_metodologia: 'asc' }
    });
    return NextResponse.json(metodologias);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener metodologías' }, { status: 500 });
  }
} 