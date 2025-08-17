import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  return NextResponse.json(
    { error: 'Método GET no soportado. Use POST para cargar resultados.' },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const evaluacionId = parseInt(formData.get('evaluacionId') as string);

    console.log('DEBUG: evaluacionId recibido:', evaluacionId);
    console.log('DEBUG: file recibido:', file?.name);

    if (!file || !evaluacionId) {
      return NextResponse.json(
        { error: 'Archivo y ID de evaluación son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que la evaluación existe
    console.log('DEBUG: Buscando evaluación con ID:', evaluacionId);

    const evaluacion = await prisma.evaluacion.findUnique({
      where: { id: evaluacionId },
      include: {
        preguntas: {
          include: {
            alternativas: true,
          },
        },
        matriz: {
          select: {
            nombre: true,
          },
        },
      },
    });

    console.log('DEBUG: Evaluación encontrada:', evaluacion ? 'SÍ' : 'NO');
    if (evaluacion) {
      console.log(
        'DEBUG: Evaluación tiene',
        evaluacion.preguntas.length,
        'preguntas'
      );
    }

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

    // Verificar formato del archivo (solo formato estándar con RUT)
    const isFormatoValido =
      headers.includes('rut') &&
      headers.includes('pregunta_id') &&
      headers.includes('alternativa_dada');

    console.log('Formato válido detectado:', isFormatoValido);

    if (!isFormatoValido) {
      return NextResponse.json(
        {
          error: `Formato de archivo no válido. Headers encontrados: ${headers.join(', ')}. Se requieren las columnas: rut, pregunta_id, alternativa_dada`,
        },
        { status: 400 }
      );
    }

    // Procesar CSV
    const data = csvText
      .split('\n')
      .slice(1)
      .map(line => {
        const values = line.split(separator).map(v => v.trim());
        return headers.reduce(
          (obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
          },
          {} as Record<string, string>
        );
      })
      .filter(row => {
        return row.rut && row.pregunta_id && row.alternativa_dada;
      });

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos válidos en el CSV' },
        { status: 400 }
      );
    }

    // Crear mapa de preguntas y alternativas correctas
    const preguntaMap = new Map();
    evaluacion.preguntas.forEach(
      (pregunta: {
        numero: number;
        id: number;
        alternativas: Array<{
          letra: string;
          esCorrecta: boolean;
        }>;
      }) => {
        const alternativaCorrecta = pregunta.alternativas.find(
          alt => alt.esCorrecta
        );
        preguntaMap.set(pregunta.numero, {
          id: pregunta.id,
          alternativaCorrecta: alternativaCorrecta?.letra || 'A',
        });
      }
    );

    console.log(
      'DEBUG: Mapa de preguntas creado:',
      Array.from(preguntaMap.entries())
    );

    // Extraer todos los RUTs únicos del CSV
    const rutsUnicos = Array.from(new Set(data.map(row => row.rut)));
    console.log('DEBUG: Total de RUTs únicos encontrados:', rutsUnicos.length);

    // Buscar todos los alumnos en una sola consulta
    const alumnos = await prisma.alumno.findMany({
      where: {
        rut: {
          in: rutsUnicos,
        },
      },
    });

    console.log('DEBUG: Alumnos encontrados en BD:', alumnos.length);

    // Crear mapa de alumnos por RUT para acceso rápido
    const alumnosMap = new Map();
    alumnos.forEach(
      (alumno: {
        id: number;
        rut: string;
        nombre: string;
        apellido: string;
      }) => {
        alumnosMap.set(alumno.rut, alumno);
      }
    );

    // Verificar alumnos no encontrados
    const alumnosNoEncontrados = rutsUnicos.filter(rut => !alumnosMap.has(rut));
    if (alumnosNoEncontrados.length > 0) {
      const alumnosNoEncontradosList = alumnosNoEncontrados
        .map(rut => `RUT: ${rut}`)
        .join(', ');
      return NextResponse.json(
        {
          error: `Los siguientes alumnos no existen en la base de datos: ${alumnosNoEncontradosList}. Por favor, asegúrate de que todos los alumnos estén registrados antes de cargar resultados.`,
        },
        { status: 400 }
      );
    }

    // Procesar datos y agrupar respuestas por alumno
    const respuestasPorAlumno = new Map();

    for (const row of data) {
      const alumnoId = row.rut;
      const alternativaDada = row.alternativa_dada.toUpperCase();
      const preguntaNumero = parseInt(row.pregunta_id);

      // Verificar que la pregunta existe usando el número de pregunta
      const preguntaInfo = preguntaMap.get(preguntaNumero);
      if (!preguntaNumero || !preguntaInfo) {
        console.log('DEBUG: Pregunta no encontrada:', preguntaNumero);
        continue; // Saltar preguntas que no existen
      }

      // Agregar respuesta al alumno
      if (!respuestasPorAlumno.has(alumnoId)) {
        respuestasPorAlumno.set(alumnoId, []);
      }

      respuestasPorAlumno.get(alumnoId).push({
        preguntaId: preguntaInfo.id,
        alternativaDada,
        esCorrecta:
          alternativaDada.toUpperCase() ===
          preguntaInfo.alternativaCorrecta.toUpperCase(),
        puntajeObtenido:
          alternativaDada.toUpperCase() ===
          preguntaInfo.alternativaCorrecta.toUpperCase()
            ? 1
            : 0,
      });
    }

    // Verificar que al menos hay un alumno válido
    if (respuestasPorAlumno.size === 0) {
      return NextResponse.json(
        {
          error:
            'No se encontraron alumnos válidos en el CSV. Todos los alumnos deben existir previamente en la base de datos.',
        },
        { status: 400 }
      );
    }

    // Crear resultado de evaluación
    const resultadoEvaluacion = await prisma.resultadoEvaluacion.create({
      data: {
        nombre: `Resultado ${evaluacion.matriz.nombre} - ${new Date().toLocaleDateString()}`,
        evaluacionId,
        totalAlumnos: respuestasPorAlumno.size,
        escalaNota: 7.0,
      },
    });

    console.log(
      'DEBUG: Procesando',
      respuestasPorAlumno.size,
      'alumnos con',
      data.length,
      'respuestas totales'
    );

    // Procesar todos los alumnos y sus respuestas en transacciones separadas
    const resultados = [];
    const todasLasRespuestas = [];

    for (const [alumnoId, respuestas] of Array.from(
      respuestasPorAlumno.entries()
    )) {
      const alumno = alumnosMap.get(alumnoId);
      const puntajeTotal = respuestas.reduce(
        (
          sum: number,
          r: {
            puntajeObtenido: number;
          }
        ) => sum + r.puntajeObtenido,
        0
      );
      const puntajeMaximo = respuestas.length;
      const porcentaje =
        puntajeMaximo > 0 ? (puntajeTotal / puntajeMaximo) * 100 : 0;
      const nota = (porcentaje / 100) * 7.0; // Escala de 1-7

      // Crear resultado del alumno en transacción separada
      const resultadoAlumno = await prisma.resultadoAlumno.create({
        data: {
          resultadoEvaluacionId: resultadoEvaluacion.id,
          alumnoId: alumno.id,
          puntajeTotal,
          puntajeMaximo,
          porcentaje,
          nota,
        },
      });

      // Preparar respuestas para inserción en lote
      const respuestasData = respuestas.map(
        (respuesta: {
          preguntaId: number;
          alternativaDada: string;
          esCorrecta: boolean;
          puntajeObtenido: number;
        }) => ({
          resultadoAlumnoId: resultadoAlumno.id,
          preguntaId: respuesta.preguntaId,
          alternativaDada: respuesta.alternativaDada,
          esCorrecta: respuesta.esCorrecta,
          puntajeObtenido: respuesta.puntajeObtenido,
        })
      );

      todasLasRespuestas.push(...respuestasData);
      resultados.push(resultadoAlumno);
    }

    // Insertar todas las respuestas en un solo lote
    if (todasLasRespuestas.length > 0) {
      await prisma.respuestaAlumno.createMany({
        data: todasLasRespuestas,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Resultados cargados exitosamente`,
      data: {
        resultadoId: resultadoEvaluacion.id,
        totalAlumnos: respuestasPorAlumno.size,
        totalRespuestas: data.length,
        evaluacion: evaluacion.matriz.nombre,
      },
    });
  } catch (error) {
    console.error('Error procesando resultados:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
