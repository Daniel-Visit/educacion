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

export function useEvaluacionData(evaluacionId: string | null) {
  const [resultadoData, setResultadoData] = useState<EvaluacionData | null>(null);
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!evaluacionId) {
        setError('No se encontró evaluacionId en la URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos reales desde la API
        const response = await fetch(`/api/evaluaciones/${evaluacionId}/resultados`);
        if (!response.ok) {
          throw new Error('Error al cargar resultados');
        }
        const resultadosData = await response.json();
        
        // Cargar preguntas desde la API
        const preguntasResponse = await fetch(`/api/evaluaciones/${evaluacionId}/preguntas`);
        if (!preguntasResponse.ok) {
          throw new Error('Error al cargar preguntas');
        }
        const preguntasData = await preguntasResponse.json();
        
        // Transformar datos al formato esperado
        const resultadoTransformado: EvaluacionData = {
          id: evaluacionId,
          nombre: `Evaluación ${evaluacionId}`,
          fecha: new Date().toISOString(),
          evaluacion: {
            id: evaluacionId,
            nombre: `Evaluación ${evaluacionId}`,
            matriz: {
              id: "1",
              nombre: "Matriz de Especificación",
              nivelExigencia: 60
            }
          },
          respuestasAlumnos: resultadosData.map((resultado: any) => ({
            id: resultado.id.toString(),
            alumno: {
              id: resultado.alumno.rut,
              nombre: resultado.alumno.nombre,
              apellido: resultado.alumno.apellido
            },
            nota: resultado.nota,
            porcentaje: resultado.porcentaje,
            puntajeTotal: resultado.puntajeTotal,
            puntajeMaximo: resultado.puntajeMaximo,
            respuestas: resultado.respuestas
          }))
        };
        
        setResultadoData(resultadoTransformado);
        setPreguntas(preguntasData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [evaluacionId]);

  return { resultadoData, preguntas, loading, error };
} 