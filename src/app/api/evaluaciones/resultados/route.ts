import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const evaluacionId = parseInt(formData.get('evaluacionId') as string);

    if (!file || !evaluacionId) {
      return NextResponse.json(
        { error: 'Archivo y ID de evaluación son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que la evaluación existe
    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        preguntas: {
          include: {
            alternativas: true
          }
        },
        matriz: {
          select: {
            nombre: true
          }
        }
      }
    });

    if (!evaluacion) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    // Leer el archivo CSV
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'El archivo CSV debe tener al menos una fila de datos' },
        { status: 400 }
      );
    }

    // Parsear headers - soportar tanto coma como punto y coma
    const firstLine = lines[0];
    const separator = firstLine.includes(';') ? ';' : ',';
    const headers = firstLine.split(separator).map(h => h.trim().toLowerCase());
    
    console.log('Headers detectados:', headers);
    console.log('Separador usado:', separator);
    
    // Detectar formato del archivo
    const isFormatoReal = headers.includes('id') && headers.includes('nombre') && headers.includes('respuesta') && headers.includes('pregunta');
    const isFormatoEsperado = headers.includes('rut') && headers.includes('nombre') && headers.includes('apellido') && headers.includes('pregunta_id') && headers.includes('alternativa_dada');
    
    console.log('Formato real detectado:', isFormatoReal);
    console.log('Formato esperado detectado:', isFormatoEsperado);
    
    if (!isFormatoReal && !isFormatoEsperado) {
      return NextResponse.json(
        { error: `Formato de archivo no reconocido. Headers encontrados: ${headers.join(', ')}. Se esperan columnas: ID, NOMBRE, RESPUESTA, PREGUNTA o rut, nombre, apellido, pregunta_id, alternativa_dada` },
        { status: 400 }
      );
    }

    // Parsear datos
    const data = lines.slice(1).map(line => {
      const values = line.split(separator).map(v => v.trim());
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as any);
    }).filter(row => {
      if (isFormatoReal) {
        return row.id && row.nombre && row.respuesta && row.pregunta;
      } else {
        return row.rut && row.nombre && row.apellido && row.pregunta_id && row.alternativa_dada;
      }
    });

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos válidos en el CSV' },
        { status: 400 }
      );
    }

    // Crear mapa de preguntas y alternativas correctas
    const preguntaMap = new Map();
    evaluacion.preguntas.forEach(pregunta => {
      const alternativaCorrecta = pregunta.alternativas.find(alt => alt.esCorrecta);
      preguntaMap.set(pregunta.numero, {
        id: pregunta.id,
        alternativaCorrecta: alternativaCorrecta?.letra || 'A'
      });
    });

    // Procesar datos y crear/actualizar alumnos
    const alumnosMap = new Map();
    const respuestasPorAlumno = new Map();

    for (const row of data) {
      let alumnoId, preguntaId, alternativaDada, nombreCompleto;
      
      if (isFormatoReal) {
        // Formato real: ID;NOMBRE;RESPUESTA;PREGUNTA
        alumnoId = row.id;
        nombreCompleto = row.nombre;
        alternativaDada = row.respuesta.toUpperCase();
        preguntaId = parseInt(row.pregunta);
      } else {
        // Formato esperado: rut,nombre,apellido,pregunta_id,alternativa_dada
        alumnoId = row.rut;
        nombreCompleto = `${row.nombre} ${row.apellido}`;
        alternativaDada = row.alternativa_dada.toUpperCase();
        preguntaId = parseInt(row.pregunta_id);
      }
      
      // Verificar que la pregunta existe
      const preguntaInfo = preguntaMap.get(preguntaId);
      if (!preguntaId || !preguntaInfo) {
        continue; // Saltar preguntas que no existen
      }

      // Crear o obtener alumno
      let alumno = alumnosMap.get(alumnoId);
      if (!alumno) {
        // Generar RUT único basado en ID si no existe
        const rut = isFormatoReal ? `${alumnoId}-${Date.now()}` : alumnoId;
        
        // Separar nombre y apellido del nombre completo
        const nombrePartes = nombreCompleto.split(' ');
        const nombre = nombrePartes[0] || '';
        const apellido = nombrePartes.slice(1).join(' ') || '';
        
        alumno = await prisma.alumno.upsert({
          where: { rut },
          update: {},
          create: {
            rut,
            nombre,
            apellido
          }
        });
        alumnosMap.set(alumnoId, alumno);
        respuestasPorAlumno.set(alumnoId, []);
      }

      // Agregar respuesta
      respuestasPorAlumno.get(alumnoId).push({
        preguntaId: preguntaInfo.id,
        alternativaDada,
        esCorrecta: alternativaDada.toUpperCase() === preguntaInfo.alternativaCorrecta.toUpperCase(),
        puntajeObtenido: alternativaDada.toUpperCase() === preguntaInfo.alternativaCorrecta.toUpperCase() ? 1 : 0
      });
    }

         // Crear resultado de evaluación
     const resultadoEvaluacion = await prisma.resultadoEvaluacion.create({
       data: {
         nombre: `Resultado ${evaluacion.matriz.nombre} - ${new Date().toLocaleDateString()}`,
         evaluacionId,
         totalAlumnos: alumnosMap.size,
         escalaNota: 7.0
       }
     });

    // Crear resultados por alumno
    const resultadosAlumnos = [];
    for (const [rut, alumno] of alumnosMap) {
      const respuestas = respuestasPorAlumno.get(rut);
      const puntajeTotal = respuestas.reduce((sum: number, r: any) => sum + r.puntajeObtenido, 0);
      const puntajeMaximo = respuestas.length;
      const porcentaje = puntajeMaximo > 0 ? (puntajeTotal / puntajeMaximo) * 100 : 0;
      const nota = (porcentaje / 100) * 7.0; // Escala de 1-7

      const resultadoAlumno = await prisma.resultadoAlumno.create({
        data: {
          resultadoEvaluacionId: resultadoEvaluacion.id,
          alumnoId: alumno.id,
          puntajeTotal,
          puntajeMaximo,
          porcentaje,
          nota
        }
      });

      // Crear respuestas individuales
      for (const respuesta of respuestas) {
        await prisma.respuestaAlumno.create({
          data: {
            resultadoAlumnoId: resultadoAlumno.id,
            preguntaId: respuesta.preguntaId,
            alternativaDada: respuesta.alternativaDada,
            esCorrecta: respuesta.esCorrecta,
            puntajeObtenido: respuesta.puntajeObtenido
          }
        });
      }

      resultadosAlumnos.push(resultadoAlumno);
    }

    return NextResponse.json({
      success: true,
      message: `Resultados cargados exitosamente`,
             data: {
         resultadoId: resultadoEvaluacion.id,
         totalAlumnos: alumnosMap.size,
         totalRespuestas: data.length,
         evaluacion: evaluacion.matriz.nombre
       }
    });

  } catch (error) {
    console.error('Error procesando resultados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 