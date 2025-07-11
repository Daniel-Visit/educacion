'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, Plus, Trash2, Save } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import Dropdown from '@/components/entrevista/Dropdown';
import { useHorarios } from '@/hooks/use-horarios';
import React from 'react';
// Importar Listbox de Headless UI y ChevronDown
import { Listbox } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

interface CrearHorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHorarioCreated: (horarioId: number) => void;
}

interface Modulo {
  id: string;
  dia: string;
  horaInicio: string;
  duracion: number;
}

const DIAS_SEMANA = [
  { value: 'Lunes', label: 'Lunes' },
  { value: 'Martes', label: 'Martes' },
  { value: 'Miércoles', label: 'Miércoles' },
  { value: 'Jueves', label: 'Jueves' },
  { value: 'Viernes', label: 'Viernes' },
];

const HORAS_DISPONIBLES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

const DURACIONES = [
  { value: '30', label: '30 min' },
  { value: '45', label: '45 min' },
  { value: '60', label: '1 hora' },
  { value: '90', label: '1.5 horas' },
  { value: '120', label: '2 horas' },
];

// Dropdown mejorado
interface NiceDropdownOption {
  value: string;
  label: string;
}
interface NiceDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: NiceDropdownOption[];
  placeholder?: string;
}
function NiceDropdown({ value, onChange, options, placeholder }: NiceDropdownProps) {
  const selected = options.find((opt: NiceDropdownOption) => opt.value === value);
  return (
    <Listbox value={value} onChange={(val: string) => onChange(val)}>
      <div className="relative">
        <Listbox.Button className="w-full rounded-lg border border-indigo-200 px-3 py-2 bg-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-400 truncate">
          <span className="truncate">{selected ? selected.label : <span className="text-gray-400">{placeholder}</span>}</span>
          <ChevronDown className="w-5 h-5 text-gray-400 ml-2 transition-transform ui-open:rotate-180" />
        </Listbox.Button>
        <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-indigo-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option: NiceDropdownOption) => (
            <Listbox.Option
              key={option.value}
              value={option.value}
              className={({ active, selected }: { active: boolean; selected: boolean }) =>
                `cursor-pointer select-none px-4 py-2 transition-colors ${
                  selected ? 'bg-indigo-100 text-indigo-700 font-bold' : active ? 'bg-indigo-50' : 'text-gray-900'
                }`
              }
            >
              {option.label}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
}

export default function CrearHorarioModal({ isOpen, onClose, onHorarioCreated }: CrearHorarioModalProps) {
  const [nombre, setNombre] = useState('');
  const [asignaturaId, setAsignaturaId] = useState('');
  const [nivelId, setNivelId] = useState('');
  const [docenteId, setDocenteId] = useState('');
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const {
    asignaturas,
    niveles,
    profesores,
    createHorario,
    loading: loadingData,
    loadHorarios,
    loadInitialData
  } = useHorarios();

  // Cargar niveles y datos al abrir el modal si están vacíos
  React.useEffect(() => {
    if (isOpen && (niveles.length === 0 || asignaturas.length === 0 || profesores.length === 0)) {
      if (typeof loadInitialData === 'function') {
        loadInitialData();
      }
    }
    // No retornar nada
  }, [isOpen]);

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

  const handleModuloChange = (id: string, field: keyof Modulo, value: any) => {
    setModulos(modulos.map(modulo => 
      modulo.id === id ? { ...modulo, [field]: value } : modulo
    ));
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
    if (modulos.length === 0) {
      setError('Debes agregar al menos un módulo');
      return false;
    }
    // Validar módulos repetidos (mismo día y hora de inicio)
    const seen = new Set();
    for (const modulo of modulos) {
      const key = `${modulo.dia}-${modulo.horaInicio}`;
      if (seen.has(key)) {
        setError('No puede haber módulos repetidos (mismo día y hora de inicio)');
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

  const isFormValid = () => {
    if (!nombre.trim() || !asignaturaId || !nivelId || !docenteId || modulos.length === 0) return false;
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
    return true;
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!validateForm()) return;
    setLoading(true);
    try {
      const horarioData = {
        nombre: nombre.trim(),
        asignaturaId: parseInt(asignaturaId),
        nivelId: parseInt(nivelId),
        docenteId: parseInt(docenteId),
        modulos: modulos.map(modulo => ({
          dia: modulo.dia,
          horaInicio: modulo.horaInicio,
          duracion: modulo.duracion,
          orden: 1,
        })),
      };
      const nuevoHorario = await createHorario(horarioData);
      onHorarioCreated(nuevoHorario.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear horario');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre('');
    setAsignaturaId('');
    setNivelId('');
    setDocenteId('');
    setModulos([]);
    setError(null);
    onClose();
  };

  // Opciones para los dropdowns
  const opcionesProfesores = profesores.map(profesor => ({
    value: profesor.id.toString(),
    label: profesor.nombre
  }));
  const opcionesAsignaturas = asignaturas.map(asignatura => ({
    value: asignatura.id.toString(),
    label: asignatura.nombre
  }));
  const opcionesNiveles = niveles.map(nivel => ({
    value: nivel.id.toString(),
    label: nivel.nombre
  }));

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-0 relative animate-fade-in max-h-[90vh] flex flex-col">
          <div className="sticky top-0 z-10 bg-white px-8 pt-8 pb-4 rounded-t-2xl flex items-start justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-indigo-700 mb-1">
                <Calendar className="w-6 h-6" />
                Crear Nuevo Horario
              </h2>
              <p className="text-gray-500 text-base">Configura tu horario docente para la planificación anual</p>
            </div>
            <button
              className="text-gray-400 hover:text-gray-700 text-xl ml-4 mt-1"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-8 mt-2">
            {error && touched && (
              <div className="bg-red-100 text-red-700 rounded-md px-3 py-2 text-sm mb-4">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Nombre del Horario *</label>
                <input
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200 text-gray-900"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: Horario Matemáticas 4°A"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Profesor Titular *</label>
                <NiceDropdown
                  value={docenteId}
                  onChange={setDocenteId}
                  options={opcionesProfesores}
                  placeholder="Seleccionar profesor"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Asignatura *</label>
                <NiceDropdown
                  value={asignaturaId}
                  onChange={setAsignaturaId}
                  options={opcionesAsignaturas}
                  placeholder="Seleccionar asignatura"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Nivel *</label>
                {opcionesNiveles.length === 0 ? (
                  <div className="text-gray-400 text-sm italic border border-gray-200 rounded-lg px-4 py-2 bg-gray-50">No hay niveles disponibles</div>
                ) : (
                  <NiceDropdown
                    value={nivelId}
                    onChange={setNivelId}
                    options={opcionesNiveles}
                    placeholder="Seleccionar nivel"
                  />
                )}
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-base font-semibold text-gray-700">
                  <Clock className="w-5 h-5" />
                  Módulos del Horario
                </span>
                <SecondaryButton onClick={handleAddModulo} className="flex items-center gap-2 px-4 py-2 text-sm">
                  <Plus className="w-4 h-4" /> Agregar Módulo
                </SecondaryButton>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {modulos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg py-8 bg-gray-50">
                    <Clock className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-gray-500 text-sm font-medium mb-1">No hay módulos</span>
                    <span className="text-gray-400 text-sm">Agrega módulos para configurar tu horario.</span>
                  </div>
                ) : (
                  modulos.map((modulo, index) => (
                    <div key={modulo.id} className="border border-indigo-200 rounded-lg p-3 bg-gradient-to-r from-indigo-50 to-purple-50 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
                      <span className="font-medium text-sm text-gray-700 md:w-20">Módulo {index + 1}</span>
                      <div className="flex flex-1 flex-col md:flex-row md:items-center gap-2 md:gap-3">
                        <div className="flex flex-col gap-1 md:w-32">
                          <label className="text-xs text-gray-600">Día</label>
                          <NiceDropdown
                            value={modulo.dia}
                            onChange={value => handleModuloChange(modulo.id, 'dia', value)}
                            options={DIAS_SEMANA}
                            placeholder="Seleccionar día"
                          />
                        </div>
                        <div className="flex flex-col gap-1 md:w-28">
                          <label className="text-xs text-gray-600">Hora de Inicio</label>
                          <NiceDropdown
                            value={modulo.horaInicio}
                            onChange={value => handleModuloChange(modulo.id, 'horaInicio', value)}
                            options={HORAS_DISPONIBLES.map(hora => ({ value: hora, label: hora }))}
                            placeholder="Seleccionar hora"
                          />
                        </div>
                        <div className="flex flex-col gap-1 md:w-28">
                          <label className="text-xs text-gray-600">Duración</label>
                          <NiceDropdown
                            value={modulo.duracion.toString()}
                            onChange={value => handleModuloChange(modulo.id, 'duracion', parseInt(value))}
                            options={DURACIONES}
                            placeholder="Seleccionar duración"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveModulo(modulo.id)}
                        className="h-8 w-8 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 hover:border hover:border-red-300 border border-transparent ml-auto"
                        title="Eliminar módulo"
                        style={{ aspectRatio: '1 / 1' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <SecondaryButton onClick={handleClose}>Cancelar</SecondaryButton>
              <PrimaryButton onClick={handleSubmit} disabled={loading || loadingData || !isFormValid()} className="flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Crear Horario
                  </>
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )
  );
} 