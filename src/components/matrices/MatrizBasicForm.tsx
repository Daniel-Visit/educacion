import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Asignatura, Nivel } from '@/types/matrices';
import PrimaryButton from '@/components/ui/PrimaryButton';
import SecondaryButton from '@/components/ui/SecondaryButton';

interface MatrizBasicFormProps {
  matrizName: string;
  onMatrizNameChange: (name: string) => void;
  selectedAsignatura: number | null;
  onAsignaturaChange: (asignaturaId: number | null) => void;
  selectedNivel: number | null;
  onNivelChange: (nivelId: number | null) => void;
  totalPreguntas: number;
  onTotalPreguntasChange: (total: number) => void;
  asignaturas: Asignatura[];
  niveles: Nivel[];
  errors: { [key: string]: string };
  isReadOnly?: boolean;
  className?: string;
  onNext?: () => void;
  canProceed?: boolean;
  // Nuevas props para modo edición
  mode?: 'create' | 'edit';
  onCancel?: () => void;
}

export default function MatrizBasicForm({
  matrizName,
  onMatrizNameChange,
  selectedAsignatura,
  onAsignaturaChange,
  selectedNivel,
  onNivelChange,
  totalPreguntas,
  onTotalPreguntasChange,
  asignaturas,
  niveles,
  errors,
  isReadOnly = false,
  className = '',
  onNext,
  canProceed = false,
  mode = 'create',
  onCancel,
}: MatrizBasicFormProps) {
  const isEditMode = mode === 'edit';

  const renderSelectField = (
    label: string,
    value: number | null,
    onChange: (value: number | null) => void,
    options: { id: number; nombre: string }[],
    errorKey: string
  ) => {
    const safeOptions = Array.isArray(options) ? options : [];

    return (
      <div className="mb-6 flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <Select
          value={value?.toString() || 'none'}
          onValueChange={(newValue: string) =>
            onChange(newValue === 'none' ? null : parseInt(newValue))
          }
          disabled={isReadOnly}
        >
          <SelectTrigger className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Seleccionar...</SelectItem>
            {safeOptions.map(option => (
              <SelectItem key={option.id} value={option.id.toString()}>
                {option.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors[errorKey] && (
          <p className="mt-1 text-sm text-red-600">{errors[errorKey]}</p>
        )}
      </div>
    );
  };

  const renderReadOnlyField = (
    label: string,
    value: number | null,
    options: { id: number; nombre: string }[]
  ) => {
    const displayValue = value
      ? options.find(option => option.id === value)?.nombre
      : 'Cargando...';

    return (
      <div className="mb-6 flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="w-full px-4 py-2 border rounded-md text-base bg-gray-50 border-gray-300 text-gray-600">
          {displayValue}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la matriz
          </label>
          <input
            type="text"
            value={matrizName}
            onChange={e => onMatrizNameChange(e.target.value)}
            disabled={isReadOnly}
            className="w-full px-4 py-2 border rounded-md text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="Ingresa el nombre de la matriz"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>
        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total de preguntas
          </label>
          <input
            type="number"
            value={totalPreguntas}
            onChange={e => onTotalPreguntasChange(Number(e.target.value))}
            disabled={isReadOnly}
            className="w-full px-4 py-2 border rounded-md text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="0"
            min={0}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {isEditMode ? (
          // En modo edición: campos de solo lectura
          <>
            {renderReadOnlyField('Asignatura', selectedAsignatura, asignaturas)}
            {renderReadOnlyField('Nivel', selectedNivel, niveles)}
          </>
        ) : (
          // En modo creación: selects editables
          <>
            {renderSelectField(
              'Asignatura',
              selectedAsignatura,
              onAsignaturaChange,
              asignaturas,
              'asignatura'
            )}
            {renderSelectField(
              'Nivel',
              selectedNivel,
              onNivelChange,
              niveles,
              'nivel'
            )}
          </>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-end gap-4 mt-4">
        {isEditMode && onCancel && (
          <SecondaryButton variant="large" onClick={onCancel}>
            Cancelar
          </SecondaryButton>
        )}
        {onNext && (
          <PrimaryButton
            variant="large"
            onClick={onNext}
            disabled={!canProceed}
          >
            Siguiente
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
