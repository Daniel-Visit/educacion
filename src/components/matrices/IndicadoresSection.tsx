import React, { useState } from 'react';
import { Plus, X, Target } from 'lucide-react';
import { OA, Indicador } from '@/types/matrices';
import { getGradient } from '@/utils/matrices';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';

interface IndicadoresSectionProps {
  selectedOAsContenido: OA[];
  selectedOAsHabilidad: OA[];
  oaIndicadores: { [oaId: number]: Indicador[] };
  onIndicadoresChange: (oaId: number, indicadores: Indicador[]) => void;
  errors: { [key: string]: string };
  className?: string;
}

export default function IndicadoresSection({
  selectedOAsContenido,
  selectedOAsHabilidad,
  oaIndicadores,
  onIndicadoresChange,
  errors,
  className = '',
}: IndicadoresSectionProps) {
  const [newIndicador, setNewIndicador] = useState<{
    [oaId: number]: { descripcion: string; preguntas: string };
  }>({});

  const addIndicador = (oaId: number) => {
    const indicador = newIndicador[oaId];
    if (!indicador || !indicador.descripcion.trim() || !indicador.preguntas)
      return;

    const preguntas = parseInt(indicador.preguntas);
    if (isNaN(preguntas) || preguntas <= 0) return;

    const currentIndicadores = oaIndicadores[oaId] || [];
    const newIndicadorObj: Indicador = {
      descripcion: indicador.descripcion.trim(),
      preguntas,
    };

    onIndicadoresChange(oaId, [...currentIndicadores, newIndicadorObj]);
    setNewIndicador(prev => ({
      ...prev,
      [oaId]: { descripcion: '', preguntas: '' },
    }));
  };

  const removeIndicador = (oaId: number, index: number) => {
    const currentIndicadores = oaIndicadores[oaId] || [];
    const updatedIndicadores = currentIndicadores.filter((_, i) => i !== index);
    onIndicadoresChange(oaId, updatedIndicadores);
  };

  const updateIndicador = (
    oaId: number,
    index: number,
    field: keyof Indicador,
    value: string | number
  ) => {
    const currentIndicadores = oaIndicadores[oaId] || [];
    const updatedIndicadores = [...currentIndicadores];
    updatedIndicadores[index] = {
      ...updatedIndicadores[index],
      [field]: field === 'preguntas' ? parseInt(value as string) || 0 : value,
    };
    onIndicadoresChange(oaId, updatedIndicadores);
  };

  const renderOASection = (oas: OA[], title: string, tipo: string) => {
    if (oas.length === 0) return null;

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="h-5 w-5" />
          {title}
        </h3>

        <div className="grid gap-6">
          {oas.map((oa, index) => {
            const indicadores = oaIndicadores[oa.id] || [];
            const error = errors[`indicadores_${oa.id}`];

            return (
              <div
                key={`${oa.id}-${index}`}
                className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden"
              >
                <div
                  className={`p-4 bg-gradient-to-r ${getGradient(index)} text-white`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{oa.oas_id}</h4>
                      <p className="text-white/90 text-sm mt-1">
                        {oa.descripcion_oas}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-sm opacity-90">Total preguntas</div>
                      <div className="text-xl font-bold">
                        {indicadores.reduce(
                          (sum, ind) => sum + ind.preguntas,
                          0
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Indicadores existentes */}
                  <div className="space-y-3 mb-6">
                    {indicadores.map((indicador, indIndex) => (
                      <div
                        key={indIndex}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <input
                            type="text"
                            value={indicador.descripcion}
                            onChange={e =>
                              updateIndicador(
                                oa.id,
                                indIndex,
                                'descripcion',
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Descripción del indicador"
                          />
                        </div>
                        <div className="w-24">
                          <input
                            type="number"
                            value={indicador.preguntas}
                            onChange={e =>
                              updateIndicador(
                                oa.id,
                                indIndex,
                                'preguntas',
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Preguntas"
                            min="1"
                          />
                        </div>
                        <button
                          onClick={() => removeIndicador(oa.id, indIndex)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Agregar nuevo indicador */}
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newIndicador[oa.id]?.descripcion || ''}
                        onChange={e =>
                          setNewIndicador(prev => ({
                            ...prev,
                            [oa.id]: {
                              ...prev[oa.id],
                              descripcion: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nuevo indicador"
                      />
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        value={newIndicador[oa.id]?.preguntas || ''}
                        onChange={e =>
                          setNewIndicador(prev => ({
                            ...prev,
                            [oa.id]: {
                              ...prev[oa.id],
                              preguntas: e.target.value,
                            },
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Preguntas"
                        min="1"
                      />
                    </div>
                    <button
                      onClick={() => addIndicador(oa.id)}
                      className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {renderOASection(selectedOAsContenido, 'OAs de Contenido', 'contenido')}
      {renderOASection(selectedOAsHabilidad, 'OAs de Habilidad', 'habilidad')}

      {selectedOAsContenido.length === 0 &&
        selectedOAsHabilidad.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay OAs seleccionados
            </h3>
            <p className="text-gray-600">
              Selecciona OAs en el paso anterior para agregar indicadores
            </p>
          </div>
        )}
    </div>
  );
}
