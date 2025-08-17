import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const archivos = await prisma.archivo.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(archivos);
  } catch (error) {
    console.error('Error al obtener archivos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [API] POST /api/archivos - Iniciando creación de archivo');
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
      console.log('❌ [API] Tipo inválido:', tipo);
      return NextResponse.json(
        { error: 'Tipo debe ser planificacion, material o evaluacion' },
        { status: 400 }
      );
    }

    // Validar que el contenido sea JSON válido
    try {
      JSON.parse(contenido);
      console.log('✅ [API] JSON válido');
    } catch (error) {
      console.log('❌ [API] JSON inválido:', error);
      return NextResponse.json(
        { error: 'El contenido debe ser JSON válido' },
        { status: 400 }
      );
    }

    // Validar tamaño del contenido
    if (contenido.length > 1000000) {
      // 1MB
      console.log(
        '❌ [API] Contenido demasiado grande:',
        contenido.length,
        'bytes'
      );
      return NextResponse.json(
        { error: 'El contenido es demasiado grande' },
        { status: 400 }
      );
    }
    console.log(
      '✅ [API] Tamaño de contenido válido:',
      contenido.length,
      'bytes'
    );

    console.log('🔵 [API] Creando archivo en base de datos...');
    console.log('🔵 [API] Datos a insertar:', {
      titulo,
      tipo,
      contenidoLength: contenido.length,
    });

    let archivo;
    try {
      archivo = await prisma.archivo.create({
        data: {
          titulo,
          tipo,
          contenido,
        },
      });
      console.log('✅ [API] Archivo creado exitosamente:', {
        id: archivo.id,
        titulo: archivo.titulo,
      });
    } catch (dbError) {
      console.error('❌ [API] Error en base de datos:', dbError);
      throw dbError;
    }

    return NextResponse.json(archivo, { status: 201 });
  } catch (error) {
    console.error('❌ [API] Error al crear archivo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
