import { useState, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { extraerPreguntasAlternativas, PreguntaExtraida } from '@/lib/extract-evaluacion'

interface MatrizEspecificacion {
  id: number
  nombre: string
  total_preguntas: number
  oas: Array<{
    oa: {
      oas_id: string
      descripcion_oas: string
      nivel: { nombre: string }
      asignatura: { nombre: string }
    }
  }>
}

interface EvaluacionFormData {
  matrizId: number | null
  contenido: any
  respuestasCorrectas: { [preguntaNumero: number]: string }
}

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
    respuestasCorrectas: {}
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

  const validateForm = () => {
    const newErrors: FormErrors = {}

    if (!evaluacionId && !titulo.trim()) {
      newErrors.titulo = 'El título es requerido'
    }

    if (!selectedMatriz) {
      newErrors.matriz = 'Debe seleccionar una matriz de especificación'
    }

    if (!formData.contenido) {
      newErrors.contenido = 'Debe crear el contenido de la evaluación'
    }

    if (preguntasExtraidas.length === 0) {
      newErrors.preguntas = 'No se detectaron preguntas en el contenido'
    }

    // Verificar que todas las preguntas tengan respuesta correcta
    const preguntasSinRespuesta = preguntasExtraidas.filter(
      pregunta => !formData.respuestasCorrectas[pregunta.numero]
    )
    if (preguntasSinRespuesta.length > 0) {
      newErrors.respuestas = `Faltan respuestas correctas para ${preguntasSinRespuesta.length} pregunta(s)`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    try {
      console.log('Guardando evaluación, evaluacionId:', evaluacionId)
      if (evaluacionId) {
        // Modo edición: PUT
        console.log('Actualizando evaluación existente con ID:', evaluacionId)
        const requestBody = {
          contenido: JSON.stringify(formData.contenido),
          preguntas: preguntasExtraidas,
          respuestasCorrectas: formData.respuestasCorrectas
        }
        console.log('Datos a enviar:', requestBody)
        const evaluacionResponse = await fetch(`/api/evaluaciones/${evaluacionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })
        if (evaluacionResponse.ok) {
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
            respuestasCorrectas: formData.respuestasCorrectas
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
      let parsedContent = null
      try {
        parsedContent = JSON.parse(content.archivo.contenido)
      } catch (error) {
        console.error('Error al parsear contenido de evaluación:', error)
        setErrors({ contenido: 'Error al cargar el contenido de la evaluación.' })
        return
      }
      
      setFormData(prev => ({
        ...prev,
        contenido: parsedContent,
        respuestasCorrectas
      }))
      
      setTitulo(content.archivo.titulo || '')
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
        respuestasCorrectas: content.respuestasCorrectas || {}
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
    handleSave,
    handleLoadContent,
    clearErrors,
    updateFormData,
    
    // Utilidades
    validateForm
  }
} 