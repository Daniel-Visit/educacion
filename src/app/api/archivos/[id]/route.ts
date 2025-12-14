import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const archivo = await db.archivo.findUnique({
      where: { id: idNum },
    });

    if (!archivo) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(archivo);
  } catch (error) {
    console.error('Error al obtener archivo:', error);
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
    console.log('🔵 [API] PUT /api/archivos/[id] - Iniciando actualización');
    const { id } = await params;
    const idNum = parseInt(id);

    console.log('🔵 [API] ID recibido:', { id, idNum });

    if (isNaN(idNum)) {
      console.log('❌ [API] ID inválido:', id);
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { titulo, tipo, contenido } = body;

    console.log('🔵 [API] Datos recibidos:', {
      titulo,
      tipo,
      contenidoLength: contenido?.length,
    });

    if (!titulo || !tipo || !contenido) {
      console.log('❌ [API] Datos faltantes:', {
        titulo: !!titulo,
        tipo: !!tipo,
        contenido: !!contenido,
      });
      return NextResponse.json(
        { error: 'Título, tipo y contenido son requeridos' },
        { status: 400 }
      );
    }

    // Validar que el tipo sea válido
    const tiposValidos = ['planificacion', 'material', 'evaluacion'];
    if (!tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo debe ser planificacion, material o evaluacion' },
        { status: 400 }
      );
    }

    // Validar que el contenido sea JSON válido
    try {
      JSON.parse(contenido);
    } catch {
      return NextResponse.json(
        { error: 'El contenido debe ser JSON válido' },
        { status: 400 }
      );
    }

    console.log('🔵 [API] Actualizando archivo en base de datos...');
    const archivo = await db.archivo.update({
      where: { id: idNum },
      data: {
        titulo,
        tipo,
        contenido,
      },
    });

    console.log('✅ [API] Archivo actualizado exitosamente:', {
      id: archivo.id,
      titulo: archivo.titulo,
    });
    return NextResponse.json(archivo);
  } catch (error) {
    console.error('❌ [API] Error al actualizar archivo:', error);
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
    const idNum = parseInt(id);

    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    await db.archivo.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: 'Archivo eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
