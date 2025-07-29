import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const asignaturaId = formData.get('asignaturaId') as string;
    const nivelId = formData.get('nivelId') as string;
    
    // Verificar que los IDs sean números válidos
    const asignaturaIdNum = parseInt(asignaturaId);
    const nivelIdNum = parseInt(nivelId);

    if (!file || !asignaturaId || !nivelId) {
      return NextResponse.json({ 
        error: 'Archivo, asignatura y nivel son requeridos' 
      }, { status: 400 });
    }

    // Verificar que sea un archivo CSV
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      return NextResponse.json({ error: 'El archivo debe ser un CSV válido' }, { status: 400 });
    }

    // Leer el contenido del archivo
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'El archivo CSV debe tener al menos una fila de datos' }, { status: 400 });
    }

    // Parsear headers
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
    


    // Verificar headers requeridos
    const requiredHeaders = ['oa_identificador', 'tipo_oa', 'indicador', 'preguntas_por_indicador'];
    for (const header of requiredHeaders) {
      if (!headers.includes(header)) {
        return NextResponse.json({ 
          error: `El archivo debe contener la columna "${header}"` 
        }, { status: 400 });
      }
    }

    // Procesar todas las filas de datos
    const matrizData: any[] = [];
    let tieneContenido = false;
    let tieneHabilidad = false;

    for (let i = 1; i < lines.length; i++) {
      const dataLine = lines[i];
      const values = dataLine.split(separator).map(v => {
        const trimmed = v.trim();
        // Remover comillas dobles del inicio y final si existen
        return trimmed.replace(/^"|"$/g, '');
      });
      const rowData = headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as any);

      // Validar datos básicos
      if (!rowData.oa_identificador || !rowData.tipo_oa || !rowData.indicador || !rowData.preguntas_por_indicador) {
        return NextResponse.json({ 
          error: `Fila ${i + 1}: Datos incompletos. Todos los campos son obligatorios` 
        }, { status: 400 });
      }

      // Validar tipo de OA
      if (rowData.tipo_oa === 'Contenido') {
        tieneContenido = true;
      } else if (rowData.tipo_oa === 'Habilidad') {
        tieneHabilidad = true;
      } else {
        return NextResponse.json({ 
          error: `Fila ${i + 1}: tipo_oa debe ser "Contenido" o "Habilidad"` 
        }, { status: 400 });
      }

      // Validar preguntas por indicador
      const preguntasPorIndicador = parseInt(rowData.preguntas_por_indicador);
      if (isNaN(preguntasPorIndicador) || preguntasPorIndicador <= 0) {
        return NextResponse.json({ 
          error: `Fila ${i + 1}: preguntas_por_indicador debe ser un número positivo` 
        }, { status: 400 });
      }

      matrizData.push(rowData);
    }



    // Verificar que todos los OAs existen y pertenecen a la asignatura y nivel
    const oaIdentificadores = [...new Set(matrizData.map(row => row.oa_identificador))]; // Obtener OAs únicos
    
        const oas = await prisma.oa.findMany({
      where: {
        oas_id: { in: oaIdentificadores },
        asignatura_id: parseInt(asignaturaId),
        nivel_id: parseInt(nivelId)
      },
      include: {
        nivel: true,
        asignatura: true
      }
    });
    
    if (oas.length !== oaIdentificadores.length) {
      // Buscar todos los OAs disponibles para esta asignatura/nivel para dar mejor información
      const todosLosOAs = await prisma.oa.findMany({
        where: {
          asignatura_id: parseInt(asignaturaId),
          nivel_id: parseInt(nivelId)
        },
        select: {
          oas_id: true,
          tipo_eje: true
        }
      });
      
      const oasNoEncontrados = oaIdentificadores.filter(id => !oas.some(oa => oa.oas_id === id));
      
      return NextResponse.json({ 
        error: `Los siguientes OAs no existen o no pertenecen a la asignatura y nivel seleccionados: ${oaIdentificadores.join(', ')}. OAs disponibles: ${todosLosOAs.map(oa => oa.oas_id).join(', ')}` 
      }, { status: 400 });
    }

    // Verificar si hay OAs de habilidad disponibles para esta asignatura/nivel
    const oasDisponibles = await prisma.oa.findMany({
      where: {
        asignatura_id: parseInt(asignaturaId),
        nivel_id: parseInt(nivelId)
      }
    });

    const tieneOAsHabilidadDisponibles = oasDisponibles.some(oa => oa.tipo_eje === 'Habilidad');
    const tieneOAsContenidoDisponibles = oasDisponibles.some(oa => oa.tipo_eje === 'Contenido');

    // Validar que hay al menos un OA de cada tipo disponible
    if (tieneOAsContenidoDisponibles && !tieneContenido) {
      return NextResponse.json({ 
        error: 'Debe haber al menos un OA de tipo "Contenido"' 
      }, { status: 400 });
    }
    if (tieneOAsHabilidadDisponibles && !tieneHabilidad) {
      return NextResponse.json({ 
        error: 'Debe haber al menos un OA de tipo "Habilidad"' 
      }, { status: 400 });
    }

    // Preparar respuesta con los datos procesados
    const response = {
      oas: matrizData.map(row => {
        const oa = oas.find(o => o.oas_id === row.oa_identificador);
        if (!oa) {
          throw new Error(`OA no encontrado: ${row.oa_identificador}`);
        }
        return {
          id: oa.id,
          oas_id: oa.oas_id,
          descripcion_oas: oa.descripcion_oas,
          eje_id: oa.eje_id,
          eje_descripcion: oa.eje_descripcion,
          nivel_id: oa.nivel_id,
          asignatura_id: oa.asignatura_id,
          tipo_eje: oa.tipo_eje,
          basal: oa.basal,
          minimo_clases: oa.minimo_clases,
          nivel: oa.nivel,
          asignatura: oa.asignatura,
          indicador: row.indicador,
          preguntas_por_indicador: parseInt(row.preguntas_por_indicador)
        };
      })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error al procesar CSV:', error);
    return NextResponse.json({ 
      error: 'Error al procesar el archivo CSV' 
    }, { status: 500 });
  }
} 