import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { extraerPreguntasAlternativas, PreguntaExtraida } from '@/lib/extract-evaluacion'
import { MatrizEspecificacion, EvaluacionFormData } from '@/types/evaluacion'

interface FormErrors {
  [key: string]: string
}

export function useEvaluacionForm() {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [matrices, setMatrices] = useState<MatrizEspecificacion[]>([])
  const [selectedMatriz, setSelectedMatriz] = useState<MatrizEspecificacion | null>(null)
  const [currentEditor, setCurrentEditor] = useState<Editor | null>(null)
  const [preguntasExtraidas, setPreguntasExtraidas] = useState<PreguntaExtraida[]>([])
  const [formData, setFormData] = useState<EvaluacionFormData>({
    matrizId: null,
    contenido: null,
    respuestasCorrectas: {},
    indicadoresAsignados: {}
  })
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [evaluacionId, setEvaluacionId] = useState<number | null>(null)
  const [isSettingInitialContent, setIsSettingInitialContent] = useState(false)

  // Cargar matrices al montar
  useEffect(() => {
    fetchMatrices()
  }, [])

  // Escuchar cambios del editor
  useEffect(() => {
    if (currentEditor) {
      const handleUpdate = () => {
        // Evitar actualizaciones durante la configuración inicial
        if (!isSettingInitialContent) {
          handleContentChange()
        }
      }
      
      currentEditor.on('update', handleUpdate)
      
      return () => {
        currentEditor.off('update', handleUpdate)
      }
    }
  }, [currentEditor, isSettingInitialContent])

  const fetchMatrices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/matrices')
      if (response.ok) {
        const data = await response.json()
        setMatrices(data)
      }
    } catch (error) {
      console.error('Error al obtener matrices:', error)
      setErrors(prev => ({ ...prev, matrices: 'Error al cargar matrices' }))
    } finally {
      setLoading(false)
    }
  }

  const handleEditorReady = (editor: Editor) => {
    // Evitar establecer el mismo editor múltiples veces
    if (currentEditor !== editor) {
      setCurrentEditor(editor)
    }
  }

  const handleContentChange = () => {
    if (!currentEditor || isSettingInitialContent) return

    const content = currentEditor.getJSON()
    setFormData(prev => ({ ...prev, contenido: content }))

    // Extraer preguntas automáticamente
    try {
      const preguntas = extraerPreguntasAlternativas(content)
      setPreguntasExtraidas(preguntas)
      
      // Limpiar respuestas correctas de preguntas que ya no existen
      const nuevasRespuestas: { [key: number]: string } = {}
      preguntas.forEach(pregunta => {
        if (formData.respuestasCorrectas[pregunta.numero]) {
          nuevasRespuestas[pregunta.numero] = formData.respuestasCorrectas[pregunta.numero]
        }
      })
      setFormData(prev => ({ ...prev, respuestasCorrectas: nuevasRespuestas }))
    } catch (error) {
      console.error('Error al extraer preguntas:', error)
      setPreguntasExtraidas([])
    }
  }

  const handleMatrizSelect = (matriz: MatrizEspecificacion) => {
    setSelectedMatriz(matriz)
    setFormData(prev => ({ ...prev, matrizId: matriz.id }))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.matriz
      return newErrors
    })
  }

  const handleRespuestaCorrectaChange = (preguntaNumero: number, letra: string) => {
    setFormData(prev => ({
      ...prev,
      respuestasCorrectas: {
        ...prev.respuestasCorrectas,
        [preguntaNumero]: letra
      }
    }))
  }

  const handleIndicadorChange = (preguntaNumero: number, tipo: 'contenido' | 'habilidad', indicadorId: number | null) => {
    setFormData(prev => ({
      ...prev,
      indicadoresAsignados: {
        ...prev.indicadoresAsignados,
        [preguntaNumero]: {
          ...prev.indicadoresAsignados[preguntaNumero],
          [tipo]: indicadorId || undefined
        }
      }
    }))
  }

  const validateForm = () => {
    console.log('[useEvaluacionForm] validateForm llamado', {
      evaluacionId,
      titulo,
      tituloTrim: titulo.trim(),
      tituloLength: titulo.length,
      selectedMatriz: !!selectedMatriz,
      contenido: !!formData.contenido,
      preguntasExtraidas: preguntasExtraidas.length,
      respuestasCorrectas: Object.keys(formData.respuestasCorrectas).length,
      indicadoresAsignados: Object.keys(formData.indicadoresAsignados).length
    })

    // Solo validar lo esencial para permitir el guardado
    const newErrors: FormErrors = {}

    // Validar matriz seleccionada (esencial)
    if (!selectedMatriz) {
      newErrors.matriz = 'Debe seleccionar una matriz de especificación'
    }

    // Validar contenido (esencial)
    if (!formData.contenido) {
      newErrors.contenido = 'El contenido es requerido'
    }

    console.log('[useEvaluacionForm] Errores de validación:', newErrors)
    console.log('[useEvaluacionForm] validateForm retorna:', Object.keys(newErrors).length === 0)

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveWithPreguntas = async (preguntas: any[]) => {
    setSaving(true)
    try {
      console.log('Guardando evaluación con preguntas forzadas, evaluacionId:', evaluacionId)
      const requestBody = {
        contenido: JSON.stringify(formData.contenido),
        preguntas: preguntas,
        respuestasCorrectas: formData.respuestasCorrectas,
        matrizId: selectedMatriz?.id || null,
        indicadoresAsignados: formData.indicadoresAsignados
      }
      console.log('Datos a enviar con preguntas forzadas:', requestBody)
      
      const evaluacionResponse = await fetch(`/api/evaluaciones/${evaluacionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      if (evaluacionResponse.ok) {
        const evaluacionActualizada = await evaluacionResponse.json()
        console.log('Evaluación actualizada:', evaluacionActualizada)
        
        // Actualizar el estado en la interfaz
        if (evaluacionActualizada.estado) {
          // Disparar un evento personalizado para notificar el cambio de estado
          window.dispatchEvent(new CustomEvent('evaluacionEstadoActualizado', {
            detail: { evaluacionId, estado: evaluacionActualizada.estado }
          }))
        }
        
        setShowSaveModal(false)
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        const errorData = await evaluacionResponse.json()
        setErrors({ submit: errorData.error || 'Error al actualizar la evaluación' })
      }
    } catch (error) {
      console.error('Error al guardar evaluación con preguntas forzadas:', error)
      setErrors({ submit: 'Error al guardar la evaluación' })
    } finally {
      setSaving(false)
    }
  }

  const handleSave = async () => {
    console.log('[useEvaluacionForm] handleSave llamado', {
      evaluacionId,
      preguntasExtraidas: preguntasExtraidas.length,
      selectedMatriz: !!selectedMatriz,
      formData: {
        contenido: !!formData.contenido,
        respuestasCorrectas: Object.keys(formData.respuestasCorrectas).length,
        indicadoresAsignados: Object.keys(formData.indicadoresAsignados).length
      }
    });
    
    console.log('[useEvaluacionForm] preguntasExtraidas detalle:', preguntasExtraidas);
    
    // Si estamos en modo edición y no hay preguntas extraídas, extraerlas del contenido
    if (evaluacionId && preguntasExtraidas.length === 0 && formData.contenido) {
      console.log('[useEvaluacionForm] Forzando extracción de preguntas del contenido');
      try {
        const preguntasExtraidas = extraerPreguntasAlternativas(formData.contenido);
        console.log('[useEvaluacionForm] Preguntas extraídas forzadamente:', preguntasExtraidas.length);
        
        // Usar las preguntas recién extraídas para el guardado
        if (preguntasExtraidas.length > 0) {
          await handleSaveWithPreguntas(preguntasExtraidas);
          return;
        }
      } catch (error) {
        console.error('Error al extraer preguntas forzadamente:', error);
      }
    }
    
    if (!validateForm()) return
    setSaving(true)
    try {
      console.log('Guardando evaluación, evaluacionId:', evaluacionId)
      if (evaluacionId) {
        // Modo edición: PUT
        console.log('Actualizando evaluación existente con ID:', evaluacionId)
        
        // Asegurar que las preguntas se envíen correctamente
        const preguntasParaEnviar = preguntasExtraidas.length > 0 ? preguntasExtraidas : [];
        console.log('Preguntas para enviar:', preguntasParaEnviar.length);
        
        const requestBody = {
          contenido: JSON.stringify(formData.contenido),
          preguntas: preguntasParaEnviar,
          respuestasCorrectas: formData.respuestasCorrectas,
          matrizId: selectedMatriz?.id || null,
          indicadoresAsignados: formData.indicadoresAsignados
        }
        console.log('Datos a enviar:', requestBody)
        console.log('preguntasExtraidas tipo:', typeof preguntasExtraidas)
        console.log('preguntasExtraidas length:', preguntasExtraidas.length)
        console.log('preguntasExtraidas primer elemento:', preguntasExtraidas[0])
        
        const requestBodyString = JSON.stringify(requestBody)
        console.log('JSON stringificado:', requestBodyString)
        
        const evaluacionResponse = await fetch(`/api/evaluaciones/${evaluacionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: requestBodyString
        })
        if (evaluacionResponse.ok) {
          const evaluacionActualizada = await evaluacionResponse.json()
          console.log('Evaluación actualizada:', evaluacionActualizada)
          
          // Actualizar el estado en la interfaz
          if (evaluacionActualizada.estado) {
            // Disparar un evento personalizado para notificar el cambio de estado
            window.dispatchEvent(new CustomEvent('evaluacionEstadoActualizado', {
              detail: { evaluacionId, estado: evaluacionActualizada.estado }
            }))
          }
          
          setShowSaveModal(false)
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
        } else {
          const errorData = await evaluacionResponse.json()
          setErrors({ submit: errorData.error || 'Error al actualizar la evaluación' })
        }
      } else {
        // Modo creación: POST
        // Primero crear el archivo
        const archivoResponse = await fetch('/api/archivos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: titulo,
            tipo: 'evaluacion',
            contenido: JSON.stringify(formData.contenido)
          })
        })
        if (!archivoResponse.ok) {
          throw new Error('Error al crear archivo')
        }
        const archivo = await archivoResponse.json()
        
        // Luego crear la evaluación
        const evaluacionResponse = await fetch('/api/evaluaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            archivoId: archivo.id,
            matrizId: selectedMatriz!.id,
            contenido: JSON.stringify(formData.contenido),
            preguntas: preguntasExtraidas,
            respuestasCorrectas: formData.respuestasCorrectas,
            indicadoresAsignados: formData.indicadoresAsignados
          })
        })
        if (evaluacionResponse.ok) {
          setShowSaveModal(false)
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
        } else {
          const errorData = await evaluacionResponse.json()
          setErrors({ submit: errorData.error || 'Error al crear la evaluación' })
        }
      }
    } catch (error) {
      console.error('Error al guardar evaluación:', error)
      setErrors({ submit: 'Error al guardar la evaluación' })
    } finally {
      setSaving(false)
    }
  }

  const handleLoadContent = (content: any) => {
    // Limpiar errores previos
    setErrors({})
    
    // Si viene de evaluacion (de /api/evaluaciones), poblar sidebar con preguntas y alternativas del backend
    if (content.preguntas && content.archivo) {
      setEvaluacionId(content.id)
      setPreguntasExtraidas(content.preguntas.map((p: any) => ({
        numero: p.numero,
        texto: p.texto,
        alternativas: p.alternativas.map((a: any) => ({ letra: a.letra, texto: a.texto }))
      })))
      // Reconstruir respuestasCorrectas
      const respuestasCorrectas: { [key: number]: string } = {}
      content.preguntas.forEach((pregunta: any) => {
        const correcta = pregunta.alternativas.find((a: any) => a.esCorrecta)
        if (correcta) {
          respuestasCorrectas[pregunta.numero] = correcta.letra
        }
      })

      // Reconstruir indicadoresAsignados
      const indicadoresAsignados: { [key: number]: { contenido?: number; habilidad?: number } } = {}
      content.preguntas.forEach((pregunta: any) => {
        if (pregunta.indicadores && pregunta.indicadores.length > 0) {
          const asignacion: { contenido?: number; habilidad?: number } = {}
          pregunta.indicadores.forEach((indicador: any) => {
            if (indicador.tipo === 'Contenido') {
              asignacion.contenido = indicador.indicadorId
            } else if (indicador.tipo === 'Habilidad') {
              asignacion.habilidad = indicador.indicadorId
            }
          })
          if (Object.keys(asignacion).length > 0) {
            indicadoresAsignados[pregunta.numero] = asignacion
          }
        }
      })
      let parsedContent = null
      try {
        parsedContent = JSON.parse(content.archivo.contenido)
      } catch (error) {
        console.error('Error al parsear contenido de evaluación:', error)
        setErrors({ contenido: 'Error al cargar el contenido de la evaluación.' })
        return
      }
      // Seleccionar la matriz correspondiente si está disponible
      if (content.matriz && matrices.length > 0) {
        const matriz = matrices.find(m => m.id === content.matriz.id)
        if (matriz) {
          handleMatrizSelect(matriz)
        }
      }
      setFormData(prev => ({
        ...prev,
        contenido: parsedContent,
        respuestasCorrectas,
        indicadoresAsignados
      }))
      setTitulo(content.archivo.titulo || '')
      
      // Extraer preguntas del contenido cargado para mantener sincronización
      try {
        const preguntasExtraidas = extraerPreguntasAlternativas(parsedContent)
        console.log('[handleLoadContent] Preguntas extraídas del contenido:', preguntasExtraidas.length);
        setPreguntasExtraidas(preguntasExtraidas)
      } catch (error) {
        console.error('Error al extraer preguntas del contenido cargado:', error)
        // Mantener las preguntas de la base de datos si no se pueden extraer del contenido
      }
      
      return
    }
    
    // Fallback: comportamiento anterior para archivos simples
    setEvaluacionId(null)
    
    // Validar que content.contenido existe antes de intentar parsearlo
    if (!content.contenido) {
      setErrors({ contenido: 'El archivo no tiene contenido válido.' })
      return
    }
    
    try {
      const parsedContent = JSON.parse(content.contenido)
      if (!parsedContent || typeof parsedContent !== 'object' || parsedContent.type !== 'doc') {
        setErrors({ contenido: 'El archivo no tiene un formato válido de TipTap.' })
        return
      }
      setFormData(prev => ({
        ...prev,
        contenido: parsedContent,
        respuestasCorrectas: content.respuestasCorrectas || {},
        indicadoresAsignados: content.indicadoresAsignados || {}
      }))
      
      try {
        const preguntas = extraerPreguntasAlternativas(parsedContent)
        setPreguntasExtraidas(preguntas)
      } catch (error) {
        setPreguntasExtraidas([])
      }
    } catch (error) {
      setErrors({ contenido: 'Error al leer el archivo: formato inválido.' })
      console.error('Error parsing content:', error)
    }
  }

  const clearErrors = () => {
    setErrors({})
  }

  const updateFormData = (updates: Partial<EvaluacionFormData>) => {
    // Si se está actualizando el contenido y no hay contenido previo, marcar que estamos estableciendo contenido inicial
    if (updates.contenido && !formData.contenido) {
      setIsSettingInitialContent(true)
      // Usar un timeout más largo para asegurar que el editor se configure completamente
      setTimeout(() => setIsSettingInitialContent(false), 500)
    }
    
    setFormData(prev => ({ ...prev, ...updates }))
  }

  return {
    // Estado
    loading,
    saving,
    matrices,
    selectedMatriz,
    preguntasExtraidas,
    formData,
    showSaveModal,
    titulo,
    errors,
    showSuccess,
    evaluacionId,
    currentEditor,
    
    // Setters
    setPreguntasExtraidas,
    setShowSaveModal,
    setTitulo,
    setShowSuccess,
    setEvaluacionId,
    
    // Handlers
    handleEditorReady,
    handleMatrizSelect,
    handleRespuestaCorrectaChange,
    handleIndicadorChange,
    handleSave,
    handleLoadContent,
    clearErrors,
    updateFormData,
    
    // Utilidades
    validateForm
  }
} 