import { useState, useEffect } from 'react';

interface EvaluacionData {
  id: string;
  nombre: string;
  fecha: string;
  evaluacion: {
    id: string;
    nombre: string;
    matriz: {
      id: string;
      nombre: string;
      nivelExigencia: number;
    };
  };
  respuestasAlumnos: Array<{
    id: string;
    alumno: {
      id: string;
      nombre: string;
      apellido: string;
    };
    nota: number;
    porcentaje: number;
    puntajeTotal?: number;
    puntajeMaximo?: number;
    respuestas?: Array<{
      preguntaId: number;
      alternativaDada: string;
      esCorrecta: boolean;
    }>;
  }>;
}

interface Pregunta {
  id: number;
  numero: number;
  texto: string;
}

export function useEvaluacionData(resultadoId: string | null) {
  const [resultadoData, setResultadoData] = useState<EvaluacionData | null>(
    null
  );
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log(
        'DEBUG: Iniciando carga de datos con resultadoId:',
        resultadoId
      );

      if (!resultadoId) {
        console.log('DEBUG: No hay resultadoId, estableciendo error');
        setError('No se encontró resultadoId en la URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('DEBUG: Obteniendo información del resultado...');
        // Primero obtener el resultado para obtener el evaluacionId
        const resultadoResponse = await fetch(
          `/api/resultados-evaluaciones/${resultadoId}`
        );
        if (!resultadoResponse.ok) {
          throw new Error('Error al cargar el resultado');
        }
        const resultadoInfo = await resultadoResponse.json();
        console.log(
          'DEBUG: Información del resultado obtenida:',
          resultadoInfo
        );

        const evaluacionId = resultadoInfo.evaluacionId;
        console.log('DEBUG: EvaluacionId obtenido:', evaluacionId);

        console.log('DEBUG: Cargando resultados de la evaluación...');
        // Cargar datos reales desde la API usando el evaluacionId correcto
        const response = await fetch(
          `/api/evaluaciones/${evaluacionId}/resultados`
        );
        if (!response.ok) {
          throw new Error('Error al cargar resultados');
        }
        const resultadosData = await response.json();
        console.log(
          'DEBUG: Resultados cargados, cantidad:',
          resultadosData.length
        );

        console.log('DEBUG: Cargando preguntas...');
        // Cargar preguntas desde la API usando el evaluacionId correcto
        const preguntasResponse = await fetch(
          `/api/evaluaciones/${evaluacionId}/preguntas`
        );
        if (!preguntasResponse.ok) {
          throw new Error('Error al cargar preguntas');
        }
        const preguntasData = await preguntasResponse.json();
        console.log(
          'DEBUG: Preguntas cargadas, cantidad:',
          preguntasData.length
        );

        // Transformar datos al formato esperado
        const resultadoTransformado: EvaluacionData = {
          id: resultadoId,
          nombre: resultadoInfo.nombre || `Resultado ${resultadoId}`,
          fecha: resultadoInfo.fechaCarga || new Date().toISOString(),
          evaluacion: {
            id: evaluacionId.toString(),
            nombre:
              resultadoInfo.evaluacion?.titulo || `Evaluación ${evaluacionId}`,
            matriz: {
              id: '1',
              nombre:
                resultadoInfo.evaluacion?.matrizNombre ||
                'Matriz de Especificación',
              nivelExigencia: 60,
            },
          },
          respuestasAlumnos: resultadosData.map((resultado: any) => ({
            id: resultado.id.toString(),
            alumno: {
              id: resultado.alumno.rut,
              nombre: resultado.alumno.nombre,
              apellido: resultado.alumno.apellido,
            },
            nota: resultado.nota,
            porcentaje: resultado.porcentaje,
            puntajeTotal: resultado.puntajeTotal,
            puntajeMaximo: resultado.puntajeMaximo,
            respuestas: resultado.respuestas,
          })),
        };

        console.log('DEBUG: Datos transformados, estableciendo estado...');
        setResultadoData(resultadoTransformado);
        setPreguntas(preguntasData);
        console.log('DEBUG: Estado establecido, finalizando carga');
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
        console.log('DEBUG: Loading establecido en false');
      }
    };

    loadData();
  }, [resultadoId]);

  return { resultadoData, preguntas, loading, error };
}
