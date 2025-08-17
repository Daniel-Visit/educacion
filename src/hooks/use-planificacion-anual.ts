import { useState, useEffect, useMemo, useRef } from 'react';
import { CalendarEvent, EventColor } from '@/components/event-calendar';
import { OA, Eje, OAClases } from '@/components/planificacion-anual/types';
import { addDays, getDay } from 'date-fns';

const modulosFijos: Modulo[] = [
  { dia: 'Martes', horaInicio: '09:00', horaFin: '10:00', duracion: 60 },
  { dia: 'Martes', horaInicio: '12:00', horaFin: '13:00', duracion: 60 },
  { dia: 'Jueves', horaInicio: '09:00', horaFin: '10:00', duracion: 60 },
  { dia: 'Jueves', horaInicio: '12:00', horaFin: '13:00', duracion: 60 },
];

// Colores disponibles para los ejes
const ejeColors = ['sky', 'amber', 'violet', 'rose', 'emerald', 'orange'];

// Función para obtener el color de un eje
const getEjeColor = (ejeId: number) => {
  return ejeColors[ejeId % ejeColors.length];
};

// Utilidad para obtener la fecha real del módulo (martes/jueves) a partir del índice
function getModuloDate(baseDate: Date, moduloIdx: number, modulos: Modulo[]) {
  // Martes = 2, Jueves = 4 (date-fns: 0=domingo)
  const modulo = modulos[moduloIdx % modulos.length];
  const semana = Math.floor(moduloIdx / modulos.length);
  // Día de la semana destino
  const diaSemana = modulo.dia === 'Martes' ? 2 : 4;
  // Buscar el primer martes o jueves igual o posterior a baseDate
  let fecha = new Date(baseDate);
  const baseDay = getDay(fecha); // 0=domingo
  let add = diaSemana - baseDay;
  if (add < 0) add += 7;
  fecha = addDays(fecha, add + semana * 7);
  // Setear hora
  const [h, m] = modulo.horaInicio.split(':').map(Number);
  fecha.setHours(h, m, 0, 0);
  return fecha;
}

// Interfaces para reemplazar tipos 'any'
interface HorarioSeleccionado {
  asignatura?: { id: number };
  nivel?: { id: number };
  modulos?: Array<{
    dia: string;
    horaInicio: string;
    horaFin?: string;
    duracion?: number;
  }>;
  fechaPrimeraClase?: string;
}

interface PlanificacionActual {
  id?: string;
  nombre?: string;
  asignaciones?: Array<{
    oa: OA;
    cantidadClases: number;
  }>;
  horario?: {
    id?: number;
    asignaturaId?: number;
    nivelId?: number;
    modulos?: Array<{ dia: string; horaInicio: string; duracion?: number }>;
    fechaPrimeraClase?: string;
  };
}

// Tipo unificado para módulos que soporte tanto horaFin como duracion
type Modulo = {
  dia: string;
  horaInicio: string;
  horaFin?: string;
  duracion?: number;
};

