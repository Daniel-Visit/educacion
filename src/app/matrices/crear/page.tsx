'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  nivel: { nombre: string };
  asignatura: { nombre: string };
  basal?: boolean;
}

interface Indicador {
  descripcion: string;
  preguntas: number;
}

interface Eje {
  id: number;
  descripcion: string;
}

export default function CrearMatrizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oas, setOAs] = useState<OA[]>([]);
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [asignaturas, setAsignaturas] = useState<{id: number, nombre: string}[]>([]);
  const [niveles, setNiveles] = useState<{id: number, nombre: string}[]>([]);
  const [selectedEje, setSelectedEje] = useState<number | null>(null);
  const [selectedAsignatura, setSelectedAsignatura] = useState<number | null>(null);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [selectedOAs, setSelectedOAs] = useState<OA[]>([]);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [oaIndicadores, setOAIndicadores] = useState<{[oaId:number]: Indicador[]}>({});
  const [matrizName, setMatrizName] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [step, setStep] = useState(1);
  const [showOaChangeModal, setShowOaChangeModal] = useState(false);
  const [pendingOAs, setPendingOAs] = useState<OA[]>([]);

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
    fetchOAs();
    fetchAsignaturas();
    fetchNiveles();
  }, []);

  // Filtrar OAs por asignatura y nivel seleccionados usando useMemo
  const oasDeAsignaturaNivel = useMemo(() => {
    if (!selectedAsignatura || !selectedNivel) return [];
    return oas.filter(oa => oa.asignatura_id === selectedAsignatura && oa.nivel_id === selectedNivel);
  }, [oas, selectedAsignatura, selectedNivel]);

  // Extraer ejes únicos de los OAs filtrados usando useMemo
  const ejesDisponibles = useMemo(() => {
    return oasDeAsignaturaNivel.reduce((acc: Eje[], oa) => {
      const ejeExistente = acc.find(e => e.id === oa.eje_id);
      if (!ejeExistente) {
        acc.push({
          id: oa.eje_id,
          descripcion: oa.eje_descripcion
        });
      }
      return acc;
    }, []);
  }, [oasDeAsignaturaNivel]);

  // Filtrar OAs por eje seleccionado usando useMemo
  const oasDelEje = useMemo(() => {
    if (!selectedEje) return [];
    return oasDeAsignaturaNivel.filter(oa => oa.eje_id === selectedEje);
  }, [oasDeAsignaturaNivel, selectedEje]);

  useEffect(() => {
    setEjes(ejesDisponibles);
    
    // Limpiar eje seleccionado si no está disponible en los nuevos ejes
    if (selectedEje && !ejesDisponibles.find(e => e.id === selectedEje)) {
      setSelectedEje(null);
    }
  }, [ejesDisponibles, selectedEje]);

  // Efecto separado para limpiar OAs cuando cambia asignatura o nivel
  useEffect(() => {
    if (selectedOAs.length > 0) {
      setSelectedOAs([]);
      setOAIndicadores({});
    }
  }, [selectedAsignatura, selectedNivel]);

  const fetchOAs = async () => {
    try {
      const response = await fetch('/api/oas');
      if (response.ok) {
        const data = await response.json();
        setOAs(data);
      }
    } catch (error) {
      console.error('Error al obtener OAs:', error);
    }
  };

  const fetchAsignaturas = async () => {
    try {
      const response = await fetch('/api/asignaturas');
      if (response.ok) {
        const data = await response.json();
        setAsignaturas(data.data || data);
      }
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
    }
  };

  const fetchNiveles = async () => {
    try {
      const response = await fetch('/api/niveles');
      if (response.ok) {
        const data = await response.json();
        setNiveles(data);
      }
    } catch (error) {
      console.error('Error al obtener niveles:', error);
    }
  };



  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedAsignatura) {
      newErrors.asignatura = 'Debe seleccionar una asignatura';
    }

    if (!selectedNivel) {
      newErrors.nivel = 'Debe seleccionar un nivel';
    }

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

  const handleCreateMatriz = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
          const matrizData = {
      nombre: matrizName,
      total_preguntas: totalPreguntas,
      asignatura_id: selectedAsignatura,
      nivel_id: selectedNivel,
      oas: selectedOAs.map(oa => ({
        oaId: oa.id,
        indicadores: (oaIndicadores[oa.id] || []).map(ind => ({
          descripcion: ind.descripcion,
          preguntas: ind.preguntas
        }))
      }))
    };

      const response = await fetch('/api/matrices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matrizData),
      });

      if (response.ok) {
        router.push('/matrices');
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.error || 'Error al crear la matriz' });
      }
    } catch (error) {
      console.error('Error al crear matriz:', error);
      setErrors({ submit: 'Error al crear la matriz' });
    } finally {
      setLoading(false);
    }
  };

  const isValid = selectedAsignatura && selectedNivel && selectedEje && selectedOAs.length > 0 && matrizName.trim() && totalPreguntas > 0;

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

  return (
    <>
      {/* Header con gradiente y stats */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-3 text-indigo-200 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Crear Nueva Matriz
            </h1>
            <p className="text-indigo-200 text-lg">
              Define los criterios de evaluación para tu matriz de especificación
            </p>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Total Preguntas</p>
                <p className="text-lg font-bold text-white">{totalPreguntas}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">OAs Seleccionados</p>
                <p className="text-lg font-bold text-white">{selectedOAs.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-indigo-200" />
              <div>
                <p className="text-indigo-200 text-xs">Paso Actual</p>
                <p className="text-lg font-bold text-white">{step} de {steps.length}</p>
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
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <Listbox value={selectedAsignatura} onChange={setSelectedAsignatura}>
                  <div className="relative mt-1">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Asignatura</Listbox.Label>
                    <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <span className="block truncate">
                        {selectedAsignatura ? asignaturas.find(a => a.id === selectedAsignatura)?.nombre : 'Selecciona una asignatura'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {asignaturas.map(asignatura => (
                        <Listbox.Option key={asignatura.id} value={asignatura.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}` }>
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{asignatura.nombre}</span>
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
                <Listbox value={selectedNivel} onChange={setSelectedNivel}>
                  <div className="relative mt-1">
                    <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Nivel</Listbox.Label>
                    <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <span className="block truncate">
                        {selectedNivel ? niveles.find(n => n.id === selectedNivel)?.nombre : 'Selecciona un nivel'}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {niveles.map(nivel => (
                        <Listbox.Option key={nivel.id} value={nivel.id} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'}` }>
                          {({ selected }) => (
                            <>
                              <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{nivel.nombre}</span>
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
              <PrimaryButton
                onClick={() => setStep(2)}
                disabled={!matrizName.trim() || totalPreguntas <= 0 || !selectedAsignatura || !selectedNivel}
              >Siguiente</PrimaryButton>
            </div>
          </div>
        )}

        {/* Sección 2: Selección de OA */}
        {step === 2 && (
          <div className="space-y-6 mb-8">
            {/* Verificar si hay OAs disponibles */}
            {oasDeAsignaturaNivel.length === 0 ? (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-3xl p-8 shadow-lg">
                <div className="text-center">
                  {/* Icono decorativo */}
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  
                  {/* Título principal */}
                  <h3 className="text-2xl font-bold text-amber-800 mb-3">
                    No hay OAs disponibles
                  </h3>
                  
                  {/* Descripción */}
                  <div className="max-w-md mx-auto space-y-3">
                    <p className="text-amber-700 text-base leading-relaxed">
                      No se encontraron Objetivos de Aprendizaje para la combinación de&nbsp;
                      <span className="font-semibold text-amber-800">
                        {asignaturas.find(a => a.id === selectedAsignatura)?.nombre}
                      </span>
                      &nbsp;y&nbsp;
                      <span className="font-semibold text-amber-800">
                        {niveles.find(n => n.id === selectedNivel)?.nombre}
                      </span>.
                    </p>
                    <p className="text-amber-600 text-sm">
                      Esto puede deberse a que aún no se han definido OAs para esta combinación específica.
                    </p>
                  </div>
                  
                  {/* Línea decorativa */}
                  <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full mx-auto my-6"></div>
                  
                  {/* Botón de acción */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => setStep(1)}
                      className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <span className="flex items-center gap-3">
                        <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver al Paso 1
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </button>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="mt-6 p-4 bg-white/50 rounded-2xl border border-amber-100">
                    <p className="text-amber-600 text-xs font-medium">
                      💡 Tip: Prueba con otras asignaturas como "Lenguaje y Comunicación" o "Matemática" 
                      que suelen tener más OAs disponibles.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Listbox value={selectedEje} onChange={setSelectedEje}>
                      <div className="relative mt-1">
                        <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Eje</Listbox.Label>
                        <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <span className="block truncate">
                            {selectedEje ? ejesDisponibles.find(e => e.id === selectedEje)?.descripcion : 'Selecciona un eje'}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Listbox.Options className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {ejesDisponibles.map(eje => (
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
                          <span className="block truncate">
                            {selectedOAs.length === 0 ? 'Selecciona uno o más OA' : `${selectedOAs.length} seleccionados`}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <ChevronsUpDown className="h-5 w-5 text-white" aria-hidden="true" />
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
                    disabled={selectedOAs.length === 0 || oasDeAsignaturaNivel.length === 0}
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
                        <button
                          className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                          onClick={() => setShowOaChangeModal(false)}
                        >Cancelar</button>
                        <button
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-400 text-white font-semibold hover:from-indigo-600 hover:to-purple-500"
                          onClick={() => {
                            setSelectedOAs(pendingOAs);
                            setOAIndicadores({});
                            setShowOaChangeModal(false);
                          }}
                        >Sí, cambiar</button>
                      </div>
                    </div>
                  </div>
                </Dialog>
              </>
            )}
          </div>
        )}

        {/* Sección 3: Indicadores */}
        {step === 3 && (
          <div className="space-y-6 mb-8">
            {selectedOAs.map((oa, index) => (
              <div key={oa.id} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                {/* Header sobrio */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${getGradient(index)}`}>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Indicadores para {oa.oas_id}</h3>
                      {oa.descripcion_oas && (
                        <p className="text-gray-500 text-sm mt-1">{oa.descripcion_oas.substring(0, 60)}...</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {oa.basal && (
                      <span className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">Basal</span>
                    )}
                    <span className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" /> Min: 10
                    </span>
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
                        onChange={e => {
                          setOAIndicadores(prev => ({
                            ...prev,
                            [oa.id]: prev[oa.id].map((ind, i) => i === idx ? { ...ind, descripcion: e.target.value } : ind)
                          }));
                        }}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all duration-200"
                        placeholder="Descripción del indicador"
                      />
                      <input
                        type="number"
                        value={indicador.preguntas}
                        onChange={e => {
                          setOAIndicadores(prev => ({
                            ...prev,
                            [oa.id]: prev[oa.id].map((ind, i) => i === idx ? { ...ind, preguntas: Number(e.target.value) } : ind)
                          }));
                        }}
                        className="w-24 px-4 py-3 border border-gray-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm text-center transition-all duration-200"
                        min={0}
                        placeholder="0"
                      />
                      {/* Botón eliminar indicador */}
                      {(oaIndicadores[oa.id] || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setOAIndicadores(prev => ({
                            ...prev,
                            [oa.id]: prev[oa.id].filter((_, i) => i !== idx)
                          }))}
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
                    onClick={() => setOAIndicadores(prev => ({
                      ...prev,
                      [oa.id]: [...(prev[oa.id] || []), { descripcion: '', preguntas: 0 }]
                    }))}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-300 text-gray-500 shadow hover:bg-gray-100 transition-all duration-200"
                    title="Agregar indicador"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            ))}
            {/* Resumen de preguntas */}
            
            <div className="flex justify-end gap-4 mt-8">
              <SecondaryButton onClick={() => setStep(2)}>Atrás</SecondaryButton>
              <PrimaryButton
                onClick={handleCreateMatriz}
                disabled={!isValid || loading || totalPreguntasIndicadores !== totalPreguntas}
              >
                {loading ? 'Creando...' : 'Continuar'}
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