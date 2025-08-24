'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { MATRIZ_STEPS, validateMatrizForm } from '@/utils/matrices';

import MatrizBasicForm from '@/components/matrices/MatrizBasicForm';
import MatrizHeader from '@/components/matrices/MatrizHeader';
import MatrizStepIndicator from '@/components/matrices/MatrizStepIndicator';
import MatrizOASelector from '@/components/matrices/MatrizOASelector';
import MatrizIndicadoresSection from '@/components/matrices/MatrizIndicadoresSection';

import ImportarMatrizModal from '@/components/matrices/ImportarMatrizModal';

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

  const [asignaturas, setAsignaturas] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [niveles, setNiveles] = useState<{ id: number; nombre: string }[]>([]);

  const [selectedAsignatura, setSelectedAsignatura] = useState<number | null>(
    null
  );
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);

  // Estados para ejes de contenido
  const [selectedEjeContenido, setSelectedEjeContenido] = useState<
    number | null
  >(null);
  const [selectedOAsContenido, setSelectedOAsContenido] = useState<OA[]>([]);

  // Estados para ejes de habilidad
  const [selectedEjeHabilidad, setSelectedEjeHabilidad] = useState<
    number | null
  >(null);
  const [selectedOAsHabilidad, setSelectedOAsHabilidad] = useState<OA[]>([]);

  // Estado combinado para la API (se mantiene para compatibilidad)
  const [selectedOAs, setSelectedOAs] = useState<OA[]>([]);

  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [oaIndicadores, setOAIndicadores] = useState<{
    [oaId: number]: Indicador[];
  }>({});
  const [matrizName, setMatrizName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchOAs(), fetchAsignaturas(), fetchNiveles()]);
    };
    loadData();
  }, []);

  const fetchOAs = async () => {
    try {
      const response = await fetch('/api/oas');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setOAs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al obtener OAs:', error);
      setOAs([]);
    }
  };

  const fetchAsignaturas = async () => {
    try {
      const response = await fetch('/api/asignaturas');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setAsignaturas(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al obtener asignaturas:', error);
      setAsignaturas([]);
    }
  };

  const fetchNiveles = async () => {
    try {
      const response = await fetch('/api/niveles');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setNiveles(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error al obtener niveles:', error);
      setNiveles([]);
    }
  };

  // Filtrar OAs por asignatura y nivel seleccionados usando useMemo
  const oasDeAsignaturaNivel = useMemo(() => {
    if (!selectedAsignatura || !selectedNivel) return [];
    return oas.filter(
      oa =>
        oa.asignatura_id === selectedAsignatura && oa.nivel_id === selectedNivel
    );
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
          descripcion: oa.eje_descripcion,
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
          descripcion: oa.eje_descripcion,
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
    if (
      selectedEjeContenido &&
      !ejesContenido.find(e => e.id === selectedEjeContenido)
    ) {
      setSelectedEjeContenido(null);
      setSelectedOAsContenido([]);
    }
  }, [ejesContenido, selectedEjeContenido]);

  // Limpiar eje de habilidad si no está disponible
  useEffect(() => {
    if (
      selectedEjeHabilidad &&
      !ejesHabilidad.find(e => e.id === selectedEjeHabilidad)
    ) {
      setSelectedEjeHabilidad(null);
      setSelectedOAsHabilidad([]);
    }
  }, [ejesHabilidad, selectedEjeHabilidad]);

  const validateForm = () => {
    const newErrors = validateMatrizForm(
      matrizName,
      selectedAsignatura,
      selectedNivel,
      selectedOAsContenido,
      selectedOAsHabilidad,
      totalPreguntas,
      oaIndicadores,
      totalPreguntasContenido,
      totalPreguntasHabilidad,
      totalPreguntasIndicadores,
      hasBothTypes
    );

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
            preguntas: ind.preguntas,
          })),
        })),
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

  // Calcula el total de preguntas de los indicadores por tipo de eje
  const totalPreguntasIndicadores = Object.values(oaIndicadores)
    .flat()
    .reduce((sum, ind) => sum + (ind.preguntas || 0), 0);

  // Calcular totales separados por tipo de eje
  const totalPreguntasContenido = selectedOAsContenido.reduce((sum, oa) => {
    const indicadores = oaIndicadores[oa.id] || [];
    return (
      sum +
      indicadores.reduce((indSum, ind) => indSum + (ind.preguntas || 0), 0)
    );
  }, 0);

  const totalPreguntasHabilidad = selectedOAsHabilidad.reduce((sum, oa) => {
    const indicadores = oaIndicadores[oa.id] || [];
    return (
      sum +
      indicadores.reduce((indSum, ind) => indSum + (ind.preguntas || 0), 0)
    );
  }, 0);

  // Validar que cada OA tenga al menos un indicador con al menos 1 pregunta
  const allOAsHaveIndicators = [
    ...selectedOAsContenido,
    ...selectedOAsHabilidad,
  ].every(oa => {
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
  const hasBothTypes =
    selectedOAsContenido.length > 0 && selectedOAsHabilidad.length > 0;

  // Validación final:
  // - Si hay ambos tipos: ambos deben cumplir sus criterios Y cada OA debe tener indicadores
  // - Si solo hay un tipo: debe cumplir su criterio Y cada OA debe tener indicadores
  const isStep3Valid = hasBothTypes
    ? allOAsContenidoHaveIndicators &&
      allOAsHabilidadHaveIndicators &&
      allOAsHaveIndicators
    : allOAsHaveIndicators;

  return (
    <>
      <MatrizHeader
        totalPreguntas={totalPreguntas}
        selectedOAsCount={selectedOAs.length}
        currentStep={step}
        totalSteps={MATRIZ_STEPS.length}
        mode="create"
      />

      {/* Form */}
      <div className="max-w-6xl mx-auto space-y-8">
        <MatrizStepIndicator steps={MATRIZ_STEPS} currentStep={step} />

        {/* Sección 1: Datos básicos */}
        {step === 1 && (
          <div className="mb-8">
            <MatrizBasicForm
              matrizName={matrizName}
              onMatrizNameChange={setMatrizName}
              selectedAsignatura={selectedAsignatura}
              onAsignaturaChange={setSelectedAsignatura}
              selectedNivel={selectedNivel}
              onNivelChange={setSelectedNivel}
              totalPreguntas={totalPreguntas}
              onTotalPreguntasChange={setTotalPreguntas}
              asignaturas={asignaturas}
              niveles={niveles}
              errors={errors}
              mode="create"
              onNext={() => setStep(2)}
              canProceed={
                !!(
                  matrizName.trim() &&
                  totalPreguntas > 0 &&
                  selectedAsignatura &&
                  selectedNivel
                )
              }
            />
          </div>
        )}

        {/* Sección 2: Selección de OA */}
        {step === 2 && (
          <div className="mb-8">
            <MatrizOASelector
              oasContenido={oasContenido}
              oasHabilidad={oasHabilidad}
              ejesContenido={ejesContenido}
              ejesHabilidad={ejesHabilidad}
              selectedEjeContenido={selectedEjeContenido}
              onEjeContenidoChange={setSelectedEjeContenido}
              selectedEjeHabilidad={selectedEjeHabilidad}
              onEjeHabilidadChange={setSelectedEjeHabilidad}
              selectedOAsContenido={selectedOAsContenido}
              onOAsContenidoChange={setSelectedOAsContenido}
              selectedOAsHabilidad={selectedOAsHabilidad}
              onOAsHabilidadChange={setSelectedOAsHabilidad}
              oasDelEjeContenido={oasDelEjeContenido}
              oasDelEjeHabilidad={oasDelEjeHabilidad}
              selectedAsignatura={selectedAsignatura}
              selectedNivel={selectedNivel}
              asignaturas={asignaturas}
              niveles={niveles}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
              canProceed={
                // Siempre se requiere: eje de contenido + al menos un OA de contenido
                !!(selectedEjeContenido && selectedOAsContenido.length > 0) &&
                // Solo si existen ejes de habilidad: también se requiere eje de habilidad + al menos un OA de habilidad
                (ejesHabilidad.length === 0 ||
                  (!!selectedEjeHabilidad && selectedOAsHabilidad.length > 0))
              }
              mode="create"
              onImportClick={() => setShowImportModal(true)}
            />
          </div>
        )}

        {/* Sección 3: Indicadores */}
        {step === 3 && (
          <MatrizIndicadoresSection
            selectedOAsContenido={selectedOAsContenido}
            selectedOAsHabilidad={selectedOAsHabilidad}
            oaIndicadores={oaIndicadores}
            onOAIndicadoresChange={setOAIndicadores}
            totalPreguntas={totalPreguntas}
            totalPreguntasContenido={totalPreguntasContenido}
            totalPreguntasHabilidad={totalPreguntasHabilidad}
            allOAsContenidoHaveIndicators={allOAsContenidoHaveIndicators}
            allOAsHabilidadHaveIndicators={allOAsHabilidadHaveIndicators}
            onBack={() => setStep(2)}
            onCreateMatriz={handleCreateMatriz}
            isStep3Valid={isStep3Valid}
            loading={loading}
            errors={errors}
            onClearError={() => setErrors({ ...errors, submit: '' })}
          />
        )}
      </div>

      {/* Modal de importación CSV */}
      <ImportarMatrizModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        asignaturaId={selectedAsignatura}
        nivelId={selectedNivel}
        onMatrizImportada={data => {
          // Procesar OAs con sus indicadores y preguntas
          if (data.oas && data.oas.length > 0) {
            // Separar OAs únicos por tipo (usar tipo_eje que es el campo real de la BD)
            const oasContenido = data.oas
              .filter(oa => oa.tipo_eje === 'Contenido')
              .filter(
                (oa, index, self) =>
                  index === self.findIndex(o => o.id === oa.id)
              )
              .map(
                (oa): OA => ({
                  id: oa.id,
                  oas_id: `OA ${oa.id}`,
                  descripcion_oas: oa.indicador,
                  eje_id: 1,
                  eje_descripcion: 'Eje importado',
                  nivel_id: selectedNivel!,
                  asignatura_id: selectedAsignatura!,
                  nivel: { nombre: 'Nivel importado' },
                  asignatura: { nombre: 'Asignatura importada' },
                  tipo_eje: oa.tipo_eje as
                    | 'Contenido'
                    | 'Habilidad'
                    | 'Actitud',
                })
              );
            const oasHabilidad = data.oas
              .filter(oa => oa.tipo_eje === 'Habilidad')
              .filter(
                (oa, index, self) =>
                  index === self.findIndex(o => o.id === oa.id)
              )
              .map(
                (oa): OA => ({
                  id: oa.id,
                  oas_id: `OA ${oa.id}`,
                  descripcion_oas: oa.indicador,
                  eje_id: 1,
                  eje_descripcion: 'Eje importado',
                  nivel_id: selectedNivel!,
                  asignatura_id: selectedAsignatura!,
                  nivel: { nombre: 'Nivel importado' },
                  asignatura: { nombre: 'Asignatura importada' },
                  tipo_eje: oa.tipo_eje as
                    | 'Contenido'
                    | 'Habilidad'
                    | 'Actitud',
                })
              );

            setSelectedOAsContenido(oasContenido);
            setSelectedOAsHabilidad(oasHabilidad);

            // Procesar indicadores por OA
            const indicadoresPorOA: { [key: number]: Indicador[] } = {};

            data.oas.forEach(oa => {
              // Crear objeto Indicador con la estructura correcta
              const indicador = {
                descripcion: oa.indicador,
                preguntas: oa.preguntas_por_indicador,
              };

              if (!indicadoresPorOA[oa.id]) {
                indicadoresPorOA[oa.id] = [];
              }
              indicadoresPorOA[oa.id].push(indicador);
            });

            setOAIndicadores(prev => ({ ...prev, ...indicadoresPorOA }));
          }

          // Avanzar al paso 3 después de importar exitosamente
          setStep(3);
        }}
      />
    </>
  );
}
