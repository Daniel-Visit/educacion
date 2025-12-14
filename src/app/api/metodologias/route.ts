import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const metodologias = await db.metodologia.findMany({
      orderBy: { nombre_metodologia: 'asc' },
    });
    return NextResponse.json(metodologias);
  } catch {
    return NextResponse.json(
      { error: 'Error al obtener metodologías' },
      { status: 500 }
    );
  }
}
