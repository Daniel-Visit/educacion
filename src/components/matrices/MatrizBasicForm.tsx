import React from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { Asignatura, Nivel } from '@/types/matrices';

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
  canProceed = false
}: MatrizBasicFormProps) {

  const renderReadOnlyField = (label: string, value: string) => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
        {value}
      </div>
    </div>
  );

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
      <Listbox value={value} onChange={onChange} disabled={isReadOnly}>
        <div className="relative min-h-[42px]">
          <Listbox.Button className="relative w-full cursor-default rounded-xl bg-white py-2 pl-3 pr-8 text-left border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed">
            <span className="block truncate">
              {value 
                ? safeOptions.find(option => option.id === value)?.nombre || 'Seleccionar...'
                : 'Seleccionar...'
              }
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>
          {!isReadOnly && (
            <Listbox.Options className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              <Listbox.Option
                value={null}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                  }`
                }
              >
                Seleccionar...
              </Listbox.Option>
              {safeOptions.map((option) => (
                <Listbox.Option
                  key={option.id}
                  value={option.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-3 pr-9 ${
                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.nombre}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                          <Check className="h-5 w-5" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          )}
        </div>
      </Listbox>
      {errors[errorKey] && (
        <p className="mt-1 text-sm text-red-600">{errors[errorKey]}</p>
      )}
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
            className="w-full px-4 py-2 border rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
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
            className="w-full px-4 py-2 border rounded-xl text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
            placeholder="0"
            min={0}
          />
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
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
      </div>
      
      {onNext && (
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
} 