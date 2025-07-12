'use client';

import { useState } from 'react';
import { Calendar, Clock, Users, Plus, Trash2, Save } from 'lucide-react';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';
import GlobalDropdown from '@/components/ui/GlobalDropdown';
import { DatePicker } from '@/components/ui/datepicker/datepicker';
import { useHorarios } from '@/hooks/use-horarios';
import React from 'react';
// Importar Listbox de Headless UI y ChevronDown
import { Listbox } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';

interface CrearHorarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHorarioCreated: (horarioId: number) => void;
  modoEdicion?: boolean;
  horarioInicial?: any;
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

export default function CrearHorarioModal({ isOpen, onClose, onHorarioCreated, modoEdicion = false, horarioInicial }: CrearHorarioModalProps) {
  const [nombre, setNombre] = useState('');
  const [asignaturaId, setAsignaturaId] = useState('');
  const [nivelId, setNivelId] = useState('');
  const [docenteId, setDocenteId] = useState('');
  const [fechaPrimeraClase, setFechaPrimeraClase] = useState('');
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
    loadInitialData,
    updateHorario
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

  // Precargar datos si es edición
  React.useEffect(() => {
    if (modoEdicion && horarioInicial && isOpen) {
      setNombre(horarioInicial.nombre || '');
      setAsignaturaId(horarioInicial.asignatura?.id?.toString() || '');
      setNivelId(horarioInicial.nivel?.id?.toString() || '');
      setDocenteId(horarioInicial.profesor?.id?.toString() || '');
      setFechaPrimeraClase(horarioInicial.fechaPrimeraClase ? new Date(horarioInicial.fechaPrimeraClase).toISOString().split('T')[0] : '');
      setModulos((horarioInicial.modulos || []).map((m: any) => ({
        id: m.id?.toString() || Date.now().toString() + Math.random(),
        dia: m.dia,
        horaInicio: m.horaInicio,
        duracion: m.duracion,
      })));
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
    if (!nombre.trim() || !asignaturaId || !nivelId || !docenteId || !fechaPrimeraClase || modulos.length === 0) return false;
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

  // Opciones para los dropdowns principales
  const asignaturaOptions = asignaturas.map(a => ({ value: a.id.toString(), label: a.nombre }));
  const nivelOptions = niveles.map(n => ({ value: n.id.toString(), label: n.nombre }));
  const profesorOptions = profesores.map(p => ({ value: p.id.toString(), label: p.nombre }));

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-all ${isOpen ? '' : 'hidden'}`}
      style={{ minHeight: '100vh' }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 relative flex flex-col max-h-[90vh] overflow-y-auto" style={{ minHeight: '600px' }}>
        <button className="absolute top-4 right-4 text-gray-400 text-2xl hover:text-gray-600 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-50 transition" onClick={onClose}>
          ×
        </button>
        <h2 className="text-2xl font-bold text-indigo-700 mb-1 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-400" />
          {modoEdicion ? 'Editar Horario' : 'Crear Nuevo Horario'}
        </h2>
        <p className="text-gray-500 mb-6">Configura tu horario docente para la planificación anual</p>

        {/* Inputs principales en grid compacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Horario *</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Horario Lenguaje 2do Básico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profesor Titular *</label>
            <GlobalDropdown
              value={docenteId}
              onChange={setDocenteId}
              options={profesorOptions}
              placeholder="Selecciona un profesor"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asignatura *</label>
            <GlobalDropdown
              value={asignaturaId}
              onChange={setAsignaturaId}
              options={asignaturaOptions}
              placeholder="Selecciona una asignatura"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nivel *</label>
            <GlobalDropdown
              value={nivelId}
              onChange={setNivelId}
              options={nivelOptions}
              placeholder="Selecciona un nivel"
            />
          </div>
        </div>

        {/* Fecha de primera clase */}
        <div className="mb-6">
          <DatePicker
            label="Fecha Primera Clase *"
            value={fechaPrimeraClase ? new Date(fechaPrimeraClase) : undefined}
            onChange={(date) => setFechaPrimeraClase(date ? date.toISOString().split('T')[0] : '')}
            placeholder="Selecciona la fecha de inicio"
            minDate={new Date("2025-01-01")}
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta fecha es el punto de partida de la planificación anual.
          </p>
        </div>

        {/* Módulos del Horario */}
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-gray-700">Módulos del Horario</span>
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
              <div key={modulo.id} className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl px-3 py-2">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs text-gray-500 font-semibold min-w-[70px]">Módulo {idx + 1}</span>
                  <GlobalDropdown
                    value={modulo.dia}
                    onChange={(v: string) => handleModuloChange(modulo.id, 'dia', v)}
                    options={DIAS_SEMANA}
                    placeholder="Día"
                    className="min-w-[140px]"
                  />
                  <GlobalDropdown
                    value={modulo.horaInicio}
                    onChange={(v: string) => handleModuloChange(modulo.id, 'horaInicio', v)}
                    options={HORAS_DISPONIBLES.map(h => ({ value: h, label: h }))}
                    placeholder="Hora inicio"
                    className="min-w-[130px]"
                  />
                  <GlobalDropdown
                    value={modulo.duracion.toString()}
                    onChange={(v: string) => handleModuloChange(modulo.id, 'duracion', parseInt(v))}
                    options={DURACIONES}
                    placeholder="Duración"
                    className="min-w-[140px]"
                  />
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

        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}

        {/* Footer al final del flujo, siempre visible */}
        <div className="mt-4 px-8 bg-white rounded-b-3xl flex justify-end gap-3 shadow-[0_-2px_16px_-8px_rgba(80,80,120,0.06)]">
          <SecondaryButton onClick={onClose} className="min-w-[120px] h-12 flex items-center justify-center text-base font-medium border border-gray-300 bg-white hover:bg-gray-50 transition-colors">
            Cancelar
          </SecondaryButton>
          <PrimaryButton onClick={handleSubmit} disabled={loading || !isFormValid()} className="min-w-[160px] h-12 flex items-center justify-center text-base font-semibold">
            <Save className="w-5 h-5 mr-2" /> {modoEdicion ? 'Guardar Cambios' : 'Crear Horario'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
} 