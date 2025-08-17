import { Listbox, Popover } from '@headlessui/react';
import { ChevronsUpDown, Check, ChevronDown } from 'lucide-react';

import { MatrizEspecificacion } from '@/types/evaluacion';

interface MatrizSelectorProps {
  matrices: MatrizEspecificacion[];
  selectedMatriz: MatrizEspecificacion | null;
  onMatrizSelect: (matriz: MatrizEspecificacion) => void;
  error?: string;
}

export default function MatrizSelector({
  matrices,
  selectedMatriz,
  onMatrizSelect,
  error,
}: MatrizSelectorProps) {
  return (
    <div className="mb-4 mt-6">
      {/* Dropdown de Matriz */}
      <div className="mb-3">
        <div className="grid grid-cols-2 gap-3">
          {/* Selector de Matriz */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Matriz de Especificación
            </label>
            <Listbox value={selectedMatriz} onChange={onMatrizSelect}>
              <div className="relative">
                <Listbox.Button className="relative w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <span
                    className={`block truncate ${selectedMatriz ? 'text-gray-900' : 'text-gray-500'}`}
                  >
                    {selectedMatriz
                      ? selectedMatriz.nombre
                      : 'Seleccionar matriz...'}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronsUpDown size={20} className="text-gray-400" />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-50 w-full mt-1 py-1 px-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {matrices.map(matriz => (
                    <Listbox.Option
                      key={matriz.id}
                      value={matriz}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 px-4 my-1 rounded-lg transition-colors ${
                          active
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <span
                                className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                              >
                                {matriz.nombre}
                              </span>
                              <span className="text-sm text-gray-500">
                                {matriz.total_preguntas} preguntas •{' '}
                                {matriz.oas.length} OAs
                              </span>
                            </div>
                            {selected && (
                              <Check size={20} className="text-indigo-600" />
                            )}
                          </div>
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {/* Dropdown de OAs */}
          {selectedMatriz && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objetivos de Aprendizaje
              </label>
              <Popover className="relative">
                <Popover.Button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {selectedMatriz.oas.slice(0, 3).map((oaItem, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-full border border-indigo-200 shadow-sm"
                        >
                          {oaItem.oa.oas_id}
                        </span>
                      ))}
                      {selectedMatriz.oas.length > 3 && (
                        <span className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-full border border-gray-200 shadow-sm">
                          +{selectedMatriz.oas.length - 3}
                        </span>
                      )}
                    </div>
                    <ChevronDown size={16} className="text-indigo-600" />
                  </div>
                </Popover.Button>

                <Popover.Panel className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Objetivos de Aprendizaje ({selectedMatriz.oas.length})
                      </h3>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedMatriz.oas.map((oaItem, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-semibold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-indigo-700 bg-white px-2 py-1 rounded border">
                                {oaItem.oa.oas_id}
                              </span>
                              <span className="text-xs text-gray-600">
                                {oaItem.oa.nivel.nombre} •{' '}
                                {oaItem.oa.asignatura.nombre}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {oaItem.oa.descripcion_oas}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Popover.Panel>
              </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