export function usePlanificacionAnual(
  horarioSeleccionado?: HorarioSeleccionado,
  planificacionId?: string
) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [oaClases, setOaClases] = useState<OAClases>({});
  const [loadingOAs, setLoadingOAs] = useState(false);
  const [showOnlyAssignable, setShowOnlyAssignable] = useState(false);
  const [selectedEjeId, setSelectedEjeId] = useState<string>('Todos');
  const [skippedOAs, setSkippedOAs] = useState<Set<number>>(new Set());
  const [planificacionActual, setPlanificacionActual] =
    useState<PlanificacionActual | null>(null);
  const [loadingPlanificacion, setLoadingPlanificacion] = useState(false);
  const [planificacionCargada, setPlanificacionCargada] = useState(false);

  // Usar useRef para preservar las asignaciones durante la carga de ejes
  const asignacionesRef = useRef<OAClases>({});

  // Mantener sincronizado el ref con oaClases
  useEffect(() => {
    asignacionesRef.current = oaClases;
  }, [oaClases]);

  // Cargar ejes y OAs filtrados por asignatura y nivel del horario
  useEffect(() => {
    if (!planificacionId && horarioSeleccionado) {
      const asignaturaId = horarioSeleccionado.asignatura?.id;
      const nivelId = horarioSeleccionado.nivel?.id;

      if (asignaturaId && nivelId) {
        setLoadingOAs(true);
        // Cargar solo los ejes de la asignatura y nivel seleccionados
        fetch(`/api/ejes?asignaturaId=${asignaturaId}&nivelId=${nivelId}`)
          .then(res => res.json())
          .then(data => {
            setEjes(data);
            // Solo inicializar oaClases si no hay una planificación cargada
            if (!planificacionCargada) {
              // No inicializar con 0s, dejar vacío para que el filtro funcione correctamente
              setOaClases({});
            }
          })
          .finally(() => setLoadingOAs(false));
      }
    }
  }, [planificacionId, horarioSeleccionado, planificacionCargada]);

  // Cargar planificación existente si se proporciona un ID
  useEffect(() => {
    if (planificacionId) {
      setLoadingPlanificacion(true);
      fetch(`/api/planificaciones/${planificacionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Error al cargar planificación:', data.error);
            return;
          }

          setPlanificacionActual(data);

          // Cargar asignaciones de OAs
          const asignaciones: OAClases = {};
          data.asignaciones?.forEach(
            (asignacion: { oaId: string; cantidadClases: number }) => {
              asignaciones[asignacion.oaId] = asignacion.cantidadClases;
            }
          );

          setOaClases(asignaciones);
          asignacionesRef.current = asignaciones; // Guardar en ref
          setPlanificacionCargada(true);
        })
        .catch(error => {
          console.error('Error al cargar planificación:', error);
        })
        .finally(() => setLoadingPlanificacion(false));
    }
  }, [planificacionId, planificacionCargada]);

  // Cargar ejes filtrados después de cargar la planificación
  useEffect(() => {
    if (planificacionActual && planificacionActual.horario) {
      // Usar la asignatura del horario, no de las asignaciones
      const asignaturaId = planificacionActual.horario.asignaturaId;
      const nivelId = planificacionActual.horario.nivelId;

      if (asignaturaId && nivelId) {
        setLoadingOAs(true);
        fetch(`/api/ejes?asignaturaId=${asignaturaId}&nivelId=${nivelId}`)
          .then(res => res.json())
          .then(data => {
            console.log('DEBUG: Ejes cargados:', data.length, 'ejes');

            // Crear un mapa de oas_id a ID para mapear las asignaciones
            const oasIdMap = new Map();
            data.forEach((eje: Eje) => {
              eje.oas.forEach((oa: OA) => {
                oasIdMap.set(oa.oas_id, oa.id);
              });
            });

            // Mapear las asignaciones existentes usando oas_id
            const asignacionesMapeadas: OAClases = {};

            // Primero, obtener los OAs de las asignaciones originales para obtener sus oas_id
            if (planificacionActual && planificacionActual.asignaciones) {
              planificacionActual.asignaciones.forEach(
                (asignacion: { oa: OA; cantidadClases: number }) => {
                  const oaOriginal = asignacion.oa;
                  if (oaOriginal && oasIdMap.has(oaOriginal.oas_id)) {
                    asignacionesMapeadas[oaOriginal.oas_id] =
                      asignacion.cantidadClases;
                  }
                }
              );
            }

            setEjes(data);

            // Usar las asignaciones mapeadas
            if (Object.keys(asignacionesMapeadas).length > 0) {
              setOaClases(asignacionesMapeadas);
              asignacionesRef.current = asignacionesMapeadas;
            }
          })
          .catch(error => {
            console.error('Error al cargar ejes filtrados:', error);
          })
          .finally(() => setLoadingOAs(false));
      }
    }
  }, [planificacionActual]);

  // Generar eventos del calendario cuando planificación y ejes estén disponibles
  useEffect(() => {
    if (planificacionActual && ejes.length > 0) {
      const eventos: CalendarEvent[] = [];
      let eventoIndex = 0;

      planificacionActual.asignaciones?.forEach(
        (asignacion: { oa: OA; cantidadClases: number }) => {
          const oa = asignacion.oa;
          const cantidadClases = asignacion.cantidadClases;

          if (oa) {
            for (let i = 0; i < cantidadClases; i++) {
              const eje = ejes.find((e: Eje) =>
                e.oas.some((o: OA) => o.id === oa.id)
              );
              const ejeColor = (
                eje ? getEjeColor(eje.ejeId) : 'sky'
              ) as EventColor;

              const modulos =
                planificacionActual.horario?.modulos &&
                planificacionActual.horario.modulos.length > 0
                  ? planificacionActual.horario.modulos
                  : modulosFijos;

              const fechaBase = planificacionActual.horario?.fechaPrimeraClase
                ? new Date(planificacionActual.horario.fechaPrimeraClase)
                : new Date(2025, 6, 1);

              const start = getModuloDate(fechaBase, eventoIndex, modulos);
              const end = new Date(start);
              const modulo = modulos[eventoIndex % modulos.length];
              end.setHours(
                end.getHours() + (modulo?.duracion ? modulo.duracion / 60 : 1)
              );

              eventos.push({
                id: Math.random().toString(36).slice(2),
                title: oa.oas_id,
                start,
                end,
                allDay: false,
                color: ejeColor,
                location: `${modulos[eventoIndex % modulos.length]?.dia} ${modulos[eventoIndex % modulos.length]?.horaInicio}`,
              });

              eventoIndex++;
            }
          }
        }
      );

      setEvents(eventos);
    }
  }, [planificacionActual, ejes]);

  // Lógica para sumar/restar clases a un OA
  const handleAddClase = (oa: OA, prevOA: OA | null) => {
    // Los OA del eje "actitud" pueden asignarse sin restricciones
    if (
      oa.eje_descripcion.toLowerCase() !== 'actitud' &&
      !skippedOAs.has(oa.id) &&
      prevOA &&
      oaClases[prevOA.oas_id] < prevOA.minimo_clases
    )
      return;
    setOaClases(prev => ({ ...prev, [oa.oas_id]: (prev[oa.oas_id] || 0) + 1 }));
    // Encontrar el eje al que pertenece este OA para obtener su color
    const eje = ejes.find((e: Eje) => e.oas.some((o: OA) => o.id === oa.id));
    const ejeColor = (eje ? getEjeColor(eje.ejeId) : 'sky') as EventColor;
    // Calcular fecha real del módulo usando los módulos del horario seleccionado
    const modulos =
      horarioSeleccionado?.modulos && horarioSeleccionado.modulos.length > 0
        ? horarioSeleccionado.modulos
        : modulosFijos;
    const moduloIdx = events.length;
    const fechaBase = horarioSeleccionado?.fechaPrimeraClase
      ? new Date(horarioSeleccionado.fechaPrimeraClase)
      : new Date(2025, 6, 1); // fallback
    const modulo = modulos[moduloIdx % modulos.length];
    const start = getModuloDate(fechaBase, moduloIdx, modulos);
    const end = new Date(start);
    end.setHours(end.getHours() + (modulo.duracion ? modulo.duracion / 60 : 1));
    setEvents(prev => [
      ...prev,
      {
        id: Math.random().toString(36).slice(2),
        title: oa.oas_id,
        start,
        end,
        allDay: false,
        color: ejeColor,
        location: `${modulo.dia} ${modulo.horaInicio}${modulo.horaFin ? '-' + modulo.horaFin : ''}`,
      },
    ]);
  };

  const handleRemoveClase = (oa: OA, nextOA: OA | null) => {
    if ((oaClases[oa.oas_id] || 0) === 0) return;
    if (
      nextOA &&
      (oaClases[nextOA.oas_id] || 0) > 0 &&
      oaClases[oa.oas_id] === oa.minimo_clases
    )
      return;
    setOaClases(prev => ({ ...prev, [oa.oas_id]: (prev[oa.oas_id] || 0) - 1 }));
    setEvents(prev => {
      const idx = prev.map(e => e.title).lastIndexOf(oa.oas_id);
      if (idx === -1) return prev;
      return prev.slice(0, idx).concat(prev.slice(idx + 1));
    });
  };

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
  };

  // Función para activar OA saltando la lógica de restricción
  const handleActivateSkippedOA = (oa: OA) => {
    // Marcar el OA como saltado (habilitado)
    setSkippedOAs(prev => new Set([...prev, oa.id]));
  };

  // Función para desactivar OA que fueron saltados
  const handleDeactivateSkippedOA = (oa: OA) => {
    // Solo permitir desactivar OA que fueron saltados
    if (!skippedOAs.has(oa.id)) return;

    // Remover el OA de la lista de saltados
    setSkippedOAs(prev => {
      const newSet = new Set(prev);
      newSet.delete(oa.id);
      return newSet;
    });
  };

  // Obtener lista de ejes para el dropdown
  const ejeOptions = [
    { value: 'Todos', label: 'Todos' },
    ...ejes.map((e: Eje) => ({
      value: e.id,
      label: e.descripcion,
    })),
  ];

  // Filtrado combinado
  const ejesFiltrados = useMemo(() => {
    const filtrados = ejes
      .filter((e: Eje) => selectedEjeId === 'Todos' || e.id === selectedEjeId)
      .map((e: Eje) => {
        const oasFiltrados = e.oas.filter((oa: OA, idx: number) => {
          // Si showOnlyAssignable está activado, solo mostrar OAs que pueden ser asignados
          if (showOnlyAssignable) {
            const prevOA = idx > 0 ? e.oas[idx - 1] : null;
            const prevOk =
              !prevOA || (oaClases[prevOA.id] || 0) >= prevOA.minimo_clases;
            const isSkipped = skippedOAs.has(oa.id);
            const canAdd =
              prevOk ||
              isSkipped ||
              oa.eje_descripcion.toLowerCase() === 'actitud';

            return canAdd;
          }
          // Si no está activado, mostrar todos los OAs
          return true;
        });

        return {
          ...e,
          oas: oasFiltrados,
        };
      })
      .filter((e: Eje) => e.oas.length > 0);

    return filtrados;
  }, [ejes, selectedEjeId, showOnlyAssignable, oaClases, skippedOAs]);

  // Función para guardar planificación
  const guardarPlanificacion = async (nombre: string, horarioId: string) => {
    try {
      // Crear un mapa de oas_id a oaId para mapear las asignaciones
      const oasIdToOaIdMap = new Map();
      ejes.forEach((eje: Eje) => {
        eje.oas.forEach((oa: OA) => {
          oasIdToOaIdMap.set(oa.oas_id, oa.id);
        });
      });

      const asignaciones = Object.entries(oaClases)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([oasId, cantidad]) => {
          const oaId = oasIdToOaIdMap.get(oasId);
          if (!oaId) {
            console.warn(`No se encontró oaId para oas_id: ${oasId}`);
            return null;
          }
          return {
            oaId: oaId,
            cantidadClases: cantidad,
          };
        })
        .filter(Boolean); // Remover asignaciones null

      const response = await fetch('/api/planificaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          horarioId: parseInt(horarioId),
          ano: new Date().getFullYear(),
          asignaciones,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al guardar planificación');
      }

      const data = await response.json();
      setPlanificacionActual(data);
      return data;
    } catch (error) {
      console.error('Error al guardar planificación:', error);
      throw error;
    }
  };

  // Función para actualizar planificación
  const actualizarPlanificacion = async (nombre: string) => {
    if (!planificacionActual) {
      throw new Error('No hay planificación para actualizar');
    }

    try {
      // Crear un mapa de oas_id a oaId para mapear las asignaciones
      const oasIdToOaIdMap = new Map();
      ejes.forEach((eje: Eje) => {
        eje.oas.forEach((oa: OA) => {
          oasIdToOaIdMap.set(oa.oas_id, oa.id);
        });
      });

      const asignaciones = Object.entries(oaClases)
        .filter(([, cantidad]) => cantidad > 0)
        .map(([oasId, cantidad]) => {
          const oaId = oasIdToOaIdMap.get(oasId);
          if (!oaId) {
            console.warn(`No se encontró oaId para oas_id: ${oasId}`);
            return null;
          }
          return {
            oaId: oaId,
            cantidadClases: cantidad,
          };
        })
        .filter(Boolean); // Remover asignaciones null

      const response = await fetch(
        `/api/planificaciones/${planificacionActual.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre,
            asignaciones,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al actualizar planificación');
      }

      const data = await response.json();
      setPlanificacionActual(data);
      return data;
    } catch (error) {
      console.error('Error al actualizar planificación:', error);
      throw error;
    }
  };

  // Función para eliminar planificación
  const eliminarPlanificacion = async () => {
    if (!planificacionActual) {
      throw new Error('No hay planificación para eliminar');
    }

    try {
      const response = await fetch(
        `/api/planificaciones/${planificacionActual.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar planificación');
      }

      setPlanificacionActual(null);
      setOaClases({});
      setEvents([]);
      return true;
    } catch (error) {
      console.error('Error al eliminar planificación:', error);
      throw error;
    }
  };

  // Función para importar CSV
  const handleImportCSV = async (oasNombres: string[]) => {
    try {
      // Obtener la asignatura del horario seleccionado
      let asignaturaId = null;
      let nivelId = null;

      if (planificacionActual && planificacionActual.horario) {
        asignaturaId = planificacionActual.horario.asignaturaId;
        nivelId = planificacionActual.horario.nivelId;
      } else if (horarioSeleccionado) {
        asignaturaId = horarioSeleccionado.asignatura?.id;
        nivelId = horarioSeleccionado.nivel?.id;
      }

      // Si no tenemos asignaturaId o nivelId, no podemos importar
      if (!asignaturaId || !nivelId) {
        throw new Error(
          'No se puede importar CSV sin horario con asignatura y nivel seleccionados'
        );
      }

      // Crear un mapa SOLO con OAs de la asignatura y nivel del horario
      const oasMap = new Map();

      ejes.forEach((eje: Eje) => {
        eje.oas.forEach((oa: OA) => {
          // Solo agregar OAs de la asignatura y nivel correctos
          if (oa.asignatura_id === asignaturaId && oa.nivel_id === nivelId) {
            oasMap.set(oa.oas_id, oa);
          }
        });
      });

      // Limpiar eventos y asignaciones actuales
      setEvents([]);
      setOaClases({});

      // Procesar cada OA del CSV
      let eventoIndex = 0;
      const nuevosEventos: CalendarEvent[] = [];
      const nuevasAsignaciones: OAClases = {};

      for (const oaNombre of oasNombres) {
        // Buscar el OA en el mapa
        const oa = oasMap.get(oaNombre);

        if (oa) {
          // Incrementar el contador de clases para este OA usando el oas_id como clave
          nuevasAsignaciones[oa.oas_id] =
            (nuevasAsignaciones[oa.oas_id] || 0) + 1;

          // Encontrar el eje al que pertenece este OA para obtener su color
          const eje = ejes.find((e: Eje) =>
            e.oas.some((o: OA) => o.id === oa.id)
          );
          const ejeColor = (eje ? getEjeColor(eje.ejeId) : 'sky') as EventColor;

          // Calcular fecha real del módulo usando los módulos del horario seleccionado
          const modulos =
            horarioSeleccionado?.modulos &&
            horarioSeleccionado.modulos.length > 0
              ? horarioSeleccionado.modulos
              : modulosFijos;

          const fechaBase = horarioSeleccionado?.fechaPrimeraClase
            ? new Date(horarioSeleccionado.fechaPrimeraClase)
            : new Date(2025, 6, 1);

          const start = getModuloDate(fechaBase, eventoIndex, modulos);
          const end = new Date(start);
          const modulo = modulos[eventoIndex % modulos.length];
          end.setHours(
            end.getHours() + (modulo?.duracion ? modulo.duracion / 60 : 1)
          );

          nuevosEventos.push({
            id: Math.random().toString(36).slice(2),
            title: oa.oas_id,
            start,
            end,
            allDay: false,
            color: ejeColor,
            location: `${modulos[eventoIndex % modulos.length]?.dia} ${modulos[eventoIndex % modulos.length]?.horaInicio}`,
          });

          eventoIndex++;
        }
      }

      // Actualizar el estado con los nuevos eventos y asignaciones
      setEvents(nuevosEventos);
      setOaClases(nuevasAsignaciones);

      return { success: true, eventosCreados: nuevosEventos.length };
    } catch (error) {
      console.error('Error al importar CSV:', error);
      throw error;
    }
  };

  return {
    events,
    ejes,
    oaClases,
    loadingOAs,
    loadingPlanificacion,
    showOnlyAssignable,
    setShowOnlyAssignable,
    selectedEjeId,
    setSelectedEjeId,
    ejeOptions,
    ejesFiltrados,
    skippedOAs,
    planificacionActual,
    handleAddClase,
    handleRemoveClase,
    handleActivateSkippedOA,
    handleDeactivateSkippedOA,
    handleEventAdd,
    handleEventUpdate,
    handleEventDelete,
    guardarPlanificacion,
    actualizarPlanificacion,
    eliminarPlanificacion,
    handleImportCSV,
  };
}
