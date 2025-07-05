import { Listbox } from '@headlessui/react'
import { ChevronsUpDown, Check } from 'lucide-react'

interface MatrizEspecificacion {
  id: number
  nombre: string
  total_preguntas: number
  oas: Array<{
    oa: {
      oas_id: string
      descripcion_oas: string
      nivel: { nombre: string }
      asignatura: { nombre: string }
    }
  }>
}

interface MatrizSelectorProps {
  matrices: MatrizEspecificacion[]
  selectedMatriz: MatrizEspecificacion | null
  onMatrizSelect: (matriz: MatrizEspecificacion) => void
  error?: string
}

export default function MatrizSelector({ 
  matrices, 
  selectedMatriz, 
  onMatrizSelect, 
  error 
}: MatrizSelectorProps) {
  return (
    <div className="mb-4 mt-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Matriz de Especificación *
      </label>
      <Listbox value={selectedMatriz} onChange={onMatrizSelect}>
        <div className="relative">
          <Listbox.Button className="relative w-100 bg-white border border-gray-300 rounded-lg mx-1 py-3 px-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <span className={`block truncate ${selectedMatriz ? 'text-gray-900' : 'text-gray-500'}`}> 
              {selectedMatriz ? selectedMatriz.nombre : 'Seleccionar matriz...'}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown size={20} className="text-gray-400" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-50 w-full mt-1 py-1 px-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {matrices.map((matriz) => (
              <Listbox.Option
                key={matriz.id}
                value={matriz}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 px-4 my-1 rounded-lg transition-colors ${
                    active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}> 
                          {matriz.nombre}
                        </span>
                        <span className="text-sm text-gray-500">
                          {matriz.total_preguntas} preguntas • {matriz.oas.length} OAs
                        </span>
                      </div>
                      {selected && <Check size={20} className="text-indigo-600" />}
                    </div>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
} 