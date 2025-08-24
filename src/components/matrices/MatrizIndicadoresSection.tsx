import { Target, BookOpen, Zap, Plus, X } from 'lucide-react';
import { getGradient } from '@/utils/matrices';
import SecondaryButton from '@/components/ui/SecondaryButton';
import PrimaryButton from '@/components/ui/PrimaryButton';

interface OA {
  id: number;
  oas_id: string;
  descripcion_oas: string;
  eje_id: number;
  eje_descripcion: string;
  nivel_id: number;
  asignatura_id: number;
  nivel: { nombre: string };
  asignatura: { nombre: string };
  basal?: boolean;
  tipo_eje: 'Contenido' | 'Habilidad' | 'Actitud';
}

interface Indicador {
  descripcion: string;
  preguntas: number;
}

interface MatrizIndicadoresSectionProps {
  // OAs seleccionados
  selectedOAsContenido: OA[];
  selectedOAsHabilidad: OA[];

  // Indicadores por OA
  oaIndicadores: { [oaId: number]: Indicador[] };
  onOAIndicadoresChange: (indicadores: { [oaId: number]: Indicador[] }) => void;

  // Totales y validaciones
  totalPreguntas: number;
  totalPreguntasContenido: number;
  totalPreguntasHabilidad: number;
  allOAsContenidoHaveIndicators: boolean;
  allOAsHabilidadHaveIndicators: boolean;

  // Navegación
  onBack: () => void;
  onCreateMatriz: () => void;
  isStep3Valid: boolean;
  loading: boolean;

  // Errores
  errors: { [key: string]: string };
  onClearError: () => void;
}

