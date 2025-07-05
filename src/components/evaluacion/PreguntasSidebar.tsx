import { Check, AlertCircle, FileText, Edit2, X, MoreVertical, Trash2, Plus } from 'lucide-react'
import { PreguntaExtraida } from '@/lib/extract-evaluacion'
import { useState } from 'react'

interface PreguntasSidebarContentProps {
  preguntasExtraidas: PreguntaExtraida[]
  respuestasCorrectas: { [preguntaNumero: number]: string }
  onRespuestaChange: (preguntaNumero: number, letra: string) => void
  onPreguntasChange: (preguntas: PreguntaExtraida[]) => void
  onFormDataChange: (data: any) => void
  formData: any
  error?: string
}

export default function PreguntasSidebarContent({
  preguntasExtraidas,
  respuestasCorrectas,
  onRespuestaChange,
  onPreguntasChange,
  onFormDataChange,
  formData,
  error
}: PreguntasSidebarContentProps) {
  const [editingPregunta, setEditingPregunta] = useState<{ 
    numero: number, 
    field: 'texto' | 'alternativa', 
    alternativaIndex?: number 
  } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [openDropdown, setOpenDropdown] = useState<{ 
    tipo: 'pregunta' | 'alternativa', 
    numero: number, 
    alternativaIndex?: number 
  } | null>(null)

  const handleStartEdit = (preguntaNumero: number, field: 'texto' | 'alternativa', alternativaIndex?: number) => {
    setEditingPregunta({ numero: preguntaNumero, field, alternativaIndex })
    if (field === 'texto') {
      const pregunta = preguntasExtraidas.find(p => p.numero === preguntaNumero)
      setEditValue(pregunta?.texto || '')
    } else if (field === 'alternativa' && alternativaIndex !== undefined) {
      const pregunta = preguntasExtraidas.find(p => p.numero === preguntaNumero)
      setEditValue(pregunta?.alternativas[alternativaIndex]?.texto || '')
    }
    setOpenDropdown(null)
  }

  const handleSaveEdit = () => {
    if (!editingPregunta || !editValue.trim()) return

    const nuevasPreguntas = [...preguntasExtraidas]
    const preguntaIndex = nuevasPreguntas.findIndex(p => p.numero === editingPregunta.numero)
    
    if (preguntaIndex === -1) return

    if (editingPregunta.field === 'texto') {
      nuevasPreguntas[preguntaIndex] = {
        ...nuevasPreguntas[preguntaIndex],
        texto: editValue.trim()
      }
    } else if (editingPregunta.field === 'alternativa' && editingPregunta.alternativaIndex !== undefined) {
      const nuevasAlternativas = [...nuevasPreguntas[preguntaIndex].alternativas]
      nuevasAlternativas[editingPregunta.alternativaIndex] = {
        ...nuevasAlternativas[editingPregunta.alternativaIndex],
        texto: editValue.trim()
      }
      nuevasPreguntas[preguntaIndex] = {
        ...nuevasPreguntas[preguntaIndex],
        alternativas: nuevasAlternativas
      }
    }

    onPreguntasChange(nuevasPreguntas)
    setEditingPregunta(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingPregunta(null)
    setEditValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleAddPregunta = () => {
    const nuevaPregunta: PreguntaExtraida = {
      numero: preguntasExtraidas.length + 1,
      texto: 'Nueva pregunta',
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
        { letra: 'C', texto: 'Alternativa C' },
        { letra: 'D', texto: 'Alternativa D' }
      ]
    }
    
    const nuevasPreguntas = [...preguntasExtraidas, nuevaPregunta]
    onPreguntasChange(nuevasPreguntas)
    
    // Iniciar edición de la nueva pregunta
    setEditingPregunta({ numero: nuevaPregunta.numero, field: 'texto' })
    setEditValue('Nueva pregunta')
  }

  const handleAddAlternativa = (preguntaNumero: number) => {
    const nuevasPreguntas = [...preguntasExtraidas]
    const preguntaIndex = nuevasPreguntas.findIndex(p => p.numero === preguntaNumero)
    
    if (preguntaIndex === -1) return
    
    const pregunta = nuevasPreguntas[preguntaIndex]
    const nuevaLetra = String.fromCharCode(65 + pregunta.alternativas.length)
    const nuevaAlternativa = { letra: nuevaLetra, texto: `Alternativa ${nuevaLetra}` }
    
    nuevasPreguntas[preguntaIndex] = {
      ...pregunta,
      alternativas: [...pregunta.alternativas, nuevaAlternativa]
    }
    
    onPreguntasChange(nuevasPreguntas)
    
    // Iniciar edición de la nueva alternativa
    setEditingPregunta({ 
      numero: preguntaNumero, 
      field: 'alternativa', 
      alternativaIndex: pregunta.alternativas.length 
    })
    setEditValue(`Alternativa ${nuevaLetra}`)
  }

  const handleDeletePregunta = (preguntaNumero: number) => {
    const nuevasPreguntas = preguntasExtraidas
      .filter(p => p.numero !== preguntaNumero)
      .map((p, index) => ({ ...p, numero: index + 1 }))
    
    onPreguntasChange(nuevasPreguntas)
    
    // Actualizar respuestas correctas
    const nuevasRespuestas: { [key: number]: string } = {}
    nuevasPreguntas.forEach((p, index) => {
      const oldNum = preguntaNumero
      if (formData.respuestasCorrectas[oldNum]) {
        nuevasRespuestas[index + 1] = formData.respuestasCorrectas[oldNum]
      }
    })
    
    onFormDataChange({
      ...formData,
      respuestasCorrectas: nuevasRespuestas
    })
    
    setOpenDropdown(null)
  }

  const handleDeleteAlternativa = (preguntaNumero: number, alternativaIndex: number) => {
    const nuevasPreguntas = [...preguntasExtraidas]
    const preguntaIndex = nuevasPreguntas.findIndex(p => p.numero === preguntaNumero)
    
    if (preguntaIndex === -1) return
    
    const nuevasAlternativas = nuevasPreguntas[preguntaIndex].alternativas
      .filter((_, index) => index !== alternativaIndex)
      .map((alt, index) => ({ ...alt, letra: String.fromCharCode(65 + index) }))
    
    nuevasPreguntas[preguntaIndex] = {
      ...nuevasPreguntas[preguntaIndex],
      alternativas: nuevasAlternativas
    }
    
    onPreguntasChange(nuevasPreguntas)
    
    // Actualizar respuesta correcta si la eliminada era la correcta
    const letraEliminada = String.fromCharCode(65 + alternativaIndex)
    if (formData.respuestasCorrectas[preguntaNumero] === letraEliminada) {
      onFormDataChange({
        ...formData,
        respuestasCorrectas: {
          ...formData.respuestasCorrectas,
          [preguntaNumero]: ''
        }
      })
    }
    
    setOpenDropdown(null)
  }

  const handleToggleDropdown = (tipo: 'pregunta' | 'alternativa', numero: number, alternativaIndex?: number) => {
    const current = openDropdown
    if (current && 
        current.tipo === tipo && 
        current.numero === numero && 
        current.alternativaIndex === alternativaIndex) {
      setOpenDropdown(null)
    } else {
      setOpenDropdown({ tipo, numero, alternativaIndex })
    }
  }

  const handleDropdownAction = (action: 'edit' | 'delete', tipo: 'pregunta' | 'alternativa', numero: number, alternativaIndex?: number) => {
    if (action === 'edit') {
      handleStartEdit(numero, tipo === 'pregunta' ? 'texto' : 'alternativa', alternativaIndex)
    } else if (action === 'delete') {
      if (tipo === 'pregunta') {
        handleDeletePregunta(numero)
      } else if (tipo === 'alternativa' && alternativaIndex !== undefined) {
        handleDeleteAlternativa(numero, alternativaIndex)
      }
    }
    setOpenDropdown(null)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Check size={20} className="text-green-600" />
            Respuestas Correctas
            {preguntasExtraidas.length > 0 && (
              <span className="ml-auto text-sm font-normal text-gray-500">
                {Object.keys(respuestasCorrectas).length}/{preguntasExtraidas.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Marca la respuesta correcta para cada pregunta
          </p>
          {error && (
            <div className="p-3 bg-red-100 border border-red-200 rounded-lg flex items-center gap-2 mb-4">
              <AlertCircle size={16} className="text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Botón para agregar pregunta */}
        <div className="flex justify-center">
          <button
            onClick={handleAddPregunta}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Agregar Pregunta
          </button>
        </div>

        {preguntasExtraidas.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">
              Las preguntas aparecerán aquí cuando escribas en el editor o agregues una nueva
            </p>
          </div>
        ) : (
          preguntasExtraidas.map((pregunta) => (
            <div key={pregunta.numero} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-sm font-semibold">
                    Pregunta {pregunta.numero}
                  </span>
                  {respuestasCorrectas[pregunta.numero] && (
                    <Check size={16} className="text-green-600" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative dropdown-container">
                    <button
                      onClick={() => handleToggleDropdown('pregunta', pregunta.numero)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openDropdown?.tipo === 'pregunta' && openDropdown?.numero === pregunta.numero && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                        <button
                          onClick={() => handleDropdownAction('edit', 'pregunta', pregunta.numero)}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <Edit2 size={14} />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDropdownAction('delete', 'pregunta', pregunta.numero)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Texto de la pregunta */}
              {editingPregunta?.numero === pregunta.numero && editingPregunta?.field === 'texto' ? (
                <div className="mb-3">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Texto de la pregunta"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-900 mb-3 text-sm">{pregunta.texto}</p>
              )}

              {/* Alternativas */}
              <div className="space-y-2">
                {pregunta.alternativas.map((alternativa, index) => {
                  const esCorrecta = respuestasCorrectas[pregunta.numero] === alternativa.letra;
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-3 ${esCorrecta ? 'bg-green-50 border border-green-200' : ''} rounded-lg px-2 py-1`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`pregunta-${pregunta.numero}`}
                          value={alternativa.letra}
                          checked={esCorrecta}
                          onChange={() => onRespuestaChange(pregunta.numero, alternativa.letra)}
                          className="text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={`font-medium w-6 ${esCorrecta ? 'text-green-700 font-bold' : 'text-gray-700'}`}>{alternativa.letra}.</span>
                      </label>
                      {esCorrecta && (
                        <Check size={16} className="text-green-600" />
                      )}
                      {editingPregunta?.numero === pregunta.numero && 
                       editingPregunta?.field === 'alternativa' && 
                       editingPregunta?.alternativaIndex === index ? (
                        <div className="flex-1 flex items-center gap-2">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Texto de la alternativa"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-between group">
                          <span className="text-gray-700 text-sm flex-1">{alternativa.texto}</span>
                          <div className="relative dropdown-container">
                            <button
                              onClick={() => handleToggleDropdown('alternativa', pregunta.numero, index)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-60 hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openDropdown?.tipo === 'alternativa' && 
                             openDropdown?.numero === pregunta.numero && 
                             openDropdown?.alternativaIndex === index && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                <button
                                  onClick={() => handleDropdownAction('edit', 'alternativa', pregunta.numero, index)}
                                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <Edit2 size={14} />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDropdownAction('delete', 'alternativa', pregunta.numero, index)}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={14} />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                
                {/* Botón para agregar alternativa */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => handleAddAlternativa(pregunta.numero)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors text-xs"
                  >
                    <Plus size={12} />
                    Agregar Alternativa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 