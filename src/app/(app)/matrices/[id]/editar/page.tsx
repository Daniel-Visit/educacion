'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MATRIZ_STEPS } from '@/utils/matrices';
import LoadingState from '@/components/ui/LoadingState';
import MatrizHeader from '@/components/matrices/MatrizHeader';
import MatrizBasicForm from '@/components/matrices/MatrizBasicForm';
import MatrizOASelector from '@/components/matrices/MatrizOASelector';
import MatrizStepIndicator from '@/components/matrices/MatrizStepIndicator';
import MatrizIndicadoresSection from '@/components/matrices/MatrizIndicadoresSection';

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
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [oas, setOAs] = useState<OA[]>([]);

  const [asignaturas, setAsignaturas] = useState<
    { id: number; nombre: string }[]
  >([]);
  const [niveles, setNiveles] = useState<{ id: number; nombre: string }[]>([]);

  const [selectedOAs, setSelectedOAs] = useState<OA[]>([]);
  const [selectedEjeContenido, setSelectedEjeContenido] = useState<
    number | null
  >(null);
  const [selectedOAsContenido, setSelectedOAsContenido] = useState<OA[]>([]);
  const [selectedEjeHabilidad, setSelectedEjeHabilidad] = useState<
    number | null
  >(null);
  const [selectedOAsHabilidad, setSelectedOAsHabilidad] = useState<OA[]>([]);
  const [selectedAsignatura, setSelectedAsignatura] = useState<number | null>(
    null
  );
  const [selectedNivel, setSelectedNivel] = useState<number | null>(null);
  const [totalPreguntas, setTotalPreguntas] = useState(0);
  const [oaIndicadores, setOAIndicadores] = useState<{
    [oaId: number]: Indicador[];
  }>({});
  const [matrizName, setMatrizName] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState(1);

  const [matrizOriginal, setMatrizOriginal] =
    useState<MatrizEspecificacion | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchMatrizAndOAs(Number(params.id));
    }
    fetchAsignaturas();
    fetchNiveles();
  }, [params.id]);

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

  const fetchMatrizAndOAs = async (matrizId: number) => {
    try {
      // Cargar OAs disponibles
      const oasResponse = await fetch('/api/oas');
      if (oasResponse.ok) {
        const oasData = await oasResponse.json();
        setOAs(oasData);
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
        const oasSeleccionados = matrizData.oas.map(
          (matrizOA: MatrizOA) => matrizOA.oa
        );
        setSelectedOAs(oasSeleccionados);

        // Establecer asignatura y nivel de la matriz existente
        if (oasSeleccionados.length > 0) {
          setSelectedAsignatura(oasSeleccionados[0].asignatura_id);
          setSelectedNivel(oasSeleccionados[0].nivel_id);
        }

        // Separar OAs por tipo
        const oasContenido = oasSeleccionados.filter(
          (oa: OA) => oa.tipo_eje === 'Contenido'
        );
        const oasHabilidad = oasSeleccionados.filter(
          (oa: OA) => oa.tipo_eje === 'Habilidad'
        );

        setSelectedOAsContenido(oasContenido);
        setSelectedOAsHabilidad(oasHabilidad);

        // Establecer ejes seleccionados
        if (oasContenido.length > 0) {
          setSelectedEjeContenido(oasContenido[0].eje_id);
        }
        if (oasHabilidad.length > 0) {
          setSelectedEjeHabilidad(oasHabilidad[0].eje_id);
        }

        // Pre-cargar indicadores
        const indicadoresPreCargados: { [oaId: number]: Indicador[] } = {};
        matrizData.oas.forEach((matrizOA: MatrizOA) => {
          indicadoresPreCargados[matrizOA.oaId] = matrizOA.indicadores;
        });
        setOAIndicadores(indicadoresPreCargados);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setErrors({ submit: 'Error al cargar los datos de la matriz' });
    } finally {
      setIsLoading(false);
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
  const oasContenido = oasDeAsignaturaNivel.filter(
    (oa: OA) => oa.tipo_eje === 'Contenido'
  );
  const oasHabilidad = oasDeAsignaturaNivel.filter(
    (oa: OA) => oa.tipo_eje === 'Habilidad'
  );

  // Extraer ejes únicos de contenido
  const ejesContenido = oasContenido.reduce((acc: Eje[], oa) => {
    const ejeExistente = acc.find(e => e.id === oa.eje_id);
    if (!ejeExistente) {
      acc.push({
        id: oa.eje_id,
        descripcion: oa.eje_descripcion,
      });
    }
    return acc;
  }, []);

  // Extraer ejes únicos de habilidad
  const ejesHabilidad = oasHabilidad.reduce((acc: Eje[], oa) => {
    const ejeExistente = acc.find(e => e.id === oa.eje_id);
    if (!ejeExistente) {
      acc.push({
        id: oa.eje_id,
        descripcion: oa.eje_descripcion,
      });
    }
    return acc;
  }, []);

  // Filtrar OAs por eje de contenido seleccionado
  const oasDelEjeContenido = selectedEjeContenido
    ? oasContenido.filter(oa => oa.eje_id === selectedEjeContenido)
    : [];

  // Filtrar OAs por eje de habilidad seleccionado
  const oasDelEjeHabilidad = selectedEjeHabilidad
    ? oasHabilidad.filter(oa => oa.eje_id === selectedEjeHabilidad)
    : [];

  // Combinar OAs seleccionados para la API
  useEffect(() => {
    const oasCombinados = [...selectedOAsContenido, ...selectedOAsHabilidad];
    setSelectedOAs(oasCombinados);
  }, [selectedOAsContenido, selectedOAsHabilidad]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (
      selectedOAsContenido.length === 0 &&
      selectedOAsHabilidad.length === 0
    ) {
      newErrors.oa = 'Debe seleccionar al menos un OA';
    }

    if (!matrizName.trim()) {
      newErrors.nombre = 'El nombre de la matriz es requerido';
    }

    if (totalPreguntas === 0) {
      newErrors.indicadores = 'El total de preguntas debe ser mayor a 0';
    }

    // Validar que cada OA tenga al menos un indicador con al menos 1 pregunta
    const allOAsHaveIndicators = [
      ...selectedOAsContenido,
      ...selectedOAsHabilidad,
    ].every(oa => {
      const indicadores = oaIndicadores[oa.id] || [];
      return (
        indicadores.length > 0 && indicadores.some(ind => ind.preguntas > 0)
      );
    });

    if (!allOAsHaveIndicators) {
      // Encontrar OAs específicos que no tienen indicadores
      const oasWithoutIndicators = [
        ...selectedOAsContenido,
        ...selectedOAsHabilidad,
      ].filter(oa => {
        const indicadores = oaIndicadores[oa.id] || [];
        return (
          indicadores.length === 0 ||
          !indicadores.some(ind => ind.preguntas > 0)
        );
      });

      if (oasWithoutIndicators.length > 0) {
        const oaNames = oasWithoutIndicators.map(oa => oa.oas_id).join(', ');
        newErrors.indicadores = `Los siguientes OAs deben tener al menos un indicador con al menos 1 pregunta: ${oaNames}`;
      } else {
        newErrors.indicadores =
          'Cada OA debe tener al menos un indicador con al menos 1 pregunta';
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
            preguntas: ind.preguntas,
          })),
        })),
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
        setErrors({
          submit: errorData.error || 'Error al actualizar la matriz',
        });
      }
    } catch (error) {
      console.error('Error al actualizar matriz:', error);
      setErrors({ submit: 'Error al actualizar la matriz' });
    } finally {
      setSaving(false);
    }
  };

  // Calcula el total de preguntas de los indicadores
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

  if (isLoading) {
    return (
      <div className="container mx-auto">
        <LoadingState message="Cargando matriz..." />
      </div>
    );
  }

  return (
    <>
      <MatrizHeader
        totalPreguntas={totalPreguntas}
        selectedOAsCount={selectedOAs.length}
        currentStep={step}
        totalSteps={MATRIZ_STEPS.length}
        mode="edit"
        matrizOriginal={matrizOriginal || undefined}
      />

      {/* Form */}
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Stepper */}
        <MatrizStepIndicator steps={MATRIZ_STEPS} currentStep={step} />

        {/* Sección 1: Datos básicos */}
        {step === 1 && (
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
            mode="edit"
            onNext={() => setStep(2)}
            onCancel={() => router.back()}
            canProceed={!!(matrizName.trim() && totalPreguntas > 0)}
          />
        )}

        {/* Sección 2: Selección de OA */}
        {step === 2 && (
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
              // En modo edición: solo validar que haya al menos un OA seleccionado
              selectedOAsContenido.length > 0 || selectedOAsHabilidad.length > 0
            }
            mode="edit"
          />
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
            onCreateMatriz={handleUpdateMatriz}
            isStep3Valid={isStep3Valid}
            loading={saving}
            errors={errors}
            onClearError={() => setErrors({ ...errors, submit: '' })}
          />
        )}
      </div>
    </>
  );
}