export default function MatrizIndicadoresSection({
  selectedOAsContenido,
  selectedOAsHabilidad,
  oaIndicadores,
  onOAIndicadoresChange,
  totalPreguntas,
  totalPreguntasContenido,
  totalPreguntasHabilidad,
  allOAsContenidoHaveIndicators,
  allOAsHabilidadHaveIndicators,
  onBack,
  onCreateMatriz,
  isStep3Valid,
  loading,
  errors,
  onClearError,
}: MatrizIndicadoresSectionProps) {
  const handleIndicadorChange = (
    oaId: number,
    index: number,
    field: 'descripcion' | 'preguntas',
    value: string | number
  ) => {
    onOAIndicadoresChange({
      ...oaIndicadores,
      [oaId]: oaIndicadores[oaId].map((ind, i) =>
        i === index ? { ...ind, [field]: value } : ind
      ),
    });
  };

  const handleAddIndicador = (oaId: number) => {
    onOAIndicadoresChange({
      ...oaIndicadores,
      [oaId]: [
        ...(oaIndicadores[oaId] || []),
        { descripcion: '', preguntas: 0 },
      ],
    });
  };

  const handleRemoveIndicador = (oaId: number, index: number) => {
    onOAIndicadoresChange({
      ...oaIndicadores,
      [oaId]: oaIndicadores[oaId].filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8 mb-8">
      {/* OAs de Contenido */}
      {selectedOAsContenido.length > 0 && (
        <div className="space-y-6">
          {/* Header de Contenido */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Indicadores de Contenido
                  </h2>
                  <p className="text-blue-100">
                    Define los indicadores para los OAs de contenido
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-bold ${totalPreguntasContenido === totalPreguntas && allOAsContenidoHaveIndicators ? 'text-emerald-200' : 'text-gray-200'}`}
                >
                  {totalPreguntasContenido} / {totalPreguntas}
                </div>
                <div className="text-sm text-blue-100">
                  {totalPreguntasContenido === totalPreguntas &&
                  allOAsContenidoHaveIndicators
                    ? '✓ Válido'
                    : '✗ Incompleto'}
                </div>
              </div>
            </div>
          </div>

          {/* OAs de Contenido */}
          {selectedOAsContenido.map((oa, index) => (
            <div
              key={`${oa.id}-${index}`}
              className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
            >
              {/* Header sobrio */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getGradient(index)}`}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Indicadores para {oa.oas_id}
                    </h3>
                    {oa.descripcion_oas && (
                      <p className="text-gray-500 text-sm mt-1">
                        {oa.descripcion_oas.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {oa.basal && (
                    <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
                      Basal
                    </span>
                  )}
                </div>
              </div>
              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Indicadores */}
                {(oaIndicadores[oa.id] || []).map((indicador, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={indicador.descripcion}
                      onChange={e =>
                        handleIndicadorChange(
                          oa.id,
                          idx,
                          'descripcion',
                          e.target.value
                        )
                      }
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
                      placeholder="Descripción del indicador"
                    />
                    <input
                      type="number"
                      value={indicador.preguntas}
                      onChange={e =>
                        handleIndicadorChange(
                          oa.id,
                          idx,
                          'preguntas',
                          Number(e.target.value)
                        )
                      }
                      className="w-24 px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-center transition-all duration-200"
                      min={0}
                      placeholder="0"
                    />
                    {/* Botón eliminar indicador */}
                    {(oaIndicadores[oa.id] || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIndicador(oa.id, idx)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-400 text-white shadow-lg hover:from-pink-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105"
                        title="Eliminar indicador"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Botón agregar indicador */}
                <button
                  type="button"
                  onClick={() => handleAddIndicador(oa.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 shadow hover:bg-gray-100 transition-all duration-200"
                  title="Agregar indicador"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OAs de Habilidad */}
      {selectedOAsHabilidad.length > 0 && (
        <div className="space-y-6">
          {/* Header de Habilidad */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    Indicadores de Habilidad
                  </h2>
                  <p className="text-green-100">
                    Define los indicadores para los OAs de habilidad
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-lg font-bold ${totalPreguntasHabilidad === totalPreguntas && allOAsHabilidadHaveIndicators ? 'text-emerald-200' : 'text-gray-200'}`}
                >
                  {totalPreguntasHabilidad} / {totalPreguntas}
                </div>
                <div className="text-sm text-green-100">
                  {totalPreguntasHabilidad === totalPreguntas &&
                  allOAsHabilidadHaveIndicators
                    ? '✓ Válido'
                    : '✗ Incompleto'}
                </div>
              </div>
            </div>
          </div>

          {/* OAs de Habilidad */}
          {selectedOAsHabilidad.map((oa, index) => (
            <div
              key={`${oa.id}-${index}`}
              className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
            >
              {/* Header sobrio */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getGradient(index)}`}
                  >
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Indicadores para {oa.oas_id}
                    </h3>
                    {oa.descripcion_oas && (
                      <p className="text-gray-500 text-sm mt-1">
                        {oa.descripcion_oas.substring(0, 60)}...
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {oa.basal && (
                    <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
                      Basal
                    </span>
                  )}
                </div>
              </div>
              {/* Contenido */}
              <div className="p-6 space-y-4">
                {/* Indicadores */}
                {(oaIndicadores[oa.id] || []).map((indicador, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <input
                      type="text"
                      value={indicador.descripcion}
                      onChange={e =>
                        handleIndicadorChange(
                          oa.id,
                          idx,
                          'descripcion',
                          e.target.value
                        )
                      }
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
                      placeholder="Descripción del indicador"
                    />
                    <input
                      type="number"
                      value={indicador.preguntas}
                      onChange={e =>
                        handleIndicadorChange(
                          oa.id,
                          idx,
                          'preguntas',
                          Number(e.target.value)
                        )
                      }
                      className="w-24 px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-center transition-all duration-200"
                      min={0}
                      placeholder="0"
                    />
                    {/* Botón eliminar indicador */}
                    {(oaIndicadores[oa.id] || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIndicador(oa.id, idx)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-400 text-white shadow-lg hover:from-pink-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105"
                        title="Eliminar indicador"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Botón agregar indicador */}
                <button
                  type="button"
                  onClick={() => handleAddIndicador(oa.id)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 shadow hover:bg-gray-100 transition-all duration-200"
                  title="Agregar indicador"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resumen de preguntas */}
      <div className="flex justify-end gap-4 mt-8">
        <SecondaryButton onClick={onBack}>Atrás</SecondaryButton>
        <PrimaryButton
          variant="large"
          onClick={onCreateMatriz}
          disabled={!isStep3Valid || loading}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando...' : 'Finalizar'}
        </PrimaryButton>
      </div>

      <div className="flex justify-end items-center mb-2">
        <span
          className={`text-base font-semibold ${
            isStep3Valid ? 'text-green-500' : 'text-gray-500'
          }`}
        >
          Total preguntas: {totalPreguntasContenido} / {totalPreguntas}
        </span>
      </div>

      {errors.submit && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black opacity-30"
              aria-hidden="true"
            />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
              <h3 className="text-lg font-bold mb-4">Error</h3>
              <p className="mb-6 text-gray-600">{errors.submit}</p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={onClearError}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
