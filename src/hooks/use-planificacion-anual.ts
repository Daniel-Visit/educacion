import { useState, useEffect } from "react";
import { CalendarEvent, EventColor } from "@/components/event-calendar";
import { OA, Eje, OAClases } from "@/components/planificacion-anual/types";
import { addDays, getDay } from "date-fns";

const modulosFijos = [
  { dia: "Martes", horaInicio: "09:00", horaFin: "10:00" },
  { dia: "Martes", horaInicio: "12:00", horaFin: "13:00" },
  { dia: "Jueves", horaInicio: "09:00", horaFin: "10:00" },
  { dia: "Jueves", horaInicio: "12:00", horaFin: "13:00" },
];

// Colores disponibles para los ejes
const ejeColors = ["sky", "amber", "violet", "rose", "emerald", "orange"];

// Función para obtener el color de un eje
const getEjeColor = (ejeId: number) => {
  return ejeColors[ejeId % ejeColors.length];
};

// Utilidad para obtener la fecha real del módulo (martes/jueves) a partir del índice
function getModuloDate(baseDate: Date, moduloIdx: number, modulos: {dia: string, horaInicio: string, horaFin: string}[]) {
  // Martes = 2, Jueves = 4 (date-fns: 0=domingo)
  const modulo = modulos[moduloIdx % modulos.length];
  const semana = Math.floor(moduloIdx / modulos.length);
  // Día de la semana destino
  const diaSemana = modulo.dia === "Martes" ? 2 : 4;
  // Buscar el primer martes o jueves igual o posterior a baseDate
  let fecha = new Date(baseDate);
  const baseDay = getDay(fecha); // 0=domingo
  let add = diaSemana - baseDay;
  if (add < 0) add += 7;
  fecha = addDays(fecha, add + semana * 7);
  // Setear hora
  const [h, m] = modulo.horaInicio.split(":").map(Number);
  fecha.setHours(h, m, 0, 0);
  return fecha;
}

export function usePlanificacionAnual(horarioSeleccionado?: { modulos?: any[], fechaPrimeraClase?: string }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [ejes, setEjes] = useState<Eje[]>([]);
  const [oaClases, setOaClases] = useState<OAClases>({});
  const [loadingOAs, setLoadingOAs] = useState(false);
  const [showOnlyAssignable, setShowOnlyAssignable] = useState(false);
  const [selectedEjeId, setSelectedEjeId] = useState<string>("Todos");
  const [skippedOAs, setSkippedOAs] = useState<Set<number>>(new Set());

  useEffect(() => {
    setLoadingOAs(true);
    fetch("/api/ejes")
      .then((res) => res.json())
      .then((data) => {
        setEjes(data);
        // Inicializar oaClases con 0 para cada OA
        const initial: OAClases = {};
        data.forEach((eje: Eje) =>
          eje.oas.forEach((oa: OA) => {
            initial[oa.id] = 0;
          })
        );
        setOaClases(initial);
      })
      .finally(() => setLoadingOAs(false));
  }, []);

  // Lógica para sumar/restar clases a un OA
  const handleAddClase = (oa: OA, prevOA: OA | null) => {
    // Los OA del eje "actitud" pueden asignarse sin restricciones
    if (oa.eje_descripcion.toLowerCase() !== 'actitud' && 
        !skippedOAs.has(oa.id) && 
        prevOA && 
        oaClases[prevOA.id] < prevOA.minimo_clases) return;
    setOaClases((prev) => ({ ...prev, [oa.id]: (prev[oa.id] || 0) + 1 }));
    // Encontrar el eje al que pertenece este OA para obtener su color
    const eje = ejes.find((e: Eje) => e.oas.some((o: OA) => o.id === oa.id));
    const ejeColor = (eje ? getEjeColor(eje.id) : "sky") as EventColor;
    // Calcular fecha real del módulo usando los módulos del horario seleccionado
    const modulos = horarioSeleccionado?.modulos && horarioSeleccionado.modulos.length > 0 ? horarioSeleccionado.modulos : modulosFijos;
    const moduloIdx = events.length;
    const fechaBase = horarioSeleccionado?.fechaPrimeraClase
      ? new Date(horarioSeleccionado.fechaPrimeraClase)
      : new Date(2025, 6, 1); // fallback
    const modulo = modulos[moduloIdx % modulos.length];
    const start = getModuloDate(fechaBase, moduloIdx, modulos);
    const end = new Date(start);
    end.setHours(end.getHours() + (modulo.duracion ? modulo.duracion / 60 : 1));
    setEvents((prev) => [
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
    if ((oaClases[oa.id] || 0) === 0) return;
    if (
      nextOA &&
      (oaClases[nextOA.id] || 0) > 0 &&
      oaClases[oa.id] === oa.minimo_clases
    )
      return;
    setOaClases((prev) => ({ ...prev, [oa.id]: (prev[oa.id] || 0) - 1 }));
    setEvents((prev) => {
      const idx = prev.map((e) => e.title).lastIndexOf(oa.oas_id);
      if (idx === -1) return prev;
      return prev.slice(0, idx).concat(prev.slice(idx + 1));
    });
  };

  const handleEventAdd = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  const handleEventUpdate = (updatedEvent: CalendarEvent) => {
    setEvents(
      events.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(events.filter((event) => event.id !== eventId));
  };

  // Función para activar OA saltando la lógica de restricción
  const handleActivateSkippedOA = (oa: OA, eje: Eje) => {
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
    { value: "Todos", label: "Todos" },
    ...ejes.map((e: Eje) => ({
      value: `${e.id}||${e.descripcion}`,
      label: e.descripcion,
    })),
  ];

  // Filtrado combinado
  const ejesFiltrados = ejes
    .filter(
      (e: Eje) =>
        selectedEjeId === "Todos" ||
        `${e.id}||${e.descripcion}` === selectedEjeId
    )
    .map((e: Eje) => ({
      ...e,
      oas: e.oas.filter((oa: OA, idx: number, arr: OA[]) => {
        if (!showOnlyAssignable) return true;
        
        // Los OA del eje "actitud" son siempre asignables
        if (oa.eje_descripcion.toLowerCase() === 'actitud') {
          return true;
        }
        
        const prevOA = idx > 0 ? arr[idx - 1] : null;
        return !prevOA || (oaClases[prevOA.id] || 0) >= prevOA.minimo_clases;
      }),
    }))
    .filter((e: Eje) => e.oas.length > 0);

  return {
    events,
    ejes,
    oaClases,
    loadingOAs,
    showOnlyAssignable,
    setShowOnlyAssignable,
    selectedEjeId,
    setSelectedEjeId,
    ejeOptions,
    ejesFiltrados,
    skippedOAs,
    handleAddClase,
    handleRemoveClase,
    handleActivateSkippedOA,
    handleDeactivateSkippedOA,
    handleEventAdd,
    handleEventUpdate,
    handleEventDelete,
  };
} 