'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronsUpDown, Check, X, Plus, Clock, BarChart3, Target } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { Dialog } from '@headlessui/react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';

interface OA {
  id: number;
  oas_id: string;
  descripcion_oas: string;
  eje_id: number;
  eje_descripcion: string;
  nivel_id: number;
  asignatura_id: number;
  basal?: boolean;
}

interface Eje {
  id: number;
  descripcion: string;
}

interface Indicador {
  id?: number;
  descripcion: string;
  preguntas: number;
}

interface MatrizOA {
  id: number;
  oaId: number;
  oa: OA;
  indicadores: Indicador[];
}

interface MatrizEspecificacion {
  id: number;
  nombre: string;
  total_preguntas: number;
  fecha_creacion: string;
  oas: MatrizOA[];
}

export default function EditarMatrizPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oas, setOAs] = useState<OA[]>([]);
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [selectedEje, setSelectedEje] = useState<number | null>(null);
  const [selectedOAs, setSelectedOAs] = useState<OA[]>([]);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [oaIndicadores, setOAIndicadores] = useState<{[oaId:number]: Indicador[]}>({});
  const [matrizName, setMatrizName] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState(1);
  const [showOaChangeModal, setShowOaChangeModal] = useState(false);
  const [pendingOAs, setPendingOAs] = useState<OA[]>([]);
  const [matrizOriginal, setMatrizOriginal] = useState<MatrizEspecificacion | null>(null);

  const steps = [
    { n: 1, label: 'Datos básicos' },
    { n: 2, label: 'Seleccionar OA' },
    { n: 3, label: 'Indicadores' }
  ];

  // Funciones de gradientes ordenados
  const getGradient = (index: number) => {
    const gradients = [
      'from-emerald-500 to-teal-600',    // 1. Verde
      'from-amber-500 to-orange-600',    // 2. Naranja
      'from-indigo-500 to-purple-600',   // 3. Índigo
      'from-cyan-500 to-blue-600',       // 4. Cyan
      'from-rose-500 to-pink-600',       // 5. Rose
      'from-violet-500 to-fuchsia-600'   // 6. Violet
    ];
    return gradients[index % gradients.length];
  };

  const getHoverGradient = (index: number) => {
    const hoverGradients = [
      'hover:from-emerald-600 hover:to-teal-700',  // 1. Verde
      'hover:from-amber-600 hover:to-orange-700',  // 2. Naranja
      'hover:from-indigo-600 hover:to-purple-700', // 3. Índigo
      'hover:from-cyan-600 hover:to-blue-700',     // 4. Cyan
      'hover:from-rose-600 hover:to-pink-700',     // 5. Rose
      'hover:from-violet-600 hover:to-fuchsia-700' // 6. Violet
    ];
    return hoverGradients[index % hoverGradients.length];
  };

  useEffect(() => {
    if (params.id) {
      fetchMatrizAndOAs(Number(params.id));
    }
  }, [params.id]);

  const fetchMatrizAndOAs = async (matrizId: number) => {
    try {
      // Cargar OAs disponibles
      const oasResponse = await fetch('/api/oas');
      if (oasResponse.ok) {
        const oasData = await oasResponse.json();
        setOAs(oasData);
        
        // Extraer ejes únicos
        const ejesUnicos = oasData.reduce((acc: Eje[], oa: OA) => {
          const ejeExistente = acc.find(e => e.id === oa.eje_id);
          if (!ejeExistente) {
            acc.push({
              id: oa.eje_id,
              descripcion: oa.eje_descripcion
            });
          }
          return acc;
        }, []);
        setEjes(ejesUnicos);
      }

      // Cargar matriz existente
      const matrizResponse = await fetch(`/api/matrices/${matrizId}`);
      if (matrizResponse.ok) {
        const matrizData = await matrizResponse.json();
        setMatrizOriginal(matrizData);
        
        // Pre-cargar datos de la matriz
        setMatrizName(matrizData.nombre);
        setTotalPreguntas(matrizData.total_preguntas);
        
        // Pre-cargar OAs seleccionados
        const oasSeleccionados = matrizData.oas.map((matrizOA: MatrizOA) => matrizOA.oa);
        setSelectedOAs(oasSeleccionados);
        
        // Pre-cargar indicadores
        const indicadoresPreCargados: {[oaId:number]: Indicador[]} = {};
        matrizData.oas.forEach((matrizOA: MatrizOA) => {
          indicadoresPreCargados[matrizOA.oaId] = matrizOA.indicadores;
        });
        setOAIndicadores(indicadoresPreCargados);
        
        // Establecer eje seleccionado (usar el primer OA como referencia)
        if (oasSeleccionados.length > 0) {
          setSelectedEje(oasSeleccionados[0].eje_id);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrors({ submit: 'Error al cargar los datos de la matriz' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar OAs por eje seleccionado
  const oasDelEje = selectedEje 
    ? oas.filter(oa => oa.eje_id === selectedEje)
    : [];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedEje) {
      newErrors.eje = 'Debe seleccionar un eje';
    }

    if (selectedOAs.length === 0) {
      newErrors.oa = 'Debe seleccionar al menos un OA';
    }

    if (!matrizName.trim()) {
      newErrors.nombre = 'El nombre de la matriz es requerido';
    }

    if (totalPreguntas === 0) {
      newErrors.indicadores = 'El total de preguntas debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateMatriz = async () => {
    if (!validateForm() || !matrizOriginal) {
      return;
    }

    setSaving(true);
    try {
      const matrizData = {
        nombre: matrizName,
        total_preguntas: totalPreguntas,
        oas: selectedOAs.map(oa => ({
          oaId: oa.id,
          indicadores: (oaIndicadores[oa.id] || []).map(ind => ({
            descripcion: ind.descripcion,
            preguntas: ind.preguntas
          }))
        }))
      };

      const response = await fetch(`/api/matrices/${matrizOriginal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matrizData),
      });

      if (response.ok) {
        router.push(`/matrices/${matrizOriginal.id}`);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Error al actualizar la matriz' });
      }
    } catch (error) {
      console.error('Error al actualizar matriz:', error);
      setErrors({ submit: 'Error al actualizar la matriz' });
    } finally {
      setSaving(false);
    }
  };

  const isValid = selectedEje && selectedOAs.length > 0 && matrizName.trim() && totalPreguntas > 0;

  const handleOaChange = (oas: OA[]) => {
    const hayIndicadores = Object.values(oaIndicadores).some(arr => arr && arr.length > 0 && arr.some(ind => ind.descripcion.trim() || ind.preguntas > 0));
    if (step === 3 && hayIndicadores && JSON.stringify(oas.map(o => o.id)) !== JSON.stringify(selectedOAs.map(o => o.id))) {
      setPendingOAs(oas);
      setShowOaChangeModal(true);
    } else {
      setSelectedOAs(oas);
    }
  };

  // Calcula el total de preguntas de los indicadores
  const totalPreguntasIndicadores = Object.values(oaIndicadores).flat().reduce((sum, ind) => sum + (ind.preguntas || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fd] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando matriz...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header moderno */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-white/80 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Editar Matriz de Especificación
              </h1>
              <p className="text-indigo-100 text-sm">
                Modifica los criterios de evaluación de tu matriz
              </p>
            </div>
          </div>
          
          {/* Información de la matriz */}
          {matrizOriginal && (
            <div className="bg-white/10 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-200" />
                <div>
                  <p className="text-indigo-200 text-xs">Matriz Original</p>
                  <p className="text-lg font-bold">{matrizOriginal.nombre}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Stats de la matriz */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Preguntas</p>
                <p className="text-lg font-bold">{totalPreguntas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">OAs Seleccionados</p>
                <p className="text-lg font-bold">{selectedOAs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Paso Actual</p>
                <p className="text-lg font-bold">{step} de {steps.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Stepper tipo wizard moderno */}
        <div className="flex justify-center items-center gap-0 mb-12 mt-8">
          {steps.map((stepObj, idx) => (
            <div key={stepObj.n} className="flex items-center">
              {/* Contenedor del paso (número + texto) */}
              <div className="flex flex-col items-center">
                {/* Círculo del paso */}
                {step > stepObj.n ? (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl text-white transition-all duration-300 transform hover:scale-105">
                    <Check className="w-7 h-7" />
                  </div>
                ) : step === stepObj.n ? (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl text-white text-xl font-bold transition-all duration-300 transform hover:scale-105">
                    {stepObj.n}
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 text-xl font-bold transition-all duration-300 hover:bg-gray-50 hover:border-gray-300">
                    {stepObj.n}
                  </div>
                )}
                {/* Texto del paso */}
                <span className={`mt-3 text-sm font-medium text-center ${step === stepObj.n ? 'text-indigo-700 font-bold' : step > stepObj.n ? 'text-emerald-600' : 'text-gray-500'}`}>{stepObj.label}</span>
              </div>
              
              {/* Línea entre pasos */}
              {idx < steps.length - 1 && (
                <div className={`h-px w-32 mb-8 rounded-full ${step > stepObj.n ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gray-200'} mx-8 transition-all duration-300`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Sección 1: Datos básicos */}
        {step === 1 && (
          <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la matriz
                </label>
                <input
                  type="text"
                  value={matrizName}
                  onChange={e => setMatrizName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300"
                  placeholder="Ingresa el nombre de la matriz"
                />
              </div>
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total de preguntas
                </label>
                <input
                  type="number"
                  value={totalPreguntas}
                  onChange={e => setTotalPreguntas(Number(e.target.value))}
                  className="w-full px-4 py-2 border rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300"
                  placeholder="0"
                  min={0}
                />
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <SecondaryButton onClick={() => router.back()}>Cancelar</SecondaryButton>
              <PrimaryButton
                onClick={() => setStep(2)}
                disabled={!matrizName.trim() || totalPreguntas <= 0}
              >Siguiente</PrimaryButton>
            </div>
          </div>
        )}

        {/* Sección 2: Selección de OA */}
        {step === 2 && (
          <div className="space-y-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Listbox value={selectedEje} onChange={setSelectedEje}>
                  <div className="relative mt-1">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Eje</Listbox.Label>
                    <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {selectedEje ? ejes.find(e => e.id === selectedEje)?.descripcion : 'Selecciona un eje'}
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {ejes.map(eje => (
                        <Listbox.Option key={eje.id} value={eje.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}` }>
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{eje.descripcion}</span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                  <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
              <div className="flex-1">
                <Listbox value={selectedOAs} onChange={handleOaChange} multiple>
                  <div className="relative mt-1">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">OA (Habilidad)</Listbox.Label>
                    <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {selectedOAs.length === 0 ? 'Selecciona uno o más OA' : `${selectedOAs.length} seleccionados`}
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    {selectedOAs.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedOAs.map(oa => (
                          <span key={oa.id} className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                            {oa.oas_id}
                            <button
                              type="button"
                              onClick={() => handleOaChange(selectedOAs.filter(o => o.id !== oa.id))}
                              className="ml-1 text-indigo-400 hover:text-indigo-700 focus:outline-none"
                              aria-label={`Eliminar ${oa.oas_id}`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {oasDelEje.map(oa => (
                        <Listbox.Option key={oa.id} value={oa} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}` }>
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{oa.oas_id} - {oa.descripcion_oas.substring(0, 50)}...</span>
                              {selected ? (
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                  <Check className="h-5 w-5" aria-hidden="true" />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <SecondaryButton onClick={() => setStep(1)}>Atrás</SecondaryButton>
              <PrimaryButton
                onClick={() => setStep(3)}
                disabled={selectedOAs.length === 0}
              >Confirmar OAs</PrimaryButton>
            </div>
            {/* Modal de confirmación para cambio de OAs */}
            <Dialog open={showOaChangeModal} onClose={() => setShowOaChangeModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4">
                <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
                <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
                  <Dialog.Title className="text-lg font-bold mb-4">¿Cambiar OAs seleccionados?</Dialog.Title>
                  <Dialog.Description className="mb-6 text-gray-600">Si cambias los OAs seleccionados, se perderán los indicadores que hayas definido. ¿Deseas continuar?</Dialog.Description>
                  <div className="flex gap-4 justify-end">
                    <SecondaryButton onClick={() => setShowOaChangeModal(false)}>Cancelar</SecondaryButton>
                    <PrimaryButton onClick={() => {
                      setSelectedOAs(pendingOAs);
                      setOAIndicadores({});
                      setShowOaChangeModal(false);
                    }}>Sí, cambiar</PrimaryButton>
                  </div>
                </div>
              </div>
            </Dialog>
          </div>
        )}

        {/* Sección 3: Indicadores */}
        {step === 3 && (
          <div className="space-y-6 mb-8">
            {selectedOAs.map(oa => (
              <div key={oa.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Target size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Indicadores para {oa.oas_id}
                    </h3>
                    <div className="flex items-center gap-3">
                      {/* Badge Basal si aplica */}
                      {oa.basal && (
                        <span className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-xs font-semibold">
                          Basal
                        </span>
                      )}
                      {/* Descripción corta */}
                      {oa.descripcion_oas && (
                        <span className="text-gray-600 text-sm">
                          {oa.descripcion_oas.substring(0, 60)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Indicadores */}
                <div className="space-y-4">
                  {(oaIndicadores[oa.id] || []).map((indicador, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={indicador.descripcion}
                          onChange={(e) => setOAIndicadores(prev => ({
                            ...prev,
                            [oa.id]: prev[oa.id].map((ind, i) => 
                              i === idx ? { ...ind, descripcion: e.target.value } : ind
                            )
                          }))}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          placeholder="Descripción del indicador"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={indicador.preguntas}
                          onChange={(e) => setOAIndicadores(prev => ({
                            ...prev,
                            [oa.id]: prev[oa.id].map((ind, i) => 
                              i === idx ? { ...ind, preguntas: Number(e.target.value) } : ind
                            )
                          }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                          placeholder="Preguntas"
                          min="0"
                        />
                      </div>
                      {(oaIndicadores[oa.id] || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setOAIndicadores(prev => ({
                            ...prev,
                            [oa.id]: prev[oa.id].filter((_, i) => i !== idx)
                          }))}
                          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-400 text-white shadow hover:from-pink-600 hover:to-red-500 transition-colors"
                          title="Eliminar indicador"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Botón agregar indicador */}
                <button
                  type="button"
                  onClick={() => setOAIndicadores(prev => ({
                    ...prev,
                    [oa.id]: [...(prev[oa.id] || []), { descripcion: '', preguntas: 0 }]
                  }))}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500 text-white shadow hover:bg-indigo-600 transition-colors mt-4"
                  title="Agregar indicador"
                >
                  <Plus size={22} />
                </button>
              </div>
            ))}
            {/* Resumen de preguntas */}
            
            <div className="flex justify-end gap-4 mt-8">
              <SecondaryButton onClick={() => setStep(2)}>Atrás</SecondaryButton>
              <PrimaryButton
                onClick={handleUpdateMatriz}
                disabled={!isValid || saving || totalPreguntasIndicadores !== totalPreguntas}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </PrimaryButton>
            </div>
            <div className="flex justify-end items-center mb-2">
              <span className={
                `text-base font-semibold ${
                  totalPreguntasIndicadores === totalPreguntas
                    ? 'text-green-500'
                    : 'text-gray-500'
                }`
              }>
                Total preguntas: {totalPreguntasIndicadores} / {totalPreguntas}
              </span>
            </div>
            {errors.submit && (
              <Dialog open={!!errors.submit} onClose={() => setErrors({ ...errors, submit: '' })} className="fixed z-50 inset-0 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
                  <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto p-8 z-10">
                    <Dialog.Title className="text-lg font-bold mb-4">Error</Dialog.Title>
                    <Dialog.Description className="mb-6 text-gray-600">{errors.submit}</Dialog.Description>
                    <div className="flex gap-4 justify-end">
                      <PrimaryButton onClick={() => setErrors({ ...errors, submit: '' })}>Cerrar</PrimaryButton>
                    </div>
                  </div>
                </div>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </>
  );
} 