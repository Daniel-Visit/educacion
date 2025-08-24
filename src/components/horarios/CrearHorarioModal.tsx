'use client';

import { useState } from 'react';
import { Calendar, Clock, Trash2, Save } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DatePicker } from '@/components/ui/datepicker/datepicker';
import { useHorarios } from '@/hooks/use-horarios';
import ModalHeader from '@/components/ui/modal-header';

import React from 'react';

// Importar el tipo Horario del hook
type Horario = {
  id: number;
  nombre: string;
  asignatura: { id: number };
  nivel: { id: number };
  profesor: { id: number };
  fechaPrimeraClase?: string;
  createdAt: string;
  modulos: Array<{
    id: number;
    dia: string;
    horaInicio: string;
    duracion: number;
  }>;
};

interface CrearHorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHorarioCreated: (horarioId: number) => void;
  modoEdicion?: boolean;
  horarioInicial?: Horario;
}

interface Modulo {
  id: string;
  dia: string;
  horaInicio: string;
  duracion: number;
}

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  tooltip?: string;
}

const DIAS_SEMANA: DropdownOption[] = [
  { value: 'Lunes', label: 'Lunes' },
  { value: 'Martes', label: 'Martes' },
  { value: 'Miércoles', label: 'Miércoles' },
  { value: 'Jueves', label: 'Jueves' },
  { value: 'Viernes', label: 'Viernes' },
];

const HORAS_DISPONIBLES = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
];

const DURACIONES = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
];

