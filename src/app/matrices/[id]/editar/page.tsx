'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, ChevronsUpDown, Check, X, Plus, Clock } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f7f8fd] flex flex-col w-full">
      <div className="w-full max-w-7xl mx-auto mt-6 mb-6 rounded-3xl bg-white/80 shadow-[0_8px_32px_0_rgba(99,102,241,0.10)] flex flex-col overflow-hidden min-h-[90vh] pb-16">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-indigo-700 mb-1">
                Editar Matriz
              </h1>
              <p className="text-gray-500 text-base">
                Modifica los criterios de evaluación de tu matriz de especificación
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Stepper tipo wizard moderno */}
            <div className="flex justify-center items-center gap-0 mb-8">
              {steps.map((stepObj, idx) => (
                <div key={stepObj.n} className="flex items-center">
                  {/* Círculo del paso */}
                  {step > stepObj.n ? (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shadow text-white text-xl font-bold">
                      <Check className="w-5 h-5" />
                    </div>
                  ) : step === stepObj.n ? (
                    <div className="w-9 h-9 rounded-full border-2 border-indigo-600 flex items-center justify-center bg-white text-indigo-600 text-xl font-bold">
                      {stepObj.n}
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center bg-white text-gray-400 text-xl font-bold">
                      {stepObj.n}
                    </div>
                  )}
                  {/* Texto del paso */}
                  <span className={`ml-3 mr-6 text-base ${step === stepObj.n ? 'text-indigo-700 font-bold' : 'text-gray-500 font-normal'}`}>{stepObj.label}</span>
                  {/* Línea entre pasos */}
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 w-12 bg-gray-200 ${step > stepObj.n ? 'bg-indigo-500' : 'bg-gray-200'} ml-6 mr-6`}></div>
                  )}
                </div>
              ))}
            </div>

            {/* Sección 1: Datos básicos */}
            {step === 1 && (
              <div className="space-y-6 mb-8">
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  <input
                    type="text"
                    value={matrizName}
                    onChange={e => setMatrizName(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300"
                    placeholder="Nombre de la matriz"
                  />
                  <input
                    type="number"
                    value={totalPreguntas}
                    onChange={e => setTotalPreguntas(Number(e.target.value))}
                    className="w-40 px-4 py-2 border rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300"
                    placeholder="Total de preguntas"
                    min={0}
                  />
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
                  <div key={oa.id} className="mt-8 bg-indigo-50/30 border border-indigo-100 rounded-2xl shadow p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-lg font-bold text-indigo-700">Indicadores para {oa.oas_id}</span>
                      {/* Badge Basal si aplica */}
                      {oa.basal && (
                        <span className="bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 text-xs font-semibold ml-2">Basal</span>
                      )}
                      {/* Descripción corta */}
                      {oa.descripcion_oas && (
                        <span className="font-normal text-gray-500 ml-2">- {oa.descripcion_oas.substring(0, 40)}...</span>
                      )}
                      {/* Ejemplo de ícono de reloj y mínimo */}
                      <span className="flex items-center text-gray-400 ml-4 text-sm"><Clock className="w-4 h-4 mr-1" /> Min: 10</span>
                    </div>
                    {/* Indicadores */}
                    {(oaIndicadores[oa.id] || []).map((indicador, idx) => (
                      <div key={idx} className="flex items-center gap-4">
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
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Preguntas"
                            min="0"
                          />
                        </div>
                        {oaIndicadores[oa.id].length > 1 && (
                          <button
                            type="button"
                            onClick={() => setOAIndicadores(prev => ({
                              ...prev,
                              [oa.id]: prev[oa.id].filter((_, i) => i !== idx)
                            }))}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-red-400 text-white shadow hover:from-pink-600 hover:to-red-500 transition-colors ml-2"
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
                      onClick={() => setOAIndicadores(prev => ({
                        ...prev,
                        [oa.id]: [...(prev[oa.id] || []), { descripcion: '', preguntas: 0 }]
                      }))}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-400 text-white shadow hover:from-indigo-600 hover:to-purple-500 transition-colors font-medium mt-2"
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
        </div>
      </div>
    </div>
  );
} 