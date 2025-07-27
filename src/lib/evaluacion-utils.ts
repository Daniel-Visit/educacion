import { MatrizEspecificacion } from '@/types/evaluacion'

export type EstadoEvaluacion = 
  | 'borrador'
  | 'preguntas_incompletas'
  | 'indicadores_incompletos'
  | 'cantidad_incorrecta'
  | 'completa'

interface EvaluacionData {
  preguntas: Array<{
    numero: number
    alternativas: Array<{
      letra: string
      esCorrecta: boolean
    }>
    indicadores?: Array<{
      tipo: string
      indicadorId: number
    }>
  }>
  matriz: MatrizEspecificacion
}

export function calcularEstadoEvaluacion(data: EvaluacionData): EstadoEvaluacion {
  const { preguntas, matriz } = data

  console.log('[calcularEstadoEvaluacion] Debug:', {
    preguntasLength: preguntas.length,
    matrizTotalPreguntas: matriz.total_preguntas,
    preguntas: preguntas.map(p => ({ numero: p.numero, indicadores: p.indicadores?.length || 0 }))
  })

  // 1. Verificar cantidad de preguntas
  if (preguntas.length !== matriz.total_preguntas) {
    console.log('[calcularEstadoEvaluacion] Cantidad incorrecta:', {
      preguntas: preguntas.length,
      esperado: matriz.total_preguntas
    })
    return 'cantidad_incorrecta'
  }

  // 2. Verificar que todas las preguntas tengan respuesta correcta
  const preguntasSinRespuesta = preguntas.filter(pregunta => 
    !pregunta.alternativas.some(alt => alt.esCorrecta)
  )
  if (preguntasSinRespuesta.length > 0) {
    return 'preguntas_incompletas'
  }

  // 3. Verificar indicadores asignados
  // Por ahora, asumimos que todas las matrices tienen OAs de contenido
  // y verificamos si tienen OAs de habilidad basándonos en los indicadores asignados
  const tieneOAsHabilidad = preguntas.some(pregunta => 
    pregunta.indicadores?.some(ind => ind.tipo === 'Habilidad')
  )

  const preguntasSinIndicadorContenido = preguntas.filter(pregunta => {
    if (!pregunta.indicadores) return true
    return !pregunta.indicadores.some(ind => ind.tipo === 'Contenido')
  })

  if (preguntasSinIndicadorContenido.length > 0) {
    return 'indicadores_incompletos'
  }

  // Si tiene OAs de habilidad, verificar que todas las preguntas tengan indicador de habilidad
  if (tieneOAsHabilidad) {
    const preguntasSinIndicadorHabilidad = preguntas.filter(pregunta => {
      if (!pregunta.indicadores) return true
      return !pregunta.indicadores.some(ind => ind.tipo === 'Habilidad')
    })

    if (preguntasSinIndicadorHabilidad.length > 0) {
      return 'indicadores_incompletos'
    }
  }

  // Si llegamos aquí, la evaluación está completa
  return 'completa'
}

export function obtenerDescripcionEstado(estado: EstadoEvaluacion): string {
  switch (estado) {
    case 'borrador':
      return 'Borrador'
    case 'preguntas_incompletas':
      return 'Sin respuestas'
    case 'indicadores_incompletos':
      return 'Sin indicadores'
    case 'cantidad_incorrecta':
      return 'Cantidad incorrecta'
    case 'completa':
      return 'Completa'
    default:
      return 'Desconocido'
  }
}

export function obtenerColorEstado(estado: EstadoEvaluacion): string {
  switch (estado) {
    case 'borrador':
      return 'text-gray-600 bg-gray-100'
    case 'preguntas_incompletas':
      return 'text-orange-700 bg-orange-100'
    case 'indicadores_incompletos':
      return 'text-blue-700 bg-blue-100'
    case 'cantidad_incorrecta':
      return 'text-red-700 bg-red-100'
    case 'completa':
      return 'text-green-700 bg-green-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
} 