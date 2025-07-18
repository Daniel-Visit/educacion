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
        archivo: true,
        preguntas: {
          include: {
            alternativas: true,
          },
        },
      },
    });

    if (!evaluacion) {
      return NextResponse.json(
        { error: 'Evaluación no encontrada' },
        { status: 404 }
      );
    }

    // Leer el archivo CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'El archivo CSV debe tener al menos una fila de datos' },
        { status: 400 }
      );
    }

    // Procesar las líneas (ignorar la primera que es header)
    const dataLines = lines.slice(1);
    const alumnosMap = new Map<string, any>();
    const respuestasMap = new Map<string, any[]>();

    for (const line of dataLines) {
      const [rut, nombre, apellido, preguntaIdStr, alternativaDada] = line.split(',').map(cell => cell.trim());
      
      if (!rut || !nombre || !apellido || !preguntaIdStr || !alternativaDada) {
        continue; // Saltar líneas incompletas
      }

      const preguntaId = parseInt(preguntaIdStr);
      const pregunta = evaluacion.preguntas.find(p => p.id === preguntaId);
      
      if (!pregunta) {
        continue; // Saltar si la pregunta no existe
      }

      // Buscar la alternativa correcta
      const alternativaCorrecta = pregunta.alternativas.find(a => a.esCorrecta);
      const esCorrecta = alternativaCorrecta?.letra === alternativaDada;
      const puntajeObtenido = esCorrecta ? 1 : 0;

      // Agrupar por alumno
      if (!alumnosMap.has(rut)) {
        alumnosMap.set(rut, {
          rut,
          nombre,
          apellido,
          puntajeTotal: 0,
          puntajeMaximo: evaluacion.preguntas.length,
          respuestas: []
        });
        respuestasMap.set(rut, []);
      }

      const alumno = alumnosMap.get(rut);
      alumno.puntajeTotal += puntajeObtenido;
      
      respuestasMap.get(rut)!.push({
        preguntaId,
        alternativaDada,
        esCorrecta,
        puntajeObtenido
      });
    }

    // Crear o actualizar alumnos y resultados en la base de datos
    const resultadoEvaluacion = await prisma.resultadoEvaluacion.create({
      data: {
        nombre: `Resultados ${evaluacion.archivo.titulo} - ${new Date().toLocaleDateString()}`,
        evaluacionId,
        totalAlumnos: alumnosMap.size,
        escalaNota: 7.0, // Escala por defecto
      },
    });

    for (const [rut, alumnoData] of alumnosMap) {
      // Crear o encontrar el alumno
      let alumno = await prisma.alumno.findUnique({
        where: { rut }
      });

      if (!alumno) {
        alumno = await prisma.alumno.create({
          data: {
            rut: alumnoData.rut,
            nombre: alumnoData.nombre,
            apellido: alumnoData.apellido,
          },
        });
      }

      // Calcular porcentaje y nota
      const porcentaje = (alumnoData.puntajeTotal / alumnoData.puntajeMaximo) * 100;
      const nota = (porcentaje / 100) * 7.0; // Escala 1-7

      // Crear resultado del alumno
      const resultadoAlumno = await prisma.resultadoAlumno.create({
        data: {
          resultadoEvaluacionId: resultadoEvaluacion.id,
          alumnoId: alumno.id,
          puntajeTotal: alumnoData.puntajeTotal,
          puntajeMaximo: alumnoData.puntajeMaximo,
          porcentaje,
          nota,
        },
      });

      // Crear respuestas individuales
      const respuestas = respuestasMap.get(rut) || [];
      for (const respuesta of respuestas) {
        await prisma.respuestaAlumno.create({
          data: {
            resultadoAlumnoId: resultadoAlumno.id,
            preguntaId: respuesta.preguntaId,
            alternativaDada: respuesta.alternativaDada,
            esCorrecta: respuesta.esCorrecta,
            puntajeObtenido: respuesta.puntajeObtenido,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      totalAlumnos: alumnosMap.size,
      resultadoEvaluacionId: resultadoEvaluacion.id,
    });

  } catch (error) {
    console.error('Error processing CSV:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 