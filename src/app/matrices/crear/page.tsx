'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronsUpDown, Check, X, Plus, Clock, BarChart3, Target, BookOpen, Zap } from 'lucide-react';
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
  tipo_eje: 'Contenido' | 'Habilidad' | 'Actitud';
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
  const [selectedAsignatura, setSelectedAsignatura] = useState<number | null>(null);
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  
  // Estados para ejes de contenido
  const [selectedEjeContenido, setSelectedEjeContenido] = useState<number | null>(null);
  const [selectedOAsContenido, setSelectedOAsContenido] = useState<OA[]>([]);
  
  // Estados para ejes de habilidad
  const [selectedEjeHabilidad, setSelectedEjeHabilidad] = useState<number | null>(null);
  const [selectedOAsHabilidad, setSelectedOAsHabilidad] = useState<OA[]>([]);
  
  // Estado combinado para la API (se mantiene para compatibilidad)
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

  // Separar OAs por tipo_eje
  const oasContenido = useMemo(() => {
    return oasDeAsignaturaNivel.filter(oa => oa.tipo_eje === 'Contenido');
  }, [oasDeAsignaturaNivel]);

  const oasHabilidad = useMemo(() => {
    return oasDeAsignaturaNivel.filter(oa => oa.tipo_eje === 'Habilidad');
  }, [oasDeAsignaturaNivel]);

  // Extraer ejes únicos de contenido
  const ejesContenido = useMemo(() => {
    return oasContenido.reduce((acc: Eje[], oa) => {
      const ejeExistente = acc.find(e => e.id === oa.eje_id);
      if (!ejeExistente) {
        acc.push({
          id: oa.eje_id,
          descripcion: oa.eje_descripcion
        });
      }
      return acc;
    }, []);
  }, [oasContenido]);

  // Extraer ejes únicos de habilidad
  const ejesHabilidad = useMemo(() => {
    return oasHabilidad.reduce((acc: Eje[], oa) => {
      const ejeExistente = acc.find(e => e.id === oa.eje_id);
      if (!ejeExistente) {
        acc.push({
          id: oa.eje_id,
          descripcion: oa.eje_descripcion
        });
      }
      return acc;
    }, []);
  }, [oasHabilidad]);

  // Filtrar OAs por eje de contenido seleccionado
  const oasDelEjeContenido = useMemo(() => {
    if (!selectedEjeContenido) return [];
    return oasContenido.filter(oa => oa.eje_id === selectedEjeContenido);
  }, [oasContenido, selectedEjeContenido]);

  // Filtrar OAs por eje de habilidad seleccionado
  const oasDelEjeHabilidad = useMemo(() => {
    if (!selectedEjeHabilidad) return [];
    return oasHabilidad.filter(oa => oa.eje_id === selectedEjeHabilidad);
  }, [oasHabilidad, selectedEjeHabilidad]);

  // Combinar OAs seleccionados para la API
  useEffect(() => {
    const oasCombinados = [...selectedOAsContenido, ...selectedOAsHabilidad];
    setSelectedOAs(oasCombinados);
  }, [selectedOAsContenido, selectedOAsHabilidad]);

  // Limpiar selecciones cuando cambia asignatura o nivel
  useEffect(() => {
    setSelectedEjeContenido(null);
    setSelectedEjeHabilidad(null);
    setSelectedOAsContenido([]);
    setSelectedOAsHabilidad([]);
    setOAIndicadores({});
  }, [selectedAsignatura, selectedNivel]);

  // Limpiar eje de contenido si no está disponible
  useEffect(() => {
    if (selectedEjeContenido && !ejesContenido.find(e => e.id === selectedEjeContenido)) {
      setSelectedEjeContenido(null);
      setSelectedOAsContenido([]);
    }
  }, [ejesContenido, selectedEjeContenido]);

  // Limpiar eje de habilidad si no está disponible
  useEffect(() => {
    if (selectedEjeHabilidad && !ejesHabilidad.find(e => e.id === selectedEjeHabilidad)) {
      setSelectedEjeHabilidad(null);
      setSelectedOAsHabilidad([]);
    }
  }, [ejesHabilidad, selectedEjeHabilidad]);

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
    const newErrors: any = {};

    if (!selectedAsignatura) {
      newErrors.asignatura = 'Debe seleccionar una asignatura';
    }

    if (!selectedNivel) {
      newErrors.nivel = 'Debe seleccionar un nivel';
    }

    if (selectedOAsContenido.length === 0 && selectedOAsHabilidad.length === 0) {
      newErrors.oa = 'Debe seleccionar al menos un OA';
    }

    if (!matrizName.trim()) {
      newErrors.nombre = 'El nombre de la matriz es requerido';
    }

    if (totalPreguntas === 0) {
      newErrors.indicadores = 'El total de preguntas debe ser mayor a 0';
    }

    // Validar que cada OA tenga al menos un indicador con al menos 1 pregunta
    const allOAsHaveIndicators = [...selectedOAsContenido, ...selectedOAsHabilidad].every(oa => {
      const indicadores = oaIndicadores[oa.id] || [];
      return indicadores.length > 0 && indicadores.some(ind => ind.preguntas > 0);
    });

    if (!allOAsHaveIndicators) {
      // Encontrar OAs específicos que no tienen indicadores
      const oasWithoutIndicators = [...selectedOAsContenido, ...selectedOAsHabilidad].filter(oa => {
        const indicadores = oaIndicadores[oa.id] || [];
        return indicadores.length === 0 || !indicadores.some(ind => ind.preguntas > 0);
      });
      
      if (oasWithoutIndicators.length > 0) {
        const oaNames = oasWithoutIndicators.map(oa => oa.oas_id).join(', ');
        newErrors.indicadores = `Los siguientes OAs deben tener al menos un indicador con al menos 1 pregunta: ${oaNames}`;
      } else {
        newErrors.indicadores = 'Cada OA debe tener al menos un indicador con al menos 1 pregunta';
      }
    }

    // Validar que cada tipo de eje sume exactamente el total de preguntas (solo si hay ambos tipos)
    if (hasBothTypes) {
      if (totalPreguntasContenido !== totalPreguntas) {
        newErrors.contenido = `Las preguntas de contenido deben sumar exactamente ${totalPreguntas} (actual: ${totalPreguntasContenido})`;
      }

      if (totalPreguntasHabilidad !== totalPreguntas) {
        newErrors.habilidad = `Las preguntas de habilidad deben sumar exactamente ${totalPreguntas} (actual: ${totalPreguntasHabilidad})`;
      }
    } else {
      // Si solo hay un tipo, validar el total general
      if (totalPreguntasIndicadores !== totalPreguntas) {
        newErrors.indicadores = `El total de preguntas debe ser exactamente ${totalPreguntas} (actual: ${totalPreguntasIndicadores})`;
      }
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

  const isValid = selectedAsignatura && selectedNivel && (selectedEjeContenido || selectedEjeHabilidad) && (selectedOAsContenido.length > 0 || selectedOAsHabilidad.length > 0) && matrizName.trim() && totalPreguntas > 0;

  // Calcula el total de preguntas de los indicadores por tipo de eje
  const totalPreguntasIndicadores = Object.values(oaIndicadores).flat().reduce((sum, ind) => sum + (ind.preguntas || 0), 0);
  
  // Calcular totales separados por tipo de eje
  const totalPreguntasContenido = selectedOAsContenido.reduce((sum, oa) => {
    const indicadores = oaIndicadores[oa.id] || [];
    return sum + indicadores.reduce((indSum, ind) => indSum + (ind.preguntas || 0), 0);
  }, 0);
  
  const totalPreguntasHabilidad = selectedOAsHabilidad.reduce((sum, oa) => {
    const indicadores = oaIndicadores[oa.id] || [];
    return sum + indicadores.reduce((indSum, ind) => indSum + (ind.preguntas || 0), 0);
  }, 0);
  
  // Validar que cada OA tenga al menos un indicador con al menos 1 pregunta
  const allOAsHaveIndicators = [...selectedOAsContenido, ...selectedOAsHabilidad].every(oa => {
    const indicadores = oaIndicadores[oa.id] || [];
    return indicadores.length > 0 && indicadores.some(ind => ind.preguntas > 0);
  });

  // Validar OAs de contenido específicamente
  const allOAsContenidoHaveIndicators = selectedOAsContenido.every(oa => {
    const indicadores = oaIndicadores[oa.id] || [];
    return indicadores.length > 0 && indicadores.some(ind => ind.preguntas > 0);
  });

  // Validar OAs de habilidad específicamente
  const allOAsHabilidadHaveIndicators = selectedOAsHabilidad.every(oa => {
    const indicadores = oaIndicadores[oa.id] || [];
    return indicadores.length > 0 && indicadores.some(ind => ind.preguntas > 0);
  });
  
  // Determinar si hay ambos tipos de eje
  const hasBothTypes = selectedOAsContenido.length > 0 && selectedOAsHabilidad.length > 0;
  
  // Validación final: 
  // - Si hay ambos tipos: ambos deben sumar el total Y cada OA debe tener indicadores
  // - Si solo hay un tipo: el total debe ser correcto Y cada OA debe tener indicadores
  const isStep3Valid = hasBothTypes 
    ? (totalPreguntasContenido === totalPreguntas && totalPreguntasHabilidad === totalPreguntas && allOAsHaveIndicators)
    : (totalPreguntasIndicadores === totalPreguntas && allOAsHaveIndicators);
  
  // Para mostrar el total correcto en el contador
  const totalPreguntasToShow = hasBothTypes ? totalPreguntasContenido : totalPreguntasIndicadores;

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
                    <div className="relative">
                      <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
            {oasContenido.length === 0 && oasHabilidad.length === 0 ? (
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
                      No se encontraron Objetivos de Aprendizaje (contenido o habilidad) para la combinación de&nbsp;
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
                <div className="space-y-4">
                  {/* Fila 1: Eje de Contenido + OAs de Contenido */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <Listbox value={selectedEjeContenido} onChange={setSelectedEjeContenido}>
                        <div className="relative mt-1">
                          <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Eje de Contenido</Listbox.Label>
                          <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <span className="block truncate">
                              {selectedEjeContenido ? ejesContenido.find(e => e.id === selectedEjeContenido)?.descripcion : 'Selecciona un eje de contenido'}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <ChevronsUpDown className="h-5 h-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <div className="relative">
                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {ejesContenido.map(eje => (
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
                        </div>
                      </Listbox>
                    </div>
                    
                    <div className="flex-1">
                      <Listbox value={selectedOAsContenido} onChange={setSelectedOAsContenido} multiple>
                        <div className="relative mt-1">
                          <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">OAs de Contenido</Listbox.Label>
                          <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <span className="block truncate">
                              {selectedOAsContenido.length === 0 ? 'Selecciona OAs de contenido' : `${selectedOAsContenido.length} OAs de contenido seleccionados`}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          {selectedOAsContenido.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedOAsContenido.map(oa => (
                                <span key={oa.id} className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                  {oa.oas_id}
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOAsContenido(selectedOAsContenido.filter(o => o.id !== oa.id))}
                                    className="ml-1 text-blue-400 hover:text-blue-700 focus:outline-none"
                                    aria-label={`Eliminar ${oa.oas_id}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="relative">
                            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              {oasDelEjeContenido.map(oa => (
                                <Listbox.Option key={oa.id} value={oa} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'}` }>
                                  {({ selected }) => (
                                    <>
                                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{oa.oas_id} - {oa.descripcion_oas.substring(0, 50)}...</span>
                                      {selected ? (
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                          <Check className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                      ) : null}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          </div>
                        </div>
                      </Listbox>
                    </div>
                  </div>

                  {/* Fila 2: Eje de Habilidad + OAs de Habilidad (solo si existen) */}
                  {ejesHabilidad.length > 0 && (
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Listbox value={selectedEjeHabilidad} onChange={setSelectedEjeHabilidad}>
                          <div className="relative mt-1">
                            <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">Eje de Habilidad</Listbox.Label>
                            <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              <span className="block truncate">
                                {selectedEjeHabilidad ? ejesHabilidad.find(e => e.id === selectedEjeHabilidad)?.descripcion : 'Selecciona un eje de habilidad'}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </Listbox.Button>
                            <div className="relative">
                              <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {ejesHabilidad.map(eje => (
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
                          </div>
                        </Listbox>
                      </div>
                      
                      <div className="flex-1">
                        <Listbox value={selectedOAsHabilidad} onChange={setSelectedOAsHabilidad} multiple>
                          <div className="relative mt-1">
                            <Listbox.Label className="block text-sm font-medium text-gray-700 mb-1">OAs de Habilidad</Listbox.Label>
                            <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500">
                              <span className="block truncate">
                                {selectedOAsHabilidad.length === 0 ? 'Selecciona OAs de habilidad' : `${selectedOAsHabilidad.length} OAs de habilidad seleccionados`}
                              </span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </Listbox.Button>
                            {selectedOAsHabilidad.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {selectedOAsHabilidad.map(oa => (
                                  <span key={oa.id} className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                                    {oa.oas_id}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOAsHabilidad(selectedOAsHabilidad.filter(o => o.id !== oa.id))}
                                      className="ml-1 text-green-400 hover:text-green-700 focus:outline-none"
                                      aria-label={`Eliminar ${oa.oas_id}`}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="relative">
                              <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                {oasDelEjeHabilidad.map(oa => (
                                  <Listbox.Option key={oa.id} value={oa} className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-green-100 text-green-900' : 'text-gray-900'}` }>
                                    {({ selected }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{oa.oas_id} - {oa.descripcion_oas.substring(0, 50)}...</span>
                                        {selected ? (
                                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600">
                                            <Check className="h-5 w-5" aria-hidden="true" />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </div>
                          </div>
                        </Listbox>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <SecondaryButton onClick={() => setStep(1)}>Atrás</SecondaryButton>
                  <PrimaryButton
                    onClick={() => setStep(3)}
                    disabled={selectedOAsContenido.length === 0 && selectedOAsHabilidad.length === 0}
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
                            // Separar OAs por tipo
                            const oasContenido = pendingOAs.filter(oa => oa.tipo_eje === 'Contenido');
                            const oasHabilidad = pendingOAs.filter(oa => oa.tipo_eje === 'Habilidad');
                            
                            setSelectedOAsContenido(oasContenido);
                            setSelectedOAsHabilidad(oasHabilidad);
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
                        <h2 className="text-2xl font-bold">Indicadores de Contenido</h2>
                        <p className="text-blue-100">Define los indicadores para los OAs de contenido</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${(totalPreguntasContenido === totalPreguntas && allOAsContenidoHaveIndicators) ? 'text-emerald-200' : 'text-gray-200'}`}>
                        {totalPreguntasContenido} / {totalPreguntas}
                      </div>
                      <div className="text-sm text-blue-100">
                        {(totalPreguntasContenido === totalPreguntas && allOAsContenidoHaveIndicators) ? '✓ Válido' : '✗ Incompleto'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OAs de Contenido */}
                {selectedOAsContenido.map((oa, index) => (
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
                        <h2 className="text-2xl font-bold">Indicadores de Habilidad</h2>
                        <p className="text-green-100">Define los indicadores para los OAs de habilidad</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${(totalPreguntasHabilidad === totalPreguntas && allOAsHabilidadHaveIndicators) ? 'text-emerald-200' : 'text-gray-200'}`}>
                        {totalPreguntasHabilidad} / {totalPreguntas}
                      </div>
                      <div className="text-sm text-green-100">
                        {(totalPreguntasHabilidad === totalPreguntas && allOAsHabilidadHaveIndicators) ? '✓ Válido' : '✗ Incompleto'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* OAs de Habilidad */}
                {selectedOAsHabilidad.map((oa, index) => (
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
              </div>
            )}
          </div>
        )}

        {/* Resumen de preguntas */}
        {step === 3 && (
          <>
            <div className="flex justify-end gap-4 mt-8">
              <SecondaryButton onClick={() => setStep(2)}>Atrás</SecondaryButton>
              <PrimaryButton
                onClick={handleCreateMatriz}
                disabled={!isStep3Valid || loading}
              >
                {loading ? 'Creando...' : 'Continuar'}
              </PrimaryButton>
            </div>
            <div className="flex justify-end items-center mb-2">
              <span className={
                `text-base font-semibold ${
                  isStep3Valid
                    ? 'text-green-500'
                    : 'text-gray-500'
                }`
              }>
                Total preguntas: {totalPreguntasToShow} / {totalPreguntas}
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
          </>
        )}
      </div>
    </>
  );
}