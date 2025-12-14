import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const imagenes = await db.imagen.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(imagenes);
  } catch (error) {
    console.error('Error al obtener imágenes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, tipo, data, tamaño } = body;

    if (!nombre || !tipo || !data || !tamaño) {
      return NextResponse.json(
        { error: 'Nombre, tipo, data y tamaño son requeridos' },
        { status: 400 }
      );
    }

    // Validar que sea una imagen
    if (!tipo.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (tamaño > MAX_SIZE) {
      return NextResponse.json(
        { error: 'La imagen no puede ser mayor a 5MB' },
        { status: 400 }
      );
    }

    // Validar que data sea Base64 válido
    if (!data.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'El formato de imagen no es válido' },
        { status: 400 }
      );
    }

    // Extraer solo la parte base64 pura (sin prefijo)
    const base64Data = data.split(',')[1];

    const imagen = await db.imagen.create({
      data: {
        nombre,
        tipo,
        data: base64Data,
        tamaño,
      },
    });

    return NextResponse.json(imagen, { status: 201 });
  } catch (error) {
    console.error('Error al crear imagen:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
