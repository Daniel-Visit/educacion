import {
  Check,
  AlertCircle,
  FileText,
  Edit2,
  X,
  MoreVertical,
  Trash2,
  Plus,
  Target,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { PreguntaExtraida } from '@/lib/extract-evaluacion';
import { useState } from 'react';
import { MatrizEspecificacion, EvaluacionFormData } from '@/types/evaluacion';
import Dropdown from '@/components/entrevista/Dropdown';
import { createPortal } from 'react-dom';

// Componente de Tooltip personalizado usando Portal
const Tooltip = ({
  children,
  content,
}: {
  children: React.ReactNode;
  content: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        className="relative inline-block w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {isVisible &&
        createPortal(
          <div
            className="fixed z-[9999] px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-normal max-w-xs pointer-events-none"
            style={{
              left: position.x,
              top: position.y,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
          >
            {content}
            <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 transform -translate-x-1/2"></div>
          </div>,
          document.body
        )}
    </>
  );
};

interface PreguntasSidebarContentProps {
  preguntasExtraidas: PreguntaExtraida[];
  respuestasCorrectas: { [preguntaNumero: number]: string };
  onRespuestaChange: (preguntaNumero: number, letra: string) => void;
  onPreguntasChange: (preguntas: PreguntaExtraida[]) => void;
  onFormDataChange: (data: Partial<EvaluacionFormData>) => void;
  formData: EvaluacionFormData;
  error?: string;
  selectedMatriz?: MatrizEspecificacion | null;
  indicadoresAsignados: {
    [preguntaNumero: number]: { contenido?: number; habilidad?: number };
  };
  onIndicadorChange: (
    preguntaNumero: number,
    tipo: 'contenido' | 'habilidad',
    indicadorId: number | null
  ) => void;
}

export default function PreguntasSidebarContent({
  preguntasExtraidas,
  respuestasCorrectas,
  onRespuestaChange,
  onPreguntasChange,
  onFormDataChange,
  formData,
  error,
  selectedMatriz,
  indicadoresAsignados,
  onIndicadorChange,
}: PreguntasSidebarContentProps) {
  console.log('🔍 [PreguntasSidebar] Estado actual:', {
    preguntasCount: preguntasExtraidas.length,
    indicadoresAsignadosCount: Object.keys(indicadoresAsignados).length,
    indicadoresAsignados: indicadoresAsignados,
    selectedMatriz: !!selectedMatriz,
  });
  const [editingPregunta, setEditingPregunta] = useState<{
    numero: number;
    field: 'texto' | 'alternativa';
    alternativaIndex?: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [openDropdown, setOpenDropdown] = useState<{
    tipo: 'pregunta' | 'alternativa';
    numero: number;
    alternativaIndex?: number;
  } | null>(null);
  const [indicadoresAccordionOpen, setIndicadoresAccordionOpen] =
    useState(false);

  const handleStartEdit = (
    preguntaNumero: number,
    field: 'texto' | 'alternativa',
    alternativaIndex?: number
  ) => {
    setEditingPregunta({ numero: preguntaNumero, field, alternativaIndex });
    if (field === 'texto') {
      const pregunta = preguntasExtraidas.find(
        p => p.numero === preguntaNumero
      );
      setEditValue(pregunta?.texto || '');
    } else if (field === 'alternativa' && alternativaIndex !== undefined) {
      const pregunta = preguntasExtraidas.find(
        p => p.numero === preguntaNumero
      );
      setEditValue(pregunta?.alternativas[alternativaIndex]?.texto || '');
    }
    setOpenDropdown(null);
  };

  const handleSaveEdit = () => {
    if (!editingPregunta || !editValue.trim()) return;

    const nuevasPreguntas = [...preguntasExtraidas];
    const preguntaIndex = nuevasPreguntas.findIndex(
      p => p.numero === editingPregunta.numero
    );

    if (preguntaIndex === -1) return;

    if (editingPregunta.field === 'texto') {
      nuevasPreguntas[preguntaIndex] = {
        ...nuevasPreguntas[preguntaIndex],
        texto: editValue.trim(),
      };
    } else if (
      editingPregunta.field === 'alternativa' &&
      editingPregunta.alternativaIndex !== undefined
    ) {
      const nuevasAlternativas = [
        ...nuevasPreguntas[preguntaIndex].alternativas,
      ];
      nuevasAlternativas[editingPregunta.alternativaIndex] = {
        ...nuevasAlternativas[editingPregunta.alternativaIndex],
        texto: editValue.trim(),
      };
      nuevasPreguntas[preguntaIndex] = {
        ...nuevasPreguntas[preguntaIndex],
        alternativas: nuevasAlternativas,
      };
    }

    onPreguntasChange(nuevasPreguntas);
    setEditingPregunta(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingPregunta(null);
    setEditValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleAddPregunta = () => {
    const nuevaPregunta: PreguntaExtraida = {
      numero: preguntasExtraidas.length + 1,
      texto: 'Nueva pregunta',
      alternativas: [
        { letra: 'A', texto: 'Alternativa A' },
        { letra: 'B', texto: 'Alternativa B' },
        { letra: 'C', texto: 'Alternativa C' },
        { letra: 'D', texto: 'Alternativa D' },
      ],
    };

    const nuevasPreguntas = [...preguntasExtraidas, nuevaPregunta];
    onPreguntasChange(nuevasPreguntas);

    // Iniciar edición de la nueva pregunta
    setEditingPregunta({ numero: nuevaPregunta.numero, field: 'texto' });
    setEditValue('Nueva pregunta');
  };

  const handleAddAlternativa = (preguntaNumero: number) => {
    const nuevasPreguntas = [...preguntasExtraidas];
    const preguntaIndex = nuevasPreguntas.findIndex(
      p => p.numero === preguntaNumero
    );

    if (preguntaIndex === -1) return;

    const pregunta = nuevasPreguntas[preguntaIndex];
    const nuevaLetra = String.fromCharCode(65 + pregunta.alternativas.length);
    const nuevaAlternativa = {
      letra: nuevaLetra,
      texto: `Alternativa ${nuevaLetra}`,
    };

    nuevasPreguntas[preguntaIndex] = {
      ...pregunta,
      alternativas: [...pregunta.alternativas, nuevaAlternativa],
    };

    onPreguntasChange(nuevasPreguntas);

    // Iniciar edición de la nueva alternativa
    setEditingPregunta({
      numero: preguntaNumero,
      field: 'alternativa',
      alternativaIndex: pregunta.alternativas.length,
    });
    setEditValue(`Alternativa ${nuevaLetra}`);
  };

  const handleDeletePregunta = (preguntaNumero: number) => {
    const nuevasPreguntas = preguntasExtraidas
      .filter(p => p.numero !== preguntaNumero)
      .map((p, index) => ({ ...p, numero: index + 1 }));

    onPreguntasChange(nuevasPreguntas);

    // Actualizar respuestas correctas
    const nuevasRespuestas: { [key: number]: string } = {};
    nuevasPreguntas.forEach((p, index) => {
      const oldNum = preguntaNumero;
      if (formData.respuestasCorrectas[oldNum]) {
        nuevasRespuestas[index + 1] = formData.respuestasCorrectas[oldNum];
      }
    });

    onFormDataChange({
      ...formData,
      respuestasCorrectas: nuevasRespuestas,
    });

    setOpenDropdown(null);
  };

  const handleDeleteAlternativa = (
    preguntaNumero: number,
    alternativaIndex: number
  ) => {
    const nuevasPreguntas = [...preguntasExtraidas];
    const preguntaIndex = nuevasPreguntas.findIndex(
      p => p.numero === preguntaNumero
    );

    if (preguntaIndex === -1) return;

    const nuevasAlternativas = nuevasPreguntas[preguntaIndex].alternativas
      .filter((_, index) => index !== alternativaIndex)
      .map((alt, index) => ({
        ...alt,
        letra: String.fromCharCode(65 + index),
      }));

    nuevasPreguntas[preguntaIndex] = {
      ...nuevasPreguntas[preguntaIndex],
      alternativas: nuevasAlternativas,
    };

    onPreguntasChange(nuevasPreguntas);

    // Actualizar respuesta correcta si la eliminada era la correcta
    const letraEliminada = String.fromCharCode(65 + alternativaIndex);
    if (formData.respuestasCorrectas[preguntaNumero] === letraEliminada) {
      onFormDataChange({
        ...formData,
        respuestasCorrectas: {
          ...formData.respuestasCorrectas,
          [preguntaNumero]: '',
        },
      });
    }

    setOpenDropdown(null);
  };

  const handleToggleDropdown = (
    tipo: 'pregunta' | 'alternativa',
    numero: number,
    alternativaIndex?: number
  ) => {
    const current = openDropdown;
    if (
      current &&
      current.tipo === tipo &&
      current.numero === numero &&
      current.alternativaIndex === alternativaIndex
    ) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown({ tipo, numero, alternativaIndex });
    }
  };

  const handleDropdownAction = (
    action: 'edit' | 'delete',
    tipo: 'pregunta' | 'alternativa',
    numero: number,
    alternativaIndex?: number
  ) => {
    if (action === 'edit') {
      handleStartEdit(
        numero,
        tipo === 'pregunta' ? 'texto' : 'alternativa',
        alternativaIndex
      );
    } else if (action === 'delete') {
      if (tipo === 'pregunta') {
        handleDeletePregunta(numero);
      } else if (tipo === 'alternativa' && alternativaIndex !== undefined) {
        handleDeleteAlternativa(numero, alternativaIndex);
      }
    }
    setOpenDropdown(null);
  };

  // Funciones para manejar indicadores
  const getIndicadoresPorTipo = (tipo: 'Contenido' | 'Habilidad') => {
    if (!selectedMatriz) return [];

    return selectedMatriz.oas
      .filter(matrizOA => matrizOA.oa.tipo_eje === tipo)
      .flatMap(matrizOA => matrizOA.indicadores);
  };

  const getIndicadoresContenido = () => getIndicadoresPorTipo('Contenido');
  const getIndicadoresHabilidad = () => getIndicadoresPorTipo('Habilidad');

  const hasIndicadoresHabilidad = () => getIndicadoresHabilidad().length > 0;

  const getIndicadorAsignado = (
    preguntaNumero: number,
    tipo: 'contenido' | 'habilidad'
  ) => {
    const asignacion = indicadoresAsignados[preguntaNumero];
    if (!asignacion) {
      console.log(
        '🔍 [getIndicadorAsignado] No hay asignación para pregunta:',
        preguntaNumero,
        'tipo:',
        tipo
      );
      return null;
    }

    const indicadorId =
      tipo === 'contenido' ? asignacion.contenido : asignacion.habilidad;
    if (!indicadorId) {
      console.log(
        '🔍 [getIndicadorAsignado] No hay indicadorId para pregunta:',
        preguntaNumero,
        'tipo:',
        tipo,
        'asignación:',
        asignacion
      );
      return null;
    }

    const indicadores =
      tipo === 'contenido'
        ? getIndicadoresContenido()
        : getIndicadoresHabilidad();

    const indicadorEncontrado = indicadores.find(ind => ind.id === indicadorId);
    console.log(
      '🔍 [getIndicadorAsignado] Buscando indicador:',
      indicadorId,
      'en',
      indicadores.length,
      'indicadores. Encontrado:',
      !!indicadorEncontrado
    );

    return indicadorEncontrado || null;
  };

  // Función para calcular cuántas preguntas faltan por asignar para cada indicador
  const getPreguntasFaltantesPorIndicador = () => {
    if (!selectedMatriz) return { contenido: {}, habilidad: {} };

    const faltantesContenido: { [indicadorId: number]: number } = {};
    const faltantesHabilidad: { [indicadorId: number]: number } = {};

    // Inicializar contadores con el total de preguntas que debe tener cada indicador
    selectedMatriz.oas.forEach(matrizOA => {
      matrizOA.indicadores.forEach(indicador => {
        if (matrizOA.oa.tipo_eje === 'Contenido') {
          faltantesContenido[indicador.id] = indicador.preguntas;
        } else if (matrizOA.oa.tipo_eje === 'Habilidad') {
          faltantesHabilidad[indicador.id] = indicador.preguntas;
        }
      });
    });

    // Restar las preguntas ya asignadas
    Object.values(indicadoresAsignados).forEach(asignacion => {
      if (
        asignacion.contenido &&
        faltantesContenido[asignacion.contenido] !== undefined
      ) {
        faltantesContenido[asignacion.contenido]--;
      }
      if (
        asignacion.habilidad &&
        faltantesHabilidad[asignacion.habilidad] !== undefined
      ) {
        faltantesHabilidad[asignacion.habilidad]--;
      }
    });

    return { contenido: faltantesContenido, habilidad: faltantesHabilidad };
  };

  // Función para obtener el estado visual del indicador (completo, incompleto, sin asignar)
  const getEstadoIndicador = (
    indicadorId: number,
    tipo: 'contenido' | 'habilidad'
  ) => {
    const faltantes = getPreguntasFaltantesPorIndicador();
    const faltantesTipo =
      tipo === 'contenido' ? faltantes.contenido : faltantes.habilidad;
    const faltante = faltantesTipo[indicadorId] || 0;

    if (faltante === 0) return 'completo';
    if (faltante < 0) return 'exceso';
    return 'incompleto';
  };

  // Función para obtener el OA correspondiente a un indicador
  const getOAForIndicador = (
    indicadorId: number,
    tipo: 'contenido' | 'habilidad'
  ) => {
    if (!selectedMatriz) return null;

    const tipoEje = tipo === 'contenido' ? 'Contenido' : 'Habilidad';

    for (const matrizOA of selectedMatriz.oas) {
      if (matrizOA.oa.tipo_eje === tipoEje) {
        const indicador = matrizOA.indicadores.find(
          ind => ind.id === indicadorId
        );
        if (indicador) {
          return matrizOA.oa;
        }
      }
    }
    return null;
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Check size={20} className="text-green-600" />
            Respuestas e Indicadores
            {preguntasExtraidas.length > 0 && (
              <span className="ml-auto text-sm font-normal text-gray-500">
                {Object.keys(respuestasCorrectas).length}/
                {preguntasExtraidas.length}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Marca las respuestas correctas y asigna indicadores de la matriz
          </p>

          {/* Información de indicadores asignados */}
          {selectedMatriz && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Matriz: {selectedMatriz.nombre}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-blue-600 font-medium">Contenido:</span>
                  <span className="text-blue-700 ml-1">
                    {getIndicadoresContenido().length} indicadores
                  </span>
                </div>
                {hasIndicadoresHabilidad() && (
                  <div>
                    <span className="text-green-600 font-medium">
                      Habilidad:
                    </span>
                    <span className="text-green-700 ml-1">
                      {getIndicadoresHabilidad().length} indicadores
                    </span>
                  </div>
                )}
              </div>

              {/* Estado de indicadores */}
              <div className="mt-4">
                <button
                  onClick={() =>
                    setIndicadoresAccordionOpen(!indicadoresAccordionOpen)
                  }
                  className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-semibold text-gray-800">
                      Estado de Indicadores
                    </span>
                  </div>
                  {indicadoresAccordionOpen ? (
                    <ChevronDown size={16} className="text-gray-600" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-600" />
                  )}
                </button>

                {indicadoresAccordionOpen && (
                  <div className="mt-2 space-y-3 p-3 bg-white border border-gray-200 rounded-lg">
                    {/* Indicadores de Contenido */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                          Contenido
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {getIndicadoresContenido().map(indicador => {
                          const faltantes =
                            getPreguntasFaltantesPorIndicador().contenido[
                              indicador.id
                            ] || 0;
                          const estado = getEstadoIndicador(
                            indicador.id,
                            'contenido'
                          );
                          const oa = getOAForIndicador(
                            indicador.id,
                            'contenido'
                          );
                          return (
                            <div
                              key={indicador.id}
                              className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                {oa && (
                                  <div className="flex-shrink-0">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                      {oa.oas_id}
                                    </span>
                                  </div>
                                )}
                                <Tooltip content={indicador.descripcion}>
                                  <div className="min-w-0 ml-1 flex-1 max-w-[350px]">
                                    <span className="text-xs text-gray-700 truncate cursor-help block">
                                      {indicador.descripcion}
                                    </span>
                                  </div>
                                </Tooltip>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                {estado === 'completo' && (
                                  <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
                                    <Check
                                      size={10}
                                      className="text-green-600"
                                    />
                                    <span className="text-xs font-medium text-green-700">
                                      Completo
                                    </span>
                                  </div>
                                )}
                                {estado === 'exceso' && (
                                  <div className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-50 border border-red-200 rounded-full">
                                    <span className="text-xs font-bold text-red-700">
                                      +{Math.abs(faltantes)}
                                    </span>
                                  </div>
                                )}
                                {estado === 'incompleto' && (
                                  <div className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-amber-50 border border-amber-200 rounded-full">
                                    <span className="text-xs font-bold text-amber-700">
                                      {faltantes}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Indicadores de Habilidad */}
                    {hasIndicadoresHabilidad() && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-xs font-medium text-green-700 uppercase tracking-wide">
                            Habilidad
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {getIndicadoresHabilidad().map(indicador => {
                            const faltantes =
                              getPreguntasFaltantesPorIndicador().habilidad[
                                indicador.id
                              ] || 0;
                            const estado = getEstadoIndicador(
                              indicador.id,
                              'habilidad'
                            );
                            const oa = getOAForIndicador(
                              indicador.id,
                              'habilidad'
                            );
                            return (
                              <div
                                key={indicador.id}
                                className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                  {oa && (
                                    <div className="flex-shrink-0">
                                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                        {oa.oas_id}
                                      </span>
                                    </div>
                                  )}
                                  <Tooltip content={indicador.descripcion}>
                                    <div className="min-w-0 flex-1 max-w-[200px]">
                                      <span className="text-xs text-gray-700 truncate cursor-help block">
                                        {indicador.descripcion}
                                      </span>
                                    </div>
                                  </Tooltip>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                  {estado === 'completo' && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full">
                                      <Check
                                        size={10}
                                        className="text-green-600"
                                      />
                                      <span className="text-xs font-medium text-green-700">
                                        Completo
                                      </span>
                                    </div>
                                  )}
                                  {estado === 'exceso' && (
                                    <div className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-50 border border-red-200 rounded-full">
                                      <span className="text-xs font-bold text-red-700">
                                        +{Math.abs(faltantes)}
                                      </span>
                                    </div>
                                  )}
                                  {estado === 'incompleto' && (
                                    <div className="flex items-center justify-center min-w-[24px] h-6 px-2 bg-amber-50 border border-amber-200 rounded-full">
                                      <span className="text-xs font-bold text-amber-700">
                                        {faltantes}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
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
              Las preguntas aparecerán aquí cuando escribas en el editor o
              agregues una nueva
            </p>
          </div>
        ) : (
          preguntasExtraidas.map(pregunta => (
            <div
              key={pregunta.numero}
              className="bg-white rounded-lg p-4 border border-gray-200"
            >
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
                      onClick={() =>
                        handleToggleDropdown('pregunta', pregunta.numero)
                      }
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {openDropdown?.tipo === 'pregunta' &&
                      openDropdown?.numero === pregunta.numero && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() =>
                              handleDropdownAction(
                                'edit',
                                'pregunta',
                                pregunta.numero
                              )
                            }
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit2 size={14} />
                            Editar
                          </button>
                          <button
                            onClick={() =>
                              handleDropdownAction(
                                'delete',
                                'pregunta',
                                pregunta.numero
                              )
                            }
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
              {editingPregunta?.numero === pregunta.numero &&
              editingPregunta?.field === 'texto' ? (
                <div className="mb-3">
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
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

              {/* Asignación de Indicadores */}
              {selectedMatriz && (
                <div className="mb-4 space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-indigo-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Indicadores Asignados
                    </span>
                  </div>

                  {/* Indicador de Contenido */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-blue-700">
                      Indicador de Contenido *
                    </label>
                    <Dropdown
                      value={
                        getIndicadorAsignado(
                          pregunta.numero,
                          'contenido'
                        )?.id?.toString() || ''
                      }
                      onChange={value =>
                        onIndicadorChange(
                          pregunta.numero,
                          'contenido',
                          value ? Number(value) : null
                        )
                      }
                      options={getIndicadoresContenido().map(ind => {
                        const estado = getEstadoIndicador(ind.id, 'contenido');
                        const isDisabled =
                          estado === 'completo' &&
                          getIndicadorAsignado(pregunta.numero, 'contenido')
                            ?.id !== ind.id;

                        return {
                          value: ind.id.toString(),
                          label: ind.descripcion,
                          disabled: isDisabled,
                        };
                      })}
                      placeholder="Seleccionar indicador de contenido..."
                      className="text-sm"
                    />
                    {getIndicadorAsignado(pregunta.numero, 'contenido') && (
                      <div className="flex items-center gap-2 text-xs text-blue-600">
                        <Check size={12} />
                        <span>Indicador de contenido asignado</span>
                      </div>
                    )}
                  </div>

                  {/* Indicador de Habilidad (solo si existe) */}
                  {hasIndicadoresHabilidad() && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-green-700">
                        Indicador de Habilidad *
                      </label>
                      <Dropdown
                        value={
                          getIndicadorAsignado(
                            pregunta.numero,
                            'habilidad'
                          )?.id?.toString() || ''
                        }
                        onChange={value =>
                          onIndicadorChange(
                            pregunta.numero,
                            'habilidad',
                            value ? Number(value) : null
                          )
                        }
                        options={getIndicadoresHabilidad().map(ind => {
                          const estado = getEstadoIndicador(
                            ind.id,
                            'habilidad'
                          );
                          const isDisabled =
                            estado === 'completo' &&
                            getIndicadorAsignado(pregunta.numero, 'habilidad')
                              ?.id !== ind.id;

                          return {
                            value: ind.id.toString(),
                            label: ind.descripcion,
                            disabled: isDisabled,
                          };
                        })}
                        placeholder="Seleccionar indicador de habilidad..."
                        className="text-sm"
                      />
                      {getIndicadorAsignado(pregunta.numero, 'habilidad') && (
                        <div className="flex items-center gap-2 text-xs text-green-600">
                          <Check size={12} />
                          <span>Indicador de habilidad asignado</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Alternativas */}
              <div className="space-y-2">
                {pregunta.alternativas
                  .sort((a, b) => a.letra.localeCompare(b.letra))
                  .map((alternativa, index) => {
                    const esCorrecta =
                      respuestasCorrectas[pregunta.numero] ===
                      alternativa.letra;
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
                            onChange={() =>
                              onRespuestaChange(
                                pregunta.numero,
                                alternativa.letra
                              )
                            }
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span
                            className={`font-medium w-6 ${esCorrecta ? 'text-green-700 font-bold' : 'text-gray-700'}`}
                          >
                            {alternativa.letra}.
                          </span>
                        </label>
                        {editingPregunta?.numero === pregunta.numero &&
                        editingPregunta?.field === 'alternativa' &&
                        editingPregunta?.alternativaIndex === index ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
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
                            <span className="text-gray-700 text-sm flex-1">
                              {alternativa.texto}
                            </span>
                            {esCorrecta && (
                              <Check
                                size={16}
                                className="text-green-600 ml-2"
                              />
                            )}
                            <div className="relative dropdown-container">
                              <button
                                onClick={() =>
                                  handleToggleDropdown(
                                    'alternativa',
                                    pregunta.numero,
                                    index
                                  )
                                }
                                className="p-1 text-gray-400 hover:text-gray-600 rounded opacity-60 hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical size={14} />
                              </button>
                              {openDropdown?.tipo === 'alternativa' &&
                                openDropdown?.numero === pregunta.numero &&
                                openDropdown?.alternativaIndex === index && (
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                                    <button
                                      onClick={() =>
                                        handleDropdownAction(
                                          'edit',
                                          'alternativa',
                                          pregunta.numero,
                                          index
                                        )
                                      }
                                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <Edit2 size={14} />
                                      Editar
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction(
                                          'delete',
                                          'alternativa',
                                          pregunta.numero,
                                          index
                                        )
                                      }
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
                    );
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
  );
}
