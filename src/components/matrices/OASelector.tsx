import React from 'react';
import { ChevronsUpDown, Check, X } from 'lucide-react';
import { Listbox } from '@headlessui/react';
import { OA, Eje } from '@/types/matrices';
import { getGradient, getHoverGradient } from '@/utils/matrices';

interface OASelectorProps {
  title: string;
  description: string;
  selectedEje: number | null;
  onEjeChange: (ejeId: number | null) => void;
  selectedOAs: OA[];
  onOAsChange: (oas: OA[]) => void;
  availableOAs: OA[];
  ejes: Eje[];
  tipo: 'Contenido' | 'Habilidad';
  error?: string;
  className?: string;
}

export default function OASelector({
  title,
  description,
  selectedEje,
  onEjeChange,
  selectedOAs,
  onOAsChange,
  availableOAs,
  ejes,
  tipo,
  error,
  className = '',
}: OASelectorProps) {
  const filteredOAs = selectedEje
    ? availableOAs.filter(
        oa => oa.eje_id === selectedEje && oa.tipo_eje === tipo
      )
    : [];

  const handleOAToggle = (oa: OA) => {
    const isSelected = selectedOAs.some(selected => selected.id === oa.id);
    if (isSelected) {
      onOAsChange(selectedOAs.filter(selected => selected.id !== oa.id));
    } else {
      onOAsChange([...selectedOAs, oa]);
    }
  };

  const removeOA = (oaId: number) => {
    onOAsChange(selectedOAs.filter(oa => oa.id !== oaId));
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 p-6 ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      {/* Selector de Eje */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Eje
        </label>
        <Listbox value={selectedEje} onChange={onEjeChange}>
          <div className="relative">
            <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <span className="block truncate">
                {selectedEje
                  ? ejes.find(eje => eje.id === selectedEje)?.descripcion ||
                    'Seleccionar eje...'
                  : 'Seleccionar eje...'}
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronsUpDown className="h-5 w-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              <Listbox.Option
                value={null}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                  }`
                }
              >
                Seleccionar eje...
              </Listbox.Option>
              {ejes
                .filter(eje =>
                  availableOAs.some(
                    oa => oa.eje_id === eje.id && oa.tipo_eje === tipo
                  )
                )
                .map(eje => (
                  <Listbox.Option
                    key={eje.id}
                    value={eje.id}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-3 pr-9 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }`
                    }
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                        >
                          {eje.descripcion}
                        </span>
                        {selected && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                            <Check className="h-5 w-5" />
                          </span>
                        )}
                      </>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Lista de OAs disponibles */}
      {selectedEje && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            OAs Disponibles ({filteredOAs.length})
          </label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredOAs.map((oa, index) => {
              const isSelected = selectedOAs.some(
                selected => selected.id === oa.id
              );
              return (
                <div
                  key={oa.id}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${
                      isSelected
                        ? `bg-gradient-to-r ${getGradient(index)} text-white border-transparent`
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => handleOAToggle(oa)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{oa.oas_id}</div>
                      <div
                        className={`text-sm mt-1 ${isSelected ? 'text-white/90' : 'text-gray-600'}`}
                      >
                        {oa.descripcion_oas}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-5 w-5 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OAs seleccionados */}
      {selectedOAs.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            OAs Seleccionados ({selectedOAs.length})
          </label>
          <div className="space-y-2">
            {selectedOAs.map((oa, index) => (
              <div
                key={oa.id}
                className={`p-3 rounded-lg bg-gradient-to-r ${getGradient(index)} text-white`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{oa.oas_id}</div>
                    <div className="text-sm mt-1 text-white/90">
                      {oa.descripcion_oas}
                    </div>
                  </div>
                  <button
                    onClick={() => removeOA(oa.id)}
                    className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