export default function CrearHorarioModal({
  isOpen,
  onClose,
  onHorarioCreated,
  modoEdicion = false,
  horarioInicial,
}: CrearHorarioModalProps) {
  const [nombre, setNombre] = useState('');
  const [asignaturaId, setAsignaturaId] = useState('');
  const [nivelId, setNivelId] = useState('');
  const [docenteId, setDocenteId] = useState('');
  const [fechaPrimeraClase, setFechaPrimeraClase] = useState('');
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    asignaturas,
    niveles,
    profesores,
    horarios,

    loadHorarios,
    createHorario,
    updateHorario,
  } = useHorarios();

  // Cargar niveles y datos al abrir el modal si están vacíos
  React.useEffect(() => {
    if (
      isOpen &&
      (niveles.length === 0 ||
        asignaturas.length === 0 ||
        profesores.length === 0)
    ) {
      // Los datos se cargan automáticamente en useHorarios
    }
    // No retornar nada
  }, [isOpen, niveles.length, asignaturas.length, profesores.length]);

  // Precargar datos si es edición
  React.useEffect(() => {
    if (modoEdicion && horarioInicial && isOpen) {
      setNombre(horarioInicial.nombre || '');
      setAsignaturaId(horarioInicial.asignatura?.id?.toString() || '');
      setNivelId(horarioInicial.nivel?.id?.toString() || '');
      setDocenteId(horarioInicial.profesor?.id?.toString() || '');
      setFechaPrimeraClase(
        horarioInicial.fechaPrimeraClase
          ? new Date(horarioInicial.fechaPrimeraClase)
              .toISOString()
              .split('T')[0]
          : ''
      );
      setModulos(
        (horarioInicial.modulos || []).map((m: Horario['modulos'][0]) => ({
          id: m.id?.toString() || Date.now().toString() + Math.random(),
          dia: m.dia,
          horaInicio: m.horaInicio,
          duracion: m.duracion,
        }))
      );
      setError(null);
    } else if (!isOpen) {
      setNombre('');
      setAsignaturaId('');
      setNivelId('');
      setDocenteId('');
      setFechaPrimeraClase('');
      setModulos([]);
      setError(null);
    }
  }, [modoEdicion, horarioInicial, isOpen]);

  // Cargar horarios al montar el componente para poder validar conflictos
  React.useEffect(() => {
    if (isOpen) {
      loadHorarios();
    }
  }, [isOpen, loadHorarios]);

  const handleAddModulo = () => {
    const nuevoModulo: Modulo = {
      id: Date.now().toString(),
      dia: 'Lunes',
      horaInicio: '08:00',
      duracion: 60,
    };
    setModulos([...modulos, nuevoModulo]);
  };

  const handleRemoveModulo = (id: string) => {
    setModulos(modulos.filter(modulo => modulo.id !== id));
  };

  const handleModuloChange = (
    id: string,
    field: keyof Modulo,
    value: string | number
  ) => {
    setModulos(
      modulos.map(modulo =>
        modulo.id === id ? { ...modulo, [field]: value } : modulo
      )
    );
  };

  const validateForm = () => {
    if (!nombre.trim()) {
      setError('El nombre del horario es requerido');
      return false;
    }
    if (!asignaturaId) {
      setError('Debes seleccionar una asignatura');
      return false;
    }
    if (!nivelId) {
      setError('Debes seleccionar un nivel');
      return false;
    }
    if (!docenteId) {
      setError('Debes seleccionar un profesor titular');
      return false;
    }
    if (!fechaPrimeraClase) {
      setError('Debes seleccionar la fecha de la primera clase');
      return false;
    }
    if (modulos.length === 0) {
      setError('Debes agregar al menos un módulo');
      return false;
    }
    // Validar módulos repetidos (mismo día y hora de inicio)
    const seen = new Set();
    for (const modulo of modulos) {
      const key = `${modulo.dia}-${modulo.horaInicio}`;
      if (seen.has(key)) {
        setError(
          'No puede haber módulos repetidos (mismo día y hora de inicio)'
        );
        return false;
      }
      seen.add(key);
    }
    // Validar solapamiento de módulos (mismo día y rango horario se superponen)
    for (let i = 0; i < modulos.length; i++) {
      const a = modulos[i];
      const aStart = parseTime(a.horaInicio);
      const aEnd = addMinutes(aStart, a.duracion);
      for (let j = i + 1; j < modulos.length; j++) {
        const b = modulos[j];
        if (a.dia !== b.dia) continue;
        const bStart = parseTime(b.horaInicio);
        const bEnd = addMinutes(bStart, b.duracion);
        if (aStart < bEnd && bStart < aEnd) {
          setError('No puede haber módulos que se solapen en el mismo día');
          return false;
        }
      }
    }

    // Validar conflictos con otros horarios del mismo profesor
    const conflictValidation = validateConflictsWithOtherHorarios(
      modulos,
      docenteId
    );
    if (conflictValidation.hasConflict && conflictValidation.conflictDetails) {
      setError(conflictValidation.conflictDetails);
      return false;
    }

    setError(null);
    return true;
  };
  // Helpers para validar solapamiento
  function parseTime(timeStr: string) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
  function addMinutes(start: number, mins: number) {
    return start + mins;
  }

  // Validar conflictos entre diferentes horarios (mismo profesor, mismo día/hora)
  const validateConflictsWithOtherHorarios = (
    modulos: Modulo[],
    docenteId: string
  ): { hasConflict: boolean; conflictDetails?: string } => {
    console.log(
      '🔍 [validateConflictsWithOtherHorarios] Iniciando validación:',
      { modulos, docenteId, horarios: horarios?.length }
    );

    if (!docenteId || !horarios || horarios.length === 0) {
      console.log(
        '🔍 [validateConflictsWithOtherHorarios] No hay docenteId o horarios, retornando false'
      );
      return { hasConflict: false };
    }

    const currentHorarioId = modoEdicion ? horarioInicial?.id : null;
    console.log(
      '🔍 [validateConflictsWithOtherHorarios] currentHorarioId:',
      currentHorarioId
    );

    for (const modulo of modulos) {
      const moduloStart = parseTime(modulo.horaInicio);
      const moduloEnd = addMinutes(moduloStart, modulo.duracion);
      console.log(
        '🔍 [validateConflictsWithOtherHorarios] Verificando módulo:',
        {
          dia: modulo.dia,
          horaInicio: modulo.horaInicio,
          duracion: modulo.duracion,
          moduloStart,
          moduloEnd,
        }
      );

      // Buscar conflictos en otros horarios del mismo profesor
      for (const horario of horarios) {
        // Saltar el horario actual si estamos editando
        if (currentHorarioId && horario.id === currentHorarioId) {
          console.log(
            '🔍 [validateConflictsWithOtherHorarios] Saltando horario actual:',
            horario.id
          );
          continue;
        }

        // Solo verificar horarios del mismo profesor
        if (horario.profesor.id !== parseInt(docenteId)) {
          console.log(
            '🔍 [validateConflictsWithOtherHorarios] Saltando horario de otro profesor:',
            {
              horarioId: horario.id,
              profesorId: horario.profesor.id,
              docenteId,
            }
          );
          continue;
        }

        console.log(
          '🔍 [validateConflictsWithOtherHorarios] Verificando horario del mismo profesor:',
          {
            horarioId: horario.id,
            nombre: horario.nombre,
            modulos: horario.modulos.length,
          }
        );

        // Verificar conflictos en los módulos de este horario
        for (const existingModulo of horario.modulos) {
          if (existingModulo.dia !== modulo.dia) {
            console.log(
              '🔍 [validateConflictsWithOtherHorarios] Día diferente, saltando:',
              { existingDia: existingModulo.dia, moduloDia: modulo.dia }
            );
            continue;
          }

          const existingStart = parseTime(existingModulo.horaInicio);
          const existingEnd = addMinutes(
            existingStart,
            existingModulo.duracion
          );
          console.log(
            '🔍 [validateConflictsWithOtherHorarios] Comparando con módulo existente:',
            {
              existingDia: existingModulo.dia,
              existingHoraInicio: existingModulo.horaInicio,
              existingDuracion: existingModulo.duracion,
              existingStart,
              existingEnd,
            }
          );

          // Si hay solapamiento, hay conflicto
          if (moduloStart < existingEnd && existingStart < moduloEnd) {
            console.log(
              '🔍 [validateConflictsWithOtherHorarios] ¡CONFLICTO DETECTADO!',
              { moduloStart, moduloEnd, existingStart, existingEnd }
            );
            return {
              hasConflict: true,
              conflictDetails: `El profesor ya está asignado a ${horario.nombre} (${horario.asignatura.nombre} - ${horario.nivel.nombre}) el ${modulo.dia} de ${existingModulo.horaInicio} a ${existingModulo.horaInicio.split(':')[0]}:${String(parseInt(existingModulo.horaInicio.split(':')[1]) + existingModulo.duracion).padStart(2, '0')}`,
            };
          }
        }
      }
    }

    console.log(
      '🔍 [validateConflictsWithOtherHorarios] No se encontraron conflictos'
    );
    return { hasConflict: false };
  };

  // Obtener opciones disponibles para día y hora (evitar conflictos)
  const getAvailableOptions = (
    moduloIndex: number,
    field: 'dia' | 'horaInicio'
  ): DropdownOption[] => {
    console.log('🔍 [getAvailableOptions] Llamado con:', {
      moduloIndex,
      field,
      docenteId,
      horarios: horarios?.length,
    });

    if (!docenteId || !horarios || horarios.length === 0) {
      console.log(
        '🔍 [getAvailableOptions] No hay docenteId o horarios, retornando todas las opciones'
      );
      return field === 'dia'
        ? DIAS_SEMANA
        : HORAS_DISPONIBLES.map(hora => ({ value: hora, label: hora }));
    }

    const currentHorarioId = modoEdicion ? horarioInicial?.id : null;
    const currentModulo = modulos[moduloIndex];

    if (field === 'dia') {
      // Los días siempre están disponibles - un profesor puede tener múltiples horarios en el mismo día
      console.log('🔍 [getAvailableOptions] Días siempre disponibles');
      return DIAS_SEMANA.map(dia => ({
        ...dia,
        disabled: false,
        tooltip: undefined,
      }));
    } else {
      // Para horas, verificar qué horas están ocupadas en el día seleccionado
      if (!currentModulo?.dia) {
        console.log(
          '🔍 [getAvailableOptions] No hay día seleccionado, retornando todas las horas'
        );
        return HORAS_DISPONIBLES.map(hora => ({ value: hora, label: hora }));
      }

      const horasOcupadas = new Set<string>();

      horarios.forEach(horario => {
        if (currentHorarioId && horario.id === currentHorarioId) return;
        if (horario.profesor.id !== parseInt(docenteId)) return;

        horario.modulos.forEach(modulo => {
          if (modulo.dia === currentModulo.dia) {
            // Marcar como ocupada la hora de inicio y las siguientes según la duración
            const startHour = parseTime(modulo.horaInicio);
            const endHour = addMinutes(startHour, modulo.duracion);

            for (let h = startHour; h < endHour; h += 30) {
              const timeStr = `${Math.floor(h / 60)
                .toString()
                .padStart(2, '0')}:${(h % 60).toString().padStart(2, '0')}`;
              horasOcupadas.add(timeStr);
            }
          }
        });
      });

      console.log(
        '🔍 [getAvailableOptions] Horas ocupadas para',
        currentModulo.dia,
        ':',
        Array.from(horasOcupadas)
      );

      return HORAS_DISPONIBLES.map(hora => ({
        value: hora,
        label: hora,
        disabled: horasOcupadas.has(hora),
        tooltip: horasOcupadas.has(hora)
          ? 'Hora ocupada por el profesor'
          : undefined,
      }));
    }
  };

  const isFormValid = () => {
    if (
      !nombre.trim() ||
      !asignaturaId ||
      !nivelId ||
      !docenteId ||
      !fechaPrimeraClase ||
      modulos.length === 0
    )
      return false;
    // Validar módulos repetidos
    const seen = new Set();
    for (const modulo of modulos) {
      const key = `${modulo.dia}-${modulo.horaInicio}`;
      if (seen.has(key)) return false;
      seen.add(key);
    }
    // Validar solapamiento
    for (let i = 0; i < modulos.length; i++) {
      const a = modulos[i];
      const aStart = parseTime(a.horaInicio);
      const aEnd = addMinutes(aStart, a.duracion);
      for (let j = i + 1; j < modulos.length; j++) {
        const b = modulos[j];
        if (a.dia !== b.dia) continue;
        const bStart = parseTime(b.horaInicio);
        const bEnd = addMinutes(bStart, b.duracion);
        if (aStart < bEnd && bStart < aEnd) return false;
      }
    }

    // Validar conflictos con otros horarios del mismo profesor
    const conflictValidation = validateConflictsWithOtherHorarios(
      modulos,
      docenteId
    );
    if (conflictValidation.hasConflict) return false;

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const horarioData = {
        nombre: nombre.trim(),
        asignaturaId: parseInt(asignaturaId),
        nivelId: parseInt(nivelId),
        docenteId: parseInt(docenteId),
        fechaPrimeraClase: new Date(fechaPrimeraClase),
        modulos: modulos.map(modulo => ({
          dia: modulo.dia,
          horaInicio: modulo.horaInicio,
          duracion: modulo.duracion,
          orden: 1,
        })),
      };
      if (modoEdicion && horarioInicial?.id) {
        const actualizado = await updateHorario(horarioInicial.id, horarioData);
        onHorarioCreated(actualizado.data.id);
      } else {
        const nuevoHorario = await createHorario(horarioData);
        onHorarioCreated(nuevoHorario.data.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar horario');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Opciones para los dropdowns principales
  const asignaturaOptions = asignaturas.map(a => ({
    value: a.id.toString(),
    label: a.nombre,
  }));
  const nivelOptions = niveles.map(n => ({
    value: n.id.toString(),
    label: n.nombre,
  }));
  const profesorOptions = profesores.map(p => ({
    value: p.id.toString(),
    label: p.nombre,
  }));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-all ${isOpen ? '' : 'hidden'}`}
      style={{ minHeight: '100vh' }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]"
        style={{ minHeight: '400px' }}
      >
        {/* Header bonito con gradiente indigo-morado - FIXED */}
        {/* Header del modal */}
        <ModalHeader
          title={modoEdicion ? 'Editar Horario' : 'Crear Nuevo Horario'}
          subtitle="Configura tu horario docente para la planificación anual"
          icon={<Calendar className="h-6 w-6 text-white" />}
          onClose={onClose}
          gradient="from-indigo-600 to-purple-600"
        />

        {/* Contenido con scroll - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto">
          {/* Inputs principales en grid compacto */}
          <div className="px-8 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Horario *
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Horario Lenguaje 2do Básico"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profesor Titular *
                </label>
                <Select
                  value={docenteId}
                  onValueChange={(value: string) => {
                    console.log(
                      '🔍 [Horarios] Dropdown Profesor onChange:',
                      value,
                      'profesorOptions:',
                      profesorOptions.length
                    );
                    setDocenteId(value);
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecciona un profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesorOptions.map(profesor => (
                      <SelectItem key={profesor.value} value={profesor.value}>
                        {profesor.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asignatura *
                </label>
                <Select
                  value={asignaturaId}
                  onValueChange={(value: string) => {
                    console.log(
                      '🔍 [Horarios] Dropdown Asignatura onChange:',
                      value,
                      'asignaturaOptions:',
                      asignaturaOptions.length
                    );
                    setAsignaturaId(value);
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecciona una asignatura" />
                  </SelectTrigger>
                  <SelectContent>
                    {asignaturaOptions.map(asignatura => (
                      <SelectItem
                        key={asignatura.value}
                        value={asignatura.value}
                      >
                        {asignatura.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel *
                </label>
                <Select
                  value={nivelId}
                  onValueChange={(value: string) => {
                    console.log(
                      '🔍 [Horarios] Dropdown Nivel onChange:',
                      value,
                      'nivelOptions:',
                      nivelOptions.length
                    );
                    setNivelId(value);
                  }}
                >
                  <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="Selecciona un nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    {nivelOptions.map(nivel => (
                      <SelectItem key={nivel.value} value={nivel.value}>
                        {nivel.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fecha de primera clase */}
            <div className="mb-6">
              <DatePicker
                label="Fecha Primera Clase *"
                value={
                  fechaPrimeraClase ? new Date(fechaPrimeraClase) : undefined
                }
                onChange={date =>
                  setFechaPrimeraClase(
                    date ? date.toISOString().split('T')[0] : ''
                  )
                }
                placeholder="Selecciona la fecha de inicio"
                minDate={new Date('2025-01-01')}
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta fecha es el punto de partida de la planificación anual.
              </p>
            </div>
          </div>

          {/* Módulos del Horario */}
          <div className="px-8 mb-2">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold text-gray-700">
                  Módulos del Horario
                </span>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium text-sm hover:bg-green-100 border border-green-200 transition-colors"
                onClick={handleAddModulo}
              >
                + Agregar Módulo
              </button>
            </div>
            <div className="space-y-3 pr-0">
              {modulos.map((modulo, idx) => (
                <div
                  key={modulo.id}
                  className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-3 py-2"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs text-gray-500 font-semibold min-w-[70px]">
                      Módulo {idx + 1}
                    </span>
                    <Select
                      value={modulo.dia}
                      onValueChange={(v: string) => {
                        console.log(
                          '🔍 [Horarios] Dropdown Módulo Día onChange:',
                          v,
                          'moduloId:',
                          modulo.id,
                          'options:',
                          getAvailableOptions(idx, 'dia').length
                        );
                        handleModuloChange(modulo.id, 'dia', v);
                      }}
                    >
                      <SelectTrigger className="min-w-[140px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Día" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOptions(idx, 'dia').map(option => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className={
                              option.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={modulo.horaInicio}
                      onValueChange={(v: string) =>
                        handleModuloChange(modulo.id, 'horaInicio', v)
                      }
                    >
                      <SelectTrigger className="min-w-[130px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Hora inicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableOptions(idx, 'horaInicio').map(option => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className={
                              option.disabled
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={modulo.duracion.toString()}
                      onValueChange={(v: string) =>
                        handleModuloChange(modulo.id, 'duracion', parseInt(v))
                      }
                    >
                      <SelectTrigger className="min-w-[140px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                        <SelectValue placeholder="Duración" />
                      </SelectTrigger>
                      <SelectContent>
                        {DURACIONES.map(duracion => (
                          <SelectItem
                            key={duracion.value}
                            value={duracion.value}
                          >
                            {duracion.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="button"
                    className="ml-2 flex items-center justify-center w-8 h-8 rounded-md border border-transparent text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors"
                    onClick={() => handleRemoveModulo(modulo.id)}
                    title="Eliminar módulo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 mb-2 text-sm px-8">{error}</div>
          )}

          {/* Footer al final del flujo, siempre visible */}
          <div className="my-4 px-8 bg-white rounded-b-3xl flex justify-end gap-3 shadow-[0_-2px_16px_-8px_rgba(80,80,120,0.06)]">
            <SecondaryButton
              onClick={onClose}
              variant="subtle"
              className="min-w-[120px] flex items-center justify-center text-base font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid()}
              variant="subtle"
              className="min-w-[160px] flex items-center justify-center text-sm font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />{' '}
              {modoEdicion ? 'Guardar Cambios' : 'Crear Horario'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
